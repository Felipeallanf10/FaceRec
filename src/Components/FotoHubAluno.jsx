import React, { useRef, useState } from "react";
import {
  Image as ImageIcon,
  Upload,
} from "lucide-react";

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

  // Upload de arquivo local - versão simplificada
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      console.log('❌ Nenhum arquivo selecionado');
      return;
    }

    console.log('📸 Arquivo selecionado:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    // Validações básicas
    if (!file.type.startsWith('image/')) {
      console.error('❌ Tipo de arquivo inválido:', file.type);
      alert('Por favor, selecione apenas arquivos de imagem');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      console.error('❌ Arquivo muito grande:', file.size);
      alert('A imagem deve ter no máximo 5MB');
      return;
    }

    console.log('✅ Arquivo válido, convertendo para base64...');
    setBusy(true);
    
    // Converter para base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target.result;
      console.log('✅ Base64 gerado, tamanho:', base64String?.length || 'null');
      
      if (onPhotoChange && base64String) {
        console.log('🔄 Chamando onPhotoChange...');
        onPhotoChange(base64String);
        showMsg("ok", "Foto carregada com sucesso!");
      } else {
        console.error('❌ onPhotoChange não definido ou base64 vazio');
        showMsg("err", "Erro: callback não definido");
      }
      
      setBusy(false);
    };
    
    reader.onerror = (error) => {
      console.error('❌ Erro ao ler arquivo:', error);
      showMsg("err", "Erro ao ler arquivo");
      setBusy(false);
    };
    
    reader.readAsDataURL(file);
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
      <div className="space-y-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          type="button"
          onClick={() => {
            console.log('🖱️ Botão clicado');
            console.log('📎 Input ref:', fileInputRef.current);
            if (fileInputRef.current) {
              fileInputRef.current.click();
            } else {
              console.error('❌ Input ref não encontrado');
            }
          }}
          disabled={busy}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Upload className="size-4" />
          {busy ? 'Processando...' : 'Selecionar Arquivo'}
        </button>
        <p className="text-xs text-slate-500 text-center">
          Formatos aceitos: JPG, PNG, WebP, GIF — Máximo 5MB
        </p>
      </div>
    </div>
  );
}