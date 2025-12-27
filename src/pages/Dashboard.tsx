import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar'; // Importamos el componente limpio
import { Menu } from 'lucide-react';

const Dashboard = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      
      {/* --- 1. HEADER MÓVIL (Solo visible en celular) --- */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 text-white z-40 flex items-center justify-between px-4 shadow-md">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMobileMenuOpen(true)} 
            className="p-1 hover:bg-slate-800 rounded transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold text-lg text-blue-400">Citas WA</span>
        </div>
      </div>

      {/* --- 2. OVERLAY (Fondo oscuro al abrir menú) --- */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-40 md:hidden backdrop-blur-sm animate-in fade-in"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* --- 3. SIDEBAR MODULAR --- */}
      {/* Aquí llamamos al componente y le pasamos el control */}
      <Sidebar 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
      />

      {/* --- 4. CONTENIDO PRINCIPAL --- */}
      <main className="flex-1 w-full relative h-full overflow-auto pt-16 md:pt-0">
        <div className="p-4 md:p-8 min-h-full">
           {/* Outlet renderiza la página que corresponda (Home, Calendario, etc.) */}
           <Outlet />
        </div>
      </main>

    </div>
  );
};

export default Dashboard;