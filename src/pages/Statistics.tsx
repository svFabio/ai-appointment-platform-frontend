import { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Clock, DollarSign, Star, MessageSquare } from 'lucide-react';

interface OverviewData {
    citasMes: number;
    ingresosMes: number;
    topClientes: Array<{ nombre: string; telefono: string; totalCitas: number }>;
    horariosPopulares: Array<{ horario: string; totalReservas: number }>;
    ratingPromedio?: number;
    ultimosComentarios?: Array<{ clienteNombre: string; rating: number; comentario: string; fecha: string }>;
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
                fetch(`${import.meta.env.VITE_API_URL}/statistics/overview`, { headers }),
                fetch(`${import.meta.env.VITE_API_URL}/statistics/revenue?months=6`, { headers })
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
            <div className="space-y-6">
                <div className="skeleton h-10 w-48 rounded-theme-md" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28 rounded-theme-lg" />)}
                </div>
                <div className="skeleton h-80 rounded-theme-lg" />
            </div>
        );
    }

    const statCards = [
        { label: 'Citas Este Mes', value: overview?.citasMes || 0, icon: TrendingUp, gradient: 'from-primary to-secondary' },
        { label: 'Ingresos del Mes', value: `Bs. ${overview?.ingresosMes || 0}`, icon: DollarSign, gradient: 'from-emerald-500 to-teal-500' },
        { label: 'Clientes Frecuentes', value: overview?.topClientes.length || 0, icon: Users, gradient: 'from-violet-500 to-purple-500' },
        { label: 'Horarios Activos', value: overview?.horariosPopulares.length || 0, icon: Clock, gradient: 'from-amber-500 to-orange-500' },
        { label: 'Satisfacción', value: (overview?.ratingPromedio || 0).toFixed(1), icon: Star, gradient: 'from-yellow-400 to-orange-400' },
    ];

    // Read CSS vars for chart colors
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim() || '#6366f1';
    const successColor = getComputedStyle(document.documentElement).getPropertyValue('--color-success').trim() || '#10b981';

    return (
        <div className="space-y-6">
            <h1 className="text-2xl md:text-3xl font-bold text-txt">Estadísticas</h1>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat, i) => (
                    <div key={i} className="stat-card">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-txt-secondary">{stat.label}</p>
                                <p className="text-2xl font-bold text-txt mt-2 animate-count-up">{stat.value}</p>
                            </div>
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                                <stat.icon className="w-5 h-5 text-white" />
                            </div>
                        </div>
                    </div>

                ))}
            </div>

            {/* Revenue Chart */}
            <div className="card-modern p-5 md:p-6">
                <h2 className="text-lg font-bold text-txt mb-4">Ingresos por Mes</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={revenue?.revenue || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                        <XAxis dataKey="mes" stroke="var(--color-text-muted)" fontSize={12} />
                        <YAxis stroke="var(--color-text-muted)" fontSize={12} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'var(--color-surface)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-md)',
                                boxShadow: 'var(--shadow-card-hover)',
                                fontSize: 13,
                            }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="total" stroke={successColor} strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Ingresos (Bs.)" />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Popular Hours Chart */}
            <div className="card-modern p-5 md:p-6">
                <h2 className="text-lg font-bold text-txt mb-4">Horarios Más Reservados</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={overview?.horariosPopulares || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                        <XAxis dataKey="horario" stroke="var(--color-text-muted)" fontSize={12} />
                        <YAxis stroke="var(--color-text-muted)" fontSize={12} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'var(--color-surface)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-md)',
                                boxShadow: 'var(--shadow-card-hover)',
                                fontSize: 13,
                            }}
                        />
                        <Legend />
                        <Bar dataKey="totalReservas" fill={primaryColor} radius={[6, 6, 0, 0]} name="Reservas" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Top Clients Table */}
            <div className="card-modern overflow-hidden">
                <div className="px-5 md:px-6 py-4 border-b border-border">
                    <h2 className="text-lg font-bold text-txt">Clientes Más Frecuentes</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-surface-elevated/50">
                                <th className="text-left py-3 px-5 text-[11px] font-semibold text-txt-muted uppercase tracking-wider">Nombre</th>
                                <th className="text-left py-3 px-5 text-[11px] font-semibold text-txt-muted uppercase tracking-wider">Teléfono</th>
                                <th className="text-left py-3 px-5 text-[11px] font-semibold text-txt-muted uppercase tracking-wider">Total Citas</th>
                            </tr>
                        </thead>
                        <tbody>
                            {overview?.topClientes.map((cliente, index) => (
                                <tr key={index} className="border-b border-border-light hover:bg-surface-alt/50 transition-colors">
                                    <td className="py-3 px-5 text-sm text-txt font-medium">{cliente.nombre}</td>
                                    <td className="py-3 px-5 text-sm text-txt-secondary font-mono">{cliente.telefono}</td>
                                    <td className="py-3 px-5">
                                        <span className="badge badge-primary font-bold">{cliente.totalCitas}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Últimos Comentarios */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" /> Comentarios Recientes
                </h2>
                <div className="space-y-4">
                    {overview?.ultimosComentarios?.length === 0 ? (
                        <p className="text-slate-500 italic">No hay comentarios aún.</p>
                    ) : (
                        overview?.ultimosComentarios?.map((com, idx) => (
                            <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="font-semibold text-slate-800 capitalize">{com.clienteNombre || 'Anónimo'}</p>
                                        <p className="text-xs text-slate-500">{new Date(com.fecha).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Star key={i} className={`w-3 h-3 ${i < com.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} />
                                        ))}
                                    </div>
                                </div>
                                <p className="text-slate-600 text-sm italic">"{com.comentario}"</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Statistics;
