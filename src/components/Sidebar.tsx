import { Link, useLocation } from 'react-router-dom';
import { X, LayoutDashboard, Calendar, CheckSquare, Smartphone, BarChart3, Users, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Definimos qué propiedades recibe este componente
interface SidebarProps {
  isOpen: boolean;      // ¿Está abierto en móvil?
  onClose: () => void;  // Función para cerrarlo
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const location = useLocation(); // Hook para saber en qué URL estamos
  const { isAdmin, logout } = useAuth(); // Hook para saber si es admin y cerrar sesión

  // Función auxiliar para saber si un link está activo
  const isActive = (path: string) => location.pathname === path;

  // Clases base para los links
  const linkClass = (path: string) => `
    flex items-center gap-3 px-4 py-3 rounded transition-all duration-200
    ${isActive(path)
      ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' // Estilo Activo
      : 'text-gray-400 hover:bg-slate-800 hover:text-white'   // Estilo Inactivo
    }
  `;

  return (
    <aside className={`
      fixed top-0 h-[100dvh] left-0 z-50 w-64 bg-slate-900 text-white flex flex-col shadow-xl 
      transition-transform duration-300 ease-in-out
      md:static md:translate-x-0 
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      {/* Botón X para cerrar (Solo visible en celular) */}
      <div className="md:hidden absolute top-4 right-4">
        <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-full transition-colors">
          <X className="w-6 h-6 text-gray-400 hover:text-white" />
        </button>
      </div>

      {/* Header del Sidebar */}
      <div className="p-6 text-center border-b border-slate-800 mt-8 md:mt-0">
        <h2 className="text-2xl font-bold text-blue-400 tracking-tight">Citas WA</h2>
        <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Panel de Control</p>
      </div>

      {/* Navegación */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">

        <Link to="/dashboard" onClick={onClose} className={linkClass('/dashboard')}>
          <LayoutDashboard size={20} />
          <span className="font-medium">Inicio</span>
        </Link>

        <Link to="/dashboard/calendario" onClick={onClose} className={linkClass('/dashboard/calendario')}>
          <Calendar size={20} />
          <span className="font-medium">Calendario</span>
        </Link>

        <Link to="/dashboard/pagos" onClick={onClose} className={linkClass('/dashboard/pagos')}>
          <CheckSquare size={20} />
          <span className="font-medium">Validar Pagos</span>
        </Link>

        <Link to="/dashboard/vincular" onClick={onClose} className={linkClass('/dashboard/vincular')}>
          <Smartphone size={20} />
          <span className="font-medium">Vincular WhatsApp</span>
        </Link>

        {/* Menús solo para ADMIN */}
        {isAdmin() && (
          <>
            <div className="pt-4 pb-2 px-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Administración</p>
            </div>

            <Link to="/dashboard/statistics" onClick={onClose} className={linkClass('/dashboard/statistics')}>
              <BarChart3 size={20} />
              <span className="font-medium">Estadísticas</span>
            </Link>

            <Link to="/dashboard/users" onClick={onClose} className={linkClass('/dashboard/users')}>
              <Users size={20} />
              <span className="font-medium">Usuarios</span>
            </Link>
          </>
        )}

      </nav>

      {/* Footer con Botón de Cerrar Sesión */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={() => {
            logout();
            onClose();
          }}
          className="flex items-center gap-3 px-4 py-3 w-full text-left rounded text-red-400 hover:bg-slate-800 hover:text-red-300 transition-all duration-200"
        >
          <LogOut size={20} />
          <span className="font-medium">Cerrar Sesión</span>
        </button>
        <div className="text-center text-xs text-gray-600 font-mono mt-4">
          v1.0.0 PRO
        </div>
      </div>
    </aside>
  );
};
