import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

interface Usuario {
    id: number;
    nombre: string;
    email: string;
}

interface AuthContextType {
    usuario: Usuario | null;
    token: string | null;
    loading: boolean;
    login: (token: string, usuario: Usuario) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const storedToken = localStorage.getItem('token');
            if (storedToken) {
                try {
                    // Verificar validez del token llamando al backend
                    const userData = await api.me(storedToken);
                    if (userData) {
                        setUsuario(userData);
                        setToken(storedToken);
                    } else {
                        logout();
                    }
                } catch (error) {
                    logout();
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const login = (newToken: string, newUser: Usuario) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUsuario(newUser);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUsuario(null);
    };

    return (
        <AuthContext.Provider value={{
            usuario,
            token,
            loading,
            login,
            logout,
            isAuthenticated: !!usuario
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
