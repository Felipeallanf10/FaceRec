import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login';
import Cadastro from './pages/Cadastro';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Configuracoes from './pages/Configuracoes';
import MainLayout from './Layout/MainLayout';
import TestPage from './pages/TestPage';
import ConfigFoto from "./pages/Configuracoes/Foto";
import Homepage from './pages/Homepage';

// ⬇️ ADICIONE
import Camera from './pages/Camera';
import LiveAttendance from './pages/LiveAttendance';
import Alunos from './pages/Alunos';
import Sala from './pages/Sala';
import Administracao from './pages/Administracao';

function PrivateRoute({ children }) {
  let usuario = null;

  try {
    const raw = localStorage.getItem("usuario");
    console.log("🔐 PrivateRoute - raw localStorage:", raw);
    if (raw && raw !== "undefined") {
      usuario = JSON.parse(raw);
      console.log("🔐 PrivateRoute - usuário encontrado:", usuario);
    }
  } catch (err) {
    console.error("🔐 PrivateRoute - erro ao parsear usuário:", err);
    usuario = null;
  }

  const isAuthenticated = !!usuario;
  console.log("🔐 PrivateRoute - está autenticado?", isAuthenticated);
  
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Rotas públicas */}
      <Route index path="/" element={<Homepage />} />
      <Route path="/home-page" element={<Homepage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/test" element={<TestPage />} />

      {/* Rotas privadas (sempre com MainLayout + PrivateRoute) */}
      <Route
        path="/home"
        element={
          <MainLayout>
            <PrivateRoute><Home /></PrivateRoute>
          </MainLayout>
        }
      />

      <Route
        path="/home"
        element={
          <MainLayout>
            <PrivateRoute><Home /></PrivateRoute>
          </MainLayout>
        }
      />

      <Route
        path="/dashboard"
        element={
          <MainLayout>
            <PrivateRoute><Dashboard /></PrivateRoute>
          </MainLayout>
        }
      />

      <Route
        path="/configuracoes"
        element={
          <MainLayout>
            <PrivateRoute><Configuracoes /></PrivateRoute>
          </MainLayout>
        }
      />

      <Route
        path="/foto"
        element={
          <MainLayout>
            <PrivateRoute><ConfigFoto /></PrivateRoute>
          </MainLayout>
        }
      />

      <Route
        path="/camera"
        element={
          <MainLayout>
            <PrivateRoute><Camera /></PrivateRoute>
          </MainLayout>
        }
      />

      <Route
        path="/chamada/:code?"
        element={
          <MainLayout>
            <PrivateRoute><LiveAttendance /></PrivateRoute>
          </MainLayout>
        }
      />

      {/* Nova rota: Página de Alunos/Salas */}
      <Route
        path="/alunos"
        element={
          <MainLayout>
            <PrivateRoute><Alunos /></PrivateRoute>
          </MainLayout>
        }
      />

      {/* Rota de Administração - Acesso restrito */}
      <Route
        path="/admin"
        element={
          <MainLayout>
            <PrivateRoute><Administracao /></PrivateRoute>
          </MainLayout>
        }
      />

      {/* Rota para sala individual com alunos */}
      <Route
        path="/sala/:id"
        element={
          <MainLayout>
            <PrivateRoute><Sala /></PrivateRoute>
          </MainLayout>
        }
      />

      <Route
        path="/sala/:id/manual"
        element={
          <MainLayout>
            <PrivateRoute>
              <div className="p-8">
                <h1 className="text-2xl font-bold">Chamada Manual (em desenvolvimento)</h1>
                <p>Aqui será implementada a chamada manual dos alunos.</p>
              </div>
            </PrivateRoute>
          </MainLayout>
        }
      />

      {/* Fallback - apenas rotas não encontradas vão para login */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
