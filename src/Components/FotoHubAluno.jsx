import { useMemo, useRef, useState } from "react";
import {
  Image as ImageIcon,
  Upload,
} from "lucide-react";

/* =========================
   FotoHub adaptado para Alunos na Administração
   ========================= */

export default function FotoHubAluno({ currentPhoto, onPhotoChange }) {
  const [message, setMessage] = useState(null);
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef();

  const basePhotoUrl = currentPhoto || "/avatar-default.png";

  // Função para mostrar mensagens
  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  // Função para converter arquivo/blob em base64 e aplicar
  const applyPhotoFromBlob = async (blob, filename = "photo.png") => {
    try {
      console.log('📷 Convertendo arquivo para base64:', filename);
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target.result;
        console.log('✅ Base64 gerado, tamanho:', base64String.length);
        console.log('🔄 Chamando onPhotoChange...');
        onPhotoChange(base64String);
        showMsg("ok", "Foto aplicada com sucesso!");
      };
      reader.onerror = (error) => {
        console.error('❌ Erro ao ler arquivo:', error);
        showMsg("err", "Erro ao ler arquivo");
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error('❌ Erro ao processar imagem:', err);
      showMsg("err", "Erro ao processar imagem");
    }
  };

  // Upload de arquivo local
  const handleUploadLocal = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('📸 Arquivo selecionado:', file.name, file.type, file.size);

    // Validações
    if (!file.type.startsWith('image/')) {
      console.error('❌ Tipo de arquivo inválido:', file.type);
      showMsg("err", "Por favor, selecione apenas arquivos de imagem");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      console.error('❌ Arquivo muito grande:', file.size);
      showMsg("err", "A imagem deve ter no máximo 5MB");
      return;
    }

    console.log('✅ Arquivo válido, processando...');
    setBusy(true);
    await applyPhotoFromBlob(file, file.name);
    setBusy(false);
    e.target.value = "";
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

      {/* Conteúdo - Apenas Galeria */}
      <div className="space-y-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          className="hidden"
          onChange={handleUploadLocal}
        />
        <button
          onClick={() => {
            console.log('🖱️ Botão "Selecionar arquivo" clicado');
            console.log('📎 fileInputRef.current:', fileInputRef.current);
            fileInputRef.current?.click();
          }}
          disabled={busy}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50 w-full sm:w-auto"
        >
          <Upload className="size-4" />
          {busy ? 'Processando...' : 'Selecionar arquivo'}
        </button>
        <p className="text-xs text-slate-500">JPG, PNG ou WebP — até 5MB</p>
      </div>
    </div>
  );
}