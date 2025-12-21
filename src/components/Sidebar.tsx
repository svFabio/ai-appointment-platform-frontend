import { Calendar, CheckSquare, LayoutDashboard } from 'lucide-react';

interface Props {
  currentView: 'CALENDAR' | 'VALIDATION';
  onChangeView: (view: 'CALENDAR' | 'VALIDATION') => void;
}

export function Sidebar({ currentView, onChangeView }: Props) {
  return (
    <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 p-4">
      <div className="mb-8 px-2 flex items-center gap-2">
        <LayoutDashboard className="text-blue-500" />
        <div>
          <h1 className="text-xl font-bold tracking-tight">Citas WA</h1>
          <p className="text-slate-400 text-xs">Admin Panel</p>
        </div>
      </div>

      <nav className="space-y-2">
        <button
          onClick={() => onChangeView('VALIDATION')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
            currentView === 'VALIDATION' 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <CheckSquare size={20} />
          <span className="font-medium">Validar Pagos</span>
        </button>

        <button
          onClick={() => onChangeView('CALENDAR')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
            currentView === 'CALENDAR' 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Calendar size={20} />
          <span className="font-medium">Calendario</span>
        </button>
      </nav>
    </aside>
  );
}