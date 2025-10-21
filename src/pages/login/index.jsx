import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, provider, signInWithPopup } from "../../firebase";
import { motion } from "framer-motion";
import api, { apiBaseURL } from "@/lib/api";
import { useUser } from "@/contexts/UserContext";
import {
  Eye,
  EyeOff,
  Brain,
  Shield,
  Zap,
  Network,
  Target,
  User,
  Lock,
  Mail,
  Chrome,
  Camera,
  ArrowLeft
} from "lucide-react";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const API_BASE = apiBaseURL;
  const { updateUser } = useUser();

  // Debug function para teste no console
  window.testLogin = async () => {
    console.log("🧪 Testando login com credenciais fixas");
    const testCredentials = {
      email: "teste@teste.com",
      password: "123456"
    };
    
    try {
      const res = await api.post("/login", testCredentials);
      console.log("🧪 Resultado do teste:", res.status, res.data);
      return { status: res.status, data: res.data };
    } catch (err) {
      if (err.response) {
        console.error("🧪 Erro no teste:", err.response.status, err.response.data);
        return { status: err.response.status, data: err.response.data };
      }
      console.error("🧪 Erro no teste:", err);
      return { error: err.message };
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      console.log("Usuário logado com Google:", result.user);

      const usuario = {
        email: result.user.email,
        full_name: result.user.displayName || "Usuário Google",
        profile_picture: result.user.photoURL || "",
        photoURL: result.user.photoURL || "",
        role: "professor",
        tipo: "professor"
      };

      localStorage.setItem("usuario", JSON.stringify(usuario));
      updateUser(usuario);
      navigate("/home");
    } catch (error) {
      console.error("Erro no login com Google:", error);
      alert("Falha no login com Google.");
    } finally {
      setLoading(false);
    }
  };

  // Credenciais de desenvolvimento/teste
  const credenciaisMock = {
    'admin@facerec.com': { senha: 'FaceRec@123', role: 'admin', nome: 'Administrador FaceRec' },
    'admin@escola.com': { senha: '123456', role: 'admin', nome: 'Administrador Sistema' },
    'administrador@escola.com': { senha: '123456', role: 'admin', nome: 'Administrador FaceRec' },
    'professor@escola.com': { senha: '123456', role: 'professor', nome: 'Professor Silva' },
    'teste@teste.com': { senha: '123456', role: 'professor', nome: 'Usuário Teste' }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    console.log("🔄 Iniciando login com:", { email: formData.email });
    
    try {
      // Verificar se é uma credencial de desenvolvimento
      const credencialMock = credenciaisMock[formData.email];
      
      if (credencialMock && formData.password === credencialMock.senha) {
        // Login mock para desenvolvimento
        console.log("🧪 Login mock detectado para:", formData.email);
        
        const usuario = {
          email: formData.email,
          full_name: credencialMock.nome,
          profile_picture: "",
          photoURL: "",
          role: credencialMock.role,
          tipo: credencialMock.role === 'admin' ? 'administrador' : 'professor'
        };

        console.log("🧪 Usuário criado para login mock:", usuario);
        console.log("🧪 Role:", credencialMock.role);
        console.log("🧪 Tipo:", credencialMock.role === 'admin' ? 'administrador' : 'professor');

        localStorage.setItem("token", `mock-token-${Date.now()}`);
        localStorage.setItem("usuario", JSON.stringify(usuario));
  updateUser(usuario);
        
        // Verificar se foi salvo corretamente
        const saved = localStorage.getItem("usuario");
        console.log("🧪 Usuário salvo no localStorage:", saved);
        console.log("🧪 Usuário parsed:", JSON.parse(saved));
        
        console.log("✅ Login mock bem-sucedido:", usuario);
        
        // Forçar recarregamento do contexto e navegação
        setTimeout(() => {
          // Recarregar a página para garantir que o contexto seja atualizado
          window.location.href = "/alunos";
        }, 200);
        return;
      }

      // Se não é credencial mock, tenta login real com backend
      console.log("🌐 Tentando login real com API:", API_BASE);
      
      const response = await api.post("/login", {
        email: formData.email,
        password: formData.password,
      });
      const data = response.data;
      console.log("📥 LOGIN RESPONSE:", response.status, data);

      if (!data?.token) throw new Error(data?.error || "Erro no login");

      const apiUser = data?.user;
      if (!apiUser?.id) {
        throw new Error("Resposta da API não retornou dados do usuário");
      }

      console.log("💾 Salvando token:", data.token);
      localStorage.setItem("token", data.token);

      const resolvedRole = apiUser.role === 'admin' ? 'admin' : 'professor';
      const usuario = {
        id: apiUser.id,
        email: apiUser.email || formData.email,
        full_name: apiUser.full_name || formData.email.split("@")[0],
        profile_picture: apiUser.profile_picture || "",
        photoURL: apiUser.photoURL || apiUser.profile_picture || "",
        role: resolvedRole,
        tipo: resolvedRole === 'admin' ? 'administrador' : 'professor',
        subject: apiUser.subject || "",
        school: apiUser.school || "",
        phone: apiUser.phone || "",
        cpf: apiUser.cpf || "",
        classes: Array.isArray(apiUser.classes) ? apiUser.classes : [],
      };

    console.log("👤 Salvando usuário:", usuario);
    localStorage.setItem("usuario", JSON.stringify(usuario));
    updateUser(usuario);
      
      console.log("🎯 Redirecionando para /alunos");
      navigate("/alunos", { replace: true });
      
    } catch (err) {
      const message = err.response?.data?.error || err.message || "Erro no login";
      console.error("❌ Login falhou:", message);
      alert(`Erro no login: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
        <div className="min-h-screen w-screen flex items-center justify-center relative overflow-hidden" style={{background: 'linear-gradient(135deg, #0f1e2a, #1a2f3a)'}}>
      
      {/* Efeitos de fundo Neural */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              duration: 2,
              delay: i * 0.1,
              repeat: Infinity,
              repeatType: "reverse",
              repeatDelay: Math.random() * 3
            }}
            className="absolute w-2 h-2 bg-gradient-to-r from-orange-200 to-orange-300 rounded-full" 
            style={{
              backgroundColor: 'rgba(245, 230, 211, 0.6)', 
              boxShadow: '0 0 8px rgba(245, 230, 211, 0.4)',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Grid Neural Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full" style={{
          backgroundImage: `
            radial-gradient(circle at 1px 1px, rgba(105, 142, 162, 0.4) 1px, transparent 0)
          `,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Container Principal Centralizado */}
      <div className="relative z-10 w-full max-w-md mx-4 flex items-center justify-center">
        
        {/* Formulário de Login Centralizado */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-md mx-auto"
        >
                    <div className="backdrop-blur-sm rounded-3xl p-8 shadow-2xl" style={{background: 'linear-gradient(135deg, #f4b88a, #f0ad7a)', border: '2px solid #eca470', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.2)'}}>
            
            {/* Logo Neural no Cabeçalho */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-center mb-8"
            >
              {/* Logo Neural */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 1, type: "spring", bounce: 0.4 }}
                className="relative mx-auto mb-6"
              >
                <div className="relative w-24 h-24 mx-auto">
                  <div className="absolute inset-0 rounded-full animate-pulse shadow-2xl" style={{background: 'linear-gradient(45deg, #698ea2, #e4a576)', boxShadow: '0 25px 50px -12px rgba(228, 165, 118, 0.25)'}}></div>
                  <div className="absolute inset-1 bg-gradient-to-r from-slate-800 to-slate-900 rounded-full"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Camera className="w-12 h-12 text-white drop-shadow-lg" />
                  </div>
                  
                  {/* Anéis Orbitais */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-2 rounded-full" style={{borderColor: 'rgba(228, 165, 118, 0.3)'}}
                  />
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-2 border rounded-full" style={{borderColor: 'rgba(105, 142, 162, 0.3)'}}
                  />
                </div>
              </motion.div>
              
              <h2 className="text-2xl font-bold text-slate-800 heading-ai mb-2">Acesso FaceRec</h2>
              <p className="text-slate-600 text-ai text-sm">Entre no sistema de chamada</p>
            </motion.div>

            {/* Formulário */}
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              onSubmit={handleEmailLogin}
              className="space-y-6"
            >
              
              {/* Campo Email */}
              <div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-slate-500 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <label className="text-sm font-medium text-slate-700 text-ai">Email FaceRec</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder=""
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-ai bg-white/80"
                    />
                  </div>
                </div>
              </div>

              {/* Campo Senha */}
              <div>
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5 text-slate-500 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <label className="text-sm font-medium text-slate-700 text-ai">Senha de Acesso</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        placeholder=""
                        className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-ai bg-white/80"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-slate-500" />
                        ) : (
                          <Eye className="h-5 w-5 text-slate-500" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botão de Login */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 text-ai text-white disabled:opacity-50 disabled:cursor-not-allowed"
                style={{background: 'linear-gradient(135deg, #698ea2, #5a7a8a)', boxShadow: '0 4px 15px rgba(105, 142, 162, 0.3)'}}
                onMouseEnter={(e) => e.target.style.boxShadow = '0 6px 20px rgba(105, 142, 162, 0.4)'}
                onMouseLeave={(e) => e.target.style.boxShadow = '0 4px 15px rgba(105, 142, 162, 0.3)'}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Processando Neural...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Brain className="w-5 h-5" />
                    <span>Acessar Sistema</span>
                  </div>
                )}
              </motion.button>

              {/* Divisor */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-slate-500 text-ai">ou continue com</span>
                </div>
              </div>

              {/* Login com Google */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleGoogleLogin}
                className="w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 text-ai border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center gap-2"
              >
                <Chrome className="w-5 h-5 text-blue-500" />
                <span>Google FaceRec Auth</span>
              </motion.button>
              
              {/* Botão Admin Bypass (temporário - DB offline) */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => {
                  // Criar usuário admin temporário
                  const adminUser = {
                    id: 'temp-admin',
                    email: 'admin@facerec.com',
                    full_name: 'Administrador (Modo Offline)',
                    role: 'admin',
                    tipo: 'administrador',
                    profile_picture: '',
                    photoURL: ''
                  };
                  
                  localStorage.setItem("token", `temp-admin-token-${Date.now()}`);
                  localStorage.setItem("usuario", JSON.stringify(adminUser));
                  updateUser(adminUser);
                  
                  console.log("🔓 Acesso admin temporário ativado");
                  navigate("/admin");
                }}
                className="w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 text-ai border-2 border-red-300 bg-red-50 hover:bg-red-100 text-red-700 flex items-center justify-center gap-2"
              >
                <Shield className="w-5 h-5" />
                <span>🚨 Admin (Modo Offline)</span>
              </motion.button>
            </motion.form>

            {/* Botões de Navegação */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="mt-8 space-y-4"
            >
              {/* Botão Voltar para Homepage */}
              <div className="text-center">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar para Homepage
                </Link>
              </div>
              
              {/* Link para Cadastro */}
              <div className="text-center">
                <p className="text-slate-600 text-ai">
                  Não possui acesso FaceRec?{" "}
                  <Link
                    to="/cadastro"
                    className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Registrar no Sistema
                  </Link>
                </p>
              </div>
            </motion.div>

          </div>
        </motion.div>
      </div>
    </div>
  );
}
