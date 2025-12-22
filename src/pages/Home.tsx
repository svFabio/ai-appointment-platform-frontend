import { useState, useEffect } from 'react';

// Definimos la interfaz exacta que viene de tu backend
interface CitaResumen {
  id: number;
  clienteNombre: string | null;
  clienteTelefono: string;
  horario: string; // OJO: Debe llamarse 'horario', no 'hora'
  estado: string;
}

interface ResumenData {
  citasHoy: number;
  pendientes: number;
  proximasCitas: CitaResumen[];
}

const Dashboard = () => {
  const [data, setData] = useState<ResumenData | null>(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/citas/resumen`)
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  if (!data) return <div className="p-6">Cargando tablero...</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Panel de Control</h1>
      
      {/* Tarjetas de Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow border-l-4 border-blue-500">
          <p className="text-gray-500">Citas para Hoy</p>
          <p className="text-2xl font-bold">{data.citasHoy}</p>
        </div>
        <div className="bg-white p-4 rounded shadow border-l-4 border-orange-500">
          <p className="text-gray-500">Pagos por Validar</p>
          <p className="text-2xl font-bold text-orange-600">{data.pendientes}</p>
        </div>
      </div>

      {/* Tabla Agenda de Hoy */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-bold">Agenda de Hoy</h2>
        </div>
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Hora</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Cliente</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.proximasCitas.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-gray-400">
                  No hay más citas programadas para hoy.
                </td>
              </tr>
            ) : (
              data.proximasCitas.map((cita) => (
                <tr key={cita.id}>
                  {/* AQUÍ ESTABA EL ERROR: Usamos cita.horario */}
                  <td className="px-6 py-4 font-bold text-gray-800">
                    {cita.horario}
                  </td>
                  
                  {/* Lógica para mostrar nombre o teléfono */}
                  <td className="px-6 py-4">
                    {cita.clienteNombre ? (
                      <span className="capitalize">{cita.clienteNombre}</span>
                    ) : (
                      <span className="text-gray-500 text-sm">
                        {/* Cortamos el ID largo si es necesario */}
                        📱 {cita.clienteTelefono.length > 15 
                             ? cita.clienteTelefono.substring(0, 8) + '...' 
                             : cita.clienteTelefono}
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full font-bold ${
                      cita.estado === 'CONFIRMADA' ? 'bg-green-100 text-green-800' :
                      cita.estado === 'VALIDACION_PENDIENTE' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {cita.estado}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;