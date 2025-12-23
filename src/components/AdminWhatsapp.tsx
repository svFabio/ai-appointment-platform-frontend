import { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';

interface WhatsappStatus {
  conectado: boolean;
  qr: string | null;
}

const AdminWhatsapp = () => {
  const [status, setStatus] = useState<WhatsappStatus>({ conectado: false, qr: null });
  const [loading, setLoading] = useState(true);
  const [procesandoLogout, setProcesandoLogout] = useState(false); // Estado para bloquear el botón

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
    if(!confirm("¿Estás seguro de que quieres desconectar el Bot?")) return;
    
    setProcesandoLogout(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      await fetch(`${API_URL}/logout`, { method: 'POST' });
        // No necesitamos hacer nada más, el polling (fetchStatus) detectará 
        // automáticamente que se cayó la conexión y mostrará el nuevo QR.
    } catch (error) {
        alert("Error al intentar desconectar");
    } finally {
        setProcesandoLogout(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const intervalo = setInterval(fetchStatus, 3000);
    return () => clearInterval(intervalo);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] bg-gray-50 p-6 font-sans">
      <h2 className="mb-6 text-2xl font-bold text-gray-800">
        Estado del Bot WhatsApp
      </h2>

      <div className="w-full max-w-md p-8 text-center bg-white rounded-xl shadow-lg border border-gray-100">
        {loading ? (
          <div className="flex flex-col items-center py-4">
            <div className="w-10 h-10 mb-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500">Cargando estado...</p>
          </div>
        ) : status.conectado ? (
          // --- CASO 1: CONECTADO (AHORA CON BOTÓN DE SALIR) ---
          <div className="flex flex-col items-center animate-in fade-in duration-500">
            <div className="text-6xl mb-4 text-green-500">✅</div>
            <h3 className="text-xl font-bold text-gray-800">Bot Operativo</h3>
            <p className="mt-2 text-gray-600 mb-6">El sistema está escuchando mensajes correctamente.</p>
            
            <button 
                onClick={handleLogout}
                disabled={procesandoLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {procesandoLogout ? 'Desconectando...' : 'Cerrar Sesión / Desvincular'}
            </button>
          </div>
        ) : (
          // --- CASO 2: DESCONECTADO (MOSTRAR QR) ---
          <div className="flex flex-col items-center">
            {status.qr ? (
              <>
                <p className="mb-4 text-lg font-semibold text-gray-700">
                  Escanea para conectar:
                </p>
                <div className="p-4 bg-white border-4 border-gray-100 rounded-lg shadow-sm">
                  <QRCode value={status.qr} size={256} className="h-auto max-w-full" />
                </div>
                <p className="mt-4 text-xs text-gray-400">
                  El QR se actualiza automáticamente.
                </p>
              </>
            ) : (
              // --- CASO 3: ESPERANDO ---
              <div className="flex flex-col items-center py-6">
                <div className="text-4xl mb-4 animate-bounce">⏳</div>
                <p className="font-medium text-gray-700">Generando código QR...</p>
                <p className="text-xs text-gray-400 mt-2">
                    {procesandoLogout ? "Reiniciando el sistema..." : "Espere un momento..."}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminWhatsapp;