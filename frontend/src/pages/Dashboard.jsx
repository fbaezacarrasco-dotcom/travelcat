import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Legend
} from 'recharts';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';
const API_OTS = API_BASE + '/ots';
const API_REPORT = API_BASE + '/reports/dashboard';

const formatCurrency = (value) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(value || 0);

const buildChartData = (entries = {}) =>
    Object.entries(entries).map(([name, value]) => ({ name, value }));

const documentBadgeClass = (estado) => {
    if (estado === 'Vencido') return 'badge text-bg-danger';
    if (estado === 'Por vencer') return 'badge text-bg-warning';
    if (estado === 'Sin fecha') return 'badge text-bg-secondary';
    return 'badge text-bg-success';
};

const maintenanceBadgeClass = (estado) => {
    if (estado === 'Vencido') return 'badge text-bg-danger';
    if (estado === 'Por vencer') return 'badge text-bg-warning';
    return 'badge text-bg-secondary';
};

const priorityBadge = (prioridad) => {
    if (prioridad === 'Alta') return 'badge text-bg-danger';
    if (prioridad === 'Media') return 'badge text-bg-warning';
    return 'badge text-bg-success';
};

function Dashboard() {
    const { token } = useAuth();
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [ordersError, setOrdersError] = useState(null);
    const [report, setReport] = useState(null);
    const [reportLoading, setReportLoading] = useState(true);
    const [reportError, setReportError] = useState(null);

    useEffect(() => {
        if (!token) return;

        setReportLoading(true);
        setReportError(null);

        fetch(API_REPORT, {
            headers: {
                Authorization: 'Bearer ' + token
            }
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error('No se pudieron obtener los indicadores del dashboard.');
                }
                return res.json();
            })
            .then((data) => {
                setReport(data);
                setReportLoading(false);
            })
            .catch((err) => {
                setReportError(err.message);
                setReportLoading(false);
            });
    }, [token]);

    useEffect(() => {
        if (!token) return;

        setOrdersLoading(true);
        setOrdersError(null);

        fetch(API_OTS, {
            headers: {
                Authorization: 'Bearer ' + token
            }
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error('No se pudieron obtener las órdenes de trabajo.');
                }
                return res.json();
            })
            .then((data) => {
                setOrders(data);
                setOrdersLoading(false);
            })
            .catch((err) => {
                setOrdersError(err.message);
                setOrdersLoading(false);
            });
    }, [token]);

    const maxVenta = useMemo(() => {
        if (!report?.ventas?.length) return 1;
        return Math.max(...report.ventas.map((item) => item.monto)) || 1;
    }, [report]);

    const estadoData = useMemo(() => buildChartData(report?.ot?.porEstado), [report]);
    const prioridadData = useMemo(() => buildChartData(report?.ot?.porPrioridad), [report]);
    const mantenciones = report?.mantenciones ?? [];

    const presupuesto = report?.gastos?.presupuesto;
    const presupuestoTotal = presupuesto?.presupuestoAnual || 1;
    const presupuestoGastado = report?.gastos?.total || 0;
    const presupuestoRestante = presupuesto?.disponible || 0;
    const presupuestoPorcentaje = Math.min((presupuestoGastado / presupuestoTotal) * 100, 100);

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="mb-0">Dashboard de mantenimiento</h1>
                    <p className="text-muted mb-0">Indicadores ejecutivos para la operación diaria</p>
                </div>
                <Link to="/nueva" className="btn btn-primary">➕ Crear Nueva OT</Link>
            </div>

            {reportError && (
                <div className="alert alert-warning" role="alert">
                    {reportError}
                </div>
            )}

            <div className="help-callout mb-4">
                <strong>¿Qué puedo hacer aquí?</strong>
                <ul className="mb-0">
                    <li>Revisa la curva mensual de ventas y los estados de tus órdenes.</li>
                    <li>Identifica documentación y programas preventivos próximos a vencer.</li>
                    <li>Controla los gastos con el presupuesto disponible.</li>
                </ul>
            </div>

            <div className="row g-4 mb-4">
                <div className="col-lg-7">
                    <div className="card shadow-sm h-100">
                        <div className="card-header bg-white d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Ventas del año</h5>
                            {!reportLoading && (
                                <span className="text-muted small">Máximo: {formatCurrency(maxVenta)}</span>
                            )}
                        </div>
                        <div className="card-body" style={{ height: 260 }}>
                            {reportLoading ? (
                                <div className="text-center text-muted">Cargando ventas...</div>
                            ) : (
                                <ResponsiveContainer>
                                    <AreaChart data={report?.ventas || []}>
                                        <defs>
                                            <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#0d6efd" stopOpacity={0.7} />
                                                <stop offset="95%" stopColor="#0d6efd" stopOpacity={0.1} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#dee2e6" />
                                        <XAxis dataKey="mes" stroke="#6c757d" />
                                        <YAxis stroke="#6c757d" tickFormatter={(value) => (value / 1000000).toFixed(1) + 'M'} />
                                        <Tooltip formatter={(value) => formatCurrency(value)} />
                                        <Area type="monotone" dataKey="monto" stroke="#0d6efd" fill="url(#colorVentas)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>
                </div>

                <div className="col-lg-5">
                    <div className="card shadow-sm mb-3">
                        <div className="card-body">
                            <h6 className="text-muted">Órdenes por estado</h6>
                            {reportLoading ? (
                                <div className="text-muted">Cargando...</div>
                            ) : estadoData.length === 0 ? (
                                <div className="text-muted">Sin registros.</div>
                            ) : (
                                <div style={{ height: 200 }}>
                                    <ResponsiveContainer>
                                        <BarChart data={estadoData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis allowDecimals={false} />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="value" name="Cantidad" fill="#20c997" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="card shadow-sm">
                        <div className="card-body">
                            <h6 className="text-muted">Órdenes por prioridad</h6>
                            {reportLoading ? (
                                <div className="text-muted">Cargando...</div>
                            ) : prioridadData.length === 0 ? (
                                <div className="text-muted">Sin registros.</div>
                            ) : (
                                <div style={{ height: 160 }}>
                                    <ResponsiveContainer>
                                        <BarChart data={prioridadData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis allowDecimals={false} />
                                            <Tooltip />
                                            <Bar dataKey="value" name="Cantidad" fill="#ffc107" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-4 mb-4">
                <div className="col-lg-6">
                    <div className="card shadow-sm h-100">
                        <div className="card-header bg-white d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Documentación por vencer</h5>
                            <Link to="/reportes" className="btn btn-outline-secondary btn-sm">Ver reportes</Link>
                        </div>
                        <div className="card-body p-0">
                            {reportLoading ? (
                                <div className="p-4 text-center text-muted">Cargando documentación...</div>
                            ) : report?.documentacion?.length ? (
                                <div className="table-responsive">
                                    <table className="table table-sm table-hover mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Patente</th>
                                                <th>Documento</th>
                                                <th>Vence</th>
                                                <th>Estado</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {report.documentacion.slice(0, 6).map((doc) => (
                                                <tr key={doc.id}>
                                                    <td>{doc.patente}</td>
                                                    <td>{doc.tipo}</td>
                                                    <td>{doc.vence ? new Date(doc.vence).toLocaleDateString() : '—'}</td>
                                                    <td>
                                                        <span className={documentBadgeClass(doc.estado)}>
                                                            {doc.estado}
                                                            {doc.diasParaVencer !== null && doc.estado !== 'Sin fecha' ? ' (' + doc.diasParaVencer + ' días)' : ''}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="p-4 text-center text-muted">No hay documentación registrada.</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="col-lg-6">
                    <div className="card shadow-sm h-100">
                        <div className="card-header bg-white d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Programas preventivos</h5>
                            <Link to="/mantencion" className="btn btn-outline-secondary btn-sm">Gestionar</Link>
                        </div>
                        <div className="card-body p-0">
                            {reportLoading ? (
                                <div className="p-4 text-center text-muted">Cargando programas...</div>
                            ) : mantenciones.length ? (
                                <div className="table-responsive">
                                    <table className="table table-sm table-hover mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Patente</th>
                                                <th>Tarea</th>
                                                <th>Próximo control</th>
                                                <th>Estado</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {mantenciones.slice(0, 6).map((programa) => (
                                                <tr key={programa.id}>
                                                    <td>{programa.patente}</td>
                                                    <td>{programa.tarea}</td>
                                                    <td>{programa.proximoControl}</td>
                                                    <td>
                                                        <span className={maintenanceBadgeClass(programa.estado)}>{programa.estado}</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="p-4 text-center text-muted">No hay programas preventivos.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-4 mb-4">
                <div className="col-lg-6">
                    <div className="card shadow-sm h-100">
                        <div className="card-body">
                            <h6 className="text-muted">Presupuesto de repuestos</h6>
                            {reportLoading ? (
                                <div className="text-muted">Cargando...</div>
                            ) : (
                                <>
                                    <div className="d-flex justify-content-between">
                                        <span>Gastado</span>
                                        <strong>{formatCurrency(presupuestoGastado)}</strong>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <span>Disponible</span>
                                        <strong>{formatCurrency(presupuestoRestante)}</strong>
                                    </div>
                                    <div className="progress mt-2" role="progressbar" aria-label="Avance presupuesto">
                                        <div
                                            className="progress-bar bg-success"
                                            style={{ width: presupuestoPorcentaje + '%' }}
                                        ></div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="col-lg-6">
                    <div className="card shadow-sm h-100">
                        <div className="card-header bg-white d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Gastos recientes</h5>
                            <Link to="/gastos" className="btn btn-outline-secondary btn-sm">Ver gastos</Link>
                        </div>
                        <div className="card-body p-0">
                            {reportLoading ? (
                                <div className="p-4 text-center text-muted">Cargando gastos...</div>
                            ) : report?.gastos?.mensual?.length ? (
                                <ul className="list-group list-group-flush">
                                    {report.gastos.mensual.slice(-4).map((mes) => (
                                        <li key={mes.periodo} className="list-group-item d-flex justify-content-between align-items-center">
                                            <span>{mes.periodo}</span>
                                            <strong>{formatCurrency(mes.total)}</strong>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="p-4 text-center text-muted">No hay gastos registrados.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="card shadow-sm">
                <div className="card-header bg-white d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Órdenes de trabajo ({orders.length})</h5>
                    <Link to="/nueva" className="btn btn-outline-primary btn-sm">Gestionar órdenes</Link>
                </div>
                <div className="card-body p-0">
                    {ordersError && (
                        <div className="alert alert-warning m-3" role="alert">
                            {ordersError}
                        </div>
                    )}
                    {ordersLoading ? (
                        <div className="p-4 text-center text-muted">Cargando órdenes de trabajo...</div>
                    ) : orders.length === 0 ? (
                        <div className="p-4 text-center text-muted">Aún no existen órdenes registradas.</div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Título</th>
                                        <th>Patente</th>
                                        <th>Prioridad</th>
                                        <th>Estado</th>
                                        <th>Fecha</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.slice(0, 6).map((order) => (
                                        <tr key={order.id}>
                                            <td>
                                                <div className="fw-semibold">{order.titulo}</div>
                                                <div className="text-muted small">{order.mecanico}</div>
                                            </td>
                                            <td>{order.patente}</td>
                                            <td>
                                                <span className={priorityBadge(order.prioridad)}>{order.prioridad}</span>
                                            </td>
                                            <td>{order.estado}</td>
                                            <td>{order.fechaSolicitud ? new Date(order.fechaSolicitud).toLocaleDateString() : '—'}</td>
                                            <td>{formatCurrency(order.totalCosto)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
