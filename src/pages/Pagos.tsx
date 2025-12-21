import { useState, useEffect } from 'react';

// Tipos
interface Cita {
  id: string;
  clienteNombre: string;
  fecha: string;
  hora: string;
  estado: string;
  comprobanteUrl?: string;
}

const Pagos = () => {
  const [citas, setCitas] = useState<Cita[]>([]);

  // Cargar citas pendientes
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/citas/pendientes`)
      .then(res => res.json())
      .then(data => {
        setCitas(data);
      })
      .catch(err => console.error("Error:", err));
  }, []);

  const confirmarPago = async (id: string) => {
    try {
        await fetch(`${import.meta.env.VITE_API_URL}/citas/${id}/confirmar`, { method: 'PUT' });
        setCitas(citas.filter(c => c.id !== id));
        alert('Cita confirmada');
    } catch (error) {
        alert('Error al confirmar');
    }
  };

  // URL de prueba (Gato) para cuando no hay comprobante real
  const IMAGEN_PRUEBA = "https://images.unsplash.com/photo-1529778873920-4da4926a72c2?fm=jpg&q=60&w=3000";

  return (
    <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Pagos por Validar</h2>
        
        {citas.length === 0 ? (
            <p className="text-gray-500">Todo al día. No hay pagos pendientes.</p>
        ) : (
            <ul>
                {citas.map(cita => {
                    // Aquí decidimos qué link usar: El real o el del gato
                    const linkFinal = cita.comprobanteUrl ? cita.comprobanteUrl : IMAGEN_PRUEBA;

                    return (
                        <li key={cita.id} className="border-b py-4 flex justify-between items-center">
                            <div>
                                <p className="font-bold">{cita.clienteNombre}</p>
                                <p className="text-sm text-gray-600">{cita.fecha} - {cita.hora}</p>
                                
                                <div className="mt-2">
                                    <p className="text-xs text-gray-400 mb-1">Comprobante:</p>
                                    
                                    {/* 👇 AQUÍ ESTABA EL ERROR: Ahora usamos linkFinal en el href también */}
                                    <a 
                                        href={linkFinal} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="inline-block"
                                    >
                                        <img 
                                            src={linkFinal} 
                                            alt="Comprobante" 
                                            className="w-24 h-24 object-cover rounded border border-gray-300 hover:opacity-75 transition cursor-pointer"
                                        />
                                    </a>
                                    
                                    {!cita.comprobanteUrl && (
                                        <span className="text-[10px] text-orange-400 block mt-1">(Sin archivo real)</span>
                                    )}
                                </div>

                            </div>
                            <button 
                                onClick={() => confirmarPago(cita.id)}
                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                                Confirmar
                            </button>
                        </li>
                    );
                })}
            </ul>
        )}
    </div>
  );
};

export default Pagos;