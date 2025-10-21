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
  const [modalChamada, setModalChamada] = useState({ aberto: false, sala: null, alunos: [] });

  // Carregar dados do administrador - apenas salas importadas via CSV
  useEffect(() => {
    const carregarSalas = () => {
      try {
        // Tentar carregar salas criadas pelo admin via importação CSV
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
            
            console.log('✅ Carregadas salas importadas via CSV:', salasComContagem);
            setSalas(salasComContagem);
            return;
          }
        }
        
        // Se não há salas importadas, mostrar lista vazia
        console.log('📝 Nenhuma sala importada via CSV encontrada');
        setSalas([]);
        
      } catch (error) {
        console.error('❌ Erro ao carregar salas:', error);
        setSalas([]);
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
   * Função para abrir modal de chamada manual
   * @param {object} sala - Dados da sala selecionada
   */
  const abrirChamadaManual = (sala) => {
    // Carregar alunos da sala
    const alunosAdmin = localStorage.getItem('admin_alunos');
    let alunosDaSala = [];
    
    if (alunosAdmin) {
      const { dados: alunosData } = JSON.parse(alunosAdmin);
      alunosDaSala = alunosData.filter(aluno => aluno.salaId === sala.id);
    }

    setModalChamada({
      aberto: true,
      sala: sala,
      alunos: alunosDaSala.map(aluno => ({
        ...aluno,
        presente: false // Estado inicial: todos ausentes
      }))
    });
  };

  /**
   * Função para fechar modal de chamada manual e voltar para home
   */
  const fecharChamadaManual = () => {
    setModalChamada({ aberto: false, sala: null, alunos: [] });
    navigate('/'); // Redireciona para a home page
  };

  /**
   * Função para alternar presença de um aluno
   */
  const alternarPresenca = (alunoId) => {
    setModalChamada(prev => ({
      ...prev,
      alunos: prev.alunos.map(aluno => 
        aluno.id === alunoId 
          ? { ...aluno, presente: !aluno.presente }
          : aluno
      )
    }));
  };

  /**
   * Função para salvar a chamada manual
   */
  const salvarChamada = () => {
    const presencas = modalChamada.alunos.filter(aluno => aluno.presente);
    const ausencias = modalChamada.alunos.filter(aluno => !aluno.presente);
    
    // Salvar registro de chamada no localStorage
    const registroChamada = {
      sala: modalChamada.sala.nome,
      salaId: modalChamada.sala.id,
      data: new Date().toISOString(),
      tipo: 'manual',
      presencas: presencas.length,
      ausencias: ausencias.length,
      alunos: modalChamada.alunos.map(aluno => ({
        nome: aluno.nome,
        matricula: aluno.matricula,
        presente: aluno.presente
      }))
    };

    // Recuperar chamadas existentes
    const chamadasExistentes = JSON.parse(localStorage.getItem('chamadas_realizadas') || '[]');
    chamadasExistentes.push(registroChamada);
    localStorage.setItem('chamadas_realizadas', JSON.stringify(chamadasExistentes));

    alert(`Chamada salva com sucesso!\nPresentes: ${presencas.length}\nAusentes: ${ausencias.length}`);
    fecharChamadaManual();
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
            onClick={() => abrirChamadaManual(sala)}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
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
        {/* Grid de Salas ou Mensagem de Estado Vazio */}
        {salas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {salas.map((sala) => (
              <CardSala key={sala.id} sala={sala} />
            ))}
          </div>
        ) : (
          /* Mensagem quando não há salas importadas */
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Nenhuma sala de aula encontrada
              </h3>
              <p className="text-gray-600 mb-6">
                As salas de aula aparecerão aqui após a importação do arquivo CSV com os dados dos alunos.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                <h4 className="font-semibold text-blue-900 mb-2">Como importar dados:</h4>
                <ol className="text-sm text-blue-800 space-y-1">
                  <li>1. Acesse a página de Administração</li>
                  <li>2. Clique em "Importar CSV"</li>
                  <li>3. Selecione o arquivo com dados dos alunos</li>
                  <li>4. As salas aparecerão automaticamente aqui</li>
                </ol>
              </div>
            </div>
          </div>
        )}

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
                    💡 <strong>Dica:</strong> O sistema utiliza inteligência artificial para reconhecer rostos e marcar presenças automaticamente.
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

      {/* Modal de Chamada Manual */}
      {modalChamada.aberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header do Modal */}
            <div className="bg-green-600 text-white p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">Chamada Manual</h2>
                  <p className="text-green-100">{modalChamada.sala?.nome} - {modalChamada.sala?.periodo}</p>
                </div>
                <button
                  onClick={fecharChamadaManual}
                  className="text-white hover:text-red-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Lista de Alunos */}
            <div className="flex-1 p-6 overflow-y-auto">
              {modalChamada.alunos.length > 0 ? (
                <div className="space-y-2">
                  {modalChamada.alunos.map((aluno, index) => (
                    <div
                      key={aluno.id || index}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                        aluno.presente 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{aluno.nome}</p>
                        <p className="text-sm text-gray-500">Matrícula: {aluno.matricula}</p>
                      </div>
                      <button
                        onClick={() => alternarPresenca(aluno.id || index)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          aluno.presente
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                        }`}
                      >
                        {aluno.presente ? 'Presente' : 'Ausente'}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Nenhum aluno encontrado nesta sala.</p>
                </div>
              )}
            </div>

            {/* Footer do Modal */}
            <div className="flex-shrink-0 bg-gray-50 px-6 py-4 flex justify-between items-center border-t">
              <div className="text-sm text-gray-600">
                <span className="font-medium text-green-600">
                  {modalChamada.alunos.filter(a => a.presente).length}
                </span>
                {' '}presentes de {modalChamada.alunos.length} alunos
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={fecharChamadaManual}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                >
                  Sair
                </button>
                <button
                  onClick={salvarChamada}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Salvar Chamada
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Alunos;