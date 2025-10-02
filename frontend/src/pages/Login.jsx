import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const initialState = {
    email: 'admin@example.com',
    password: 'admin123'
};

function Login() {
    const { login, error, loading, isAuthenticated } = useAuth();
    const [formData, setFormData] = useState(initialState);
    const [formError, setFormError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        setFormError(error);
    }, [error]);

    if (isAuthenticated) {
        const redirectTo = location.state?.from ?? '/';
        return <Navigate to={redirectTo} replace />;
    }

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setFormError(null);

        const { ok, error: loginError } = await login(formData);

        if (!ok) {
            setFormError(loginError);
            return;
        }

        const redirectTo = location.state?.from ?? '/';
        navigate(redirectTo, { replace: true });
    };

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
            <div className="card shadow-sm p-4" style={{ maxWidth: '420px', width: '100%' }}>
                <div className="text-center mb-4">
                    <h2 className="fw-bold">Gestión de Mantenciones</h2>
                    <p className="text-muted mb-0">Accede con tus credenciales</p>
                </div>

                {formError && (
                    <div className="alert alert-danger" role="alert">
                        {formError}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">Correo electrónico</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            className="form-control"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="admin@example.com"
                            autoComplete="email"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="password" className="form-label">Contraseña</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            className="form-control"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Ingresa tu contraseña"
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-100"
                        disabled={loading}
                    >
                        {loading ? 'Ingresando...' : 'Iniciar sesión'}
                    </button>
                </form>

                <p className="small text-muted mt-3 mb-0">
                    * Usuario demo precargado: admin@example.com / admin123
                </p>
            </div>
        </div>
    );
}

export default Login;
