# reco_service.py
import os
import io
import time
import csv
import math
import json
import signal
import logging
import requests
import face_recognition
import numpy as np
from PIL import Image
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

API_BASE = os.getenv("API_BASE", "http://localhost:3001").rstrip("/")
API_KEY  = os.getenv("API_KEY", "")
KNOWN_FACES_ENDPOINT = os.getenv("KNOWN_FACES_ENDPOINT", "/api/known-faces")
ATTENDANCE_ENDPOINT  = os.getenv("ATTENDANCE_ENDPOINT", "/api/attendance")

CAMERA_SNAPSHOT_URL  = os.getenv("CAMERA_SNAPSHOT_URL", "http://localhost:4000/api/cam/capture")
POLL_SECONDS         = float(os.getenv("POLL_SECONDS", "1.0"))
MATCH_TOLERANCE      = float(os.getenv("MATCH_TOLERANCE", "0.5"))  # menor = mais exigente
DEDUP_MIN_SECONDS    = int(os.getenv("DEDUP_MIN_SECONDS", "60"))
DEVICE_LABEL         = os.getenv("DEVICE_LABEL", "esp32-cam-01")

LOG_CSV              = os.getenv("LOG_CSV", "reco_log.csv")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s"
)

session = requests.Session()
session.headers.update({"User-Agent": "reco-service/1.0"})

class KnownSet:
    def __init__(self):
        self.names = []       # lista paralela aos encodings
        self.ids   = []
        self.enc   = []       # np.ndarray (n, 128)

    def add(self, user_id, name, encoding):
        self.ids.append(user_id)
        self.names.append(name)
        self.enc.append(encoding)

    @property
    def matrix(self):
        if not self.enc:
            return np.zeros((0, 128), dtype=np.float64)
        return np.vstack(self.enc)

def fetch_known_faces():
    url = f"{API_BASE}{KNOWN_FACES_ENDPOINT}"
    logging.info(f"Baixando rostos de: {url}")
    r = session.get(url, timeout=20)
    r.raise_for_status()
    payload = r.json()
    faces = payload.get("faces", [])
    logging.info(f"{len(faces)} rostos com foto encontrados.")
    return faces

def download_image(url):
    r = session.get(url, timeout=20)
    r.raise_for_status()
    return r.content

def compute_encodings_from_photo(content):
    image = np.array(Image.open(io.BytesIO(content)).convert("RGB"))
    locs = face_recognition.face_locations(image, model="hog")
    if not locs:
        # tenta reescalar imagem caso seja muito grande/pequena
        pil = Image.open(io.BytesIO(content)).convert("RGB")
        pil = pil.resize((pil.width // 2, pil.height // 2)) if max(pil.size) > 1200 else pil.resize((pil.width*2, pil.height*2))
        image = np.array(pil)
        locs = face_recognition.face_locations(image, model="hog")
    if not locs:
        return []
    encs = face_recognition.face_encodings(image, known_face_locations=locs)
    return encs

def build_known_set():
    faces = fetch_known_faces()
    ks = KnownSet()
    for f in faces:
        try:
            img_bytes = download_image(f["photo_url"])
            encs = compute_encodings_from_photo(img_bytes)
            if not encs:
                logging.warning(f"Nenhum rosto detectado em {f['name']} ({f['photo_url']})")
                continue
            # usa o primeiro encoding; pode-se guardar vários por pessoa no futuro
            ks.add(f["user_id"], f["name"], encs[0])
            logging.info(f"Encoding gerado para {f['name']}")
        except Exception as e:
            logging.exception(f"Falha ao processar {f.get('name')} - {e}")
    logging.info(f"Encodings prontos: {len(ks.enc)}")
    return ks

def capture_frame():
    r = session.get(CAMERA_SNAPSHOT_URL, timeout=20)
    r.raise_for_status()
    img = np.array(Image.open(io.BytesIO(r.content)).convert("RGB"))
    return img

def post_attendance(user_id, confidence):
    url = f"{API_BASE}{ATTENDANCE_ENDPOINT}"
    headers = {"X-API-Key": API_KEY, "Content-Type": "application/json"}
    data = {"user_id": int(user_id), "confidence": float(confidence), "device_label": DEVICE_LABEL}
    rr = session.post(url, headers=headers, json=data, timeout=15)
    if rr.status_code == 200:
        logging.info(f"✅ Presença enviada: user_id={user_id} conf={confidence:.3f}")
    else:
        logging.error(f"❌ Falha POST /attendance: {rr.status_code} {rr.text}")

def main_loop():
    known = build_known_set()
    last_seen = {}  # user_id -> epoch seconds

    # CSV opcional para auditoria local
    csv_fp = open(LOG_CSV, "a", newline="", encoding="utf-8")
    writer = csv.writer(csv_fp)
    writer.writerow(["ts", "user_id", "name", "distance", "confidence", "event"])

    def handle_sig(*_):
        logging.info("Encerrando...")
        csv_fp.close()
        raise SystemExit(0)

    signal.signal(signal.SIGINT, handle_sig)
    signal.signal(signal.SIGTERM, handle_sig)

    while True:
        try:
            frame = capture_frame()
            locs = face_recognition.face_locations(frame, model="hog")
            encs = face_recognition.face_encodings(frame, known_face_locations=locs)

            for loc, enc in zip(locs, encs):
                if known.matrix.shape[0] == 0:
                    continue
                distances = face_recognition.face_distance(known.matrix, enc)
                best_idx = int(np.argmin(distances))
                best_dist = float(distances[best_idx])

                if best_dist <= MATCH_TOLERANCE:
                    user_id = known.ids[best_idx]
                    name    = known.names[best_idx]
                    # converte distância em "confiança" aproximada (1 - norm)
                    confidence = max(0.0, 1.0 - best_dist)  # simples e prático
                    now = time.time()
                    if (now - last_seen.get(user_id, 0)) >= DEDUP_MIN_SECONDS:
                        post_attendance(user_id, confidence)
                        last_seen[user_id] = now
                        writer.writerow([datetime.now().isoformat(), user_id, name, best_dist, confidence, "sent"])
                    else:
                        writer.writerow([datetime.now().isoformat(), user_id, name, best_dist, confidence, "debounced"])
                else:
                    # rosto desconhecido; apenas log local
                    writer.writerow([datetime.now().isoformat(), "", "unknown", best_dist, "", "ignored"])

            time.sleep(POLL_SECONDS)
        except Exception as e:
            logging.exception(f"Loop error: {e}")
            time.sleep(2.0)

if __name__ == "__main__":
    main_loop()
