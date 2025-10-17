import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Página Alunos - Lista todas as salas de aula disponíveis
 * 
 * Esta página exibe um grid de cards com as salas de aula que o professor
 * pode acessar para fazer chamada com reconhecimento facial ou manual.
 * 
 * Funcionalidades:
 * - Exibe lista de salas em cards responsivos (dados reais do admin)
 * - Navegação para página individual da sala
 * - Design moderno com Tailwind CSS
 * - Integrado com sistema de administração
 */
const Alunos = () => {
  const navigate = useNavigate();
  const [salas, setSalas] = useState([]);

  // Dados padrão (mock) - usados se o admin não tiver criado salas
  const salasMock = [
    {
      id: 1,
      nome: "1º Ano A",
      turma: "Ensino Médio",
      totalAlunos: 32,
      periodo: "Manhã",
      professor: "Prof. Maria Silva"
    },
    {
      id: 2,
      nome: "1º Ano B", 
      turma: "Ensino Médio",
      totalAlunos: 28,
      periodo: "Manhã",
      professor: "Prof. João Santos"
    },
    {
      id: 3,
      nome: "2º Ano A",
      turma: "Ensino Médio", 
      totalAlunos: 30,
      periodo: "Tarde",
      professor: "Prof. Ana Costa"
    },
    {
      id: 4,
      nome: "2º Ano B",
      turma: "Ensino Médio",
      totalAlunos: 25,
      periodo: "Tarde", 
      professor: "Prof. Carlos Lima"
    },
    {
      id: 5,
      nome: "3º Ano A",
      turma: "Ensino Médio",
      totalAlunos: 29,
      periodo: "Manhã",
      professor: "Prof. Lucia Ferreira"
    },
    {
      id: 6,
      nome: "3º Ano B",
      turma: "Ensino Médio",
      totalAlunos: 27,
      periodo: "Tarde",
      professor: "Prof. Roberto Souza"
    }
  ];

  // Carregar dados do administrador ou usar dados mock
  useEffect(() => {
    const carregarSalas = () => {
      try {
        // Tentar carregar salas criadas pelo admin
        const salasAdmin = localStorage.getItem('admin_salas');
        const alunosAdmin = localStorage.getItem('admin_alunos');
        
        if (salasAdmin) {
          const { dados: salasSalvas } = JSON.parse(salasAdmin);
          
          if (salasSalvas && salasSalvas.length > 0) {
            // Calcular totalAlunos real para cada sala
            let alunosSalvos = [];
            if (alunosAdmin) {
              const { dados: alunosData } = JSON.parse(alunosAdmin);
              alunosSalvos = alunosData || [];
            }
            
            const salasComContagem = salasSalvas.map(sala => ({
              ...sala,
              totalAlunos: alunosSalvos.filter(aluno => aluno.salaId === sala.id).length || sala.totalAlunos || 0
            }));
            
            console.log('✅ Carregadas salas do administrador:', salasComContagem);
            setSalas(salasComContagem);
            return;
          }
        }
        
        // Se não há salas do admin, usar dados mock
        console.log('📝 Usando salas padrão (mock)');
        setSalas(salasMock);
        
      } catch (error) {
        console.error('❌ Erro ao carregar salas:', error);
        setSalas(salasMock);
      }
    };
    
    carregarSalas();
  }, []);

  /**
   * Função para navegar para a página da sala específica
   * @param {number} salaId - ID da sala selecionada
   */
  const acessarSala = (salaId) => {
    navigate(`/sala/${salaId}`);
  };

  /**
   * Componente de Card da Sala
   * Renderiza as informações de uma sala em formato de card
   */
  const CardSala = ({ sala }) => {
    return (
      <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-blue-200 transform hover:-translate-y-1">
        {/* Cabeçalho do Card */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            {sala.nome}
          </h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p className="flex items-center">
              <span className="font-medium">Turma:</span>
              <span className="ml-2">{sala.turma}</span>
            </p>
            <p className="flex items-center">
              <span className="font-medium">Professor:</span>
              <span className="ml-2">{sala.professor}</span>
            </p>
            <p className="flex items-center">
              <span className="font-medium">Período:</span>
              <span className="ml-2">{sala.periodo}</span>
            </p>
          </div>
        </div>

        {/* Informações de Alunos */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-center text-gray-700">
            <span className="font-bold text-2xl text-blue-600">{sala.totalAlunos}</span>
            <span className="text-sm ml-1">alunos matriculados</span>
          </p>
        </div>

        {/* Botões de Ação */}
        <div className="space-y-2">
          {/* Botão Principal - Acessar Sala */}
          <button
            onClick={() => acessarSala(sala.id)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>Acessar Sala</span>
          </button>

          {/* Botão Secundário - Chamada Manual */}
          <button
            onClick={() => navigate(`/sala/${sala.id}/manual`)}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <span>Chamada Manual</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header da Página */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Gerenciar Salas de Aula
              </h1>
              <p className="mt-2 text-gray-600">
                Selecione uma sala para realizar a chamada com reconhecimento facial ou manual
              </p>
            </div>
            
            {/* Indicador de Status do Sistema */}
            <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-2 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Sistema Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Indicador de Status dos Dados */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className={`rounded-lg p-4 ${
          localStorage.getItem('admin_salas') ? 
            'bg-green-50 border border-green-200' : 
            'bg-yellow-50 border border-yellow-200'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${
              localStorage.getItem('admin_salas') ? 'bg-green-400' : 'bg-yellow-400'
            }`}></div>
            <span className={`text-sm font-medium ${
              localStorage.getItem('admin_salas') ? 'text-green-800' : 'text-yellow-800'
            }`}>
              {localStorage.getItem('admin_salas') ? 
                '✅ Exibindo salas cadastradas pelo administrador' : 
                '📝 Exibindo salas padrão (administrador ainda não cadastrou salas)'
              }
            </span>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Grid de Salas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {salas.map((sala) => (
            <CardSala key={sala.id} sala={sala} />
          ))}
        </div>

        {/* Seção de Informações do Sistema */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                🎯 Como Fazer Chamada Automatizada
              </h3>
              <div className="text-blue-800 space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">1</div>
                  <p><strong>Escolha a Sala:</strong> Clique em "Acessar Sala" da turma desejada</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-sm">2</div>
                  <p><strong>Ative a Câmera:</strong> Clique no botão "Ativar Câmera" verde</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-sm">3</div>
                  <p><strong>Aponte para a Sala:</strong> Posicione a câmera para capturar os rostos dos alunos</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 font-bold text-sm">4</div>
                  <p><strong>Reconhecimento Automático:</strong> O sistema identifica e marca presenças automaticamente</p>
                </div>
                
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 text-sm">
                    💡 <strong>Dica:</strong> Se a câmera falhar, use o botão "Chamada Manual" como backup para marcar presenças individualmente.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer com Estatísticas Rápidas */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
            <p className="text-2xl font-bold text-blue-600">{salas.length}</p>
            <p className="text-sm text-gray-600">Salas Disponíveis</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
            <p className="text-2xl font-bold text-green-600">
              {salas.reduce((total, sala) => total + sala.totalAlunos, 0)}
            </p>
            <p className="text-sm text-gray-600">Total de Alunos</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
            <p className="text-2xl font-bold text-purple-600">100%</p>
            <p className="text-sm text-gray-600">Sistema Operacional</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Alunos;