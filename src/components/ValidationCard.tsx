// src/components/ValidationCard.tsx
import type { Cita } from '../types';
import { Check, X } from 'lucide-react';

interface Props {
  cita: Cita;
  onAction: (id: string, action: 'APROBAR' | 'RECHAZAR') => void;
}

export const ValidationCard = ({ cita, onAction }: Props) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden mb-6">
      <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between">
        <div>
           <h3 className="font-bold text-slate-800">{cita.clienteNombre}</h3>
           <p className="text-sm text-slate-500">{cita.clienteTelefono}</p>
        </div>
        <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold h-fit">
          {cita.estado}
        </span>
      </div>

      <div className="p-6 grid md:grid-cols-2 gap-6">
        {/* Info Cita */}
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase">Fecha Solicitada</p>
          <p className="text-lg font-medium text-slate-800 mb-4">{cita.fecha} - {cita.hora}</p>
          
          <div className="flex gap-3 mt-8">
            <button 
              onClick={() => onAction(cita.id, 'RECHAZAR')}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-red-200 text-red-600 font-bold hover:bg-red-50"
            >
              <X size={18} /> Rechazar
            </button>
            <button 
              onClick={() => onAction(cita.id, 'APROBAR')}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 shadow-lg shadow-green-200"
            >
              <Check size={18} /> Validar
            </button>
          </div>
        </div>

        {/* Comprobante */}
        <div className="bg-slate-100 rounded-xl flex items-center justify-center min-h-[200px] border-2 border-dashed border-slate-300 relative overflow-hidden group">
          {cita.comprobanteUrl ? (
            <img src={cita.comprobanteUrl} alt="Comprobante" className="object-cover w-full h-full" />
          ) : (
            <span className="text-slate-400 text-sm">Sin imagen cargada</span>
          )}
        </div>
      </div>
    </div>
  );
};