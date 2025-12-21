import { useState, useEffect } from 'react';

// Definimos los tipos de datos
interface Cita {
  id: string;
  clienteNombre: string;
  hora: string;
  estado: string;
}

interface ResumenData {
  citasHoy: number;
  pendientes: number;
  proximasCitas: Cita[];
}

const Home = () => {
  // Estado inicial en 0 y arrays vacíos
  const [data, setData] = useState<ResumenData>({
    citasHoy: 0,
    pendientes: 0,
    proximasCitas: []
  });

  // Conexión al Backend al cargar la página
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/citas/resumen`)
      .then(res => res.json())
      .then(datos => setData(datos))
      .catch(err => console.error("Error cargando resumen:", err));
  }, []);

  // Fecha actual para mostrar en el encabezado
  const fechaActual = new Date().toLocaleDateString('es-ES', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="space-y-6">
      
      {/* ENCABEZADO */}
      <div className="flex justify-between items-end border-b pb-4 border-gray-200">
        <div>
            <h1 className="text-3xl font-bold text-slate-800">Panel de Control</h1>
            <p className="text-gray-600">Resumen de actividad.</p>
        </div>
        <div className="text-right hidden md:block">
            <p className="text-sm text-gray-500 font-bold uppercase">Fecha</p>
            <p className="text-xl text-slate-700 capitalize">{fechaActual}</p>
        </div>
      </div>

      {/* TARJETAS DE DATOS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Citas Hoy */}
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-600">
          <div className="flex justify-between items-center">
             <div>
                <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Citas para Hoy</h3>
                {/* AQUI SE MUESTRA EL DATO REAL */}
                <p className="text-4xl font-bold mt-2 text-slate-800">{data.citasHoy}</p>
             </div>
          </div>
        </div>

        {/* Card 2: Por Validar */}
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-orange-500">
          <div className="flex justify-between items-center">
             <div>
                <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Pagos por Validar</h3>
                {/* AQUI SE MUESTRA EL DATO REAL */}
                <p className="text-4xl font-bold mt-2 text-slate-800">{data.pendientes}</p>
             </div>
          </div>
        </div>

        {/* Card 3: Estado del Sistema */}
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-600">
          <div className="flex justify-between items-center">
             <div>
                <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Estado del Bot</h3>
                <div className="flex items-center gap-2 mt-3">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    <p className="text-lg font-bold text-green-700">Activo</p>
                </div>
             </div>
          </div>
        </div>

      </div>

      {/* LISTA DE PRÓXIMAS CITAS */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-bold text-slate-700">Agenda de Hoy</h3>
          </div>
          
          <div className="p-0">
              {data.proximasCitas.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                      <p>No hay citas programadas para hoy.</p>
                  </div>
              ) : (
                  <table className="w-full text-left">
                      <thead className="bg-gray-100 text-gray-600 text-xs uppercase">
                          <tr>
                              <th className="px-6 py-3">Hora</th>
                              <th className="px-6 py-3">Cliente</th>
                              <th className="px-6 py-3">Estado</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                          {data.proximasCitas.map((cita) => (
                              <tr key={cita.id} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 font-bold text-slate-700">{cita.hora}</td>
                                  <td className="px-6 py-4">{cita.clienteNombre}</td>
                                  <td className="px-6 py-4">
                                      <span className={`px-2 py-1 text-xs rounded-full ${
                                          cita.estado === 'CONFIRMADA' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                                      }`}>
                                          {cita.estado}
                                      </span>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              )}
          </div>
      </div>
    </div>
  );
};

export default Home;