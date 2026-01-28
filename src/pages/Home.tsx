import { useState, useEffect } from 'react';
import { api } from '../services/api';

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
  totalFuturas: number;
}

const Dashboard = () => {
  const [data, setData] = useState<ResumenData | null>(null);

  useEffect(() => {
    api.obtenerResumen()
      .then(resumen => {
        if (resumen) setData(resumen);
      })
      .catch(console.error);
  }, []);

  if (!data) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kenyan-copper-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando tablero...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 border border-gray-100">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">Panel de Control</h1>
        <p className="text-sm text-gray-600 mt-1">Resumen de tu spa y citas</p>
      </div>

      {/* Tarjetas de Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-4 md:p-6 rounded-lg shadow border-l-4 border-kenyan-copper-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Citas para Hoy</p>
              <p className="text-2xl md:text-3xl font-bold text-gray-800 mt-1">{data.citasHoy}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-lg shadow border-l-4 border-orange-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Pagos por Validar</p>
              <p className="text-2xl md:text-3xl font-bold text-orange-600 mt-1">{data.pendientes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-lg shadow border-l-4 border-green-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Citas</p>
              <p className="text-2xl md:text-3xl font-bold text-green-600 mt-1">{data.totalFuturas}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla Agenda de Hoy */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-4 md:px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg md:text-xl font-bold text-gray-800">Agenda de Hoy</h2>
          <p className="text-sm text-gray-600 mt-1">Todas las citas programadas para hoy</p>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Hora</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.proximasCitas.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-400">
                    <div className="text-4xl mb-2">✓</div>
                    <p>No hay más citas programadas para hoy.</p>
                  </td>
                </tr>
              ) : (
                data.proximasCitas.map((cita) => (
                  <tr key={cita.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-800">
                      {cita.horario}
                    </td>

                    <td className="px-6 py-4">
                      {cita.clienteNombre ? (
                        <span className="capitalize font-medium">{cita.clienteNombre}</span>
                      ) : (
                        <span className="text-gray-500 text-sm flex items-center gap-1">
                          Tel: {cita.clienteTelefono.length > 15
                            ? cita.clienteTelefono.substring(0, 8) + '...'
                            : cita.clienteTelefono}
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs rounded-full font-semibold ${cita.estado === 'CONFIRMADA' ? 'bg-green-100 text-green-800' :
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

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-gray-200">
          {data.proximasCitas.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-400">
              <div className="text-4xl mb-2">✓</div>
              <p>No hay más citas programadas para hoy.</p>
            </div>
          ) : (
            data.proximasCitas.map((cita) => (
              <div key={cita.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-gray-800">{cita.horario}</p>
                    {cita.clienteNombre ? (
                      <p className="text-sm text-gray-600 capitalize">{cita.clienteNombre}</p>
                    ) : (
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        Tel: {cita.clienteTelefono.length > 15
                          ? cita.clienteTelefono.substring(0, 8) + '...'
                          : cita.clienteTelefono}
                      </p>
                    )}
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full font-semibold ${cita.estado === 'CONFIRMADA' ? 'bg-green-100 text-green-800' :
                    cita.estado === 'VALIDACION_PENDIENTE' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                    {cita.estado}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;