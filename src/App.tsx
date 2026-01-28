import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Pagos from './pages/Pagos';
import Calendario from './pages/Calendario';
import Home from './pages/Home';
import Vincular from './pages/Vincular';
import Login from './pages/Login';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Routes>
          {/* Ruta de Login (pública) */}
          <Route path="/login" element={<Login />} />

          {/* Ruta raíz redirige a dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Dashboard protegido */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }>
            {/* Subrutas del Dashboard */}
            <Route index element={<Home />} />
            <Route path="calendario" element={<Calendario />} />
            <Route path="pagos" element={<Pagos />} />
            <Route path="vincular" element={<Vincular />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-800 mb-2">404</h1>
                <p className="text-gray-600 mb-4">Página no encontrada</p>
                <a href="/dashboard" className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">
                  Volver al Dashboard
                </a>
              </div>
            </div>
          } />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;