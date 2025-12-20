// src/pages/Dashboard.tsx
import { useEffect, useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { ValidationCard } from '../components/ValidationCard';
import { api } from '../services/api'; // Importamos el servicio real
import type { Cita } from '../types';

export default function Dashboard() {
  const [view, setView] = useState<'CALENDAR' | 'VALIDATION'>('VALIDATION');
  const [citasPendientes, setCitasPendientes] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. CARGAR DATOS DEL BACKEND
  useEffect(() => {
    cargarDatos();
    // Aquí podríamos poner un setInterval para "polling" cada 5 segundos
    const intervalo = setInterval(cargarDatos, 10000); 
    return () => clearInterval(intervalo);
  }, []);

  const cargarDatos = async () => {
    try {
      if (view === 'VALIDATION') {
        const data = await api.obtenerPendientes();
        setCitasPendientes(data);
      }
      // Aquí cargaríamos el calendario si view === 'CALENDAR'
    } finally {
      setLoading(false);
    }
  };

  // 2. MANEJAR ACCIONES
  const handleValidacion = async (id: string, accion: 'APROBAR' | 'RECHAZAR') => {
    // Optimistic UI: Lo quitamos de la lista antes de que responda el server para que se sienta rápido
    setCitasPendientes(prev => prev.filter(c => c.id !== id));
    
    const exito = await api.validarPago(id, accion);
    if (!exito) {
      alert("Error al conectar con el servidor");
      cargarDatos(); // Revertimos si falló
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar currentView={view} onChangeView={setView} />

      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto">
        <header className="mb-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-800">
            {view === 'CALENDAR' ? 'Calendario General' : 'Validación de Pagos'}
          </h1>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-sm font-medium text-slate-600">Servidor Conectado</span>
          </div>
        </header>

        {loading ? (
          <div className="text-center py-10 text-slate-400">Cargando datos...</div>
        ) : (
          <>
            {view === 'VALIDATION' && (
              <div className="max-w-4xl mx-auto">
                {citasPendientes.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                    <p className="text-slate-400">No hay pagos pendientes por validar</p>
                  </div>
                ) : (
                  citasPendientes.map(cita => (
                    <ValidationCard key={cita.id} cita={cita} onAction={handleValidacion} />
                  ))
                )}
              </div>
            )}

            {view === 'CALENDAR' && (
              <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center">
                <p className="text-slate-400">Aquí irá la grilla del calendario (Próximo paso)</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}