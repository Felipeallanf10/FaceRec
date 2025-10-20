import React, { useState } from 'react';
import { X, Shield, Lock, Eye, Database, UserCheck } from 'lucide-react';

export default function ModalPrivacidade({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Política de Privacidade</h2>
                <p className="text-sm text-gray-600">FaceRec - Sistema de Reconhecimento</p>
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
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-blue-800">
              <UserCheck className="w-4 h-4" />
              <span className="font-semibold text-sm">Última atualização: 09 de Outubro de 2025</span>
            </div>
          </div>

          {/* Seções */}
          <div className="space-y-6">
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-600" />
                1. Coleta de Dados
              </h3>
              <div className="text-gray-700 space-y-2">
                <p>O FaceRec coleta os seguintes tipos de informação:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Dados de Cadastro:</strong> Nome completo, email, telefone, CPF</li>
                  <li><strong>Fotos Biométricas:</strong> Imagens faciais para reconhecimento</li>
                  <li><strong>Dados de Acesso:</strong> Login, horários de uso, atividades no sistema</li>
                  <li><strong>Dados Técnicos:</strong> IP, navegador, dispositivo (para segurança)</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Database className="w-5 h-5 text-green-600" />
                2. Uso das Informações
              </h3>
              <div className="text-gray-700 space-y-2">
                <p>Utilizamos seus dados para:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Autenticação e reconhecimento facial</li>
                  <li>Controle de presença e chamadas automatizadas</li>
                  <li>Melhoria do sistema e algoritmos de IA</li>
                  <li>Comunicação sobre o serviço</li>
                  <li>Segurança e prevenção de fraudes</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Lock className="w-5 h-5 text-purple-600" />
                3. Proteção de Dados
              </h3>
              <div className="text-gray-700 space-y-2">
                <p>Implementamos medidas de segurança rigorosas:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Criptografia de dados em trânsito e repouso</li>
                  <li>Acesso restrito por função (professores vs. administradores)</li>
                  <li>Backups seguros e redundância</li>
                  <li>Monitoramento contínuo de segurança</li>
                  <li>Conformidade com LGPD (Lei Geral de Proteção de Dados)</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">4. Compartilhamento</h3>
              <div className="text-gray-700 space-y-2">
                <p className="font-medium text-green-700">
                  🔒 Não compartilhamos seus dados com terceiros para fins comerciais.
                </p>
                <p>Compartilhamento apenas ocorre:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Com seu consentimento explícito</li>
                  <li>Para cumprimento legal obrigatório</li>
                  <li>Para proteção de direitos e segurança</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">5. Seus Direitos</h3>
              <div className="text-gray-700 space-y-2">
                <p>Conforme a LGPD, você tem direito a:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Acessar seus dados pessoais</li>
                  <li>Corrigir dados incompletos ou desatualizados</li>
                  <li>Solicitar exclusão de dados</li>
                  <li>Revogar consentimento</li>
                  <li>Portabilidade dos dados</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">6. Contato</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 mb-2">Para questões sobre privacidade:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li><strong>Email:</strong> julia.rossin@eaportal.org</li>
                  <li><strong>Telefone:</strong> (19)98184-6601</li>
                  <li><strong>Endereço:</strong> unasp-ec</li>
                </ul>
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50 rounded-b-2xl">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Esta política está em conformidade com a LGPD
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}