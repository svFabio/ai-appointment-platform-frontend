import { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';
import { io } from 'socket.io-client';

interface WhatsappStatus {
  conectado: boolean;
  qr: string | null;
}

const AdminWhatsapp = () => {
  const [status, setStatus] = useState<WhatsappStatus>({ conectado: false, qr: null });
  const [loading, setLoading] = useState(true);
  const [procesandoLogout, setProcesandoLogout] = useState(false);

  const fetchStatus = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const response = await fetch(`${API_URL}/status-whatsapp`);
      const data = await response.json();
      setStatus(data);
      setLoading(false);
    } catch (error) {
      console.error("Error conectando con el backend:", error);
    }
  };

  // Función para llamar al endpoint de logout
  const handleLogout = async () => {
    if (!confirm("¿Estás seguro de que quieres desconectar el Bot?")) return;

    setProcesandoLogout(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      await fetch(`${API_URL}/logout`, { method: 'POST' });
    } catch (error) {
      alert("Error al intentar desconectar");
    } finally {
      setProcesandoLogout(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchStatus();

    // Setup Socket.IO for real-time updates
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const urlBase = API_URL.replace('/api', '');

    const socket = io(urlBase, {
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('✅ Socket.IO conectado para WhatsApp status');
    });

    // Listen for real-time WhatsApp status updates
    socket.on('whatsapp-status', (data: WhatsappStatus) => {
      console.log('📡 Estado WhatsApp actualizado en tiempo real:', data);
      setStatus(data);
      setLoading(false);
    });

    // Fallback: HTTP polling every 5 seconds (backup)
    const intervalo = setInterval(fetchStatus, 5000);

    return () => {
      socket.disconnect();
      clearInterval(intervalo);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-lg">
        <h2 className="mb-6 text-xl md:text-2xl font-bold text-gray-800 text-center">
          Estado del Bot WhatsApp
        </h2>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6 lg:p-8">
          {loading ? (
            <div className="flex flex-col items-center py-6">
              <div className="w-12 h-12 md:w-16 md:h-16 mb-4 border-4 border-kenyan-copper-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-500 text-sm md:text-base">Cargando estado...</p>
            </div>
          ) : status.conectado ? (
            // --- CASO 1: CONECTADO (AHORA CON BOTÓN DE SALIR) ---
            <div className="flex flex-col items-center animate-in fade-in duration-500">
              <div className="text-5xl md:text-6xl mb-4 text-green-500">✓</div>
              <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2">Bot Operativo</h3>
              <p className="text-sm md:text-base text-gray-600 mb-6 text-center max-w-md">
                El sistema está escuchando mensajes correctamente.
              </p>

              <button
                onClick={handleLogout}
                disabled={procesandoLogout}
                className="w-full md:w-auto px-4 py-2.5 text-sm md:text-base font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {procesandoLogout ? 'Desconectando...' : 'Cerrar Sesión / Desvincular'}
              </button>
            </div>
          ) : (
            // --- CASO 2: DESCONECTADO (MOSTRAR QR) ---
            <div className="flex flex-col items-center">
              {status.qr ? (
                <>
                  <p className="mb-4 text-base md:text-lg font-semibold text-gray-700 text-center">
                    Escanea para conectar:
                  </p>
                  <div className="p-3 sm:p-4 bg-white border-2 border-gray-200 rounded-xl shadow-sm mb-4">
                    <QRCode
                      value={status.qr}
                      size={200}
                      className="h-auto max-w-full w-full"
                    />
                  </div>
                  <p className="text-xs md:text-sm text-gray-400 text-center max-w-sm">
                    El QR se actualiza automáticamente en tiempo real. Escanéalo con tu WhatsApp.
                  </p>
                </>
              ) : (
                // --- CASO 3: ESPERANDO ---
                <div className="flex flex-col items-center py-8">
                  <div className="text-4xl md:text-5xl mb-4 animate-bounce">⏳</div>
                  <p className="font-medium text-gray-700 text-center mb-2">
                    Generando código QR...
                  </p>
                  <p className="text-xs md:text-sm text-gray-400 text-center max-w-sm">
                    {procesandoLogout ? "Reiniciando el sistema..." : "Espere un momento..."}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>Para más ayuda, contacta al administrador del sistema</p>
        </div>
      </div>
    </div>
  );
};

export default AdminWhatsapp;
