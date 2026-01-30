import { useState, useEffect, useMemo, useCallback } from 'react';
import { useCitas } from '../hooks/useCitas';
import { useQueryClient } from '@tanstack/react-query';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import type { View, Components } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { io } from 'socket.io-client';
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
  Timer,
  Plus,
  Loader2
} from 'lucide-react';
import { api } from '../services/api';
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


interface RecursoEvento {
  estado?: string;
  telefono?: string;
  tipo?: 'resumen' | 'cita';
  count?: number;
}

interface EventoCalendario {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  resource?: RecursoEvento;
}

// --- 3. Componente MODAL ---
const ModalDetalle = ({
  event,
  onClose,
  onReprogramar,
  onNoAsistio
}: {
  event: EventoCalendario | null,
  onClose: () => void,
  onReprogramar: () => void,
  onNoAsistio: () => void
}) => {
  if (!event) return null;

  const getStatusColor = (estado?: string) => {
    switch (estado) {
      case 'CONFIRMADA': return 'text-green-700 bg-green-100 border-green-300';
      case 'VALIDAR': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'PENDIENTE_PAGO': return 'text-slate-500 bg-slate-50 border-slate-200';
      case 'NO_ASISTIO': return 'text-red-700 bg-red-100 border-red-300';
      default: return 'text-indigo-600 bg-indigo-50 border-indigo-200';
    }
  };

  const statusClass = getStatusColor(event.resource?.estado);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-slate-100 overflow-hidden animate-modal-pop">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-lg text-slate-800">Detalles de la Cita</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors hover:rotate-90 duration-300">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Cliente</p>
              <p className="font-bold text-slate-800 text-lg leading-tight">{event.title}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Teléfono</p>
              <p className="font-medium text-slate-700 font-mono">{event.resource?.telefono || 'No registrado'}</p>
            </div>
          </div>

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

          <div className={`mt-4 p-3 rounded-xl border ${statusClass} flex items-center justify-center gap-2`}>
            {event.resource?.estado === 'CONFIRMADA' && <CheckCircle2 className="w-5 h-5" />}
            {event.resource?.estado === 'VALIDAR' && <AlertCircle className="w-5 h-5" />}
            {event.resource?.estado === 'PENDIENTE_PAGO' && <Banknote className="w-5 h-5" />}
            <span className="font-bold tracking-wide">{event.resource?.estado}</span>
          </div>

        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100">
          <div className="flex gap-3">
            {event.resource?.tipo === 'cita' && (
              <button
                onClick={onReprogramar}
                className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-100 transition-all text-sm"
              >
                Reprogramar
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-900 transition-all shadow-lg shadow-slate-200 text-sm"
            >
              Cerrar
            </button>
          </div>
          {event.resource?.tipo === 'cita' && event.start < new Date() && event.resource?.estado !== 'CANCELADA' && (
            <button
              onClick={onNoAsistio}
              className={`w-full mt-3 px-4 py-2 border font-medium rounded-lg transition-all text-sm flex items-center gap-2 justify-center ${event.resource?.estado === 'NO_ASISTIO'
                  ? 'border-green-300 text-green-700 hover:bg-green-50'
                  : 'border-red-300 text-red-700 hover:bg-red-50'
                }`}
            >
              {event.resource?.estado === 'NO_ASISTIO' ? (
                <><CheckCircle2 className="w-4 h-4" /> Marcar como Asistió</>
              ) : (
                <><X className="w-4 h-4" /> No Asistió</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// --- 3.5 Componente MODAL NUEVA CITA ---
interface DatosNuevaCita {
  clienteNombre: string;
  clienteTelefono: string;
  fecha: string;
  horario: string;
}

const ModalNuevaCita = ({
  isOpen,
  onClose,
  fechaInicial,
  onSuccess
}: {
  isOpen: boolean;
  onClose: () => void;
  fechaInicial?: Date;
  onSuccess: () => void;
}) => {
  const [formData, setFormData] = useState<DatosNuevaCita>({
    clienteNombre: '',
    clienteTelefono: '',
    fecha: fechaInicial ? format(fechaInicial, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    horario: ''
  });
  const [horariosDisponibles, setHorariosDisponibles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar horarios cuando cambia la fecha
  useEffect(() => {
    if (isOpen && formData.fecha) {
      cargarHorarios(formData.fecha);
    }
  }, [isOpen, formData.fecha]);

  // Reset cuando se abre con nueva fecha
  useEffect(() => {
    if (isOpen && fechaInicial) {
      setFormData(prev => ({
        ...prev,
        fecha: format(fechaInicial, 'yyyy-MM-dd'),
        horario: ''
      }));
    }
  }, [isOpen, fechaInicial]);

  const cargarHorarios = async (fecha: string) => {
    setLoadingHorarios(true);
    const horarios = await api.obtenerHorariosDisponibles(fecha);
    setHorariosDisponibles(horarios);
    setLoadingHorarios(false);
    // Si el horario seleccionado ya no está disponible, limpiarlo
    if (!horarios.includes(formData.horario)) {
      setFormData(prev => ({ ...prev, horario: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validaciones Frontend
    if (formData.clienteNombre.trim().length < 3) {
      setError('El nombre debe tener al menos 3 caracteres.');
      return;
    }

    if (formData.clienteTelefono.length < 8) {
      setError('El teléfono debe tener al menos 8 dígitos.');
      return;
    }

    setLoading(true);

    const result = await api.crearCitaAdmin(formData);

    setLoading(false);

    if (result.success) {
      // Limpiar formulario
      setFormData({ clienteNombre: '', clienteTelefono: '', fecha: format(new Date(), 'yyyy-MM-dd'), horario: '' });
      onSuccess();
      onClose();
    } else {
      setError(result.error || 'Error al crear la cita');
    }
  };

  const handleClose = () => {
    setError(null);
    setFormData({ clienteNombre: '', clienteTelefono: '', fecha: format(new Date(), 'yyyy-MM-dd'), horario: '' });
    onClose();
  };

  // Handler para teléfono (solo números)
  const handleTelefonoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value.replace(/\D/g, ''); // Eliminar todo lo que no sea número
    setFormData(prev => ({ ...prev, clienteTelefono: valor }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-100 overflow-hidden animate-modal-pop">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white">
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <Plus className="w-5 h-5" /> Nueva Cita Presencial
          </h3>
          <button onClick={handleClose} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">Nombre del Cliente *</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={formData.clienteNombre}
                onChange={(e) => setFormData(prev => ({ ...prev, clienteNombre: e.target.value }))}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="Ej: Juan Pérez"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">Teléfono *</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="tel"
                required
                value={formData.clienteTelefono}
                onChange={handleTelefonoChange}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="Ej: 591 70000000"
              />
            </div>
            <p className="text-xs text-slate-400 mt-1 ml-1">Solo números</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">Fecha *</label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="date"
                required
                value={formData.fecha}
                onChange={(e) => setFormData(prev => ({ ...prev, fecha: e.target.value }))}
                min={format(new Date(), 'yyyy-MM-dd')}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">Horario *</label>
            {loadingHorarios ? (
              <div className="flex items-center justify-center py-4 text-slate-500">
                <Loader2 className="w-5 h-5 animate-spin mr-2" /> Cargando horarios...
              </div>
            ) : horariosDisponibles.length === 0 ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
                No hay horarios disponibles para esta fecha
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {horariosDisponibles.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, horario: h }))}
                    className={`py-2.5 px-3 rounded-lg font-semibold text-sm transition-all ${formData.horario === h
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !formData.horario}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Creando...</>
              ) : (
                <><Plus className="w-4 h-4" /> Crear Cita</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- 3.6 Componente MODAL REPROGRAMAR ---
const ModalReprogramar = ({
  isOpen,
  onClose,
  cita,
  onSuccess
}: {
  isOpen: boolean;
  onClose: () => void;
  cita: EventoCalendario;
  onSuccess: () => void;
}) => {
  const [fecha, setFecha] = useState(format(cita.start, 'yyyy-MM-dd'));
  const [horario, setHorario] = useState(format(cita.start, 'HH:mm'));
  const [horariosDisponibles, setHorariosDisponibles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      cargarHorarios(fecha);
    }
  }, [isOpen, fecha]);

  const cargarHorarios = async (fechaSel: string) => {
    setLoadingHorarios(true);
    const horarios = await api.obtenerHorariosDisponibles(fechaSel);
    // Si es la misma fecha de la cita original, asegúrate de incluir el horario actual si se quiere mantener (aunque la idea es cambiarlo)
    // Pero si el usuario cambia de fecha y vuelve a la original, el horario original debería estar "ocupado" por él mismo, así que la API lo devolvería como ocupado?
    // En la API `getHorariosDisponibles` no excluimos la cita actual.
    // Para simplificar, asumimos que si reprograma es para cambiar.
    setHorariosDisponibles(horarios);
    setLoadingHorarios(false);

    // Si el horario seleccionado ya no está en la lista (y no es el original), limpiarlo
    // Pero si es el original y estamos en la fecha original, tal vez no aparezca disponible, pero es SU horario.
    // De momento, si reprograma, se asume que busca un hueco LIBRE.
    if (!horarios.includes(horario) && fechaSel !== format(cita.start, 'yyyy-MM-dd')) {
      setHorario('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await api.reprogramarCita(cita.id, fecha, horario);

    setLoading(false);

    if (result.success) {
      onSuccess();
      onClose();
    } else {
      setError(result.error || 'Error al reprogramar');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-100 overflow-hidden animate-modal-pop">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white">
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" /> Reprogramar Cita
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-3 bg-slate-50 rounded-lg text-sm text-slate-700 mb-4 border border-slate-100">
            <p className="font-semibold text-slate-500 text-xs uppercase mb-1">Cita Actual</p>
            <p className="font-bold">{cita.title}</p>
            <p>{format(cita.start, 'EEEE d MMMM, HH:mm', { locale: es })}</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">Nueva Fecha</label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="date"
                required
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                min={format(new Date(), 'yyyy-MM-dd')}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">Nuevo Horario</label>
            {loadingHorarios ? (
              <div className="flex items-center justify-center py-4 text-slate-500">
                <Loader2 className="w-5 h-5 animate-spin mr-2" /> Buscando espacios...
              </div>
            ) : horariosDisponibles.length === 0 ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
                No hay horarios disponibles para esta fecha
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {horariosDisponibles.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setHorario(h)}
                    className={`py-2.5 px-3 rounded-lg font-semibold text-sm transition-all ${horario === h
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !horario || horariosDisponibles.length === 0}
              className="flex-1 px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar Cambio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- 4. Componentes Visuales del Calendario ---
const CustomEventDay = ({ event }: { event: EventoCalendario }) => {
  const { title, resource } = event;
  const getIcon = () => {
    switch (resource?.estado) {
      case 'CONFIRMADA': return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
      case 'VALIDAR': return <AlertCircle className="w-3.5 h-3.5 text-amber-600" />;
      case 'PENDIENTE_PAGO': return <Banknote className="w-3.5 h-3.5 text-slate-500" />;
      default: return <CalendarIcon className="w-3.5 h-3.5 text-indigo-500" />;
    }
  };
  return (
    <div className="flex flex-col h-full justify-center px-2 hover:bg-slate-50/50 transition-colors rounded">
      <div className="flex items-center gap-1.5">
        {getIcon()}
        <span className="text-xs font-bold truncate leading-tight text-slate-700">
          {title}
        </span>
      </div>
    </div>
  );
};

const CustomEventMonth = ({ event }: { event: EventoCalendario }) => {
  const count = event.resource?.count || 0;
  return (
    <div className="flex items-center justify-center h-full w-full">
      <span className="hidden md:block text-xs font-semibold tracking-wide truncate px-1">
        {event.title}
      </span>
      <div className="md:hidden flex items-center justify-center gap-0.5 flex-wrap px-0.5 h-full content-center">
        {Array.from({ length: Math.min(count, 4) }).map((_, i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-600 shadow-sm" />
        ))}
        {count > 4 && <span className="text-[10px] text-blue-600 font-bold leading-none">+</span>}
      </div>
    </div>
  );
};

const CustomToolbar = ({ onNavigate, onView, view, label, onNuevaCita }: any) => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between mb-4 pb-4 border-b border-slate-200 gap-4">
      <div className="flex items-center gap-2">
        <div className="flex items-center bg-white rounded-lg border border-slate-200 shadow-sm p-1">
          <button onClick={() => onNavigate('PREV')} className="p-1.5 hover:bg-slate-100 rounded-md text-slate-600 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={() => onNavigate('TODAY')} className="px-3 py-1 text-sm font-bold text-slate-700 hover:bg-slate-100 rounded-md mx-1 transition-colors">
            Hoy
          </button>
          <button onClick={() => onNavigate('NEXT')} className="p-1.5 hover:bg-slate-100 rounded-md text-slate-600 transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <h2 className="text-xl font-bold text-slate-800 ml-2 capitalize font-sans">{label}</h2>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onNuevaCita}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-200 hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4" /> Nueva Cita
        </button>

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
    </div>
  );
};

// --- 5. Componente Principal ---
const CalendarioFinal = () => {
  // React Query Hook
  const { data: dataRaw = [], isLoading: loading } = useCitas(); // Obtiene todas las citas
  const queryClient = useQueryClient();

  const [fecha, setFecha] = useState(new Date());
  const [vista, setVista] = useState<View>(Views.MONTH);
  const [citaSeleccionada, setCitaSeleccionada] = useState<EventoCalendario | null>(null);
  const [modalNuevaCita, setModalNuevaCita] = useState<{ isOpen: boolean; fecha?: Date }>({ isOpen: false });
  const [modalReprogramar, setModalReprogramar] = useState<{ isOpen: boolean; cita?: EventoCalendario }>({ isOpen: false });

  const abrirModalNuevaCita = (fechaPreseleccionada?: Date) => {
    setModalNuevaCita({ isOpen: true, fecha: fechaPreseleccionada });
  };

  // --- 5.2 USE EFFECT CON SOCKETS ---
  useEffect(() => {
    // Conexión WebSocket
    const urlBase = import.meta.env.VITE_API_URL.replace('/api', '');
    const socket = io(urlBase);

    socket.on('connect', () => {
      console.log('Frontend conectado al Socket');
    });

    // 3. ESCUCHAR CAMBIOS DEL BACKEND
    socket.on('cambio-citas', () => {
      console.log('Cambio detectado en citas -> Recargando agenda...');
      // Invalidamos la query para que React Query vuelva a hacer fetch automáticamente
      queryClient.invalidateQueries({ queryKey: ['citas'] });
    });

    return () => {
      socket.disconnect();
    };
  }, [queryClient]);


  // --- Procesamiento de Eventos (Igual que antes) ---
  const eventos = useMemo((): EventoCalendario[] => {
    if (loading && dataRaw.length === 0) return [];

    if (vista === Views.MONTH) {
      const countByDate: Record<string, number> = {};
      dataRaw.forEach(c => {
        // Aseguramos formato fecha válido
        const d = c.fecha.toString().split('T')[0];
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
          resource: { tipo: 'resumen' as const, estado: 'INFO', count: count }
        };
      });
    }

    return dataRaw.map(cita => {
      const datePart = cita.fecha.toString().split('T')[0];
      const start = new Date(`${datePart}T${cita.horario}:00`);
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
      border: 'none', borderRadius: '6px', fontSize: '12px',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)', outline: 'none', color: '#334155'
    };

    if (event.resource?.tipo === 'resumen') {
      return {
        style: { ...style, backgroundColor: '#eff6ff', color: '#2563eb', textAlign: 'center' as const, border: '1px solid #dbeafe', fontWeight: '600' }
      };
    }

    switch (event.resource?.estado) {
      case 'PENDIENTE_PAGO': style.backgroundColor = '#f8fafc'; style.borderLeft = '3px solid #94a3b8'; break;
      case 'VALIDAR': style.backgroundColor = '#fffbeb'; style.borderLeft = '3px solid #f59e0b'; break;
      case 'CONFIRMADA': style.backgroundColor = '#d1fae5'; style.borderLeft = '3px solid #059669'; break;
      case 'NO_ASISTIO':
        style.backgroundColor = '#fee2e2';
        style.borderLeft = '3px solid #dc2626';
        style.textDecoration = 'line-through';
        style.opacity = '0.8';
        break;
      default: style.backgroundColor = '#f1f5f9'; style.borderLeft = '3px solid #cbd5e1';
    }
    return { style };
  }, []);

  const components: Components<EventoCalendario> = useMemo(() => ({
    toolbar: (props: any) => <CustomToolbar {...props} onNuevaCita={() => abrirModalNuevaCita()} />,
    event: ({ event }: any) => {
      if (vista === Views.MONTH) return <CustomEventMonth event={event} />;
      return <CustomEventDay event={event} />;
    },
  }), [vista]);

  const onSelectSlot = (slotInfo: any) => {
    if (vista === Views.MONTH && slotInfo.action === 'click') {
      setFecha(slotInfo.start);
      setVista(Views.DAY);
    } else if (vista === Views.DAY && slotInfo.action === 'click') {
      // En vista de día, abrir modal con fecha preseleccionada
      abrirModalNuevaCita(slotInfo.start);
    }
  };

  const handleReprogramar = () => {
    if (citaSeleccionada) {
      setModalReprogramar({ isOpen: true, cita: citaSeleccionada });
      setCitaSeleccionada(null);
    }
  };

  const handleNoAsistio = async () => {
    if (!citaSeleccionada) return;

    // Si ya está marcado como NO_ASISTIO, revertir a CONFIRMADA
    const esNoAsistio = citaSeleccionada.resource?.estado === 'NO_ASISTIO';
    const result = esNoAsistio
      ? await api.marcarAsistio(citaSeleccionada.id)
      : await api.marcarNoAsistio(citaSeleccionada.id);

    if (result.success) {
      queryClient.invalidateQueries({ queryKey: ['citas'] });
      setCitaSeleccionada(null);
    } else {
      alert(result.error || 'Error al actualizar estado de asistencia');
    }
  };

  const onSelectEvent = (event: EventoCalendario) => {
    if (vista === Views.MONTH) {
      setFecha(event.start);
      setVista(Views.DAY);
    } else {
      if (event.resource?.tipo === 'cita') setCitaSeleccionada(event);
    }
  };

  return (
    <div className="h-full w-full bg-slate-50 p-4 md:p-6 font-sans relative">
      {citaSeleccionada && (
        <ModalDetalle
          event={citaSeleccionada}
          onClose={() => setCitaSeleccionada(null)}
          onReprogramar={handleReprogramar}
          onNoAsistio={handleNoAsistio}
        />
      )}
      <ModalNuevaCita
        isOpen={modalNuevaCita.isOpen}
        onClose={() => setModalNuevaCita({ isOpen: false })}
        fechaInicial={modalNuevaCita.fecha}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['citas'] })}
      />

      {modalReprogramar.cita && (
        <ModalReprogramar
          isOpen={modalReprogramar.isOpen}
          onClose={() => setModalReprogramar({ isOpen: false, cita: undefined })}
          cita={modalReprogramar.cita}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['citas'] })}
        />
      )}

      <div key={vista} className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-6 h-[85vh] flex flex-col border border-slate-100 animate-tab-change">
        <Calendar
          culture='es' localizer={localizer} events={eventos}
          startAccessor="start" endAccessor="end" style={{ height: '100%' }}
          views={[Views.MONTH, Views.DAY]} view={vista} onView={setVista}
          date={fecha} onNavigate={setFecha} selectable={true}
          onSelectEvent={onSelectEvent} onSelectSlot={onSelectSlot}
          components={components} eventPropGetter={eventPropGetter}
          messages={{
            allDay: 'Todo el día', previous: 'Anterior', next: 'Siguiente', today: 'Hoy',
            month: 'Mes', day: 'Día', date: 'Fecha', time: 'Hora', event: 'Evento',
            noEventsInRange: 'Sin citas agendadas', showMore: total => `+${total} más`
          }}
          min={new Date(0, 0, 0, 8, 0, 0)} max={new Date(0, 0, 0, 21, 0, 0)}
        />
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        .rbc-calendar { font-family: 'Inter', sans-serif; color: #334155; }
        .rbc-header { padding: 12px 0; font-size: 0.75rem; font-weight: 700; color: #94a3b8; border-bottom: 1px solid #f1f5f9 !important; text-transform: uppercase; letter-spacing: 0.05em; }
        .rbc-date-cell { display: flex !important; justify-content: center !important; padding: 8px 0 !important; font-size: 0.9rem; font-weight: 500; color: #64748b; }
        .rbc-today { background-color: transparent !important; }
        .rbc-now .rbc-button-link { background: #4f46e5; color: white; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 8px; margin: 0 auto !important; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.4); font-weight: 700; }
        .rbc-month-view, .rbc-time-view { border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; }
        .rbc-day-bg + .rbc-day-bg { border-left: 1px solid #f1f5f9; }
        .rbc-month-row + .rbc-month-row { border-top: 1px solid #f1f5f9; }
        .rbc-off-range-bg { background-color: #f8fafc; }
        .rbc-timeslot-group { border-bottom: 1px dashed #f1f5f9; }
        .rbc-time-gutter .rbc-timeslot-group { border-bottom: none; }
        .rbc-current-time-indicator { background-color: #f43f5e; }
        .rbc-event { background: none !important; padding: 0 !important; }
        .rbc-event-label { display: none !important; }
      `}</style>
    </div>
  );
};

export default CalendarioFinal;