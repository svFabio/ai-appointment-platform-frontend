import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Pagos from './pages/Pagos';
import Calendario from './pages/Calendario';
import Home from './pages/Home';
import Vincular from './pages/Vincular';
import Login from './pages/Login';
import { NotificationToast } from './components/NotificationToast';
import { useNotifications } from './hooks/useNotifications';
import { playNotificationSound } from './utils/notificationSound';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

function App() {
  const { notifications, addNotification, dismissNotification } = useNotifications();

  useEffect(() => {
    // Conectar al Socket.IO cuando la app se monta
    const urlBase = import.meta.env.VITE_API_URL.replace('/api', '');
    const socket = io(urlBase, {
      transports: ['websocket', 'polling'],
      reconnection: true
    });

    // Escuchar evento de nueva cita
    socket.on('nueva-cita', (data: any) => {
      console.log('📬 Nueva cita recibida:', data);

      // Formatear fecha para mostrar
      const fechaFormateada = format(new Date(data.fecha), 'dd MMM yyyy', { locale: es });

      // Agregar notificación
      addNotification({
        message: `Nueva cita de ${data.clienteNombre}`,
        clienteNombre: data.clienteNombre,
        fecha: fechaFormateada,
        horario: data.horario
      });

      // Reproducir sonido
      playNotificationSound();
    });

    return () => {
      socket.disconnect();
    };
  }, [addNotification]);

  return (
    <AuthProvider>
      <div className="App">
        {/* Contenedor de notificaciones - Desktop: bottom-right, Mobile: top-center */}
        <div className="fixed md:bottom-4 md:right-4 md:top-auto top-0 left-0 right-0 md:left-auto md:w-auto w-full z-[9999] pointer-events-none">
          <div className="pointer-events-auto md:space-y-0 space-y-0">
            {notifications.map((notif) => (
              <NotificationToast
                key={notif.id}
                id={notif.id}
                clienteNombre={notif.clienteNombre}
                fecha={notif.fecha}
                horario={notif.horario}
                onDismiss={dismissNotification}
              />
            ))}
          </div>
        </div>

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