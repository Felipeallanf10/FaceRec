import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../../contexts/UserContext';
import api from '../../lib/api';
import { Navigate } from 'react-router-dom';
import FotoHubAluno from '../../Components/FotoHubAluno';
import { 
  Users, 
  School, 
  Plus, 
  Edit3, 
  Trash2, 
  Camera,
  Save,
  X,
  Upload,
  UserPlus,
  GraduationCap
} from 'lucide-react';

/**
 * Página de Administração
 * 
 * Permite ao administrador:
 * - Gerenciar alunos (cadastrar, editar, excluir, alterar fotos)
 * - Gerenciar salas de aula (criar turmas)
 * - Configurar sistema
 * 
 * Acesso restrito apenas para usuários com role 'admin'
 */
const Administracao = () => {
  const { usuario, isAdmin } = useUser();

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [modalType, setModalType] = useState(''); // 'aluno' ou 'sala'
  const fileInputRef = useRef(null);
  const [importResumo, setImportResumo] = useState(null);
  const [importingToServer, setImportingToServer] = useState(false);
  const [showFotoHub, setShowFotoHub] = useState(false);

  // Estados dos dados
  const [alunos, setAlunos] = useState([]);
  const [salas, setSalas] = useState([]);
  const [salaSelecionada, setSalaSelecionada] = useState(null); // Para filtrar alunos por sala
  const [selectedAlunos, setSelectedAlunos] = useState([]); // ids selecionados para exclusão
  const [deleteSalaPrompt, setDeleteSalaPrompt] = useState(null); // {id, nome}

  // Verificar permissão de acesso
  if (!isAdmin()) {
    return <Navigate to="/alunos" replace />;
  }

  // Funções para persistência de dados no localStorage
  const salvarDados = (chave, dados) => {
    try {
      localStorage.setItem(`admin_${chave}`, JSON.stringify({
        dados,
        timestamp: new Date().toISOString(),
        usuario: usuario?.email || 'admin'
      }));
      console.log(`✅ ${chave} salvos no localStorage:`, dados);
    } catch (error) {
      console.error(`❌ Erro ao salvar ${chave}:`, error);
    }
  };

  const removerDados = (chave) => {
    try {
      localStorage.removeItem(`admin_${chave}`);
      console.log(`🗑️ admin_${chave} removido do localStorage`);
    } catch (error) {
      console.error(`❌ Erro ao remover ${chave}:`, error);
    }
  };

  const carregarDados = (chave, dadosDefault) => {
    try {
      const dadosSalvos = localStorage.getItem(`admin_${chave}`);
      if (dadosSalvos) {
        const { dados, timestamp, usuario: usuarioSalvo } = JSON.parse(dadosSalvos);
        console.log(`🔄 Carregando ${chave} salvos em ${new Date(timestamp).toLocaleString()} por ${usuarioSalvo}:`, dados);
        return dados;
      }
    } catch (error) {
      console.error(`❌ Erro ao carregar ${chave}:`, error);
    }
    return dadosDefault;
  };

  // Carregamento inicial dos dados com persistência
  useEffect(() => {
    // Dados padrão (mock) - usados apenas se não houver dados salvos
    const mockAlunos = [];

    const mockSalas = [];

    // Carregar dados salvos ou usar defaults
    const alunosCarregados = carregarDados('alunos', mockAlunos);
    const salasCarregadas = carregarDados('salas', mockSalas);

    setAlunos(alunosCarregados);
    setSalas(salasCarregadas);
  }, []);

  // Ao montar, se houver token e for admin, tentar sincronizar com o backend
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        // Busca salas/alunos do backend
        const res = await api.get('/admin/classrooms', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res?.data) {
          const { salas: salasServer = [], alunos: alunosServer = [] } = res.data;
          // Mapear nomes/formatos caso necessário
              setSalas(salasServer.map(s => ({
            id: s.id,
                nome: s.nome || s.name,
            turma: s.turma || '',
            periodo: s.periodo || '',
            totalAlunos: s.total_students || s.totalAlunos || 0,
            ativa: true
          })));

          setAlunos(alunosServer.map(a => ({
                id: Number(a.id),
            nome: a.nome,
            matricula: a.matricula,
            email: a.email,
            telefone: a.telefone,
                salaId: a.salaId ? Number(a.salaId) : a.salaId,
            foto: a.foto,
            ativo: a.ativo,
            dataCadastro: a.dataCadastro || a.created_at
          })));
        }
      } catch (err) {
        console.warn('Não foi possível sincronizar salas do servidor:', err?.response?.data || err.message || err);
      }
    };

    fetchAdminData();
  }, []);

  // Persistência automática - salva sempre que os dados mudam
  useEffect(() => {
    if (alunos.length > 0) {
      salvarDados('alunos', alunos);
    } else {
      removerDados('alunos');
    }
  }, [alunos]);

  useEffect(() => {
    if (salas.length > 0) {
      salvarDados('salas', salas);
    } else {
      removerDados('salas');
    }
  }, [salas]);



  /**
   * Funções para gerenciar alunos
   */
  const handleAddAluno = () => {
    // Verificar se existem salas cadastradas
    if (salas.length === 0) {
      alert('❌ Não é possível cadastrar alunos sem salas!\n\nPrimeiro crie pelo menos uma sala na aba "Gerenciar Salas".');
      return;
    }
    
    setEditingItem({
      nome: '',
      matricula: '',
      salaId: salaSelecionada?.id || '', // Pré-selecionar a sala se estiver filtrada
      email: '',
      telefone: '',
      foto: '',
      ativo: true
    });
    setModalType('aluno');
    setShowModal(true);
  };

  const handleEditAluno = (aluno) => {
    setEditingItem(aluno);
    setModalType('aluno');
    setShowModal(true);
  };



  const handleSaveAluno = async () => {
    // Validações obrigatórias
    if (!editingItem.nome?.trim()) {
      alert('❌ Por favor, insira o nome do aluno.');
      return;
    }
    
    if (!editingItem.salaId) {
      alert('❌ Por favor, selecione uma sala para o aluno.');
      return;
    }
    
    // Buscar dados da sala selecionada
    const salaSelecionada = salas.find(s => s.id == editingItem.salaId);
    
    try {
      if (editingItem.id) {
        // Editar existente - enviar para backend se houver mudanças na foto
        const alunoOriginal = alunos.find(a => a.id === editingItem.id);
        const fotoAlterada = alunoOriginal?.foto !== editingItem.foto;
        
        if (fotoAlterada) {
          console.log('📸 Enviando foto atualizada para o backend...');
          const token = localStorage.getItem('token');
          if (token) {
            try {
              await api.put(`/admin/alunos/${editingItem.id}`, {
                ...editingItem
              }, {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });
              console.log('✅ Foto salva no backend com sucesso');
            } catch (error) {
              console.warn('⚠️ Erro ao salvar no backend, mantendo apenas localmente:', error.message);
            }
          }
        }
        
        // Atualizar localmente
        setAlunos(prev => prev.map(a => a.id === editingItem.id ? editingItem : a));
        console.log(`✅ Aluno ${editingItem.nome} atualizado pelo admin ${usuario?.email} - Sala: ${salaSelecionada?.nome}`);
        alert(`✅ Aluno ${editingItem.nome} atualizado com sucesso!\nSala: ${salaSelecionada?.nome}${fotoAlterada ? '\n📸 Foto atualizada!' : ''}`);
      } else {
        // Criar novo
        const novoAluno = {
          ...editingItem,
          id: Date.now(),
          matricula: editingItem.matricula || `2024${Date.now().toString().slice(-5)}`,
          dataCadastro: new Date().toISOString().split('T')[0]
        };
        setAlunos(prev => [...prev, novoAluno]);
        console.log(`✅ Novo aluno ${novoAluno.nome} cadastrado pelo admin ${usuario?.email} - Sala: ${salaSelecionada?.nome}`);
        alert(`✅ Aluno ${novoAluno.nome} cadastrado com sucesso!\nSala: ${salaSelecionada?.nome}`);
      }
    } catch (error) {
      console.error('❌ Erro ao salvar aluno:', error);
      alert('❌ Erro ao salvar aluno: ' + error.message);
      return;
    }
    
    setShowModal(false);
    setEditingItem(null);
  };

  const handleDeleteAluno = (alunoId) => {
    const aluno = alunos.find(a => a.id === alunoId);
    if (confirm(`Tem certeza que deseja excluir o aluno ${aluno?.nome}? Esta ação não pode ser desfeita.`)) {
      (async () => {
        const token = localStorage.getItem('token');
        try {
          if (token) {
            await api.delete(`/admin/students/${alunoId}`, { headers: { Authorization: `Bearer ${token}` } });
          }
        } catch (err) {
          console.warn('Falha ao deletar aluno no servidor:', err?.response?.data || err.message || err);
        }

  const remaining = alunos.filter(a => a.id !== alunoId);
  setAlunos(remaining);
        console.log(`🗑️ Aluno ${aluno?.nome} removido pelo admin ${usuario?.email}`);
        alert(`🗑️ Aluno ${aluno?.nome} foi removido do sistema.`);
  salvarDados('alunos', remaining);
      })();
    }
  };

  // Seleção em massa: toggle, selecionar todos visíveis e limpar seleção
  const toggleSelectAluno = (alunoId) => {
    setSelectedAlunos(prev => {
      if (prev.includes(alunoId)) return prev.filter(id => id !== alunoId);
      return [...prev, alunoId];
    });
  };

  const selectAllVisiveis = () => {
    const alunosFiltrados = salaSelecionada ? alunos.filter(a => a.salaId === salaSelecionada.id) : alunos;
    const ids = alunosFiltrados.map(a => a.id);
    setSelectedAlunos(ids);
  };

  const clearSelection = () => setSelectedAlunos([]);

  const handleDeleteSelected = async () => {
    if (selectedAlunos.length === 0) return alert('Nenhum aluno selecionado.');

    if (!confirm(`Tem certeza que deseja excluir ${selectedAlunos.length} aluno(s)? Esta ação não pode ser desfeita.`)) return;

    const token = localStorage.getItem('token');
    const idsToDelete = [...selectedAlunos];
    const failed = [];

    try {
      if (token) {
        // Chama deletions em paralelo (mas coletando resultados)
        const promises = idsToDelete.map(id => api.delete(`/admin/students/${id}`, { headers: { Authorization: `Bearer ${token}` } }).catch(err => ({ error: err, id })));
        const results = await Promise.all(promises);
        results.forEach(r => {
          if (r && r.error) failed.push(r.id);
        });
      }
    } catch (err) {
      console.warn('Erro durante exclusão múltipla:', err);
    }

    // Atualiza estado local removendo os ids que foram (provavelmente) deletados
    const remaining = alunos.filter(a => !idsToDelete.includes(a.id));
    setAlunos(remaining);
    salvarDados('alunos', remaining);
    clearSelection();

    if (failed.length > 0) {
      alert(`Alguns alunos não puderam ser deletados no servidor: ${failed.join(', ')}. Eles foram removidos localmente.`);
    } else {
      alert(`${idsToDelete.length - failed.length} aluno(s) removido(s) com sucesso.`);
    }
  };

  /**
   * Funções para gerenciar salas
   */
  const handleAddSala = () => {
    setEditingItem({
      nome: '',
      turma: 'Ensino Médio',
      periodo: 'Manhã',
      ativa: true
    });
    setModalType('sala');
    setShowModal(true);
  };

  const handleEditSala = (sala) => {
    setEditingItem(sala);
    setModalType('sala');
    setShowModal(true);
  };

  const handleSaveSala = () => {
    if (editingItem.id) {
      // Editar existente
      setSalas(prev => prev.map(s => s.id === editingItem.id ? {
        ...editingItem,
        totalAlunos: alunos.filter(a => a.salaId === editingItem.id).length
      } : s));
      console.log(`✅ Sala ${editingItem.nome} atualizada pelo admin ${usuario?.email}`);
      alert(`✅ Sala ${editingItem.nome} atualizada com sucesso!`);
    } else {
      // Criar nova
      const novaSala = {
        ...editingItem,
        id: Date.now(),
        totalAlunos: 0
      };
      setSalas(prev => [...prev, novaSala]);
      console.log(`✅ Nova sala ${novaSala.nome} criada pelo admin ${usuario?.email}`);
      alert(`✅ Sala ${novaSala.nome} criada com sucesso!`);
    }
    setShowModal(false);
    setEditingItem(null);
  };

  const handleDeleteSala = (salaId) => {
    const sala = salas.find(s => s.id === salaId) || editingItem;
    if (!sala) {
      alert('Sala não encontrada');
      return;
    }
    setDeleteSalaPrompt({ id: sala.id, nome: sala.nome });
  };

  const applyLocalSalaRemoval = (salaId, keepStudents) => {
    const remainingSalas = salas.filter(s => s.id !== salaId);
    let remainingAlunos;
    if (keepStudents) {
      remainingAlunos = alunos.map(a => a.salaId == salaId ? { ...a, salaId: null } : a);
    } else {
      remainingAlunos = alunos.filter(a => a.salaId != salaId);
    }
    setSalas(remainingSalas);
    setAlunos(remainingAlunos);
    salvarDados('salas', remainingSalas);
    salvarDados('alunos', remainingAlunos);
  };

  const confirmDeleteSala = async (keepStudents) => {
    if (!deleteSalaPrompt) return;
    const salaId = deleteSalaPrompt.id;
    const token = localStorage.getItem('token');
    try {
      if (token) {
        await api.post(`/admin/classrooms/${salaId}/remove`, { keepStudents }, { headers: { Authorization: `Bearer ${token}` } });
        applyLocalSalaRemoval(salaId, keepStudents);
        try {
          const fetchRes = await api.get('/admin/classrooms', { headers: { Authorization: `Bearer ${token}` } });
          if (fetchRes?.data) {
            const { salas: salasServer = [], alunos: alunosServer = [] } = fetchRes.data;
            const mappedSalas = salasServer.map(s => ({ id: Number(s.id), nome: s.nome || s.name, turma: s.turma || '', periodo: s.periodo || '', totalAlunos: s.total_students || s.totalAlunos || 0, ativa: true }));
            const mappedAlunos = alunosServer.map(a => ({ id: Number(a.id), nome: a.nome, matricula: a.matricula, email: a.email, telefone: a.telefone, salaId: a.salaId ? Number(a.salaId) : a.salaId, foto: a.foto, ativo: a.ativo, dataCadastro: a.dataCadastro || a.created_at }));
            setSalas(mappedSalas);
            setAlunos(mappedAlunos);
            salvarDados('salas', mappedSalas);
            salvarDados('alunos', mappedAlunos);
          }
        } catch (e) {
          console.warn('Falha ao re-sincronizar após remoção da sala:', e?.response?.data || e.message || e);
        }
      } else {
        applyLocalSalaRemoval(salaId, keepStudents);
      }

      setShowModal(false);
      setEditingItem(null);
      alert(keepStudents ? 'Sala removida e alunos mantidos.' : 'Sala e alunos removidos.');
    } catch (err) {
      console.error('Erro ao remover sala:', err);
      alert('Erro ao remover sala: ' + (err?.response?.data?.error || err.message || err));
    } finally {
      setDeleteSalaPrompt(null);
    }
  };

  // Funções de backup e exportação
  const exportarDados = () => {
    const dadosCompletos = {
      alunos,
      salas,
      backup: {
        timestamp: new Date().toISOString(),
        usuario: usuario?.email || 'admin',
        versao: '1.0'
      }
    };
    
    const dadosJSON = JSON.stringify(dadosCompletos, null, 2);
    const blob = new Blob([dadosJSON], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup-escolar-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log(`📁 Backup exportado pelo admin ${usuario?.email}`);
    alert('📁 Backup dos dados exportado com sucesso!');
  };

  

  const parseCsvContent = (text) => {
    const rawLines = text.split(/\r?\n/);
    const lines = rawLines
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length < 2) {
      throw new Error('Arquivo CSV precisa conter cabeçalho e ao menos uma linha de dados.');
    }

    const headerLine = lines[0];
    const delimiter = headerLine.includes(';') ? ';' : ',';
    const headers = headerLine.split(delimiter).map((h) => h.trim());
    const normalizedHeaders = headers.map((h) =>
      h
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
    );

    const findIndex = (keyword) =>
      normalizedHeaders.findIndex((header) => header.includes(keyword));

    const indices = {
      sala: findIndex('sala'),
      turma: findIndex('turma'),
      periodo: findIndex('periodo'),
      nome: findIndex('nome'),
      matricula: findIndex('matric'),
      email: findIndex('email'),
      telefone: findIndex('telefone'),
    };

    if (indices.sala === -1 || indices.nome === -1) {
      throw new Error('Cabeçalho precisa conter, no mínimo, as colunas "Sala" e "Nome".');
    }

    let salaSeq = 1;
    let alunoSeq = 1;
    const salasMap = new Map();
    const alunosImportados = [];

    lines.slice(1).forEach((line, idx) => {
      const cols = line.split(delimiter).map((c) => c.trim());
      if (cols.every((value) => value === '')) {
        return;
      }

      const salaNome = cols[indices.sala] || '';
      const alunoNome = cols[indices.nome] || '';

      if (!salaNome || !alunoNome) {
        console.warn(`Linha ${idx + 2} ignorada (Sala ou Nome ausente).`);
        return;
      }

      const salaKey = salaNome.toLowerCase();
      if (!salasMap.has(salaKey)) {
        const salaId = salaSeq++;
        salasMap.set(salaKey, {
          id: salaId,
          nome: salaNome,
          turma: indices.turma !== -1 ? (cols[indices.turma] || '') : '',
          periodo: indices.periodo !== -1 ? (cols[indices.periodo] || '') : '',
          totalAlunos: 0,
          ativa: true,
        });
      }

      const sala = salasMap.get(salaKey);
      sala.totalAlunos += 1;

      const alunoId = alunoSeq++;
      alunosImportados.push({
        id: alunoId,
        nome: alunoNome,
        matricula:
          indices.matricula !== -1 && cols[indices.matricula]
            ? cols[indices.matricula]
            : `AUTO-${sala.id}-${String(alunoId).padStart(4, '0')}`,
        salaId: sala.id,
        email: indices.email !== -1 ? (cols[indices.email] || '') : '',
        telefone: indices.telefone !== -1 ? (cols[indices.telefone] || '') : '',
        foto: '',
        ativo: true,
        dataCadastro: new Date().toISOString().split('T')[0],
      });
    });

    if (alunosImportados.length === 0) {
      throw new Error('Nenhum aluno válido foi encontrado no arquivo.');
    }

    const salasImportadas = Array.from(salasMap.values()).map((sala) => ({
      ...sala,
      turma: sala.turma || 'Turma não informada',
      periodo: sala.periodo || 'Manhã',
    }));

    return { alunos: alunosImportados, salas: salasImportadas };
  };

  const handleCsvButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleCsvInputChange = async (event) => {
    const input = event.target;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

  const reader = new FileReader();
  reader.onload = async (loadEvent) => {
      try {
        const text = loadEvent.target?.result;
        if (typeof text !== 'string') {
          throw new Error('Não foi possível ler o conteúdo do arquivo.');
        }

        const { alunos: alunosImportados, salas: salasImportadas } = parseCsvContent(text);

        setSalas(salasImportadas);
        setAlunos(alunosImportados);
        setSalaSelecionada(null);

        setImportResumo({
          arquivo: file.name,
          totalAlunos: alunosImportados.length,
          totalSalas: salasImportadas.length,
          horario: new Date().toLocaleString('pt-BR'),
        });

        alert(`✅ Importação concluída: ${alunosImportados.length} alunos distribuídos em ${salasImportadas.length} sala(s).`);
        // Pergunta ao usuário se deseja enviar os dados para o servidor
        try {
          if (confirm('Deseja enviar os dados importados para o servidor e salvá-los no banco de dados?')) {
            await sendImportToServer(alunosImportados, salasImportadas);
          }
        } catch (err) {
          console.error('Erro ao enviar importação ao servidor:', err);
          alert('Erro ao enviar os dados ao servidor: ' + (err?.message || err));
        }
      } catch (error) {
        console.error('❌ Erro ao importar CSV:', error);
        alert(`❌ Erro ao importar CSV: ${error.message}`);
      } finally {
        if (input) {
          input.value = '';
        }
      }
    };

    reader.onerror = () => {
      alert('❌ Não foi possível ler o arquivo selecionado.');
      input.value = '';
    };

    reader.readAsText(file, 'utf-8');
  };

  // Envia os dados importados para o backend
  const sendImportToServer = async (alunosImportados, salasImportadas) => {
    if (!Array.isArray(alunosImportados) || alunosImportados.length === 0) {
      alert('Nenhum aluno válido para enviar.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Não há token de autenticação. Faça login como administrador antes de enviar.');
      return;
    }

    setImportingToServer(true);
    try {
      const res = await api.post('/admin/import', {
        alunos: alunosImportados,
        salas: salasImportadas
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res?.data?.success) {
        alert(`✅ Importação enviada com sucesso. Alunos inseridos: ${res.data.inserted || 0}`);
        // Atualizar dados locais com o que está no servidor
        try {
          const fetchRes = await api.get('/admin/classrooms', {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (fetchRes?.data) {
            const { salas: salasServer = [], alunos: alunosServer = [] } = fetchRes.data;
            const mappedSalas = salasServer.map(s => ({
              id: s.id,
              nome: s.nome || s.name,
              turma: s.turma || '',
              periodo: s.periodo || '',
              totalAlunos: s.total_students || s.totalAlunos || 0,
              ativa: true
            }));

            const mappedAlunos = alunosServer.map(a => ({
              id: a.id,
              nome: a.nome,
              matricula: a.matricula,
              email: a.email,
              telefone: a.telefone,
              salaId: a.salaId,
              foto: a.foto,
              ativo: a.ativo,
              dataCadastro: a.dataCadastro || a.created_at
            }));

            setSalas(mappedSalas);
            setAlunos(mappedAlunos);
            // Persistir no formato esperado
            salvarDados('salas', mappedSalas);
            salvarDados('alunos', mappedAlunos);
          }
        } catch (e) {
          console.warn('Falha ao atualizar salas locais após import:', e?.response?.data || e.message || e);
        }
      } else {
        alert('Resposta inesperada do servidor: ' + JSON.stringify(res.data));
      }
    } catch (err) {
      console.error('Erro ao enviar import para servidor:', err);
      const message = err.response?.data?.error || err.message || 'Erro desconhecido';
      alert('Erro ao enviar import para servidor: ' + message);
      throw err;
    } finally {
      setImportingToServer(false);
    }
  };

  /**
   * Componente do Modal
   */
  const Modal = () => {
    if (!showModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold">
              {modalType === 'aluno' 
                ? (editingItem?.id ? '✏️ Editar Aluno' : '👤 Cadastrar Aluno por Sala')
                : (editingItem?.id ? '✏️ Editar Sala' : '🏫 Nova Sala')
              }
            </h3>
            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <div className="p-6 space-y-4">
            {modalType === 'aluno' ? (
              <>
                {/* Informação sobre cadastro por sala */}
                {!editingItem?.id && (
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start">
                      <div className="text-blue-600 text-lg mr-3">ℹ️</div>
                      <div>
                        <p className="text-sm text-blue-800 font-medium mb-1">
                          Cadastro de Aluno por Sala
                        </p>
                        <p className="text-xs text-blue-700">
                          Selecione uma sala existente para vincular o aluno. Caso não existam salas, 
                          primeiro importe uma sala em "Importar CSV".
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Foto do Aluno */}
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4">
                    {editingItem?.foto ? (
                      <img
                        src={editingItem.foto}
                        alt="Foto do aluno"
                        className="w-full h-full rounded-full object-cover border-4 border-gray-200"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
                        <Camera className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  {/* Botões de controle de foto */}
                  <div className="flex gap-3 justify-center mb-4">
                    <button 
                      onClick={() => setShowFotoHub(!showFotoHub)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                    >
                      <Upload className="w-4 h-4 inline mr-1" />
                      {showFotoHub ? 'Fechar Editor' : 'Configurar Foto'}
                    </button>
                    {editingItem?.foto && (
                      <button 
                        onClick={() => setEditingItem(prev => ({...prev, foto: null}))}
                        className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
                      >
                        <span className="inline mr-1">🗑️</span>
                        Remover Foto
                      </button>
                    )}
                  </div>

                  {/* FotoHub integrado */}
                  {showFotoHub && (
                    <div className="mb-6">
                      <FotoHubAluno 
                        currentPhoto={editingItem?.foto}
                        onPhotoChange={(newPhoto) => {
                          console.log('📸 FotoHub: Nova foto recebida, tamanho:', newPhoto?.length || 'null');
                          setEditingItem(prev => ({...prev, foto: newPhoto}));
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Campos do Aluno */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingItem?.nome || ''}
                    onChange={(e) => setEditingItem(prev => ({...prev, nome: e.target.value}))}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      !editingItem?.nome?.trim() ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="👤 Digite o nome completo do aluno"
                    required
                  />
                  {!editingItem?.nome?.trim() && (
                    <p className="text-red-500 text-xs mt-1">⚠️ Nome é obrigatório</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Matrícula</label>
                  <input
                    type="text"
                    value={editingItem?.matricula || ''}
                    onChange={(e) => setEditingItem(prev => ({...prev, matricula: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Número da matrícula"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sala <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editingItem?.salaId || ''}
                    onChange={(e) => setEditingItem(prev => ({...prev, salaId: parseInt(e.target.value)}))}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      !editingItem?.salaId ? 'border-red-300 bg-red-50' : 'border-green-300 bg-green-50'
                    }`}
                    required
                  >
                    <option value="">🏫 Selecione uma sala para o aluno</option>
                    {salas.map(sala => (
                      <option key={sala.id} value={sala.id}>
                        📚 {sala.nome} - {sala.turma} ({sala.periodo})
                      </option>
                    ))}
                  </select>
                  {salaSelecionada && editingItem?.salaId === salaSelecionada.id && !editingItem?.id ? (
                    <p className="text-green-600 text-xs mt-1">✅ Aluno será adicionado à sala selecionada</p>
                  ) : !editingItem?.salaId ? (
                    <p className="text-red-500 text-xs mt-1">⚠️ É obrigatório selecionar uma sala</p>
                  ) : null}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={editingItem?.email || ''}
                    onChange={(e) => setEditingItem(prev => ({...prev, email: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="email@escola.com"
                  />
                </div>
              </>
            ) : (
              <>
                {/* Campos da Sala */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome da Sala</label>
                  <input
                    type="text"
                    value={editingItem?.nome || ''}
                    onChange={(e) => setEditingItem(prev => ({...prev, nome: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: 1º Ano A"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Turma</label>
                  <select
                    value={editingItem?.turma || ''}
                    onChange={(e) => setEditingItem(prev => ({...prev, turma: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Ensino Médio">Ensino Médio</option>
                    <option value="Ensino Fundamental II">Ensino Fundamental II</option>
                    <option value="Ensino Fundamental I">Ensino Fundamental I</option>
                  </select>
                </div>



                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Período</label>
                  <select
                    value={editingItem?.periodo || ''}
                    onChange={(e) => setEditingItem(prev => ({...prev, periodo: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Manhã">Manhã</option>
                    <option value="Tarde">Tarde</option>
                    <option value="Noite">Noite</option>
                  </select>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancelar
            </button>
            {modalType === 'sala' && editingItem?.id && (
              <button
                onClick={() => handleDeleteSala(editingItem.id)}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4 inline mr-2" />
                Excluir Sala
              </button>
            )}
            <button
              onClick={modalType === 'aluno' ? handleSaveAluno : handleSaveSala}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Salvar</span>
            </button>
          </div>
        </div>
      </div>
    );
  };



  return (
    <div className="min-h-screen bg-gray-50">
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={handleCsvInputChange}
      />
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Painel de Administração
              </h1>
              <p className="text-gray-600">
                Gerencie alunos, salas de aula e configurações do sistema
              </p>
            </div>
            
            <div className="flex items-center space-x-2 bg-red-100 text-red-800 px-3 py-2 rounded-full">
              <GraduationCap className="w-5 h-5" />
              <span className="text-sm font-medium">Administrador</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controles Administrativos */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h3 className="text-sm font-semibold text-gray-700">Controles do Sistema:</h3>
              <div className="flex space-x-2">
                <button
                  onClick={handleCsvButtonClick}
                  className="flex items-center space-x-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-lg transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <span>Importar CSV</span>
                </button>
                <button
                  onClick={exportarDados}
                  className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Exportar Backup</span>
                </button>
                {/* botão 'Limpar Dados' removido conforme solicitação do usuário */}
              </div>
            </div>
            <div className="text-xs text-gray-600 bg-white px-3 py-1 rounded-full border">
              💾 Alterações salvas automaticamente
            </div>
          </div>

        </div>
      </div>

      {/* Lista de Alunos */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div>

            {/* Header da seção Alunos com Seletor de Sala */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    Lista de Alunos
                    {salaSelecionada && (
                      <span className="ml-2 text-sm font-normal text-green-600">- {salaSelecionada.nome}</span>
                    )}
                  </h2>
                  <div className="text-sm text-gray-500">{alunos.length} aluno(s) no total</div>
                </div>

                {/* Botões de ação centralizados */}
                <div className="flex items-center space-x-2 flex-1 justify-center mx-8">
                  <button onClick={selectAllVisiveis} className="px-3 py-1 bg-gray-700 hover:bg-gray-800 text-white rounded text-sm transition-colors">Selecionar visíveis</button>
                  <button onClick={clearSelection} className="px-3 py-1 bg-gray-700 hover:bg-gray-800 text-white rounded text-sm transition-colors">Limpar seleção</button>
                  <button onClick={handleDeleteSelected} className="px-3 py-1 bg-red-700 hover:bg-red-800 text-white rounded text-sm transition-colors">Excluir selecionados</button>
                </div>

                {/* Seletor de Sala */}
                <div className="flex flex-col space-y-1">
                  <label className="text-xs font-medium text-gray-700">Filtrar por sala:</label>
                  <select
                    value={salaSelecionada?.id || ''}
                    onChange={(e) => {
                      const salaId = e.target.value;
                      setSalaSelecionada(salaId ? salas.find(s => s.id == salaId) : null);
                    }}
                    className="px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[180px] text-xs"
                  >
                    <option value="">🎓 Todos os Alunos ({alunos.length})</option>
                    {salas.map(sala => {
                      const alunosDaSala = alunos.filter(aluno => aluno.salaId === sala.id);
                      return (
                        <option key={sala.id} value={sala.id}>
                          📚 {sala.nome} ({alunosDaSala.length} alunos)
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
            </div>

            {/* Lista de Alunos */}
            {(() => {
              // Filtrar alunos baseado na sala selecionada
              const alunosFiltrados = salaSelecionada 
                ? alunos.filter(aluno => aluno.salaId == salaSelecionada.id)
                : alunos;
              
              return alunosFiltrados.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                  <div className="text-gray-400 text-6xl mb-4">👥</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {salaSelecionada 
                      ? `Nenhum aluno na ${salaSelecionada.nome}` 
                      : 'Nenhum aluno cadastrado'
                    }
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {salaSelecionada
                      ? `A sala "${salaSelecionada.nome}" ainda não possui alunos cadastrados.`
                      : 'Para cadastrar alunos, você precisa primeiro ter salas criadas.'
                    }
                  </p>
                  {salaSelecionada ? (
                    <div className="space-y-2">
                      <p className="text-blue-600 font-medium">
                        📚 Sala: {salaSelecionada.nome} - {salaSelecionada.turma}
                      </p>
                      <p className="text-sm text-gray-500">
                        Clique em "Adicionar à {salaSelecionada.nome}" para cadastrar o primeiro aluno
                      </p>
                    </div>
                  ) : salas.length === 0 ? (
                    <p className="text-orange-600 font-medium">
                      ⚠️ Primeiro importe uma sala, em "Importar CSV"
                    </p>
                  ) : (
                    <p className="text-green-600 font-medium">
                      ✅ {salas.length} sala(s) disponível(is) para vincular alunos
                    </p>
                  )}
                </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input type="checkbox" checked={selectedAlunos.length > 0 && (
                          (salaSelecionada ? alunos.filter(a => a.salaId === salaSelecionada.id).every(a => selectedAlunos.includes(a.id)) : alunos.every(a => selectedAlunos.includes(a.id)))
                        )} onChange={(e) => {
                          if (e.target.checked) selectAllVisiveis(); else clearSelection();
                        }} />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aluno
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Matrícula
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sala
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {alunosFiltrados.map((aluno) => {
                      const sala = salas.find(s => s.id === aluno.salaId);
                      return (
                        <tr key={aluno.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <input type="checkbox" checked={selectedAlunos.includes(aluno.id)} onChange={() => toggleSelectAluno(aluno.id)} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {aluno.foto ? (
                                <img
                                  src={aluno.foto}
                                  alt={aluno.nome}
                                  className="h-10 w-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                  <span className="text-gray-600 text-xs font-medium">{aluno.nome.charAt(0).toUpperCase()}</span>
                                </div>
                              )}
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {aluno.nome}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {aluno.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {aluno.matricula}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {sala ? (
                              <div>
                                <div className="font-medium">📚 {sala.nome}</div>
                                <div className="text-xs text-gray-500">{sala.turma} - {sala.periodo}</div>
                              </div>
                            ) : (
                              <span className="text-red-500">❌ Sala não encontrada</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              aluno.ativo 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {aluno.ativo ? 'Ativo' : 'Inativo'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => handleEditAluno(aluno)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteAluno(aluno.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            );
            })()}

            {/* Seção: Alunos desvinculados (sem sala) */}
            <div className="mt-10">
              <h3 className="text-lg font-semibold mb-3">Alunos desvinculados (sem sala)</h3>
              {alunos.filter(a => !a.salaId || a.salaId === null).length === 0 ? (
                <p className="text-sm text-gray-500">Nenhum aluno desvinculado.</p>
              ) : (
                <div className="bg-white rounded-lg p-4 border border-gray-100">
                  {alunos.filter(a => !a.salaId || a.salaId === null).map(aluno => (
                    <div key={aluno.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <div>
                        <div className="font-medium">{aluno.nome}</div>
                        <div className="text-xs text-gray-500">Matrícula: {aluno.matricula}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          placeholder="Série / Turma"
                          defaultValue={aluno.turma || ''}
                          onBlur={(e) => {
                            const serie = e.target.value;
                            const novo = alunos.map(a => a.id === aluno.id ? { ...a, turma: serie } : a);
                            setAlunos(novo);
                            salvarDados('alunos', novo);
                          }}
                          className="px-3 py-1 border rounded text-sm"
                        />
                        <button
                          onClick={() => {
                            if (!confirm('Remover aluno definitivamente?')) return;
                            const token = localStorage.getItem('token');
                            (async () => {
                              try {
                                if (token) await api.delete(`/admin/students/${aluno.id}`, { headers: { Authorization: `Bearer ${token}` } });
                              } catch (e) { console.warn('Falha ao remover aluno servidor:', e); }
                              const remaining = alunos.filter(a => a.id !== aluno.id);
                              setAlunos(remaining);
                              salvarDados('alunos', remaining);
                            })();
                          }}
                          className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                        >Excluir</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
        </div>


      </div>

      {deleteSalaPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Remover sala</h3>
              <p className="text-sm text-gray-600 mt-1">
                O que deseja fazer com a sala <span className="font-semibold">{deleteSalaPrompt.nome}</span>?
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => confirmDeleteSala(false)}
                className="w-full px-4 py-3 bg-red-600 text-white rounded-lg flex items-center justify-center space-x-2 hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Excluir sala e alunos vinculados</span>
              </button>
              <button
                onClick={() => confirmDeleteSala(true)}
                className="w-full px-4 py-3 bg-amber-100 text-amber-800 rounded-lg flex items-center justify-center space-x-2 hover:bg-amber-200 transition-colors"
              >
                <span>Remover sala e manter alunos (desvincular)</span>
              </button>
            </div>
            <div className="text-right">
              <button
                onClick={() => setDeleteSalaPrompt(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      <Modal />
    </div>
  );
};

export default Administracao;