import React, { useState } from 'react';
import { X, Users, Phone, Mail, MessageCircle, Clock, CheckCircle, AlertTriangle, Bug } from 'lucide-react';

export default function ModalSuporte({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('contato');
  const [ticket, setTicket] = useState({
    tipo: 'duvida',
    assunto: '',
    mensagem: '',
    email: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simular envio do ticket
    alert('Ticket de suporte enviado com sucesso! Em breve entraremos em contato.');
    setTicket({ tipo: 'duvida', assunto: '', mensagem: '', email: '' });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Central de Suporte</h2>
                <p className="text-green-100 text-sm">Estamos aqui para ajudar você</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mt-6">
            {[
              { id: 'contato', label: 'Contato', icon: Phone },
              { id: 'faq', label: 'FAQ', icon: Users },
              { id: 'ticket', label: 'Abrir Ticket', icon: MessageCircle }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  activeTab === id
                    ? 'bg-white text-green-600'
                    : 'text-green-100 hover:bg-white/20'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === 'contato' && (
            <div className="space-y-6">
              {/* Canais de Atendimento */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Phone className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Telefone</h3>
                      <p className="text-sm text-gray-600">Atendimento direto</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="font-mono text-lg text-blue-700">(19)98184-6601</p>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>Segunda a Sexta: 8h às 18h</span>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Email</h3>
                      <p className="text-sm text-gray-600">Resposta em até 24h</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="font-mono text-purple-700">julia.rossin@eaportal.org</p>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>Resposta em até 24 horas</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Suporte Técnico */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4">🔧 Suporte Técnico Especializado</h3>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Configuração de câmeras</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Problemas de reconhecimento</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Integração com sistemas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Treinamento de usuários</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Backup e recuperação</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Atualizações do sistema</span>
                  </div>
                </div>
              </div>

              {/* Emergência */}
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center gap-2 text-red-700 font-semibold mb-2">
                  <AlertTriangle className="w-5 h-5" />
                  Emergência (Sistema Fora do Ar)
                </div>
                <p className="text-sm text-red-600">
                  Para problemas críticos que impedem o funcionamento do sistema: 
                  <span className="font-mono ml-2">(19)98184-6601</span> (24h)
                </p>
              </div>
            </div>
          )}

          {activeTab === 'faq' && (
            <div className="space-y-4">
              {[
                {
                  pergunta: "Como cadastrar novos alunos no sistema?",
                  resposta: "Acesse o painel de Administração → Gerenciar Alunos → Adicionar Novo Aluno. Preencha os dados básicos e adicione uma foto para o reconhecimento facial."
                },
                {
                  pergunta: "O que fazer se o reconhecimento facial falhar?",
                  resposta: "1) Verifique se a iluminação está adequada, 2) Certifique-se de que a câmera está limpa, 3) Tente recadastrar a foto do aluno com melhor qualidade, 4) Entre em contato com o suporte se o problema persistir."
                },
                {
                  pergunta: "Como fazer backup dos dados?",
                  resposta: "No painel de Administração, use a função 'Exportar Backup'. Os dados são salvos em formato JSON seguro. Recomendamos fazer backup semanalmente."
                },
                {
                  pergunta: "Posso usar o sistema offline?",
                  resposta: "O sistema funciona principalmente online para sincronização de dados. Algumas funcionalidades básicas podem funcionar offline temporariamente."
                },
                {
                  pergunta: "Como alterar permissões de usuários?",
                  resposta: "Apenas administradores podem alterar permissões. No painel administrativo, selecione o usuário e modifique o nível de acesso (Professor ou Administrador)."
                },
                {
                  pergunta: "Quantos alunos posso cadastrar?",
                  resposta: "Não há limite técnico. O sistema é otimizado para escolas de qualquer tamanho, desde pequenas turmas até grandes instituições."
                }
              ].map((item, index) => (
                <details key={index} className="border border-gray-200 rounded-lg">
                  <summary className="p-4 cursor-pointer font-medium text-gray-900 hover:bg-gray-50">
                    ❓ {item.pergunta}
                  </summary>
                  <div className="px-4 pb-4 text-gray-700 text-sm leading-relaxed border-t border-gray-100 bg-gray-50">
                    {item.resposta}
                  </div>
                </details>
              ))}
            </div>
          )}

          {activeTab === 'ticket' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo do Problema
                  </label>
                  <select
                    value={ticket.tipo}
                    onChange={(e) => setTicket(prev => ({ ...prev, tipo: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="duvida">💬 Dúvida Geral</option>
                    <option value="tecnico">🔧 Problema Técnico</option>
                    <option value="bug">🐛 Bug ou Erro</option>
                    <option value="recurso">💡 Solicitação de Recurso</option>
                    <option value="conta">👤 Problema com Conta</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seu Email
                  </label>
                  <input
                    type="email"
                    value={ticket.email}
                    onChange={(e) => setTicket(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="seu@email.com"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assunto
                </label>
                <input
                  type="text"
                  value={ticket.assunto}
                  onChange={(e) => setTicket(prev => ({ ...prev, assunto: e.target.value }))}
                  placeholder="Descreva brevemente o problema..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição Detalhada
                </label>
                <textarea
                  value={ticket.mensagem}
                  onChange={(e) => setTicket(prev => ({ ...prev, mensagem: e.target.value }))}
                  placeholder="Descreva o problema em detalhes, incluindo passos para reproduzir, mensagens de erro, etc..."
                  rows={5}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-700">
                  📋 <strong>Dica:</strong> Para problemas técnicos, inclua informações sobre 
                  seu navegador, sistema operacional e passos exatos que levaram ao erro.
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Enviar Ticket de Suporte
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}