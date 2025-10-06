import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || `${window.location.origin}/api`;
const API_LOGIN = API_BASE + '/auth/login';
const API_LOGOUT = API_BASE + '/auth/logout';
const API_PROFILE = API_BASE + '/auth/profile';

console.log('API_LOGIN:', API_LOGIN);

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
            headers: {
                'Content-Type': 'application/json'  // ✅ necesario para enviar JSON
            },
            body: JSON.stringify({ email, password })
        });

        const contentType = response.headers.get('content-type');

        if (!response.ok) {
            // Intenta parsear error en JSON, si no se puede, captura como texto
            if (contentType && contentType.includes('application/json')) {
                const payload = await response.json();
                throw new Error(payload.error || 'Credenciales inválidas.');
            } else {
                const text = await response.text();
                console.error('Respuesta inesperada del servidor:', text);
                throw new Error('Error inesperado del servidor.');
            }
        }

        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('Respuesta inesperada (no JSON):', text);
            throw new Error('El servidor devolvió una respuesta no válida.');
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
