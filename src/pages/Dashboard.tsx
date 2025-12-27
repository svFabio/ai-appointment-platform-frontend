import { Link, Outlet } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X, Calendar, CheckSquare, LayoutDashboard, Smartphone } from 'lucide-react';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Inicio', href: '/', icon: LayoutDashboard },
    { name: 'Calendario', href: '/calendario', icon: Calendar },
    { name: 'Validar Pagos', href: '/pagos', icon: CheckSquare },
    { name: 'Vincular WhatsApp', href: '/vincular', icon: Smartphone },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden bg-gray-600 bg-opacity-75 transition-opacity"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* --- SIDEBAR (Mobile) --- */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white shadow-xl transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } md:hidden`}>
         {/* Header */}
         <div className="p-4 border-b border-slate-700 bg-gradient-to-b from-slate-800 to-slate-900">
             <div className="flex items-center justify-between">
               <div>
                 <h2 className="text-xl font-bold text-kenyan-copper-400">Citas WA</h2>
                 <p className="text-xs text-gray-400 mt-1">Panel de Control</p>
               </div>
               <button
                 onClick={() => setSidebarOpen(false)}
                 className="p-2 rounded-md hover:bg-slate-800 transition-colors"
               >
                 <X className="h-6 w-6" />
               </button>
             </div>
         </div>
         
         {/* Navigation */}
         <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-3 bg-slate-800/50 hover:bg-kenyan-copper-600 rounded transition text-gray-200 hover:text-white group"
              >
                 <item.icon className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
                 <span className="font-medium">{item.name}</span>
              </Link>
            ))}
         </nav>

         {/* Footer */}
         <div className="p-4 border-t border-slate-800 bg-gradient-to-t from-slate-800 to-slate-900 text-center text-xs text-gray-500">
            v1.0.0 Beta
         </div>
      </aside>

      {/* --- SIDEBAR (Desktop) --- */}
      <aside className="hidden md:flex md:flex-col md:w-64 lg:w-72 bg-slate-900 text-white shadow-xl flex-shrink-0">
         {/* Header */}
         <div className="p-4 border-b border-slate-700 bg-gradient-to-b from-slate-800 to-slate-900">
             <div className="text-center">
                 <h2 className="text-xl font-bold text-kenyan-copper-400">Citas WA</h2>
                 <p className="text-xs text-gray-400 mt-1">Panel de Control</p>
             </div>
         </div>
         
         {/* Navigation */}
         <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center gap-3 px-4 py-3 bg-slate-800/50 hover:bg-kenyan-copper-600 rounded transition text-gray-200 hover:text-white group"
              >
                 <item.icon className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
                 <span className="font-medium">{item.name}</span>
              </Link>
            ))}
         </nav>

         {/* Footer */}
         <div className="p-4 border-t border-slate-800 bg-gradient-to-t from-slate-800 to-slate-900 text-center text-xs text-gray-500">
            v1.0.0 Beta
         </div>
      </aside>

      {/* --- HEADER (Mobile) --- */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            <Menu className="h-6 w-6 text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-800">Citas WA</h1>
          <div className="w-6"></div>
        </div>
      </header>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <main className="flex-1 p-6 md:p-8 overflow-auto">
        <div className="md:hidden h-12"></div> {/* Spacer for mobile header */}

        <Outlet />
      </main>
    </div>
  );
};

export default Dashboard;