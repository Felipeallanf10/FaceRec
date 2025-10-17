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
   * Iniciar câmera real
   */
  const iniciarCamera = async () => {
    try {
      setCameraError(null);
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user' // Câmera frontal por padrão
        },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
      
      setStream(mediaStream);
      setIsCapturing(true);
      iniciarSimulacaoReconhecimento();
      
    } catch (error) {
      console.error('Erro ao acessar câmera:', error);
      let mensagem = 'Erro ao acessar câmera';
      
      if (error.name === 'NotAllowedError') {
        mensagem = 'Permissão negada. Permita o acesso à câmera nas configurações do navegador.';
      } else if (error.name === 'NotFoundError') {
        mensagem = 'Nenhuma câmera encontrada no dispositivo.';
      } else if (error.name === 'NotReadableError') {
        mensagem = 'Câmera já está sendo usada por outro aplicativo.';
      }
      
      setCameraError(mensagem);
      setHasCamera(false);
    }
  };

  /**
   * Parar câmera
   */
  const pararCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsCapturing(false);
    pararSimulacaoReconhecimento();
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
    verificarCamera();
    
    // Cleanup ao desmontar componente
    return () => {
      pararCamera();
    };
  }, []);

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
      <div className="bg-gradient-to-r from-blue-600 to-green-600 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Camera className="w-6 h-6" />
            <div>
              <h3 className="font-semibold">Reconhecimento Facial</h3>
              <p className="text-sm opacity-90">
                {isCapturing ? 'Câmera Ativa - Identificando alunos' : 'Clique para ativar a câmera'}
              </p>
            </div>
          </div>
          
          {/* Status LED */}
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isCapturing ? 'bg-red-400 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className="text-sm">{isCapturing ? 'REC' : 'OFF'}</span>
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
        {!isCapturing && !cameraError && (
          <div className="text-center text-gray-400">
            <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Câmera Desativada</p>
            <p className="text-sm">Clique no botão para iniciar</p>
          </div>
        )}

        {/* Erro de câmera */}
        {cameraError && (
          <div className="text-center text-red-400 p-8">
            <AlertCircle className="w-16 h-16 mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">Erro na Câmera</p>
            <p className="text-sm">{cameraError}</p>
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
            <span>{isCapturing ? 'Parar Câmera' : 'Iniciar Câmera'}</span>
          </button>

          {/* Informações de status */}
          <div className="text-right">
            <p className="text-sm text-gray-600">
              Status: {isCapturing ? 'Ativa' : 'Inativa'}
            </p>
            {reconhecimentoAtivo && (
              <p className="text-xs text-green-600">
                {detectedFaces.length} rosto(s) detectado(s)
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
      </div>
    </div>
  );
};

export default CameraReconhecimento;