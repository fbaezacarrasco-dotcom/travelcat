import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';
const API_EXPENSES = API_BASE + '/expenses';

const formatCurrency = (value) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(value || 0);

const emptyForm = {
    patente: '',
    concepto: '',
    costo: '',
    fecha: new Date().toISOString().slice(0, 10),
    boleta: null
};

function Gastos() {
    const { token } = useAuth();
    const [gastos, setGastos] = useState([]);
    const [presupuesto, setPresupuesto] = useState(null);
    const [formData, setFormData] = useState({ ...emptyForm });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);

    const headers = useMemo(() => ({
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json'
    }), [token]);

    const fetchGastos = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(API_EXPENSES, { headers: { Authorization: 'Bearer ' + token } });

            if (!response.ok) {
                throw new Error('No se pudieron obtener los gastos.');
            }

            const data = await response.json();
            setGastos(data.gastos || []);
            setPresupuesto(data.presupuesto || null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchGastos();
    }, [fetchGastos]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        if (message) setMessage(null);

        if (name === 'costo') {
            const numeric = value.replace(/[^0-9]/g, '');
            setFormData((prev) => ({ ...prev, costo: numeric }));
            return;
        }

        if (name === 'patente') {
            setFormData((prev) => ({ ...prev, patente: value.toUpperCase() }));
            return;
        }

        if (name === 'boleta') {
            const file = event.target.files?.[0] || null;
            setFormData((prev) => ({ ...prev, boleta: file }));
            return;
        }

        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!token) return;

        if (!formData.patente.trim() || !formData.concepto.trim() || !formData.costo) {
            setMessage({ type: 'warning', text: 'Complete patente, concepto y costo.' });
            return;
        }

        setSaving(true);
        setError(null);

        const payload = new FormData();
        payload.append('patente', formData.patente.trim().toUpperCase());
        payload.append('concepto', formData.concepto);
        payload.append('costo', Number(formData.costo));
        payload.append('fecha', formData.fecha);
        if (formData.boleta) {
            payload.append('boleta', formData.boleta);
        }

        try {
            const response = await fetch(API_EXPENSES, {
                method: 'POST',
                headers,
                body: payload
            });

            if (!response.ok) {
                const body = await response.json().catch(() => ({}));
                throw new Error(body.error || 'No se pudo registrar el gasto.');
            }

            setMessage({ type: 'success', text: 'Gasto registrado correctamente.' });
            setFormData({ ...emptyForm, fecha: new Date().toISOString().slice(0, 10) });
            await fetchGastos();
        } catch (submitError) {
            setError(submitError.message);
        } finally {
            setSaving(false);
        }
    };

    const totalGastado = gastos.reduce((acc, item) => acc + (item.costo || 0), 0);

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="mb-0">Gastos en repuestos</h1>
                    <p className="text-muted mb-0">Controla los movimientos y monitorea tu presupuesto anual</p>
                </div>
                <button className="btn btn-outline-secondary" onClick={fetchGastos} disabled={loading}>
                    {loading ? 'Actualizando...' : 'Refrescar'}
                </button>
            </div>

            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            <div className="row g-4">
                <div className="col-lg-5">
                    <div className="card shadow-sm">
                        <div className="card-header bg-white">
                            <h5 className="mb-0">Registrar gasto</h5>
                        </div>
                        <div className="card-body">
                            {message && (
                                <div className={`alert alert-${message.type}`} role="alert">
                                    {message.text}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">Patente</label>
                                    <input
                                        name="patente"
                                        value={formData.patente}
                                        onChange={handleChange}
                                        className="form-control"
                                        placeholder="AA-BB11"
                                        required
                                    />
                                </div>

                
                                <div className="mb-3">
                                    <label className="form-label">Concepto</label>
                                    <input
                                        name="concepto"
                                        value={formData.concepto}
                                        onChange={handleChange}
                                        className="form-control"
                                        placeholder="Ej. Cambio de neumáticos"
                                        required
                                    />
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Costo (CLP)</label>
                                        <input
                                            name="costo"
                                            value={formData.costo}
                                            onChange={handleChange}
                                            className="form-control"
                                            inputMode="numeric"
                                            required
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Fecha</label>
                                        <input
                                            type="date"
                                            name="fecha"
                                            value={formData.fecha}
                                            onChange={handleChange}
                                            className="form-control"
                                        />
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Adjuntar boleta (opcional)</label>
                                    <input
                                        type="file"
                                        name="boleta"
                                        className="form-control"
                                        accept="application/pdf,image/*"
                                        onChange={handleChange}
                                    />
                                    <div className="form-text">PDF o imagen de respaldo del gasto.</div>
                                </div>

                                <button type="submit" className="btn btn-primary w-100" disabled={saving}>
                                    {saving ? 'Guardando...' : 'Registrar gasto'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {presupuesto && (
                        <div className="card shadow-sm mt-4">
                            <div className="card-body">
                                <h6 className="text-muted">Resumen de presupuesto</h6>
                                <div className="d-flex justify-content-between">
                                    <span>Presupuesto anual</span>
                                    <strong>{formatCurrency(presupuesto.presupuestoAnual)}</strong>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <span>Gastado</span>
                                    <strong>{formatCurrency(presupuesto.gastado)}</strong>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <span>Disponible</span>
                                    <strong>{formatCurrency(presupuesto.disponible)}</strong>
                                </div>
                                <div className="progress mt-2" role="progressbar">
                                    <div
                                        className="progress-bar bg-success"
                                        style={{
                                            width: `${Math.min(
                                                (presupuesto.gastado / presupuesto.presupuestoAnual) * 100,
                                                100
                                            ).toFixed(0)}%`
                                        }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="col-lg-7">
                    <div className="card shadow-sm h-100">
                        <div className="card-header bg-white d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Historial de gastos</h5>
                            <span className="text-muted small">Total: {formatCurrency(totalGastado)}</span>
                        </div>
                        <div className="card-body p-0">
                            {loading ? (
                                <div className="p-4 text-center text-muted">Cargando gastos...</div>
                            ) : gastos.length === 0 ? (
                                <div className="p-4 text-center text-muted">Aún no hay gastos registrados.</div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Fecha</th>
                                                <th>Patente</th>
                                                <th>Concepto</th>
                                                <th>Boleta</th>
                                                <th className="text-end">Costo</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {gastos.map((gasto) => (
                                                <tr key={gasto.id}>
                                                    <td>{gasto.fecha ? new Date(gasto.fecha).toLocaleDateString() : '—'}</td>
                                                    <td>{gasto.patente}</td>
                                                    <td>{gasto.concepto}</td>
                                                    <td>
                                                        {gasto.boletaPath ? (
                                                            <a href={gasto.boletaPath} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-secondary">
                                                                Ver boleta
                                                            </a>
                                                        ) : (
                                                            <span className="text-muted">—</span>
                                                        )}
                                                    </td>
                                                    <td className="text-end">{formatCurrency(gasto.costo)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Gastos;
