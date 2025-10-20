import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Camera, 
  Shield, 
  Zap, 
  ArrowRight,
  Menu,
  X,
  Sparkles,
  Globe,
  Lock,
  Users,
  Phone,
  Mail,
  MessageCircle,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

export default function Homepage() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isSupportOpen, setIsSupportOpen] = React.useState(false);

  return (
    <div className="min-h-screen w-screen overflow-x-hidden" style={{background: 'linear-gradient(135deg, #0f1e2a, #1a2f3a)'}}>
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-6 py-4 backdrop-blur-md" style={{background: '#698ea2'}}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{background: 'linear-gradient(135deg, #e4a576, #d89660)'}}>
              <Camera className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">FaceRec</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <Link 
              to="/login" 
              className="px-5 py-2.5 rounded-xl font-medium transition-all text-sm hover:scale-105"
              style={{background: 'linear-gradient(135deg, #e4a576, #d89660)', color: 'white'}}
            >
              Começar
            </Link>
          </div>

          <button 
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 border backdrop-blur-sm"
            style={{background: 'rgba(228, 165, 118, 0.1)', borderColor: 'rgba(228, 165, 118, 0.2)'}}
          >
            <Camera className="w-4 h-4" style={{color: '#e4a576'}} />
            <span className="text-sm font-medium text-white">Reconhecimento Facial de Nova Geração</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
          >
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Videochamadas
            </span>{' '}
            Inteligentes
            <br />
            com{' '}
            <span 
              className="bg-gradient-to-r bg-clip-text text-transparent"
              style={{backgroundImage: 'linear-gradient(135deg, #e4a576, #f4b88a)'}}
            >
              Reconhecimento Facial
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl text-white/70 mb-10 max-w-3xl mx-auto leading-relaxed"
          >
            Experimente o futuro da comunicação por vídeo com reconhecimento facial avançado, 
            conexões seguras e experiência perfeita para o usuário.
          </motion.p>

          {/* Hero Visual */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="relative max-w-4xl mx-auto"
          >
            {/* Main Dashboard Mockup */}
            <div 
              className="rounded-3xl p-8 shadow-2xl border"
              style={{
                background: 'linear-gradient(135deg, rgba(223, 204, 204, 0.1), rgba(204, 213, 209, 0.05))',
                borderColor: 'rgba(255, 255, 255, 0.1)'
              }}
            >
              {/* Top Bar */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{background: '#ff5f56'}}></div>
                  <div className="w-3 h-3 rounded-full" style={{background: '#ffbd2e'}}></div>
                  <div className="w-3 h-3 rounded-full" style={{background: '#27ca3f'}}></div>
                </div>
                <div className="text-white/60 text-sm">facerec.com/dashboard</div>
              </div>

              {/* Content Area */}
              <div className="grid md:grid-cols-3 gap-6">
                {/* Active Call */}
                <div className="md:col-span-2 rounded-2xl p-6" style={{background: 'rgba(15, 30, 42, 0.5)'}}>
                  <div className="flex items-center justify-center h-48 rounded-xl" style={{background: 'rgba(228, 165, 118, 0.1)'}}>
                    <Camera className="w-16 h-16" style={{color: '#e4a576'}} />
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-white font-medium">Active Call</div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full animate-pulse" style={{background: '#27ca3f'}}></div>
                      <span className="text-white/60 text-sm">Conectado</span>
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                  <div className="rounded-2xl p-4" style={{background: 'rgba(105, 142, 162, 0.1)'}}>
                    <div className="text-white font-medium mb-2">Sistema</div>
                    <div className="text-2xl font-bold" style={{color: '#698ea2'}}>Ativo</div>
                    <div className="text-white/60 text-sm">Funcionando</div>
                  </div>
                  
                  <div className="rounded-2xl p-4" style={{background: 'rgba(228, 165, 118, 0.1)'}}>
                    <div className="text-white font-medium mb-2">Instituição</div>
                    <div className="text-2xl font-bold" style={{color: '#e4a576'}}>UNASP</div>
                    <div className="text-white/60 text-sm">Centro Universitário</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-6 -left-6 w-16 h-16 rounded-full flex items-center justify-center animate-pulse" style={{background: 'linear-gradient(135deg, #698ea2, #5a7a8a)'}}>
              <Shield className="w-8 h-8 text-white" />
            </div>
            
            <div className="absolute -bottom-6 -right-6 w-16 h-16 rounded-full flex items-center justify-center animate-pulse" style={{background: 'linear-gradient(135deg, #e4a576, #d89660)'}}>
              <Zap className="w-8 h-8 text-white" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Por que escolher o FaceRec?
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Construído com tecnologia de ponta para o mundo moderno
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Camera,
                title: "Reconhecimento Facial",
                description: "Sistema de reconhecimento facial para registro de presença com tecnologia moderna e interface intuitiva"
              },
              {
                icon: Lock,
                title: "Segurança dos Dados",
                description: "Proteção adequada das informações dos usuários com práticas de segurança estabelecidas"
              },
              {
                icon: Globe,
                title: "Fácil Acesso",
                description: "Acesse o sistema de qualquer dispositivo conectado à internet com navegador web moderno"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="p-8 rounded-3xl backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all group"
                style={{background: 'rgba(255, 255, 255, 0.02)'}}
              >
                <div className="w-16 h-16 rounded-2xl mb-6 flex items-center justify-center group-hover:scale-110 transition-transform" style={{background: 'linear-gradient(135deg, #e4a576, #d89660)'}}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-white/70 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="p-12 rounded-3xl backdrop-blur-sm border border-white/10"
            style={{background: 'linear-gradient(135deg, rgba(228, 165, 118, 0.05), rgba(105, 142, 162, 0.05))'}}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Pronto para Transformar suas Chamadas?
            </h2>
            
            <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
              Junte-se a milhares de usuários que já melhoraram sua experiência de comunicação
            </p>
            
            <Link 
              to="/login"
              className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl font-semibold text-white transition-all transform hover:scale-105 shadow-xl"
              style={{background: 'linear-gradient(135deg, #e4a576, #d89660)'}}
            >
              Comece Hoje
              <ArrowRight className="w-6 h-6" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10" style={{background: '#698ea2'}}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{background: 'linear-gradient(135deg, #e4a576, #d89660)'}}>
                <Camera className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">FaceRec</span>
            </div>
            
            <div className="flex items-center gap-8">
              <button 
                onClick={() => setIsSupportOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm text-white font-medium transition-all hover:scale-105 hover:bg-white/20 border border-white/20"
              >
                <Users className="w-4 h-4" />
                Suporte
              </button>
            </div>
            
            <div className="text-white/60 text-sm">
              © 2025 FaceRec. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      {/* Modal de Suporte */}
      {isSupportOpen && (
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
                  onClick={() => setIsSupportOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
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
                  <p className="text-red-600 text-sm mb-3">
                    Para situações críticas que impedem o funcionamento do sistema, entre em contato imediatamente:
                  </p>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-red-600" />
                      <span className="font-mono text-red-700">(19)98184-6601</span>
                      <span className="text-red-600 text-xs">(24h)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-red-600" />
                      <span className="font-mono text-red-700">julia.rossin@eaportal.org</span>
                    </div>
                  </div>
                </div>

                {/* Informações Adicionais */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">📍 Informações de Contato</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-800">Endereço:</p>
                      <p className="text-gray-600">
                        Centro Universitário Adventista de São Paulo<br />
                        Estrada de Itapecerica, 5859<br />
                        Capão Redondo - São Paulo/SP<br />
                        CEP: 05858-001
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 mb-2">Horário de Atendimento:</p>
                      <div className="space-y-1 text-gray-600">
                        <p>📞 Telefone: Segunda a Sexta, 8h às 18h</p>
                        <p>📧 Email: Resposta em até 24 horas</p>
                        <p>🚨 Emergências: 24 horas por dia</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}