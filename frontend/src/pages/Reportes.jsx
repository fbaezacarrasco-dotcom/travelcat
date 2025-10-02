import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';

const formatCurrency = (value) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(value || 0);

function Reportes() {
    const { token } = useAuth();
    const [costos, setCostos] = useState([]);
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!token) return;

        const headers = { Authorization: 'Bearer ' + token };
        setLoading(true);
        setError(null);

        Promise.all([
            fetch(`${API_BASE}/reports/costos-por-camion`, { headers }),
            fetch(`${API_BASE}/reports/dashboard`, { headers })
        ])
            .then(async ([costosRes, dashboardRes]) => {
                if (!costosRes.ok || !dashboardRes.ok) {
                    throw new Error('No se pudieron obtener los reportes.');
                }

                const [costosData, dashboardData] = await Promise.all([
                    costosRes.json(),
                    dashboardRes.json()
                ]);

                setCostos(costosData);
                setDashboard(dashboardData);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, [token]);

    return (
        <div className="container mt-4">
            <h1 className="mb-4">Reportes de gestión</h1>

            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="text-center text-muted">Cargando reportes...</div>
            ) : (
                <div className="row g-4">
                    <div className="col-lg-6">
                        <div className="card shadow-sm">
                            <div className="card-header bg-white">
                                <h5 className="mb-0">Costo acumulado por camión</h5>
                                <small className="text-muted">Incluye repuestos utilizados y gastos registrados</small>
                            </div>
                            <div className="card-body p-0">
                                {costos.length === 0 ? (
                                    <div className="p-4 text-center text-muted">Aún no hay información disponible.</div>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table table-hover mb-0">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Patente</th>
                                                    <th className="text-end">Costo acumulado</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {costos.map((item) => (
                                                    <tr key={item.patente}>
                                                        <td>{item.patente}</td>
                                                        <td className="text-end">{formatCurrency(item.total)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-6">
                        <div className="card shadow-sm mb-4">
                            <div className="card-header bg-white">
                                <h5 className="mb-0">Documentación detallada</h5>
                                <small className="text-muted">Ordenada por proximidad de vencimiento</small>
                            </div>
                            <div className="card-body p-0">
                                {dashboard?.documentacion?.length ? (
                                    <div className="table-responsive">
                                        <table className="table table-sm table-hover mb-0">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Patente</th>
                                                    <th>Documento</th>
                                                    <th>Responsable</th>
                                                    <th>Vence</th>
                                                    <th>Días</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {dashboard.documentacion.map((doc) => (
                                                    <tr key={doc.id}>
                                                        <td>{doc.patente}</td>
                                                        <td>{doc.tipo}</td>
                                                        <td>{doc.responsable || '—'}</td>
                                                        <td>{doc.vence ? new Date(doc.vence).toLocaleDateString() : '—'}</td>
                                                        <td>{doc.diasParaVencer ?? '—'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="p-4 text-center text-muted">Sin documentación registrada.</div>
                                )}
                            </div>
                        </div>

                        <div className="card shadow-sm">
                            <div className="card-header bg-white">
                                <h5 className="mb-0">Gastos por periodo</h5>
                                <small className="text-muted">Detalle de los últimos movimientos</small>
                            </div>
                            <div className="card-body p-0">
                                {dashboard?.gastos?.mensual?.length ? (
                                    <ul className="list-group list-group-flush">
                                        {dashboard.gastos.mensual.map((mes) => (
                                            <li key={mes.periodo} className="list-group-item">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <strong>{mes.periodo}</strong>
                                                        <div className="text-muted small">Movimientos: {mes.items.length}</div>
                                                    </div>
                                                    <span>{formatCurrency(mes.total)}</span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="p-4 text-center text-muted">Sin gastos registrados.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Reportes;
