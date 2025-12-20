// src/components/Sidebar.tsx
import { Calendar, Clock, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  currentView: string;
  onChangeView: (view: 'CALENDAR' | 'VALIDATION') => void;
}

export const Sidebar = ({ currentView, onChangeView }: SidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'CALENDAR', label: 'Calendario', icon: Calendar },
    { id: 'VALIDATION', label: 'Pagos Pendientes', icon: Clock },
  ];

  return (
    <>
      {/* Móvil Toggle */}
      <button onClick={() => setIsOpen(true)} className="md:hidden fixed top-4 left-4 z-50 p-2 bg-slate-900 text-white rounded-lg">
        <Menu size={24} />
      </button>

      {/* Sidebar Real */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="p-6 flex justify-between items-center border-b border-slate-800">
          <h2 className="text-xl font-bold text-amber-500">Citas WA</h2>
          <button onClick={() => setIsOpen(false)} className="md:hidden"><X /></button>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { onChangeView(item.id as any); setIsOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentView === item.id ? 'bg-amber-500 text-slate-900 font-bold' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-slate-800">
          <button className="flex items-center gap-3 text-slate-400 hover:text-red-400 w-full px-4">
            <LogOut size={20} /> Salir
          </button>
        </div>
      </aside>
    </>
  );
};