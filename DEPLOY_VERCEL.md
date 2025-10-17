# Deploy do Frontend no Vercel

## Frontend (Vercel)
- `VITE_API_BASE = /api`
- (opcional) `VITE_CAM_STREAM_URL`
- (opcional) `VITE_CLASSROOM_CODE`
- (opcional) `VITE_SOCKET_BASE` (use `https://facerec.alwaysdata.net` se precisar forçar WebSocket direto)

Build: `npm run build` → gera `dist/`.

## Backend (AlwaysData)
Arquivo `.env` deve conter:
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `API_KEY`
- (opcional) `ALLOWED_ORIGINS=https://seuapp.vercel.app,https://seuapp-git-main-usuario.vercel.app,http://localhost:5173`

## Passo a passo Vercel
1. Importar o repositório → selecionar o diretório raiz do frontend.
2. Preset **Vite**; confirmar `Build Command = npm run build` e `Output Directory = dist`.
3. Adicionar as variáveis `VITE_*` mencionadas em *Frontend (Vercel)*.
4. Deploy.

## Pós-deploy / Testes
- `https://<app>.vercel.app/api/*` responde 200 (proxy ativo para o backend AlwaysData).
- Navegação e refresh em rotas internas funcionam (fallback SPA).
- `https://<app>.vercel.app/uploads/*` carrega imagens/arquivos.
- Nenhuma chamada do frontend usa URL absoluta; todas utilizam `import.meta.env.VITE_API_BASE`.

> Desenvolvimento local: defina `VITE_API_BASE=http://localhost:3001/api` no `.env` para apontar direto ao backend.

> Caso o proxy não seja utilizado, habilite CORS no backend limitando `ALLOWED_ORIGINS` aos domínios do Vercel + `http://localhost:5173`.
