import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "@/lib/api";
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
  Phone,
  UserPlus,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  CreditCard,
  Users
} from "lucide-react";

export default function Cadastro() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    cpf: "",
    subject: "",
    school: "",
    classes: "",
  });
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1); // Multi-step form
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateStep1 = () => {
    const hasBasic = formData.fullName.length >= 2 && formData.email && formData.phone && formData.cpf.length >= 11;
    const hasTeachingData = formData.subject.trim().length > 0 && formData.school.trim().length > 0 && formData.classes.trim().length > 0;
    return hasBasic && hasTeachingData;
  };

  const validateStep2 = () => {
    return formData.password.length >= 6 && formData.password === formData.confirmPassword;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handlePrevStep = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) {
      alert("Verifique se as senhas coincidem e têm pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);
    
    try {
      const classListRaw = formData.classes
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item.length > 0);

      const classSet = new Set();
      const classList = [];
      classListRaw.forEach((item) => {
        const key = item.toLowerCase();
        if (classSet.has(key)) return;
        classSet.add(key);
        classList.push(item);
      });

      const { data } = await api.post("/signup", {
        fullName: formData.fullName.trim(),
  email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phone: formData.phone.trim(),
        cpf: formData.cpf.trim(),
        subject: formData.subject.trim(),
        school: formData.school.trim(),
        classes: classList,
      });
      
      if (data?.error) throw new Error(data.error);
      
      // Sucesso - redireciona para login
      navigate("/login", { 
        state: { message: "Conta FaceRec criada com sucesso! Faça login para continuar." }
      });
      
    } catch (err) {
      const message = err.response?.data?.error || err.message || "Erro no cadastro";
      console.error("Erro no cadastro:", message);
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center relative overflow-hidden" style={{background: 'linear-gradient(135deg, #0f1e2a, #1a2f3a)'}}>
      
      {/* Efeitos de fundo Neural */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              duration: 2,
              delay: i * 0.05,
              repeat: Infinity,
              repeatType: "reverse",
              repeatDelay: Math.random() * 4
            }}
            className="absolute w-2 h-2 bg-gradient-to-r from-orange-200 to-orange-300 rounded-full" 
            style={{
              backgroundColor: 'rgba(228, 165, 118, 0.6)', 
              boxShadow: '0 0 8px rgba(228, 165, 118, 0.4)',
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
        
        {/* Formulário de Cadastro Centralizado */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="backdrop-blur-sm rounded-3xl p-8 shadow-2xl" style={{background: 'linear-gradient(135deg, #f4b88a, #f0ad7a)', border: '2px solid #eca470', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.2)'}}>
            
            {/* Header do Formulário com Logo */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-center mb-8"
            >
              {/* Logo Neural com ícone de usuário */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 1, type: "spring", bounce: 0.4 }}
                className="relative mx-auto mb-6"
              >
                <div className="relative w-20 h-20 mx-auto">
                  <div className="absolute inset-0 rounded-full animate-pulse shadow-2xl" style={{background: 'linear-gradient(45deg, #698ea2, #e4a576)', boxShadow: '0 25px 50px -12px rgba(228, 165, 118, 0.25)'}}></div>
                  <div className="absolute inset-1 bg-gradient-to-r from-slate-800 to-slate-900 rounded-full"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <UserPlus className="w-10 h-10 text-white drop-shadow-lg" />
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
              
              <h2 className="text-2xl font-bold text-slate-800 heading-ai mb-2">FaceRec Registry</h2>
              <p className="text-slate-600 text-ai text-sm">
                {step === 1 ? "Crie sua conta no sistema" : "Configure sua segurança"}
              </p>
              <div className="flex items-center gap-2 justify-center mt-3">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{backgroundColor: '#e4a576'}}></div>
                <span className="text-sm mono-ai" style={{color: '#698ea2'}}>ETAPA {step} DE 2</span>
              </div>
            </motion.div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="w-full bg-slate-200 rounded-full h-2">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: step === 1 ? "50%" : "100%" }}
                  transition={{ duration: 0.5 }}
                  className="h-2 rounded-full"
                  style={{background: 'linear-gradient(135deg, #e4a576, #d89660)'}}
                />
              </div>
            </div>

            {/* Formulário */}
            <form onSubmit={step === 2 ? handleSubmit : (e) => e.preventDefault()} className="space-y-6">
              
              {/* Step 1 - Dados Pessoais */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-6"
                >
                  
                  {/* Nome Completo */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 text-ai">Nome Completo</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5" style={{color: '#e4a576'}} />
                      </div>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                        placeholder=""
                        className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-ai bg-white/80"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 text-ai">Email FaceRec</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5" style={{color: '#e4a576'}} />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder=""
                        className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-ai bg-white/80"
                      />
                    </div>
                  </div>

                  {/* Telefone */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 text-ai">Telefone</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5" style={{color: '#e4a576'}} />
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        placeholder=""
                        className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-ai bg-white/80"
                      />
                    </div>
                  </div>

                  {/* CPF */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 text-ai">CPF</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CreditCard className="h-5 w-5" style={{color: '#e4a576'}} />
                      </div>
                      <input
                        type="text"
                        name="cpf"
                        value={formData.cpf}
                        onChange={handleChange}
                        required
                        placeholder=""
                        className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-ai bg-white/80"
                      />
                    </div>
                  </div>

                  {/* Matéria */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 text-ai">Matéria lecionada</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Target className="h-5 w-5" style={{color: '#e4a576'}} />
                      </div>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        placeholder="Ex: Matemática"
                        className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-ai bg-white/80"
                      />
                    </div>
                  </div>

                  {/* Escola */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 text-ai">Escola</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Network className="h-5 w-5" style={{color: '#e4a576'}} />
                      </div>
                      <input
                        type="text"
                        name="school"
                        value={formData.school}
                        onChange={handleChange}
                        required
                        placeholder="Ex: Escola Municipal Central"
                        className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-ai bg-white/80"
                      />
                    </div>
                  </div>

                  {/* Turmas */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 text-ai">Turmas atribuídas</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Users className="h-5 w-5" style={{color: '#e4a576'}} />
                      </div>
                      <input
                        type="text"
                        name="classes"
                        value={formData.classes}
                        onChange={handleChange}
                        required
                        placeholder="Separe por vírgulas, ex: 1ºA, 1ºB, 2ºA"
                        className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-ai bg-white/80"
                      />
                    </div>
                    <p className="text-xs text-slate-500 text-ai">Você pode editar ou adicionar novas turmas depois pelo painel.</p>
                  </div>

                  {/* Botão Próximo */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handleNextStep}
                    disabled={!validateStep1()}
                    className="w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 text-ai text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{backgroundColor: '#698ea2', opacity: 1, boxShadow: '0 4px 15px rgba(105, 142, 162, 0.3)'}}
                  >
                    <span>Próxima Etapa</span>
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </motion.div>
              )}

              {/* Step 2 - Segurança */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-6"
                >
                  
                  {/* Senha */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 text-ai">Senha de Acesso</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5" style={{color: '#e4a576'}} />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        placeholder=""
                        className="w-full pl-10 pr-12 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-ai bg-white/80"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                        ) : (
                          <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirmar Senha */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 text-ai">Confirmar Senha</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Shield className="h-5 w-5" style={{color: '#e4a576'}} />
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        placeholder=""
                        className="w-full pl-10 pr-12 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-ai bg-white/80"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                        ) : (
                          <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Indicador de Força da Senha */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 text-ai">Força da Senha</span>
                      <span className={`font-medium ${
                        formData.password.length >= 8 ? 'text-green-600' : 
                        formData.password.length >= 6 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {formData.password.length >= 8 ? 'Forte' : 
                         formData.password.length >= 6 ? 'Média' : 'Fraca'}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full">
                      <div className={`h-2 rounded-full transition-all duration-300 ${
                        formData.password.length >= 8 ? 'w-full bg-green-500' :
                        formData.password.length >= 6 ? 'w-2/3 bg-yellow-500' : 'w-1/3 bg-red-500'
                      }`} />
                    </div>
                  </div>

                  {/* Botões */}
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={handlePrevStep}
                      className="flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-200 text-ai border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center gap-2"
                    >
                      <ArrowLeft className="w-5 h-5" />
                      <span>Voltar</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={loading || !validateStep2()}
                      className="flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-200 text-ai text-white hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{background: 'linear-gradient(135deg, #698ea2, #5a7a8a)', boxShadow: '0 4px 15px rgba(105, 142, 162, 0.3)'}}
                      onMouseEnter={(e) => e.target.style.boxShadow = '0 6px 20px rgba(105, 142, 162, 0.4)'}
                      onMouseLeave={(e) => e.target.style.boxShadow = '0 4px 15px rgba(105, 142, 162, 0.3)'}
                    >
                      {loading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Registrando...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <Brain className="w-5 h-5" />
                          <span>Criar Conta</span>
                        </div>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </form>

            {/* Link para Login */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="mt-8 text-center"
            >
              <p className="text-slate-600 text-ai">
                Já possui acesso FaceRec?{" "}
                <Link
                  to="/login"
                  className="font-semibold transition-colors"
                  style={{color: '#698ea2'}}
                  onMouseEnter={(e) => e.target.style.color = '#5a7a8a'}
                  onMouseLeave={(e) => e.target.style.color = '#698ea2'}
                >
                  Entrar no Sistema
                </Link>
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
