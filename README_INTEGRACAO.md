# Kit de Integração – Reconhecimento Facial + Banco de Dados (TCC)

Este pacote liga a sua **câmera (ESP32‑CAM ou mock-cam)** ao **back‑end Node/Express** do seu projeto para **registrar presença** automaticamente.

## 0) Visão Rápida

- **Python Service (`reco_service.py`)**: consome *snapshots* da câmera, reconhece rostos com `face_recognition`, e envia **batidas de presença** ao back‑end.
- **Rotas no Node (`server_attendance_routes.mjs`)**: expõem
  - `GET /api/known-faces` → lista de usuários com `profile_picture` (para o serviço Python baixar imagens e gerar *encodings*).
  - `POST /api/attendance` → grava presença no banco (protegido por **X-API-Key**).
- **SQL (`sql/001_create_attendance.sql`)**: cria a tabela `attendance_logs`.

> **Compatível com o seu repositório `TCC1-master`** (Node/Express + MariaDB/MySQL) e com as pastas de câmera/mock-cam já existentes.

---

## 1) Dependências do Python

> Windows precisa dos *build tools* antes do `dlib/face_recognition`:
- Visual C++ Build Tools: https://visualstudio.microsoft.com/pt-br/visual-cpp-build-tools/
- CMake: https://cmake.org/download/
- OpenCV (pip): https://pypi.org/project/opencv-python/
- Dlib (pip): https://pypi.org/project/dlib/ *(instala como dependência do `face_recognition`)*

Depois:
```bash
python -m venv .venv
. .venv/Scripts/activate   # Windows
pip install face_recognition opencv-python requests python-dotenv
```

---

## 2) Configuração – Back‑end (Node)

1. Copie `server_attendance_routes.mjs` para a pasta `backend/src/` do seu `TCC1-master`.
2. Edite `backend/src/server.js` e **importe/instale** as rotas (no topo):
   ```js
   import { installAttendanceRoutes, installFaceRoutes } from './server_attendance_routes.mjs';
   ```
   E **depois de criar o `app` e o `pool`**:
   ```js
   installFaceRoutes(app, pool);        // GET /api/known-faces
   installAttendanceRoutes(app, pool);  // POST /api/attendance
   ```
3. No `.env` do backend, adicione:
   ```
   API_KEY=troque_esta_chave_grande_e_unica
   ```
4. Rode o backend normalmente.

> **Dica**: seu backend já serve `/uploads` sem cache. É exatamente esse caminho que o serviço Python usará para baixar as fotos.

---

## 3) Banco de Dados

Execute o script:
```sql
-- sql/001_create_attendance.sql
```
Ele cria `attendance_logs` e índices básicos.

---

## 4) Serviço de Reconhecimento (Python)

Crie um arquivo `.env` **ao lado do `reco_service.py`**:
```
API_BASE=http://localhost:3001
API_KEY=troque_esta_chave_grande_e_unica

# URL de snapshot: use sua ESP32, ou o mock-cam do projeto (porta 4000)
CAMERA_SNAPSHOT_URL=http://localhost:4000/api/cam/capture

# Parâmetros de reconhecimento
POLL_SECONDS=1.0
MATCH_TOLERANCE=0.5
DEDUP_MIN_SECONDS=60
```

Execute:
```bash
python reco_service.py
```

O serviço:
- baixa a lista de rostos conhecidos (`/api/known-faces`),
- gera *encodings* a partir das **fotos de perfil**,
- captura *snapshots*,
- compara, e
- **POST** em `/api/attendance` com `X-API-Key`.

---

## 5) Teste Rápido

- Abra sua página **Câmera** (ou o mock-cam).
- Deixe uma ou mais **fotos de perfil** salvas no backend (Configurações → Foto).
- Rode o `reco_service.py`.
- Observe os logs no terminal e confira os registros em `attendance_logs`.

---

## 6) Próximos passos (opcional)

- **Tempo-real**: adicionar *WebSocket* (ex.: `socket.io`) para o frontend mostrar "João marcado presente".
- **Turmas/Aulas**: criar tabelas `classrooms`, `lessons`, `enrollments` e vincular `attendance_logs` a uma aula específica.
- **Vários dispositivos**: criar tabela `devices` e salvar `device_label` no log.

Qualquer ajuste fino (debounce, tolerância, múltiplos encodings por pessoa) dá para calibrar depois que estiver rodando.
