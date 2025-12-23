import { Link, Outlet } from 'react-router-dom';

const Dashboard = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl">
         <div className="p-6 text-center border-b border-slate-700">
             <h2 className="text-2xl font-bold text-blue-400">Citas WA</h2>
             <p className="text-xs text-gray-400 mt-1">Panel de Control</p>
         </div>
         
         <nav className="flex-1 p-4 space-y-2">
            {/* 1. HOME (Ruta Raíz) */}
            <Link to="/" className="flex items-center gap-3 px-4 py-3 bg-slate-800/50 hover:bg-blue-600 rounded transition text-gray-200 hover:text-white">
               <span>Inicio</span>
            </Link>

            {/* 2. CALENDARIO (Abajo de Home) */}
            <Link to="/calendario" className="flex items-center gap-3 px-4 py-3 bg-slate-800/50 hover:bg-blue-600 rounded transition text-gray-200 hover:text-white">
               <span>Calendario</span>
            </Link>

            {/* 3. PAGOS (Abajo de Calendario) */}
            <Link to="/pagos" className="flex items-center gap-3 px-4 py-3 bg-slate-800/50 hover:bg-blue-600 rounded transition text-gray-200 hover:text-white">
               <span>Validar Pagos</span>
            </Link>

            {/* 4. Vincular QR WA*/}
            <Link to="/vincular" className="flex items-center gap-3 px-4 py-3 bg-slate-800/50 hover:bg-blue-600 rounded transition text-gray-200 hover:text-white">
               <span>Vincular WhatsApp</span>
            </Link>
         </nav>

         <div className="p-4 border-t border-slate-800 text-center text-xs text-gray-500">
            v1.0.0 Beta
         </div>
      </aside>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Dashboard;