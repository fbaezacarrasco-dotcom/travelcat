import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';
const API_LOGIN = API_BASE + '/auth/login';
const API_LOGOUT = API_BASE + '/auth/logout';
const API_PROFILE = API_BASE + '/auth/profile';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem('authToken'));
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('authUser');
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!token || user) return;

        const controller = new AbortController();

        const fetchProfile = async () => {
            try {
                const response = await fetch(API_PROFILE, {
                    headers: {
                        Authorization: 'Bearer ' + token
                    },
                    signal: controller.signal
                });

                if (!response.ok) {
                    throw new Error('No se pudo validar la sesión.');
                }

                const data = await response.json();
                setUser(data.user);
                localStorage.setItem('authUser', JSON.stringify(data.user));
            } catch (profileError) {
                console.warn(profileError.message);
                clearAuthState();
            }
        };

        fetchProfile();

        return () => controller.abort();
    }, [token, user]);

    const clearAuthState = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
    };

    const login = async ({ email, password }) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(API_LOGIN, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                const payload = await response.json().catch(() => ({}));
                const message = payload.error || 'Credenciales inválidas.';
                throw new Error(message);
            }

            const data = await response.json();
            setToken(data.token);
            setUser(data.user);
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('authUser', JSON.stringify(data.user));
            return { ok: true };
        } catch (loginError) {
            const message = loginError.message || 'Error al iniciar sesión.';
            setError(message);
            clearAuthState();
            return { ok: false, error: message };
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        if (!token) {
            clearAuthState();
            return;
        }

        try {
            await fetch(API_LOGOUT, {
                method: 'POST',
                headers: {
                    Authorization: 'Bearer ' + token
                }
            });
        } catch (logoutError) {
            console.warn('Falló el cierre de sesión en el servidor:', logoutError.message);
        } finally {
            clearAuthState();
        }
    };

    const value = useMemo(() => ({
        token,
        user,
        login,
        logout,
        loading,
        error,
        isAuthenticated: Boolean(token && user)
    }), [token, user, loading, error]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth debe usarse dentro de un AuthProvider');
    }

    return context;
}
