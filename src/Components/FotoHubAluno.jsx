import { useMemo, useRef, useState } from "react";
import {
  Image as ImageIcon,
  Upload,
  Link as LinkIcon,
  Palette,
  RefreshCcw,
  CheckCircle2,
} from "lucide-react";

/* =========================
   FotoHub adaptado para Alunos na Administração
   ========================= */

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

// Função para converter hex para RGB
function hexToRgb(hex) {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result 
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [0, 0, 0];
}

export default function FotoHubAluno({ currentPhoto, onPhotoChange }) {
  const [tab, setTab] = useState("galeria");
  const [urlInput, setUrlInput] = useState("");
  const [tint, setTint] = useState(null);
  const [message, setMessage] = useState(null);
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef();

  // Paleta de cores
  const palette = [
    { label: "Original", hex: null },
    { label: "Azul", hex: "#3b82f6" },
    { label: "Verde", hex: "#10b981" },
    { label: "Roxo", hex: "#8b5cf6" },
    { label: "Rosa", hex: "#ec4899" },
    { label: "Vermelho", hex: "#ef4444" },
    { label: "Laranja", hex: "#f97316" },
    { label: "Amarelo", hex: "#eab308" },
  ];

  const basePhotoUrl = currentPhoto || "/avatar-default.png";

  // Função para mostrar mensagens
  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  // Função para converter arquivo/blob em base64 e aplicar
  const applyPhotoFromBlob = async (blob, filename = "photo.png") => {
    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target.result;
        onPhotoChange(base64String);
        showMsg("ok", "Foto aplicada com sucesso!");
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      showMsg("err", "Erro ao processar imagem");
    }
  };

  // Upload de arquivo local
  const handleUploadLocal = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validações
    if (!file.type.startsWith('image/')) {
      showMsg("err", "Por favor, selecione apenas arquivos de imagem");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showMsg("err", "A imagem deve ter no máximo 5MB");
      return;
    }

    setBusy(true);
    await applyPhotoFromBlob(file, file.name);
    setBusy(false);
    e.target.value = "";
  };

  // Importar por URL/Drive
  const handleImportUrl = async () => {
    if (!urlInput) return;
    try {
      setBusy(true);
      const normalized = normalizeDriveUrl(urlInput);
      const resp = await fetch(normalized, { mode: "cors" });
      if (!resp.ok) throw new Error("Não foi possível baixar a imagem dessa URL.");
      
      const ct = resp.headers.get("content-type") || "";
      if (!/image\/(png|jpe?g|webp|gif)/i.test(ct)) {
        console.warn("Content-Type não parece imagem:", ct);
      }
      
      const blob = await resp.blob();
      await applyPhotoFromBlob(blob, `from_url_${Date.now()}.png`);
      setUrlInput("");
    } catch (err) {
      showMsg("err", err.message || "Erro ao importar.");
    } finally {
      setBusy(false);
    }
  };

  // Função para colorir fundo escuro
  async function colorizeDarkBackground(imgUrl, hex) {
    const [tr, tg, tb] = hexToRgb(hex || "#000000");

    // Carregar imagem
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imgUrl;
    
    await new Promise((res, rej) => {
      img.onload = res;
      img.onerror = () => rej(new Error("Falha ao carregar imagem base."));
    });

    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;
    const canvas = document.createElement("canvas");
    canvas.width = w; 
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, w, h);

    // Recolorir pixels escuros (fundo)
    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i+1], b = data[i+2], a = data[i+3];
      if (a === 0) continue; // transparente
      
      // Luminância perceptiva
      const lum = 0.2126*r + 0.7152*g + 0.0722*b;
      // Threshold para brancos ficarem
      if (lum < 235) {
        data[i] = tr; 
        data[i+1] = tg; 
        data[i+2] = tb;
      }
    }
    ctx.putImageData(imageData, 0, 0);
    return new Promise((res) => canvas.toBlob(res, "image/png", 0.95));
  }

  // Aplicar cor e salvar
  const saveTinted = async () => {
    try {
      setBusy(true);
      if (!currentPhoto) {
        showMsg("err", "Nenhuma foto base para aplicar cores");
        return;
      }
      
      const blob = await colorizeDarkBackground(currentPhoto, tint?.hex || null);
      if (!blob) throw new Error("Falha ao gerar imagem.");
      
      await applyPhotoFromBlob(blob, `${tint?.hex ? `color_${tint.label}` : "original"}_${Date.now()}.png`);
      showMsg("ok", tint?.hex ? `Foto ${tint.label} aplicada!` : "Foto original aplicada!");
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
          <p className="text-sm text-slate-600">Galeria • Link/Drive • Original • Cores</p>
        </div>
      </div>

      {/* Preview + mensagem */}
      <div className="flex items-center gap-3 mb-4">
        <img
          src={basePhotoUrl}
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

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { id: "galeria", label: "Galeria", icon: <Upload className="size-4" /> },
          { id: "drive", label: "Drive/URL", icon: <LinkIcon className="size-4" /> },
          { id: "original", label: "Original", icon: <RefreshCcw className="size-4" /> },
          { id: "cores", label: "Cores", icon: <Palette className="size-4" /> },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`inline-flex items-center gap-2 px-3 py-2 text-sm rounded-xl border transition ${
              tab === t.id
                ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      {tab === "galeria" && (
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            className="hidden"
            onChange={handleUploadLocal}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={busy}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50 w-full sm:w-auto"
          >
            <Upload className="size-4" />
            Selecionar arquivo
          </button>
          <p className="text-xs text-slate-500">JPG, PNG ou WebP — até 5MB</p>
        </div>
      )}

      {tab === "drive" && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Cole um link público (Drive, Imgur, etc.)"
              className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-slate-300"
            />
            <button
              onClick={handleImportUrl}
              disabled={busy || !urlInput}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50 w-full sm:w-auto"
            >
              <CheckCircle2 className="size-4" />
              Importar
            </button>
          </div>
          <p className="text-xs text-slate-500 break-words">
            Links do Drive também funcionam (use compartilhamento público).
          </p>
        </div>
      )}

      {tab === "original" && (
        <div className="space-y-2">
          <p className="text-sm text-slate-600">Voltar para a foto sem cor/filtros.</p>
          <button
            onClick={() => { setTint(null); setTab("cores"); }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 w-full sm:w-auto"
          >
            <RefreshCcw className="size-4" />
            Usar foto original (salvar sem cor)
          </button>
          <p className="text-xs text-slate-500">Depois clique em "Salvar" na aba Cores.</p>
        </div>
      )}

      {tab === "cores" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {palette.map((c) => (
              <button
                key={c.label}
                onClick={() => setTint(c.hex ? { hex: c.hex, label: c.label } : null)}
                className={`h-10 px-2 rounded-xl border text-xs sm:text-sm ${
                  (tint?.hex || null) === (c.hex || null)
                    ? "border-indigo-400 ring-2 ring-indigo-200"
                    : "border-slate-200"
                }`}
                style={{
                  background: c.hex ? `linear-gradient(90deg, ${c.hex}55, ${c.hex}aa)` : "white",
                }}
                title={c.label}
              >
                {c.label}
              </button>
            ))}
          </div>

          <button
            onClick={saveTinted}
            disabled={busy || !currentPhoto}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 w-full sm:w-auto"
          >
            <CheckCircle2 className="size-4" />
            Salvar {tint?.label ? `(${tint.label})` : "(sem cor)"}
          </button>

          <p className="text-xs text-slate-500">
            Agora a cor substitui o fundo preto (sem sobrepor a silhueta branca).
          </p>
        </div>
      )}
    </div>
  );
}