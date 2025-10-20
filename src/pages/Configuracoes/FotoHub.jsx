import { useMemo, useRef, useState } from "react";
import { useUser } from "../../contexts/UserContext";
import api, { apiOrigin, buildUploadsUrl } from "@/lib/api";
import {
  Image as ImageIcon,
  Upload,
  Link,
  Download,
} from "lucide-react";

/* =========================
   Helpers
   ========================= */

// Monta URL absoluta para exibir avatar (SEM fallback fantasma)
function toAvatarUrl(u) {
  const candidate = u?.profile_picture || "";
  if (!candidate) return "/avatar-default.png"; // padrão p/ todos
  return buildUploadsUrl(candidate);
}

// Tenta tornar link do Drive em link direto
function normalizeDriveUrl(raw) {
  if (!raw) return raw;
  try {
    const url = new URL(raw);
    if (url.hostname.includes("drive.google.com")) {
      const match = url.pathname.match(/\/file\/d\/([^/]+)/);
      const id = match?.[1] || url.searchParams.get("id");
      if (id) return `https://drive.google.com/uc?export=view&id=${id}`;
    }
    return raw;
  } catch {
    return raw;
  }
}

function getToken() {
  const keys = ["authToken", "token", "accessToken", "jwt"];
  for (const k of keys) {
    const v = localStorage.getItem(k);
    if (v) return v;
  }
  for (const k of ["authToken", "token"]) {
    const v = sessionStorage.getItem(k);
    if (v) return v;
  }
  return null;
}

