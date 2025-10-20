import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { User, LogOut, Shield, Camera } from 'lucide-react';
import { motion } from 'framer-motion';
import ModalPrivacidade from '../Components/ModalPrivacidade';
import ModalSuporte from '../Components/ModalSuporte';
import ModalTermos from '../Components/ModalTermos';
import { buildUploadsUrl } from '@/lib/api';


export default function MainLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario, isAdmin } = useUser();
  const [showPrivacidade, setShowPrivacidade] = useState(false);
  const [showSuporte, setShowSuporte] = useState(false);
  const [showTermos, setShowTermos] = useState(false);

  // Debug do usuário atual
  console.log("🔍 MainLayout - Usuário atual:", usuario);
  console.log("🔍 MainLayout - isAdmin():", isAdmin());
  console.log("🔍 MainLayout - role:", usuario?.role);
  console.log("🔍 MainLayout - tipo:", usuario?.tipo);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/'); // Redireciona para a homepage
  };

  // Função para obter nome de exibição
  const getDisplayName = () => {
    if (usuario?.full_name) return usuario.full_name;
    if (usuario?.nome) return usuario.nome;
    if (usuario?.email) return usuario.email.split('@')[0];
    return 'Usuário';
  };

  // Função para obter foto de perfil
  const getProfilePicture = () => {
    const url =
      usuario?.photoURL ||
      usuario?.profile_picture ||
      usuario?.foto ||
      null;
    if (!url) return null;
    return buildUploadsUrl(url);
  };

  // Itens de navegação baseados no tipo de usuário
  const navItems = [
    { to: '/alunos', label: 'Salas de Aula', roles: ['professor', 'admin'] },
    ...(isAdmin() ? [{ to: '/admin', label: 'Administração', roles: ['admin'] }] : []),
    { to: '/configuracoes', label: 'Configurações', roles: ['professor', 'admin'] },
  ].filter(item => !item.roles || item.roles.includes(usuario?.role || 'professor'));

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header FaceRec com blur e fundo translúcido */}
      <header
        className="sticky top-0 z-40 border-b border-slate-200/60 backdrop-blur-md"
        style={{ background: 'rgba(255, 255, 255, 0.8)' }}
      >
        <nav className="container-pro h-16 flex items-center justify-between">
          {/* Marca com câmera animada */}
          <Link to="/home" className="flex items-center gap-3 no-underline group">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
              className="relative"
            >
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 rounded-full animate-pulse shadow-lg group-hover:shadow-xl transition-all duration-200" style={{background: 'linear-gradient(45deg, #698ea2, #e4a576)', boxShadow: '0 8px 20px -8px rgba(228, 165, 118, 0.4)'}}></div>
                <div className="absolute inset-1 bg-gradient-to-r from-slate-700 to-slate-800 rounded-full"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Camera className="w-5 h-5 text-white drop-shadow-md" />
                </div>
                
                {/* Anel Orbital */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border border-orange-300/40 rounded-full"
                />
              </div>
            </motion.div>
            <div>
              <span className="text-xl font-bold heading-ai bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                FaceRec
              </span>
              <div className="text-xs text-slate-500 mono-ai -mt-1">System</div>
            </div>
          </Link>

          {/* Navegação Neural */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((it) => (
              <Link 
                key={it.to} 
                to={it.to} 
                className={`relative px-3 py-2 rounded-lg font-medium transition-all duration-200 text-ai ${
                  location.pathname === it.to 
                    ? 'text-blue-600 bg-blue-50 shadow-sm' 
                    : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                {it.label}
                {location.pathname === it.to && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></div>
                )}
              </Link>
            ))}
          </div>

          {/* Mini Hub de Perfil com nome, foto e botão sair */}
          <div className="flex items-center gap-3">
            {/* Foto de Perfil */}
            <div className="relative">
              {getProfilePicture() ? (
                <img
                  src={getProfilePicture()}
                  alt="Foto de Perfil"
                  className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
              {/* Status Indicator */}
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
            </div>
            
            {/* Nome do Usuário */}
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-slate-800 heading-ai">{getDisplayName()}</p>
              <p className="text-xs text-slate-500 mono-ai flex items-center">
                {isAdmin() && <Shield className="w-3 h-3 mr-1" />}
                {isAdmin() ? 'Administrador' : 'Professor'}
              </p>
            </div>
            
            {/* Botão Sair */}
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200 text-ai"
              title="Sair do Sistema"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Sair</span>
            </button>
          </div>
        </nav>
      </header>

      {/* Conteúdo com largura/padding padrão */}
      <main className="flex-1">
        <div className="container-pro page">{children}</div>
      </main>

      <footer className="border-t border-slate-200/60 mt-16 bg-gradient-to-r from-slate-50 to-blue-50">
        <div className="container-pro py-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {/* Componente de Câmera da página de login */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
              className="relative"
            >
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full animate-pulse shadow-lg" style={{background: 'linear-gradient(45deg, #698ea2, #e4a576)', boxShadow: '0 8px 20px -8px rgba(228, 165, 118, 0.4)'}}></div>
                <div className="absolute inset-1 bg-gradient-to-r from-slate-700 to-slate-800 rounded-full"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white drop-shadow-md" />
                </div>
                
                {/* Anel Orbital */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border border-orange-300/40 rounded-full"
                />
              </div>
            </motion.div>
            
            <p className="text-sm text-slate-600 text-ai">
              © {new Date().getFullYear()} FaceRec — Sistema Inteligente de Reconhecimento.
            </p>
          </div>
          
          <div className="flex gap-6 text-sm">
            <button 
              onClick={() => setShowPrivacidade(true)}
              className="text-slate-500 hover:text-blue-600 transition-colors text-ai hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded px-2 py-1" 
            >
              Privacidade
            </button>
            <button 
              onClick={() => setShowTermos(true)}
              className="text-slate-500 hover:text-purple-600 transition-colors text-ai hover:underline focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 rounded px-2 py-1" 
            >
              Termos
            </button>
            <button 
              onClick={() => setShowSuporte(true)}
              className="text-slate-500 hover:text-green-600 transition-colors text-ai hover:underline focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 rounded px-2 py-1" 
            >
              Suporte
            </button>
          </div>
        </div>
      </footer>

      {/* Modais */}
      <ModalPrivacidade isOpen={showPrivacidade} onClose={() => setShowPrivacidade(false)} />
      <ModalTermos isOpen={showTermos} onClose={() => setShowTermos(false)} />
      <ModalSuporte isOpen={showSuporte} onClose={() => setShowSuporte(false)} />
    </div>
  );
}
