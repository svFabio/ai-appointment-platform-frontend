import { useState, useEffect } from 'react';

interface Cita {
  id: number;
  clienteNombre: string | null;
  clienteTelefono: string;
  fecha: string;
  horario: string; 
  estado: string;
  comprobanteUrl: string | null;
}

const Pagos = () => {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Cargar citas pendientes
  useEffect(() => {
    // Asegúrate de que VITE_API_URL sea 'http://localhost:3000/api'
    fetch(`${import.meta.env.VITE_API_URL}/citas/pendientes`)
      .then(res => res.json())
      .then(data => {
        setCitas(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error cargando pagos:", err);
        setLoading(false);
      });
  }, []);

  // 2. Función para Validar
  const manejarValidacion = async (id: number, accion: 'CONFIRMAR' | 'RECHAZAR') => {
    const confirmacion = window.confirm(`¿Estás seguro de ${accion === 'CONFIRMAR' ? 'APROBAR' : 'RECHAZAR'} este pago?`);
    if (!confirmacion) return;

    try {
      // Esta ruta ahora sí existe en el backend
      const res = await fetch(`${import.meta.env.VITE_API_URL}/citas/${id}/validar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion })
      });

      if (res.ok) {
        setCitas(prev => prev.filter(c => c.id !== id));
      } else {
        const errorText = await res.text();
        console.error("Error del servidor:", errorText);
        alert("Error en el servidor. Revisa la consola.");
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión con el servidor");
    }
  };

  if (loading) return <div className="p-6 text-center">Cargando pagos pendientes...</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="border-b pb-4 mb-4">
        <h2 className="text-xl font-bold text-slate-800">Validación de Comprobantes</h2>
        <p className="text-sm text-gray-500">Revisa las fotos enviadas por WhatsApp</p>
      </div>
      
      {citas.length === 0 ? (
        <div className="py-10 text-center">
            <p className="text-gray-400">🎉 Todo al día. No hay pagos pendientes de revisión.</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {citas.map(cita => (
            <li key={cita.id} className="py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              
              <div className="flex gap-5 items-center">
                {/* Visualización del Comprobante */}
                {cita.comprobanteUrl ? (
                  <a href={cita.comprobanteUrl} target="_blank" rel="noreferrer" className="flex-shrink-0">
                    <img 
                      src={cita.comprobanteUrl} 
                      alt="Comprobante"
                      className="w-24 h-24 object-cover rounded-lg border-2 border-orange-200 hover:border-orange-500 transition-all cursor-zoom-in shadow-sm" 
                    />
                  </a>
                ) : (
                  <div className="w-24 h-24 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 text-[10px] border border-dashed border-gray-300">
                    SIN FOTO
                  </div>
                )}

                <div>
                  {/* Lógica para mostrar nombre o limpiar el número largo */}
                  <p className="font-bold text-lg text-slate-800">
                    {cita.clienteNombre || (
                        cita.clienteTelefono.length > 15 
                        ? `📱 ID: ${cita.clienteTelefono.substring(0, 5)}...` 
                        : `📱 ${cita.clienteTelefono}`
                    )}
                  </p>
                  
                  <div className="flex flex-col gap-1 mt-1">
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <span className="font-semibold text-slate-700">Horario:</span> {cita.horario}
                    </p>
                    <div className="mt-2">
                        <span className="text-[10px] px-2 py-1 rounded bg-orange-100 text-orange-700 font-black uppercase tracking-widest">
                            {cita.estado}
                        </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3 w-full md:w-auto">
                <button 
                  onClick={() => manejarValidacion(cita.id, 'CONFIRMAR')}
                  disabled={!cita.comprobanteUrl}
                  className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg shadow-sm text-white font-bold transition-all ${
                    cita.comprobanteUrl 
                    ? 'bg-green-600 hover:bg-green-700 active:scale-95' 
                    : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  Aprobar
                </button>
                
                <button 
                  onClick={() => manejarValidacion(cita.id, 'RECHAZAR')}
                  className="flex-1 md:flex-none px-6 py-2.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-bold transition-all active:scale-95"
                >
                  Rechazar
                </button>
              </div>

            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Pagos;