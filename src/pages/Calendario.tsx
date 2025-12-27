import { useState, useEffect, useMemo, useCallback } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import type { View, Components } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  ChevronLeft, 
  ChevronRight, 
  LayoutGrid, 
  Clock, 
  Calendar as CalendarIcon,
  CheckCircle2,
  AlertCircle,
  Banknote,
  Phone,
  X,
  User,
  Timer
} from 'lucide-react';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// --- 1. Configuración Regional ---
const locales = { 'es': es };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// --- 2. Interfaces ---
interface CitaBackend {
  id: number;
  clienteNombre: string | null;
  clienteTelefono: string;
  fecha: string;
  horario: string;
  estado: 'PENDIENTE_PAGO' | 'VALIDAR' | 'CONFIRMADA' | string;
}

interface RecursoEvento {
  estado?: string;
  telefono?: string;
  tipo?: 'resumen' | 'cita';
}

interface EventoCalendario {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  resource?: RecursoEvento;
}

// --- 3. Componente MODAL (Ventana de Detalles) ---
const ModalDetalle = ({ event, onClose }: { event: EventoCalendario | null, onClose: () => void }) => {
  if (!event) return null;

  const getStatusColor = (estado?: string) => {
    switch(estado) {
      case 'CONFIRMADA': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'VALIDAR': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'PENDIENTE_PAGO': return 'text-slate-500 bg-slate-50 border-slate-200';
      default: return 'text-indigo-600 bg-indigo-50 border-indigo-200';
    }
  };

  const statusClass = getStatusColor(event.resource?.estado);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header del Modal */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-lg text-slate-800">Detalles de la Cita</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500 " />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-5 space-y-4">
          
          {/* Nombre */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Cliente</p>
              <p className="font-bold text-slate-800 text-lg leading-tight">{event.title}</p>
            </div>
          </div>

          {/* Teléfono */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Teléfono</p>
              <p className="font-medium text-slate-700 font-mono">{event.resource?.telefono || 'No registrado'}</p>
            </div>
          </div>

          {/* Hora */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <Timer className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Horario</p>
              <p className="font-medium text-slate-700">
                {format(event.start, 'EEEE d MMMM, yyyy', { locale: es })}
                <br />
                <span className="text-lg font-bold">
                  {format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}
                </span>
              </p>
            </div>
          </div>

          {/* Estado Badge */}
          <div className={`mt-4 p-3 rounded-xl border ${statusClass} flex items-center justify-center gap-2`}>
            {event.resource?.estado === 'CONFIRMADA' && <CheckCircle2 className="w-5 h-5" />}
            {event.resource?.estado === 'VALIDAR' && <AlertCircle className="w-5 h-5" />}
            {event.resource?.estado === 'PENDIENTE_PAGO' && <Banknote className="w-5 h-5" />}
            <span className="font-bold tracking-wide">{event.resource?.estado}</span>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-900 transition-colors shadow-lg shadow-slate-200"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

// --- 4. Componentes Visuales del Calendario ---

// Tarjeta de Cita (Vista Agenda/Día) - AHORA SOLO MUESTRA NOMBRE
const CustomEventDay = ({ event }: { event: EventoCalendario }) => {
  const { title, resource } = event;
  
  const getIcon = () => {
    switch(resource?.estado) {
      case 'CONFIRMADA': return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
      case 'VALIDAR': return <AlertCircle className="w-3.5 h-3.5 text-amber-600" />;
      case 'PENDIENTE_PAGO': return <Banknote className="w-3.5 h-3.5 text-slate-500" />;
      default: return <CalendarIcon className="w-3.5 h-3.5 text-indigo-500" />;
    }
  };

  return (
    <div className="flex flex-col h-full justify-center px-2">
      {/* SIMPLIFICADO: Solo Icono y Nombre. Nada más. */}
      <div className="flex items-center gap-1.5">
        {getIcon()}
        <span className="text-xs font-bold truncate leading-tight text-slate-700">
          {title}
        </span>
      </div>
    </div>
  );
};

// Chip de Resumen (Vista Mes)
const CustomEventMonth = ({ event }: { event: EventoCalendario }) => {
  return (
    <div className="flex items-center justify-center h-full w-full">
      <span className="text-xs font-semibold tracking-wide">
        {event.title}
      </span>
    </div>
  );
};

// Toolbar Profesional
const CustomToolbar = ({ onNavigate, onView, view, label }: any) => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between mb-4 pb-4 border-b border-slate-200 gap-4">
      <div className="flex items-center gap-2">
        <div className="flex items-center bg-white rounded-lg border border-slate-200 shadow-sm p-1">
          <button onClick={() => onNavigate('PREV')} className="p-1.5 hover:bg-slate-100 rounded-md text-slate-600">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={() => onNavigate('TODAY')} className="px-3 py-1 text-sm font-bold text-slate-700 hover:bg-slate-100 rounded-md mx-1">
            Hoy
          </button>
          <button onClick={() => onNavigate('NEXT')} className="p-1.5 hover:bg-slate-100 rounded-md text-slate-600">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <h2 className="text-xl font-bold text-slate-800 ml-2 capitalize font-sans">{label}</h2>
      </div>

      <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
        <button
          onClick={() => onView(Views.MONTH)}
          className={`flex items-center gap-2 px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${view === Views.MONTH ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <LayoutGrid className="w-4 h-4" /> <span>Mes</span>
        </button>
        <button
          onClick={() => onView(Views.DAY)}
          className={`flex items-center gap-2 px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${view === Views.DAY ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Clock className="w-4 h-4" /> <span>Día</span>
        </button>
      </div>
    </div>
  );
};

// --- 5. Componente Principal ---
const CalendarioFinal = () => {
  const [dataRaw, setDataRaw] = useState<CitaBackend[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [fecha, setFecha] = useState(new Date());
  const [vista, setVista] = useState<View>(Views.MONTH);
  
  // Estado para el Modal
  const [citaSeleccionada, setCitaSeleccionada] = useState<EventoCalendario | null>(null);

  // --- Fetch del Backend ---
  useEffect(() => {
    setLoading(true);
    fetch(`${import.meta.env.VITE_API_URL}/citas/agenda`)
      .then((res) => res.ok ? res.json() : [])
      .then((data) => setDataRaw(Array.isArray(data) ? data : []))
      .catch(() => {
        console.warn("Error API, usando datos mock");
        setDataRaw([
          { id: 1, clienteNombre: 'María Cliente', clienteTelefono: '77112233', fecha: new Date().toISOString().split('T')[0], horario: '09:00', estado: 'CONFIRMADA' },
          { id: 2, clienteNombre: 'Fabio Salguero', clienteTelefono: '60554433', fecha: new Date().toISOString().split('T')[0], horario: '13:00', estado: 'VALIDAR' },
          { id: 3, clienteNombre: 'Octavio Salguero', clienteTelefono: '70010020', fecha: new Date().toISOString().split('T')[0], horario: '16:00', estado: 'PENDIENTE_PAGO' },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  // --- Procesamiento de Eventos ---
  const eventos = useMemo((): EventoCalendario[] => {
    if (loading) return [];

    if (vista === Views.MONTH) {
      const countByDate: Record<string, number> = {};
      dataRaw.forEach(c => {
        const d = c.fecha.split('T')[0];
        countByDate[d] = (countByDate[d] || 0) + 1;
      });

      return Object.entries(countByDate).map(([dateStr, count]) => {
        const start = new Date(`${dateStr}T00:00:00`);
        return {
          id: `sum-${dateStr}`,
          title: `${count} cita${count > 1 ? 's' : ''}`, 
          start,
          end: new Date(start),
          allDay: true,
          resource: { tipo: 'resumen' as const, estado: 'INFO' }
        };
      });
    }

    return dataRaw.map(cita => {
      const start = new Date(`${cita.fecha.split('T')[0]}T${cita.horario}:00`);
      const end = new Date(start.getTime() + 60 * 60000); 
      return {
        id: cita.id.toString(),
        title: cita.clienteNombre || `Cita sin nombre`,
        start,
        end,
        resource: { 
          tipo: 'cita' as const, 
          estado: cita.estado,
          telefono: cita.clienteTelefono 
        }
      };
    });
  }, [dataRaw, vista, loading]);

  const eventPropGetter = useCallback((event: EventoCalendario) => {
    const style: React.CSSProperties = {
      border: 'none',
      borderRadius: '6px',
      fontSize: '12px',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      outline: 'none',
      color: '#334155'
    };

    if (event.resource?.tipo === 'resumen') {
      return {
        style: {
          ...style,
          backgroundColor: '#eff6ff', 
          color: '#2563eb',          
          textAlign: 'center' as const,
          border: '1px solid #dbeafe',
          fontWeight: '600'
        }
      };
    }

    switch (event.resource?.estado) {
      case 'PENDIENTE_PAGO':
        style.backgroundColor = '#f8fafc';
        style.borderLeft = '3px solid #94a3b8';
        break;
      case 'VALIDAR':
        style.backgroundColor = '#fffbeb'; 
        style.borderLeft = '3px solid #f59e0b';
        break;
      case 'CONFIRMADA':
        style.backgroundColor = '#ecfdf5'; 
        style.borderLeft = '3px solid #10b981'; 
        break;
      default:
        style.backgroundColor = '#f1f5f9';
        style.borderLeft = '3px solid #cbd5e1';
    }

    return { style };
  }, []);

  const components: Components<EventoCalendario> = useMemo(() => ({
    toolbar: CustomToolbar,
    event: ({ event }: any) => {
      if (vista === Views.MONTH) return <CustomEventMonth event={event} />;
      return <CustomEventDay event={event} />;
    },
  }), [vista]);

  // --- Handlers ---
  const onSelectSlot = (slotInfo: any) => {
    if (vista === Views.MONTH && slotInfo.action === 'click') {
      setFecha(slotInfo.start);
      setVista(Views.DAY);
    }
  };

  const onSelectEvent = (event: EventoCalendario) => {
    if (vista === Views.MONTH) {
      setFecha(event.start);
      setVista(Views.DAY);
    } else {
      // SI ES VISTA DE DÍA: ABRIMOS EL MODAL
      if(event.resource?.tipo === 'cita') {
        setCitaSeleccionada(event);
      }
    }
  };

  return (
    <div className="h-full w-full bg-slate-50 p-4 md:p-6 font-sans relative">
      
      {/* --- RENDERIZADO DEL MODAL --- */}
      {citaSeleccionada && (
        <ModalDetalle 
          event={citaSeleccionada} 
          onClose={() => setCitaSeleccionada(null)} 
        />
      )}

      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-6 h-[85vh] flex flex-col border border-slate-100">
        <Calendar
          culture='es'
          localizer={localizer}
          events={eventos}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          
          views={[Views.MONTH, Views.DAY]}
          view={vista}
          onView={setVista}
          
          date={fecha}
          onNavigate={setFecha}
          selectable={true}
          onSelectEvent={onSelectEvent}
          onSelectSlot={onSelectSlot}
          components={components}
          eventPropGetter={eventPropGetter}
          
          messages={{
            allDay: 'Todo el día',
            previous: 'Anterior',
            next: 'Siguiente',
            today: 'Hoy',
            month: 'Mes',
            day: 'Día',
            date: 'Fecha',
            time: 'Hora',
            event: 'Evento',
            noEventsInRange: 'Sin citas agendadas',
            showMore: total => `+${total} más`
          }}
          
          min={new Date(0, 0, 0, 8, 0, 0)}
          max={new Date(0, 0, 0, 21, 0, 0)}
        />
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        .rbc-calendar { font-family: 'Inter', sans-serif; color: #334155; }
        .rbc-header {
          padding: 12px 0; font-size: 0.75rem; font-weight: 700; color: #94a3b8;
          border-bottom: 1px solid #f1f5f9 !important; text-transform: uppercase; letter-spacing: 0.05em;
        }
        .rbc-date-cell {
          display: flex !important; justify-content: center !important;
          padding: 8px 0 !important; font-size: 0.9rem; font-weight: 500; color: #64748b;
        }
        .rbc-today { background-color: transparent !important; }
        .rbc-now .rbc-button-link {
          background: #4f46e5; color: white; width: 32px; height: 32px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 8px; margin: 0 auto !important;
          box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.4); font-weight: 700;
        }
        .rbc-month-view, .rbc-time-view { border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; }
        .rbc-day-bg + .rbc-day-bg { border-left: 1px solid #f1f5f9; }
        .rbc-month-row + .rbc-month-row { border-top: 1px solid #f1f5f9; }
        .rbc-off-range-bg { background-color: #f8fafc; }
        .rbc-timeslot-group { border-bottom: 1px dashed #f1f5f9; }
        .rbc-time-gutter .rbc-timeslot-group { border-bottom: none; }
        .rbc-current-time-indicator { background-color: #f43f5e; }
        .rbc-event { background: none !important; padding: 0 !important; }
        
        /* Ocultar el texto de la hora que pone la librería automáticamente */
        .rbc-event-label { display: none !important; }
      `}</style>
    </div>
  );
};

export default CalendarioFinal;