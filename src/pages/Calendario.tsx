import { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Configuración del idioma español para el calendario
const locales = {
  'es': es,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// 1. INTERFAZ CORREGIDA (Coincide con tu Backend y Prisma)
interface CitaBackend {
  id: number;
  clienteNombre: string | null;
  clienteTelefono: string;
  fecha: string;    // Ejemplo: "2025-12-21T19:17:37..."
  horario: string;  // Ejemplo: "13:00"
  estado: string;
}

interface EventoCalendario {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource?: any;
}

const Calendario = () => {
  const [eventos, setEventos] = useState<EventoCalendario[]>([]);
  const [fecha, setFecha] = useState(new Date()); // Control de la fecha visible
  const [vistaActual, setVistaActual] = useState(Views.MONTH); // Vista por defecto

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/citas/agenda`)
      .then(res => res.json())
      .then((data: CitaBackend[]) => {
        
        const eventosFormateados = data.map(cita => {
          // A. Limpiamos la fecha: De "2025-12-21T19:00..." sacamos "2025-12-21"
          const fechaSoloDia = cita.fecha.split('T')[0]; 
          
          // B. Construimos la fecha de inicio exacta: "2025-12-21T13:00:00"
          // Esto evita errores de "Invalid Date"
          const start = new Date(`${fechaSoloDia}T${cita.horario}:00`);
          
          // C. Calculamos el fin (1 hora después)
          const end = new Date(start.getTime() + 60 * 60 * 1000);

          // D. Definimos qué texto mostrar en la cajita
          const nombreAmostrar = cita.clienteNombre 
            ? cita.clienteNombre 
            : `📱 ${cita.clienteTelefono}`;

          return {
            id: cita.id.toString(),
            title: `${cita.horario} - ${nombreAmostrar}`, // Ej: "13:00 - Juan Perez"
            start: start,
            end: end,
            resource: { estado: cita.estado } // Guardamos el estado para usarlo en los colores
          };
        });

        setEventos(eventosFormateados);
      })
      .catch(err => console.error("Error cargando agenda:", err));
  }, []);

  // Función para manejar la navegación (Botones Atrás/Adelante/Hoy)
  const manejarNavegacion = (nuevaFecha: Date) => {
    setFecha(nuevaFecha);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow h-screen flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-slate-800">Agenda del Spa 🇧🇴</h2>
        {/* Leyenda de colores pequeña */}
        <div className="flex gap-3 text-xs">
            <span className="flex items-center gap-1"><div className="w-3 h-3 bg-gray-400 rounded-full"></div> Pendiente Pago</span>
            <span className="flex items-center gap-1"><div className="w-3 h-3 bg-orange-500 rounded-full"></div> Validar</span>
            <span className="flex items-center gap-1"><div className="w-3 h-3 bg-green-500 rounded-full"></div> Confirmada</span>
        </div>
      </div>
      
      <div className="flex-1"> 
        <Calendar
          localizer={localizer}
          events={eventos}
          
          // Control de fecha y navegación
          date={fecha} 
          onNavigate={manejarNavegacion}

          // Control de vistas
          view={vistaActual}
          onView={(nuevaVista: any) => setVistaActual(nuevaVista)}
          
          // Configuraciones visuales
          startAccessor="start"
          endAccessor="end"
          culture='es'
          
          messages={{
            next: "Siguiente",
            previous: "Anterior",
            today: "Hoy",
            month: "Mes",
            week: "Semana",
            day: "Día",
            agenda: "Lista",
            date: "Fecha",
            time: "Hora",
            event: "Cita",
            noEventsInRange: "No hay citas en este rango."
          }}

          // Colores según el estado de la cita
          eventPropGetter={(event) => {
            const estado = event.resource?.estado || '';
            let backgroundColor = '#3B82F6'; // Azul default

            if (estado === 'PENDIENTE_PAGO') {
              backgroundColor = '#9CA3AF'; // Gris
            } else if (estado === 'VALIDACION_PENDIENTE') {
              backgroundColor = '#F97316'; // Naranja fuerte
            } else if (estado === 'CONFIRMADA') {
              backgroundColor = '#10B981'; // Verde Esmeralda
            } else if (estado === 'CANCELADA') {
              backgroundColor = '#EF4444'; // Rojo
            }

            return {
              style: {
                backgroundColor,
                color: 'white',
                borderRadius: '6px',
                border: 'none',
                fontSize: '0.85rem',
                padding: '2px 5px'
              }
            };
          }}
        />
      </div>
    </div>
  );
};

export default Calendario;