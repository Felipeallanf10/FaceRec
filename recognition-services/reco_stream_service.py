# reco_stream_service.py
import os, io, time, logging
import requests
import face_recognition
import numpy as np
import cv2
from PIL import Image
from dotenv import load_dotenv

load_dotenv()

API_BASE = os.getenv("API_BASE", "http://localhost:3001").rstrip("/")
API_KEY  = os.getenv("API_KEY", "")
CAMERA_STREAM_URL = os.getenv("CAMERA_STREAM_URL", "http://localhost:8080/stream")  # MJPEG
FRAME_SAMPLER_FPS = float(os.getenv("FRAME_SAMPLER_FPS", "2"))
CLASSROOM_CODE    = os.getenv("CLASSROOM_CODE", "3AT.I")

MATCH_TOLERANCE   = float(os.getenv("MATCH_TOLERANCE", "0.5"))
DEDUP_MIN_SECONDS = int(os.getenv("DEDUP_MIN_SECONDS", "60"))

KNOWN_FACES_ENDPOINT = os.getenv("KNOWN_FACES_ENDPOINT", "/api/known-faces")

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
session = requests.Session()
session.headers.update({"User-Agent": "reco-stream/1.0"})

def fetch_known_faces():
    r = session.get(API_BASE + KNOWN_FACES_ENDPOINT, timeout=20)
    r.raise_for_status()
    return r.json().get("faces", [])

def build_known_set():
    faces = fetch_known_faces()
    names, ids, encs = [], [], []
    for f in faces:
        try:
            img = session.get(f["photo_url"], timeout=20).content
            pil = Image.open(io.BytesIO(img)).convert("RGB")
            image = np.array(pil)
            locs = face_recognition.face_locations(image, model="hog")
            if not locs:
                continue
            e = face_recognition.face_encodings(image, known_face_locations=locs)
            if not e: continue
            encs.append(e[0]); names.append(f["name"]); ids.append(f["user_id"])
            logging.info("encoding: %s", f["name"])
        except Exception as e:
            logging.warning("skip %s: %s", f.get("name"), e)
    enc_matrix = np.vstack(encs) if encs else np.zeros((0, 128), dtype=np.float64)
    return {"names": names, "ids": ids, "enc": enc_matrix}

def post_detection(user_id, confidence):
    headers = {"X-API-Key": API_KEY, "Content-Type": "application/json"}
    payload = {"user_id": int(user_id), "confidence": float(confidence), "classroom_code": CLASSROOM_CODE}
    # 1) registra log + debounced pelo handler original
    r1 = session.post(API_BASE + "/api/attendance", headers=headers, json=payload, timeout=10)
    # 2) consolida e emite evento realtime
    r2 = session.post(API_BASE + "/api/_internal/consolidate", json=payload, timeout=10)
    logging.info("POST attendance=%s consolidate=%s", r1.status_code, r2.status_code)

def main():
    known = build_known_set()
    last_seen = {}

    cap = cv2.VideoCapture(CAMERA_STREAM_URL)
    if not cap.isOpened():
        raise RuntimeError("Não foi possível abrir o stream da câmera: " + CAMERA_STREAM_URL)

    period = 1.0 / FRAME_SAMPLER_FPS
    last = 0.0

    logging.info("Iniciando leitura do stream...")
    while True:
        ok, frame = cap.read()
        if not ok:
            time.sleep(0.1); continue

        now = time.time()
        if (now - last) < period:
            continue
        last = now

        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        locs = face_recognition.face_locations(rgb, model="hog")
        encs = face_recognition.face_encodings(rgb, known_face_locations=locs)

        for enc in encs:
            if known["enc"].shape[0] == 0: continue
            distances = face_recognition.face_distance(known["enc"], enc)
            idx = int(np.argmin(distances))
            dist = float(distances[idx])
            if dist <= MATCH_TOLERANCE:
                uid = known["ids"][idx]
                conf = max(0.0, 1.0 - dist)
                if (now - last_seen.get(uid, 0)) >= DEDUP_MIN_SECONDS:
                    post_detection(uid, conf)
                    last_seen[uid] = now

if __name__ == "__main__":
    main()
