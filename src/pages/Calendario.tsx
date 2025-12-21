import { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Configuración del idioma español
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

// Tipos (si usas TypeScript)
interface CitaBackend {
  id: string;
  clienteNombre: string;
  fecha: string;
  hora: string;
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
  
  // 👇 1. AQUÍ AGREGUÉ EL ESTADO DE LA FECHA (Esto faltaba)
  const [fecha, setFecha] = useState(new Date());

  // Estado para la vista (Mes, Semana, Día)
  const [vistaActual, setVistaActual] = useState(Views.MONTH);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/citas/agenda`)
      .then(res => res.json())
      .then((data: CitaBackend[]) => {
        const eventosFormateados = data.map(cita => {
          const fechaInicio = new Date(`${cita.fecha}T${cita.hora}:00`);
          const fechaFin = new Date(fechaInicio.getTime() + 60 * 60 * 1000);

          return {
            id: cita.id,
            title: `${cita.clienteNombre} (${cita.estado})`,
            start: fechaInicio,
            end: fechaFin,
          };
        });
        setEventos(eventosFormateados);
      })
      .catch(err => console.error("Error cargando agenda:", err));
  }, []);

  // Función para manejar la navegación (Siguiente, Anterior, Hoy)
  const manejarNavegacion = (nuevaFecha: Date) => {
    setFecha(nuevaFecha);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow h-screen flex flex-col">
      <h2 className="text-2xl font-bold mb-4 text-slate-800">Agenda del Spa</h2>
      
      <div className="h-[600px]"> 
        <Calendar
          localizer={localizer}
          events={eventos}
          startAccessor="start"
          endAccessor="end"
          
          // 👇 2. AQUÍ CONECTAMOS LA FECHA AL CALENDARIO (Esto faltaba)
          date={fecha} 
          onNavigate={manejarNavegacion}

          // Configuración de Vistas
          view={vistaActual}
          onView={(nuevaVista: any) => setVistaActual(nuevaVista)}
          
          // Idioma
          culture='es'
          messages={{
            next: "Siguiente",
            previous: "Anterior",
            today: "Hoy",
            month: "Mes",
            week: "Semana",
            day: "Día",
            agenda: "Agenda",
            date: "Fecha",
            time: "Hora",
            event: "Evento",
            noEventsInRange: "No hay citas en este rango."
          }}

          // Estilos de eventos
          eventPropGetter={(event) => {
            let newStyle = {
              backgroundColor: '#3B82F6',
              color: 'white',
              borderRadius: '5px',
              border: 'none'
            };
        
            if (event.title.includes('PENDIENTE')) {
              newStyle.backgroundColor = '#F97316';
            } else if (event.title.includes('CONFIRMADA')) {
              newStyle.backgroundColor = '#22C55E';
            }
        
            return { style: newStyle };
          }}
        />
      </div>
    </div>
  );
};

export default Calendario;