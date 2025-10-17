# Kit Realtime – Presença ao Vivo por Turma

Este pacote complementa o **Kit de Integração** anterior, adicionando **tempo real**:
- **Socket.IO** no backend → emite eventos quando alguém é reconhecido.
- **Tabela de turmas/aulas** → presença por **aula do dia** (ex.: 3AT.I – 07:30).
- **Frontend React** → mostra vídeo ao vivo, presentes e faltantes em tempo real.
- **Serviço Python (stream)** → lê o *stream* MJPEG/RTSP e envia detecções.

## 0) Fluxo

1. ESP32‑CAM transmite (ex.: `http://<ip-da-cam>/stream` – MJPEG).
2. Serviço Python (`reco_stream_service.py`) amostra frames, reconhece rostos e posta
   `POST /api/attendance` com `classroom_code=3AT.I`.
3. Backend grava em `attendance_logs` e **upsert** em `attendance_presence` (por aula).
4. Backend **emite Socket.IO** `attendance:present` para o frontend.
5. Página mostra “presentes”/“faltantes” em tempo real.

## 1) SQL – Turmas/Aulas/Presença consolidada

Rode o script:
```
sql/002_classes_lessons.sql
```

## 2) Backend – Socket.IO + Rotas de apoio

- `_server_realtime.mjs_` exporta `installRealtime(app, server, pool)` e **estende** `POST /api/attendance` para emitir eventos e consolidar presença por aula.
- Também expõe utilidades:
  - `GET /api/classrooms/by-code/:code` → id e alunos matriculados
  - `GET /api/lessons/current?classroom_code=...` → id da aula de hoje (cria se não existir)
  - `GET /api/attendance/state?lesson_id=...` → snapshot de presença atual

### Como instalar no seu `server.js`

```js
// Troque a criação do servidor para expor o HTTP server
import http from 'http';
import { installRealtime } from './server_realtime.mjs';

const app = express();
// ... middlewares, pool, rotas existentes ...
const server = http.createServer(app);

installFaceRoutes(app, pool);        // do kit anterior
installAttendanceRoutes(app, pool);  // do kit anterior
installRealtime(app, server, pool);  // NOVO: Socket.IO + rotas realtime

server.listen(process.env.PORT || 3001, () => {
  console.log('Server up');
});
```

> Se você já usa `app.listen`, troque para `http.createServer(app).listen(...)` e passe `server` para o `installRealtime`.

## 3) Serviço Python – Stream

Use `reco_stream_service.py` (OpenCV `VideoCapture`) e configure:

```
API_BASE=http://localhost:3001
API_KEY=...
CAMERA_STREAM_URL=http://<ip-da-esp32>/stream   # MJPEG
FRAME_SAMPLER_FPS=2
CLASSROOM_CODE=3AT.I
MATCH_TOLERANCE=0.5
DEDUP_MIN_SECONDS=60
```

## 4) Frontend React – Componente de Painel

`frontend/LiveAttendance.jsx`: mostra o vídeo ao vivo, total de matriculados, presentes e faltantes. Conecta no Socket.IO do backend (`/` por padrão).

Env vars sugeridas no front:
```
VITE_CAM_STREAM_URL=http://<ip-da-esp32>/stream
VITE_CLASSROOM_CODE=3AT.I
VITE_API_BASE=http://localhost:3001
```

---

### Observações práticas

- **Regra de presença**: marcou uma vez na janela da aula → **Presente**. Saída posterior não remove presença (a não ser que você mude a regra).
- **Múltiplas câmeras**: rode um serviço Python por sala com `CLASSROOM_CODE` diferente.
- **Acurácia**: ajuste `MATCH_TOLERANCE` (0.5 ≈ padrão razoável). Adicione várias fotos de cada aluno para melhorar encodings.
