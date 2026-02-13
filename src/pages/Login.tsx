import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { api } from '../services/api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/dashboard';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const data = await api.login(email, password);
            login(data.token, data.usuario);
            navigate(from, { replace: true });
        } catch (err: any) {
            setError(err.message || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary), #1e1b4b)' }}
        >
            {/* Animated background orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20 animate-gradient"
                    style={{ background: 'radial-gradient(circle, var(--color-primary-light), transparent)' }} />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-15 animate-gradient"
                    style={{ background: 'radial-gradient(circle, var(--color-secondary-light), transparent)', animationDelay: '4s' }} />
            </div>

            <div className="glass-card w-full max-w-md overflow-hidden shadow-2xl relative z-10"
                style={{ background: 'rgba(255, 255, 255, 0.95)' }}
            >
                {/* Header */}
                <div className="gradient-primary p-8 text-center animate-gradient" style={{ backgroundSize: '200% 200%' }}>
                    <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg border border-white/30">
                        <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Panel Administrativo</h2>
                    <p className="text-white/70 mt-2 text-sm">Ingresa tus credenciales para continuar</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {error && (
                        <div className="p-4 bg-danger-light border border-danger/20 rounded-xl text-danger text-sm flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-txt mb-1.5">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-txt-muted" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input-modern pl-10"
                                    placeholder="admin@ejemplo.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-txt mb-1.5">Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-txt-muted" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-modern pl-10"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full py-3.5 text-base"
                    >
                        {loading ? (
                            <><Loader2 className="w-5 h-5 animate-spin" /> Verificando...</>
                        ) : (
                            'Iniciar Sesión'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
