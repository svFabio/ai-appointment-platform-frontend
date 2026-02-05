import { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Clock, DollarSign } from 'lucide-react';

interface OverviewData {
    citasMes: number;
    ingresosMes: number;
    topClientes: Array<{ nombre: string; telefono: string; totalCitas: number }>;
    horariosPopulares: Array<{ horario: string; totalReservas: number }>;
}

interface RevenueData {
    revenue: Array<{ mes: string; total: number }>;
}

const Statistics = () => {
    const [overview, setOverview] = useState<OverviewData | null>(null);
    const [revenue, setRevenue] = useState<RevenueData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStatistics();
    }, []);

    const fetchStatistics = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };

            const [overviewRes, revenueRes] = await Promise.all([
                fetch(`${import.meta.env.VITE_API_URL}/api/statistics/overview`, { headers }),
                fetch(`${import.meta.env.VITE_API_URL}/api/statistics/revenue?months=6`, { headers })
            ]);

            const overviewData = await overviewRes.json();
            const revenueData = await revenueRes.json();

            setOverview(overviewData);
            setRevenue(revenueData);
        } catch (error) {
            console.error('Error fetching statistics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-slate-600">Cargando estadísticas...</div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold text-slate-800">📊 Estadísticas</h1>

            {/* Cards de Resumen */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600">Citas Este Mes</p>
                            <p className="text-2xl font-bold text-slate-800">{overview?.citasMes || 0}</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-blue-500" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600">Ingresos del Mes</p>
                            <p className="text-2xl font-bold text-green-600">Bs. {overview?.ingresosMes || 0}</p>
                        </div>
                        <DollarSign className="w-8 h-8 text-green-500" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600">Clientes Frecuentes</p>
                            <p className="text-2xl font-bold text-slate-800">{overview?.topClientes.length || 0}</p>
                        </div>
                        <Users className="w-8 h-8 text-purple-500" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600">Horarios Activos</p>
                            <p className="text-2xl font-bold text-slate-800">{overview?.horariosPopulares.length || 0}</p>
                        </div>
                        <Clock className="w-8 h-8 text-orange-500" />
                    </div>
                </div>
            </div>

            {/* Gráfico de Ingresos */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <h2 className="text-xl font-semibold text-slate-800 mb-4">Ingresos por Mes</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={revenue?.revenue || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="mes" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="total" stroke="#10b981" strokeWidth={2} name="Ingresos (Bs.)" />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Gráfico de Horarios Populares */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <h2 className="text-xl font-semibold text-slate-800 mb-4">Horarios Más Reservados</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={overview?.horariosPopulares || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="horario" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="totalReservas" fill="#3b82f6" name="Reservas" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Tabla de Top Clientes */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <h2 className="text-xl font-semibold text-slate-800 mb-4">Clientes Más Frecuentes</h2>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200">
                                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Nombre</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Teléfono</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Total Citas</th>
                            </tr>
                        </thead>
                        <tbody>
                            {overview?.topClientes.map((cliente, index) => (
                                <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                                    <td className="py-3 px-4 text-sm text-slate-800">{cliente.nombre}</td>
                                    <td className="py-3 px-4 text-sm text-slate-600">{cliente.telefono}</td>
                                    <td className="py-3 px-4 text-sm text-slate-800 font-semibold">{cliente.totalCitas}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Statistics;
