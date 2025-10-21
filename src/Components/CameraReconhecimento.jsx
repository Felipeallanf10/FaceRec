import React, { useState, useRef, useEffect } from 'react';
import { Camera, Square, Play, Pause, RotateCcw, AlertCircle } from 'lucide-react';

/**
 * Componente CameraReconhecimento
 * 
 * Este componente gerencia a câmera para reconhecimento facial.
 * Funciona com:
 * - Webcam real (getUserMedia) para desenvolvimento
 * - Placeholder para quando não há câmera disponível
 * - Preparado para integração com API de reconhecimento facial
 */
const CameraReconhecimento = ({ 
  onAlunosDetectados = () => {}, 
  isActive = false,
  onToggleCamera = () => {},
  className = ""
}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [detectedFaces, setDetectedFaces] = useState([]);
  const [hasCamera, setHasCamera] = useState(false);
  
  // Estados para gerenciamento de permissões da câmera
  const [permissionState, setPermissionState] = useState('unknown'); // 'granted', 'denied', 'prompt', 'unknown'
  const [needsPermissionRequest, setNeedsPermissionRequest] = useState(false);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  
  // Estado do reconhecimento simulado
  const [simulationInterval, setSimulationInterval] = useState(null);
  const [reconhecimentoAtivo, setReconhecimentoAtivo] = useState(false);

  /**
   * Verificar se há câmeras disponíveis
   */
  const verificarCamera = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(device => device.kind === 'videoinput');
      setHasCamera(cameras.length > 0);
      return cameras.length > 0;
    } catch (error) {
      console.error('Erro ao verificar câmeras:', error);
      setHasCamera(false);
      return false;
    }
  };

  /**
   * REMOVIDA: Verificação automática de permissões (PERIGOSA)
   * Agora só verifica quando o usuário solicita explicitamente
   */

  /**
   * Solicitar permissão da câmera explicitamente
   */
  const solicitarPermissaoCamera = async () => {
    setIsRequestingPermission(true);
    setCameraError(null);
    
    try {
      console.log('🔐 Solicitando permissão da câmera...');
      
      // Tentar acessar a câmera - isso mostra o prompt de permissão
      const testStream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: false 
      });
      
      // Se chegou aqui, permissão foi concedida
      console.log('✅ Permissão concedida!');
      
      // Parar o stream de teste
      testStream.getTracks().forEach(track => track.stop());
      
      setPermissionState('granted');
      setNeedsPermissionRequest(false);
      
      // Agora iniciar a câmera de verdade
      await iniciarCameraReal();
      
    } catch (error) {
      console.error('❌ Erro ao solicitar permissão:', error);
      
      if (error.name === 'NotAllowedError') {
        setPermissionState('denied');
        setCameraError('🚫 Permissão da câmera foi negada. Para usar o reconhecimento facial, permita o acesso à câmera quando solicitado pelo navegador.');
      } else if (error.name === 'NotFoundError') {
        setCameraError('📷 Nenhuma câmera encontrada no dispositivo.');
        setHasCamera(false);
      } else {
        setCameraError(`❌ Erro: ${error.message}`);
      }
    } finally {
      setIsRequestingPermission(false);
    }
  };

  /**
   * Função que o usuário clica em "Iniciar Câmera" - SEMPRE mostra botão de permissão
   */
  const iniciarCamera = async () => {
    console.log('🎬 Usuário clicou em "Iniciar Câmera"');
    setCameraError(null);
    
    // 1. Verificar se há câmeras disponíveis
    const temCamera = await verificarCamera();
    if (!temCamera) {
      setCameraError('📷 Nenhuma câmera encontrada no dispositivo.');
      return;
    }
    
    // 2. SEMPRE mostrar botão de permissão (segurança)
    console.log('� Mostrando botão para solicitar permissão explícita...');
    setNeedsPermissionRequest(true);
    setPermissionState('prompt');
  };

  /**
   * Iniciar câmera real (após permissões verificadas)
   */
  const iniciarCameraReal = async () => {
    try {
      console.log('🎥 Iniciando câmera real...');
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          console.log('✅ Câmera iniciada com sucesso!');
        };
      }
      
      setStream(mediaStream);
      setIsCapturing(true);
      setPermissionState('granted');
      iniciarSimulacaoReconhecimento();
      
    } catch (error) {
      console.error('❌ Erro ao iniciar câmera:', error);
      
      if (error.name === 'NotAllowedError') {
        setPermissionState('denied');
        setCameraError('🚫 Permissão da câmera foi negada. Para usar o reconhecimento facial, permita o acesso quando solicitado.');
      } else if (error.name === 'NotFoundError') {
        setCameraError('📷 Nenhuma câmera encontrada no dispositivo.');
        setHasCamera(false);
      } else if (error.name === 'NotReadableError') {
        setCameraError('⚠️ Câmera em uso por outro aplicativo. Feche outros programas que possam estar usando a câmera.');
      } else {
        setCameraError(`❌ Erro inesperado: ${error.message}`);
      }
    }
  };

  /**
   * Parar câmera - FUNÇÃO CRÍTICA DE SEGURANÇA
   */
  const pararCamera = () => {
    console.log('🔒 PARANDO CÂMERA - segurança crítica');
    
    // 1. Parar todos os tracks do stream
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        console.log('🔒 Track parado:', track.kind, track.readyState);
      });
      setStream(null);
    }
    
    // 2. Limpar vídeo
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.pause();
    }
    
    // 3. Resetar estados
    setIsCapturing(false);
    setNeedsPermissionRequest(false);
    setPermissionState('unknown');
    
    // 4. Parar simulação
    pararSimulacaoReconhecimento();
    
    console.log('✅ Câmera completamente fechada e segura');
  };

  /**
   * Capturar frame da câmera para processamento
   */
  const capturarFrame = () => {
    if (!videoRef.current || !canvasRef.current) return null;
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Retornar frame como base64 para enviar à API
    return canvas.toDataURL('image/jpeg', 0.8);
  };

  /**
   * Simulação de reconhecimento facial (para desenvolvimento)
   * Em produção, isso será substituído pela API real
   */
  const iniciarSimulacaoReconhecimento = () => {
    setReconhecimentoAtivo(true);
    
    // Simular detecção de rostos a cada 2 segundos
    const interval = setInterval(() => {
      // Simular rostos detectados (mock)
      const rostosSimulados = [
        { id: Math.random(), confianca: 85 + Math.random() * 15, nome: 'Detectando...' },
        { id: Math.random(), confianca: 78 + Math.random() * 20, nome: 'Analisando...' }
      ];
      
      setDetectedFaces(rostosSimulados);
      
      // Simular identificação de alunos após alguns segundos
      setTimeout(() => {
        const alunosIdentificados = [
          { id: 1, nome: 'Ana Clara Silva', confianca: 92 },
          { id: 5, nome: 'João Pedro Santos', confianca: 88 },
          { id: 12, nome: 'Maria Eduarda Costa', confianca: 91 }
        ];
        
        onAlunosDetectados(alunosIdentificados);
      }, 1500);
      
    }, 3000);
    
    setSimulationInterval(interval);
  };

  /**
   * Parar simulação de reconhecimento
   */
  const pararSimulacaoReconhecimento = () => {
    setReconhecimentoAtivo(false);
    if (simulationInterval) {
      clearInterval(simulationInterval);
      setSimulationInterval(null);
    }
    setDetectedFaces([]);
  };

  /**
   * Toggle câmera ligada/desligada
   */
  const toggleCamera = () => {
    if (isCapturing) {
      pararCamera();
    } else {
      iniciarCamera();
    }
    onToggleCamera(!isCapturing);
  };

  // Efeitos
  useEffect(() => {
    // APENAS verificar câmeras disponíveis (SEM acessar permissões automaticamente)
    const inicializar = async () => {
      console.log('🚀 Página carregada - verificando apenas câmeras disponíveis...');
      
      // Verificar câmeras disponíveis (sem acessar permissões)
      await verificarCamera();
      
      console.log('⚠️ Permissões NÃO verificadas automaticamente por segurança');
    };
    
    inicializar();
    
    // CLEANUP CRÍTICO: Garantir que câmera seja fechada
    return () => {
      console.log('🔒 Limpeza de segurança: fechando câmera...');
      pararCamera();
      // Garantir que todos os tracks sejam parados
      if (stream) {
        stream.getTracks().forEach(track => {
          track.stop();
          console.log('🔒 Track da câmera parado:', track.kind);
        });
      }
    };
  }, [stream]);

  // Responder a mudanças externas do estado isActive
  useEffect(() => {
    if (isActive && !isCapturing) {
      iniciarCamera();
    } else if (!isActive && isCapturing) {
      pararCamera();
    }
  }, [isActive]);

  return (
    <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${className}`}>
      {/* Header do Componente */}
      <div className={`p-4 text-white ${isCapturing ? 'bg-gradient-to-r from-red-600 to-orange-600' : 'bg-gradient-to-r from-blue-600 to-green-600'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Camera className="w-6 h-6" />
            <div>
              <h3 className="font-semibold">
                {isCapturing ? '🔴 CÂMERA ATIVA' : 'Reconhecimento Facial'}
              </h3>
              <p className="text-sm opacity-90">
                {isCapturing ? '⚠️ SUA CÂMERA ESTÁ SENDO ACESSADA' : 'Clique para solicitar acesso à câmera'}
              </p>
            </div>
          </div>
          
          {/* Status LED e Aviso */}
          <div className="flex items-center space-x-4">
            {isCapturing && (
              <div className="text-right">
                <p className="text-xs font-bold">🚨 GRAVANDO</p>
                <p className="text-xs opacity-75">Clique FECHAR para parar</p>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <div className={`w-4 h-4 rounded-full ${isCapturing ? 'bg-red-300 animate-pulse' : 'bg-gray-400'}`}></div>
              <span className="text-sm font-bold">{isCapturing ? '🔴 REC' : 'OFF'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Área da Câmera */}
      <div className="relative bg-black aspect-video flex items-center justify-center">
        {/* Vídeo da câmera real */}
        {isCapturing && !cameraError && (
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
          />
        )}

        {/* Placeholder quando câmera não está ativa */}
        {!isCapturing && !cameraError && !needsPermissionRequest && (
          <div className="text-center text-gray-400">
            <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Câmera Desativada</p>
            <p className="text-sm">Clique no botão para iniciar</p>
          </div>
        )}

        {/* Solicitação de permissão necessária */}
        {needsPermissionRequest && !isCapturing && (
          <div className="text-center text-yellow-500 p-8">
            <Camera className="w-16 h-16 mx-auto mb-4" />
            <p className="text-lg font-medium mb-4">Permissão Necessária</p>
            <p className="text-sm mb-6 text-gray-300">
              Para usar o reconhecimento facial, precisamos acessar sua câmera.
            </p>
            
            <button
              onClick={solicitarPermissaoCamera}
              disabled={isRequestingPermission}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center space-x-2 mx-auto"
            >
              {isRequestingPermission ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Aguardando permissão...</span>
                </>
              ) : (
                <>
                  <Camera className="w-5 h-5" />
                  <span>🔐 Solicitar Acesso à Câmera</span>
                </>
              )}
            </button>
            
            <p className="text-xs text-gray-400 mt-4">
              Clique em "Permitir" quando o navegador solicitar
            </p>
          </div>
        )}

        {/* Erro de câmera */}
        {cameraError && (
          <div className="text-center text-red-400 p-8">
            <AlertCircle className="w-16 h-16 mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">Problema com a Câmera</p>
            <div className="text-sm whitespace-pre-line">{cameraError}</div>
            
            {/* Botão para tentar novamente se permissão foi negada */}
            {permissionState === 'denied' && (
              <button
                onClick={() => window.location.reload()}
                className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                🔄 Recarregar Página
              </button>
            )}
          </div>
        )}

        {/* Overlay de detecção de rostos */}
        {reconhecimentoAtivo && (
          <div className="absolute inset-0">
            {/* Indicadores de rostos detectados */}
            {detectedFaces.map((face, index) => (
              <div
                key={face.id}
                className="absolute border-2 border-green-400"
                style={{
                  top: `${20 + index * 30}%`,
                  left: `${30 + index * 20}%`,
                  width: '120px',
                  height: '80px'
                }}
              >
                <div className="bg-green-400 text-black px-2 py-1 text-xs font-medium -mt-6">
                  {face.confianca.toFixed(0)}% - {face.nome}
                </div>
              </div>
            ))}
            
            {/* Scanning overlay */}
            <div className="absolute inset-0 border-2 border-blue-400 border-dashed animate-pulse">
              <div className="absolute top-2 left-2 text-blue-400 text-xs font-medium bg-black bg-opacity-50 px-2 py-1 rounded">
                RECONHECENDO...
              </div>
            </div>
          </div>
        )}

        {/* Canvas oculto para captura de frames */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Controles da Câmera */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between">
          {/* Botão principal */}
          <div className="flex space-x-3">
            <button
              onClick={toggleCamera}
              disabled={cameraError && !hasCamera}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                isCapturing
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-400 disabled:cursor-not-allowed'
              }`}
            >
              {isCapturing ? <Square className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              <span>{isCapturing ? '🔒 FECHAR CÂMERA' : '🎥 Solicitar Câmera'}</span>
            </button>
            
            {/* Botão de emergência para fechar câmera */}
            {isCapturing && (
              <button
                onClick={pararCamera}
                className="flex items-center space-x-2 px-4 py-3 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-semibold transition-all border-2 border-red-500"
                title="Fechar câmera imediatamente"
              >
                <Square className="w-5 h-5" />
                <span>🚨 EMERGÊNCIA</span>
              </button>
            )}
          </div>

          {/* Informações de status */}
          <div className="text-right space-y-1">
            <div className="flex items-center justify-end space-x-2">
              <p className="text-sm text-gray-600">
                Status: {isCapturing ? 'Ativa' : 'Inativa'}
              </p>
              
              {/* Indicador de permissão */}
              <span className={`text-xs px-2 py-1 rounded-full ${
                permissionState === 'granted' ? 'bg-green-100 text-green-800' :
                permissionState === 'denied' ? 'bg-red-100 text-red-800' :
                permissionState === 'prompt' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {permissionState === 'granted' ? '🔓 Permitida' :
                 permissionState === 'denied' ? '🔒 Negada' :
                 permissionState === 'prompt' ? '⏳ Pendente' :
                 '❓ Verificando'}
              </span>
            </div>
            
            {reconhecimentoAtivo && (
              <p className="text-xs text-green-600">
                {detectedFaces.length} rosto(s) detectado(s)
              </p>
            )}
            
            {hasCamera !== null && (
              <p className="text-xs text-gray-500">
                {hasCamera ? '📷 Câmera detectada' : '📷 Nenhuma câmera'}
              </p>
            )}
          </div>

          {/* Botão de captura manual */}
          {isCapturing && (
            <button
              onClick={() => {
                const frame = capturarFrame();
                console.log('Frame capturado:', frame);
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Camera className="w-4 h-4" />
              <span>Capturar</span>
            </button>
          )}
        </div>
        
        {/* Informações adicionais sobre permissões */}
        {needsPermissionRequest && !isCapturing && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-700">
              🔐 <strong>Permissão necessária:</strong> Clique em "Solicitar Acesso à Câmera" para continuar
            </p>
          </div>
        )}
        
        {permissionState === 'denied' && !isCapturing && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">
              💡 <strong>Dica:</strong> Para reativar a câmera, clique no ícone de câmera na barra de endereços do navegador e permita o acesso.
            </p>
          </div>
        )}
        
        {isRequestingPermission && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              🔐 Aguardando resposta do usuário para permissão da câmera...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CameraReconhecimento;