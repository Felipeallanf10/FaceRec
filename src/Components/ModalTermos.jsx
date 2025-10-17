import React from 'react';
import { X, FileText, Scale, Shield, AlertCircle, CheckCircle, Users } from 'lucide-react';

export default function ModalTermos({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Termos de Uso</h2>
                <p className="text-sm text-gray-600">FaceRec AI - Sistema de Reconhecimento Facial</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Última atualização */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-indigo-800">
              <CheckCircle className="w-4 h-4" />
              <span className="font-semibold text-sm">Última atualização: 09 de Outubro de 2025</span>
            </div>
            <p className="text-indigo-700 text-sm mt-1">
              Ao usar o FaceRec AI, você concorda com estes termos e condições.
            </p>
          </div>

          {/* Seções dos Termos */}
          <div className="space-y-8">
            {/* 1. Aceitação dos Termos */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Scale className="w-5 h-5 text-indigo-600" />
                1. Aceitação dos Termos
              </h3>
              <div className="text-gray-700 space-y-3">
                <p>
                  Ao acessar e usar o sistema FaceRec AI, você concorda em cumprir e estar 
                  vinculado a estes Termos de Uso. Se você não concordar com qualquer parte 
                  destes termos, não deve usar nosso sistema.
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                    <p className="text-amber-800 text-sm">
                      <strong>Importante:</strong> Estes termos constituem um acordo legal 
                      entre você e o FaceRec AI. Leia cuidadosamente.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. Descrição do Serviço */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                2. Descrição do Serviço
              </h3>
              <div className="text-gray-700 space-y-3">
                <p>
                  O FaceRec AI é um sistema de reconhecimento facial para controle de 
                  presença em ambiente educacional que oferece:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Reconhecimento facial automatizado para chamada</li>
                  <li>Gestão de alunos e salas de aula</li>
                  <li>Relatórios de presença e frequência</li>
                  <li>Painel administrativo para professores e gestores</li>
                  <li>Backup e sincronização de dados</li>
                </ul>
              </div>
            </section>

            {/* 3. Conta de Usuário */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                3. Conta de Usuário e Responsabilidades
              </h3>
              <div className="text-gray-700 space-y-3">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-2">✅ Você DEVE:</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Fornecer informações precisas e atualizadas</li>
                      <li>• Manter a confidencialidade da sua senha</li>
                      <li>• Usar o sistema apenas para fins educacionais</li>
                      <li>• Respeitar a privacidade dos alunos</li>
                      <li>• Notificar sobre uso não autorizado</li>
                    </ul>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-red-800 mb-2">❌ Você NÃO DEVE:</h4>
                    <ul className="text-sm text-red-700 space-y-1">
                      <li>• Compartilhar credenciais de acesso</li>
                      <li>• Tentar burlar o sistema de reconhecimento</li>
                      <li>• Usar dados para fins comerciais externos</li>
                      <li>• Realizar engenharia reversa do software</li>
                      <li>• Interferir no funcionamento do sistema</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* 4. Uso Aceitável */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">4. Política de Uso Aceitável</h3>
              <div className="text-gray-700 space-y-3">
                <p>O sistema FaceRec AI deve ser usado exclusivamente para:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Controle de presença educacional:</strong> Chamada automatizada em salas de aula</li>
                  <li><strong>Gestão acadêmica:</strong> Relatórios e estatísticas de frequência</li>
                  <li><strong>Administração escolar:</strong> Gerenciamento de turmas e alunos</li>
                </ul>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                  <h4 className="font-semibold text-red-800 mb-2">🚫 Uso Proibido:</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• Vigilância não autorizada ou invasão de privacidade</li>
                    <li>• Discriminação baseada em características físicas</li>
                    <li>• Coleta de dados biométricos para outros fins</li>
                    <li>• Revenda ou redistribuição do sistema</li>
                    <li>• Atividades ilegais ou não éticas</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 5. Dados e Privacidade */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">5. Proteção de Dados e Privacidade</h3>
              <div className="text-gray-700 space-y-3">
                <p>
                  O tratamento de dados pessoais e biométricos segue rigorosamente 
                  a Lei Geral de Proteção de Dados (LGPD):
                </p>
                <div className="grid md:grid-cols-3 gap-4 mt-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <h5 className="font-semibold text-blue-800 text-sm mb-1">🔒 Coleta</h5>
                    <p className="text-blue-700 text-xs">
                      Apenas dados necessários para funcionamento do sistema
                    </p>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <h5 className="font-semibold text-purple-800 text-sm mb-1">🛡️ Proteção</h5>
                    <p className="text-purple-700 text-xs">
                      Criptografia e medidas de segurança avançadas
                    </p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <h5 className="font-semibold text-green-800 text-sm mb-1">👤 Direitos</h5>
                    <p className="text-green-700 text-xs">
                      Acesso, correção, exclusão e portabilidade garantidos
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 6. Propriedade Intelectual */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">6. Propriedade Intelectual</h3>
              <div className="text-gray-700 space-y-3">
                <p>
                  Todos os direitos autorais, marcas registradas e propriedade intelectual 
                  do FaceRec AI são de propriedade exclusiva dos desenvolvedores.
                </p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Direitos Reservados:</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Algoritmos de reconhecimento facial</li>
                    <li>• Interface e design do sistema</li>
                    <li>• Código-fonte e arquitetura</li>
                    <li>• Documentação e materiais de treinamento</li>
                    <li>• Nome e marca FaceRec AI</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 7. Limitações e Responsabilidades */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">7. Limitações de Responsabilidade</h3>
              <div className="text-gray-700 space-y-3">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                    <div className="text-yellow-800 text-sm">
                      <p className="font-semibold mb-1">Importante sobre Precisão:</p>
                      <p>
                        O reconhecimento facial pode ter variações de precisão devido a 
                        fatores como iluminação, qualidade da câmera e condições ambientais. 
                        O sistema deve ser usado como ferramenta auxiliar, não substituto 
                        do julgamento humano.
                      </p>
                    </div>
                  </div>
                </div>
                <p>
                  O FaceRec AI não se responsabiliza por danos indiretos, perda de dados 
                  ou interrupções de serviço fora de nosso controle.
                </p>
              </div>
            </section>

            {/* 8. Modificações */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">8. Modificações dos Termos</h3>
              <div className="text-gray-700">
                <p>
                  Reservamos o direito de modificar estes termos a qualquer momento. 
                  Mudanças significativas serão notificadas com pelo menos 30 dias de antecedência.
                  O uso continuado do sistema após as modificações constitui aceitação dos novos termos.
                </p>
              </div>
            </section>

            {/* 9. Contato Legal */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">9. Contato e Jurisdição</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">📧 Questões Legais:</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li><strong>Email:</strong> juridico@facerec.ai</li>
                      <li><strong>Telefone:</strong> (11) 9999-7777</li>
                      <li><strong>Horário:</strong> Seg-Sex, 9h às 17h</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">⚖️ Jurisdição:</h4>
                    <p className="text-sm text-gray-700">
                      Este acordo é regido pelas leis brasileiras. 
                      Foro da comarca de São Paulo/SP para resolver disputas.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Aviso Final */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 text-center">
            <CheckCircle className="w-8 h-8 text-indigo-600 mx-auto mb-3" />
            <h4 className="font-bold text-indigo-900 mb-2">Acordo Aceito</h4>
            <p className="text-sm text-indigo-700">
              Ao usar o FaceRec AI, você confirma ter lido, compreendido e 
              concordado com todos os termos e condições acima descritos.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50 rounded-b-2xl">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Versão 2.1 • Efetivo desde 09/10/2025
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Li e Concordo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}