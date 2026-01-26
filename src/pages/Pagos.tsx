import { usePendientes, useValidarPago } from '../hooks/useCitas';

interface Cita {
  id: number;
  clienteNombre: string | null;
  clienteTelefono: string;
  fecha: string;
  horario: string;
  estado: string;
  comprobanteUrl: string | null;
}

const Pagos = () => {
  // Usamos los hooks de React Query
  const { data: citas = [], isLoading: loading } = usePendientes();
  const { mutateAsync: validarPago } = useValidarPago();

  // 2. Función para Validar
  const manejarValidacion = async (id: number, accion: 'CONFIRMAR' | 'RECHAZAR') => {
    // Nota: window.confirm bloquea el hilo, mejor usar un modal custom o confiar en el usuario.
    // Para simplificar, lo mantenemos o lo quitamos según preferencia.
    const confirmacion = window.confirm(`¿Estás seguro de ${accion === 'CONFIRMAR' ? 'APROBAR' : 'RECHAZAR'} este pago?`);
    if (!confirmacion) return;

    try {
      // El hook maneja el toast de éxito/error y la invalidación de queries
      await validarPago({ id: id.toString(), accion });
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kenyan-copper-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando pagos pendientes...</p>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-100">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">Validación de Comprobantes</h2>
            <p className="text-sm text-gray-600 mt-1">Revisa las fotos enviadas por WhatsApp</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-kenyan-copper-50 text-kenyan-copper-700 rounded-full text-sm font-medium">
            <span className="w-2 h-2 bg-kenyan-copper-500 rounded-full"></span>
            {citas.length} pendientes
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 md:p-6">
        {citas.length === 0 ? (
          <div className="py-12 text-center">
            <div className="text-6xl mb-4">✓</div>
            <p className="text-lg text-gray-600 font-medium">¡Todo al día!</p>
            <p className="text-sm text-gray-500 mt-2">No hay pagos pendientes de revisión.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {citas.map(cita => (
              <div key={cita.id} className="bg-gray-50 rounded-xl p-4 md:p-6 hover:bg-white transition-all border border-gray-100">
                <div className="flex flex-col md:flex-row gap-4 md:gap-6">

                  {/* Comprobante Image */}
                  <div className="flex-shrink-0">
                    {cita.comprobanteUrl ? (
                      <a href={cita.comprobanteUrl} target="_blank" rel="noreferrer" className="block">
                        <img
                          src={cita.comprobanteUrl}
                          alt="Comprobante"
                          className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-lg border-2 border-orange-200 hover:border-orange-500 transition-all cursor-zoom-in shadow-sm"
                        />
                      </a>
                    ) : (
                      <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs border border-dashed border-gray-300">
                        <div className="text-center">
                          <div className="text-lg mb-1">📄</div>
                          <p>SIN FOTO</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
                      <p className="font-bold text-lg md:text-xl text-gray-800">
                        {cita.clienteNombre || (
                          cita.clienteTelefono.length > 15
                            ? `ID: ${cita.clienteTelefono.substring(0, 5)}...`
                            : `Tel: ${cita.clienteTelefono}`
                        )}
                      </p>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-200">
                        {cita.estado}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Horario:</span> {cita.horario}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">Tel:</span>
                        <span className="font-medium">Teléfono:</span> {cita.clienteTelefono}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3 md:gap-0 md:flex-row md:items-center md:justify-end md:w-48">
                    <button
                      onClick={() => manejarValidacion(cita.id, 'CONFIRMAR')}
                      disabled={!cita.comprobanteUrl}
                      className={`w-full md:w-auto px-4 py-2.5 rounded-lg font-bold transition-all ${cita.comprobanteUrl
                        ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl active:scale-95'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                      Aprobar
                    </button>

                    <button
                      onClick={() => manejarValidacion(cita.id, 'RECHAZAR')}
                      className="w-full md:w-auto px-4 py-2.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-bold transition-all hover:shadow-md active:scale-95"
                    >
                      Rechazar
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Pagos;