// util: #RRGGBB -> [r,g,b]
function hexToRgb(hex) {
  if (!hex) return [0, 0, 0];
  const h = hex.replace("#", "");
  const v = parseInt(h.length === 3 ? h.split("").map(c => c + c).join("") : h, 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}

/* =========================
   Componente
   ========================= */

export default function FotoHub() {
  const { usuario, setUsuario, updateProfilePicture } = useUser();
  const safeUser = usuario || {};
  const baseAvatarUrl = useMemo(() => toAvatarUrl(safeUser), [safeUser]);

  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null); // {type:'ok'|'err', text}
  const [urlInput, setUrlInput] = useState("");

  const fileInputRef = useRef(null);



  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3500);
  };

  // Envia um Blob/Arquivo para o endpoint de upload do back
  const uploadBlobAsFile = async (blob, filename = "profile.png") => {
    const token = getToken();
    if (!token) throw new Error("Sessão expirada. Faça login novamente.");

    const form = new FormData();
    // NOME DO CAMPO TEM QUE SER profilePicture (multer.single('profilePicture'))
    form.append("profilePicture", new File([blob], filename, { type: blob.type || "image/png" }));

    const { data } = await api.post("/user/profile-picture", form, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!data?.success) {
      throw new Error(data?.error || data?.message || "Falha ao enviar imagem.");
    }

    // A resposta já vem com ?v=timestamp; para persistir no usuário, salvamos sem o ?v=
    const returned = data.profilePictureUrl || safeUser.profile_picture;
    const cleanPath = (returned || "")
      .replace(apiOrigin || "", "")
      .replace(/^https?:\/\/[^/]+/i, "")
      .replace(/\?v=.*$/, "");
    const updated = { ...safeUser, profile_picture: cleanPath || null };
    setUsuario(updated);
    try { localStorage.setItem("usuario", JSON.stringify(updated)); } catch {}

    // Atualiza header/preview com cache-busting
    const full = buildUploadsUrl(returned);
    if (full) updateProfilePicture(`${full}?v=${Date.now()}`);

    return data;
  };

  // Upload local
  const handleUploadLocal = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)) {
      showMsg("err", "Escolha JPG, PNG ou WebP.");
      e.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showMsg("err", "Máximo 5MB.");
      e.target.value = "";
      return;
    }
    try {
      setBusy(true);
      await uploadBlobAsFile(file, file.name);
      showMsg("ok", "Foto atualizada!");
    } catch (err) {
      showMsg("err", err.message || "Erro ao enviar.");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  };

  // Importar por URL/Drive — faz o download no cliente e reenvia ao teu POST existente
  const handleImportUrl = async () => {
    if (!urlInput) return;
    try {
      setBusy(true);
      const normalized = normalizeDriveUrl(urlInput);
      const resp = await fetch(normalized, { mode: "cors" });
      if (!resp.ok) throw new Error("Não foi possível baixar a imagem dessa URL.");
      const ct = resp.headers.get("content-type") || "";
      if (!/image\/(png|jpe?g|webp|gif)/i.test(ct)) {
        // ainda tentamos, mas avisamos
        console.warn("Content-Type não parece imagem:", ct);
      }
      const blob = await resp.blob();
      await uploadBlobAsFile(blob, `from_url_${Date.now()}.png`);
      setUrlInput("");
      showMsg("ok", "Foto importada!");
    } catch (err) {
      showMsg("err", err.message || "Erro ao importar.");
    } finally {
      setBusy(false);
    }
  };

  // === COLORIR “POR DENTRO” (troca o fundo preto por uma cor sólida) ===
  async function colorizeDarkBackground(imgUrl, hex) {
    const [tr, tg, tb] = hexToRgb(hex || "#000000");

    // carrega imagem base
    const img = new Image();
    img.crossOrigin = "anonymous";
    // cache-bust p/ evitar preview antigo ao voltar de rota
    const sep = imgUrl.includes("?") ? "&" : "?";
    img.src = `${imgUrl}${sep}v=${Date.now()}`;
    await new Promise((res, rej) => {
      img.onload = res;
      img.onerror = () => rej(new Error("Falha ao carregar imagem base."));
    });

    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;
    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, w, h);

    // recolore só pixels ESCUROS (fundo), preservando brancos (silhueta/aro)
    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i+1], b = data[i+2], a = data[i+3];
      if (a === 0) continue; // transparente fora do círculo
      // luminância perceptiva
      const lum = 0.2126*r + 0.7152*g + 0.0722*b;
      // threshold alto (~brancos ficam)
      if (lum < 235) {
        data[i] = tr; data[i+1] = tg; data[i+2] = tb; // cor sólida
      }
    }
    ctx.putImageData(imageData, 0, 0);
    return new Promise((res) => canvas.toBlob(res, "image/png", 0.95));
  }

  // Aplica cor e salva
  const saveTinted = async () => {
    try {
      setBusy(true);
      // sem cor -> volta ao original (reenvia a base)
      const blob = await colorizeDarkBackground(baseAvatarUrl, tint?.hex || null);
      if (!blob) throw new Error("Falha ao gerar imagem.");
      await uploadBlobAsFile(blob, `${tint?.hex ? `color_${tint.label}` : "original"}_${Date.now()}.png`);
      showMsg("ok", tint?.hex ? `Foto ${tint.label} salva!` : "Foto original aplicada!");
    } catch (err) {
      showMsg("err", err.message || "Erro ao aplicar cor.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="w-full max-w-full overflow-hidden backdrop-blur-md bg-white/80 border border-slate-200/60 rounded-2xl p-6 shadow-xl shadow-slate-900/5">
      {/* Cabeçalho */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-fuchsia-500 to-purple-500 rounded-lg shrink-0">
          <ImageIcon className="size-5 text-white" />
        </div>
        <div className="min-w-0">
          <h3 className="text-lg font-bold text-slate-800">Foto de Perfil</h3>
          <p className="text-sm text-slate-600">Selecionar arquivo dos documentos</p>
        </div>
      </div>

      {/* Preview + mensagem */}
      <div className="flex items-center gap-3 mb-4">
        <img
          src={baseAvatarUrl}
          alt="Pré-visualização"
          className="w-16 h-16 rounded-full object-cover border border-slate-200 shrink-0"
          onError={(e) => { e.currentTarget.src = "/avatar-default.png"; }}
        />
        {message && (
          <div
            className={`text-sm px-3 py-2 rounded-lg border break-words flex-1 min-w-0 ${
              message.type === "ok"
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}
      </div>



      {/* Conteúdo - Galeria e URL */}
      <div className="space-y-4">
        {/* Upload de Arquivo */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleUploadLocal}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={busy}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50 transition-colors"
        >
          <Upload className="size-4" />
          {busy ? 'Processando...' : 'Selecionar Arquivo'}
        </button>
        
        {/* Divisor */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-200"></div>
          <span className="text-xs text-slate-500 font-medium">OU</span>
          <div className="flex-1 h-px bg-slate-200"></div>
        </div>
        
        {/* Campo URL */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Importar de URL</label>
          <div className="flex items-center gap-3">
            <Link className="size-5 text-slate-500 flex-shrink-0" />
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Cole o link da imagem aqui..."
              className="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 transition-all duration-200 bg-white"
            />
            <button
              onClick={handleImportUrl}
              disabled={busy || !urlInput.trim()}
              className="px-4 py-3 bg-fuchsia-500 text-white rounded-xl hover:bg-fuchsia-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Download className="size-4" />
              Importar
            </button>
          </div>
        </div>
        
        <p className="text-xs text-slate-500 text-center">
          Formatos aceitos: JPG, PNG, WebP, GIF — Máximo 5MB
        </p>
      </div>






    </div>
  );
}
