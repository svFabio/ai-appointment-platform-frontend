import { useState } from 'react'; // 1. Importamos useState para el interruptor
import { Link, Outlet } from 'react-router-dom';
import { Menu, X } from 'lucide-react'; // 2. Importamos los iconos (Hamburguesa y Cerrar)

const Dashboard = () => {
  // 3. Estado para controlar si el menú está abierto o cerrado en celular
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      
      {/* --- 4. BARRA SUPERIOR MÓVIL (Solo se ve en celular) --- */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 text-white z-40 flex items-center justify-between px-4 shadow-md">
        <div className="flex items-center gap-3">
          {/* Botón de las 3 rayas */}
          <button onClick={() => setMobileMenuOpen(true)} className="p-1 active:scale-95 transition-transform">
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold text-lg text-blue-400">Citas WA</span>
        </div>
      </div>

      {/* --- 5. FONDO OSCURO (Solo cuando abres menú en celular) --- */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* --- SIDEBAR (Modificado para ser responsive) --- */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col shadow-xl transition-transform duration-300 ease-in-out
        md:static md:translate-x-0 
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
         {/* Botón X para cerrar (Solo visible en celular dentro del menú) */}
         <div className="md:hidden absolute top-4 right-4">
            <button onClick={() => setMobileMenuOpen(false)}>
              <X className="w-6 h-6 text-gray-400" />
            </button>
         </div>

         <div className="p-6 text-center border-b border-slate-700 mt-8 md:mt-0">
             <h2 className="text-2xl font-bold text-blue-400">Citas WA</h2>
             <p className="text-xs text-gray-400 mt-1">Panel de Control</p>
         </div>
         
         <nav className="flex-1 p-4 space-y-2">
            {/* TUS ENLACES ORIGINALES (Agregué onClick para cerrar menú al tocar en móvil) */}
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 bg-slate-800/50 hover:bg-blue-600 rounded transition text-gray-200 hover:text-white">
               <span>Inicio</span>
            </Link>

            <Link to="/calendario" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 bg-slate-800/50 hover:bg-blue-600 rounded transition text-gray-200 hover:text-white">
               <span>Calendario</span>
            </Link>

            <Link to="/pagos" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 bg-slate-800/50 hover:bg-blue-600 rounded transition text-gray-200 hover:text-white">
               <span>Validar Pagos</span>
            </Link>

            <Link to="/vincular" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 bg-slate-800/50 hover:bg-blue-600 rounded transition text-gray-200 hover:text-white">
               <span>Vincular WhatsApp</span>
            </Link>
         </nav>

         <div className="p-4 border-t border-slate-800 text-center text-xs text-gray-500">
            v1.0.0 Beta
         </div>
      </aside>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <main className="flex-1 p-4 md:p-8 overflow-auto w-full relative pt-20 md:pt-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Dashboard;