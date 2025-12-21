import type { Cita } from '../types'; // Asegúrate de que esta ruta sea correcta
import { Check, X } from 'lucide-react';

interface Props {
  cita: Cita;
  onAction: (id: string, action: 'APROBAR' | 'RECHAZAR') => void;
}

// IMPORTANTE: Usamos "export const" para que coincida con el import { ValidationCard }
export const ValidationCard = ({ cita, onAction }: Props) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden mb-6 transition-all hover:shadow-xl">
      
      {/* Encabezado de la tarjeta */}
      <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-start">
        <div>
           <h3 className="font-bold text-slate-800 text-lg">{cita.clienteNombre}</h3>
           <p className="text-sm text-slate-500 font-medium">Teléfono: {cita.clienteTelefono}</p>
        </div>
        <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold tracking-wide border border-amber-200">
          {cita.estado}
        </span>
      </div>

      <div className="p-6 grid md:grid-cols-2 gap-6">
        {/* Columna Izquierda: Información y Botones */}
        <div className="flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Fecha Solicitada</p>
            <div className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
              <span>Fecha: {cita.fecha}</span>
              <span className="text-slate-300">|</span>
              <span>Hora: {cita.hora}</span>
            </div>
          </div>
          
          <div className="flex gap-3 mt-4">
            <button 
              onClick={() => onAction(cita.id, 'RECHAZAR')}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-red-100 text-red-600 font-bold hover:bg-red-50 hover:border-red-200 transition-colors"
            >
              <X size={18} /> Rechazar
            </button>
            <button 
              onClick={() => onAction(cita.id, 'APROBAR')}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 shadow-lg shadow-green-200 transition-all active:scale-95"
            >
              <Check size={18} /> Validar
            </button>
          </div>
        </div>

        {/* Columna Derecha: Imagen del Comprobante */}
        <div className="bg-slate-100 rounded-xl flex items-center justify-center min-h-[200px] border-2 border-dashed border-slate-300 relative overflow-hidden group">
          {cita.comprobanteUrl ? (
            <a 
              href={cita.comprobanteUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full h-full block cursor-zoom-in"
              title="Clic para ver en grande"
            >
              <img 
                src={cita.comprobanteUrl} 
                alt="Comprobante de pago" 
                className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105" 
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                 <span className="opacity-0 group-hover:opacity-100 bg-black/70 text-white text-xs px-2 py-1 rounded backdrop-blur-sm transition-opacity">
                    Ver imagen completa
                 </span>
              </div>
            </a>
          ) : (
            <div className="text-center p-4">
              <p className="text-slate-400 text-sm font-medium">Sin imagen cargada</p>
              <p className="text-slate-300 text-xs mt-1">(El usuario no subió comprobante)</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};