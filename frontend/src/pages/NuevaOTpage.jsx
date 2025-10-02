import { useCallback, useEffect, useMemo, useState } from 'react';
import NuevaOTForm from '../components/NuevaOTForm';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';
const API_OTS = API_BASE + '/ots';
const API_PROVIDERS = API_BASE + '/providers';
const API_TRUCKS = API_BASE + '/trucks';
const API_REFERENCE = API_BASE + '/reference';

const emptyOrder = {
    titulo: '',
    patente: '',
    mecanico: '',
    proveedorId: '',
    prioridad: 'Media',
    estado: 'Pendiente',
    descripcion: '',
    fechaSolicitud: new Date().toISOString().slice(0, 10),
    conductor: '',
    repuestos: []
};

const formatCurrency = (value) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(value || 0);

function NuevaOTPage() {
    const { token } = useAuth();
    const [orders, setOrders] = useState([]);
    const [providers, setProviders] = useState([]);
    const [trucks, setTrucks] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [formData, setFormData] = useState(emptyOrder);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [actionMessage, setActionMessage] = useState(null);
    const ayuda = useMemo(
        () => [
            'Completa los datos principales (título, patente, mecánico y proveedor).',
            'Agrega los repuestos con su cantidad y costo para calcular automáticamente el total.',
            'Puedes editar, eliminar o descargar cada orden registrada en formato JSON.'
        ],
        []
    );

    const authHeaders = useMemo(() => ({
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json'
    }), [token]);

    const fetchOrders = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(API_OTS, { headers: { Authorization: 'Bearer ' + token } });

            if (!response.ok) {
                throw new Error('No se pudo obtener el listado de órdenes de trabajo.');
            }

            const data = await response.json();
            setOrders(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [token]);

    const fetchCatalogs = useCallback(async () => {
        if (!token) return;

        try {
            const [provRes, truckRes, refRes] = await Promise.all([
                fetch(API_PROVIDERS, { headers: { Authorization: 'Bearer ' + token } }),
                fetch(API_TRUCKS, { headers: { Authorization: 'Bearer ' + token } }),
                fetch(API_REFERENCE + '/catalogos', { headers: { Authorization: 'Bearer ' + token } })
            ]);

            if (!provRes.ok || !truckRes.ok || !refRes.ok) {
                throw new Error('No se pudieron cargar los catálogos requeridos.');
            }

            const [provData, truckData, refData] = await Promise.all([
                provRes.json(),
                truckRes.json(),
                refRes.json()
            ]);

            setProviders(provData);
            setTrucks(truckData);
            setDrivers(refData.conductores || []);
        } catch (catalogError) {
            console.error(catalogError);
        }
    }, [token]);

    useEffect(() => {
        fetchOrders();
        fetchCatalogs();
    }, [fetchOrders, fetchCatalogs]);

    const handleFieldChange = (name, value) => {
        if (name === 'patente') {
            setFormData((prev) => ({ ...prev, patente: value.toUpperCase() }));
            return;
        }

        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddRepuesto = () => {
        setFormData((prev) => ({
            ...prev,
            repuestos: [...prev.repuestos, { nombre: '', cantidad: 1, costo: 0 }]
        }));
    };

    const handleRepuestoChange = (index, field, value) => {
        if (field === 'cantidad' || field === 'costo') {
            value = value.replace(/[^0-9]/g, '');
        }

        setFormData((prev) => ({
            ...prev,
            repuestos: prev.repuestos.map((item, idx) =>
                idx === index ? { ...item, [field]: value } : item
            )
        }));
    };

    const handleRemoveRepuesto = (index) => {
        setFormData((prev) => ({
            ...prev,
            repuestos: prev.repuestos.filter((_, idx) => idx !== index)
        }));
    };

    const resetForm = () => {
        setFormData({
            ...emptyOrder,
            fechaSolicitud: new Date().toISOString().slice(0, 10)
        });
        setEditingId(null);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError(null);
        setActionMessage(null);

        const method = editingId ? 'PUT' : 'POST';
        const endpoint = editingId ? `${API_OTS}/${editingId}` : API_OTS;

        const payload = {
            ...formData,
            proveedorId: formData.proveedorId ? Number(formData.proveedorId) : null
        };

        try {
            const response = await fetch(endpoint, {
                method,
                headers: authHeaders,
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const body = await response.json().catch(() => ({}));
                throw new Error(body.error || 'No se pudo guardar la orden de trabajo.');
            }

            await fetchOrders();
            setActionMessage(editingId ? 'Orden actualizada correctamente.' : 'Orden creada correctamente.');
            resetForm();
        } catch (submitError) {
            setError(submitError.message);
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (order) => {
        setEditingId(order.id);
        setFormData({
            titulo: order.titulo,
            patente: order.patente,
            mecanico: order.mecanico,
            proveedorId: String(order.proveedorId || ''),
            prioridad: order.prioridad,
            estado: order.estado,
            descripcion: order.descripcion,
            fechaSolicitud: order.fechaSolicitud || new Date().toISOString().slice(0, 10),
            conductor: order.conductor || '',
            repuestos: Array.isArray(order.repuestos)
                ? order.repuestos.map((item) => ({
                      nombre: item.nombre,
                      cantidad: item.cantidad,
                      costo: item.costo
                  }))
                : []
        });
    };

    const handleDelete = async (order) => {
        if (!window.confirm(`¿Eliminar la orden "${order.titulo}"?`)) return;

        try {
            const response = await fetch(`${API_OTS}/${order.id}`, {
                method: 'DELETE',
                headers: { Authorization: 'Bearer ' + token }
            });

            if (!response.ok) {
                throw new Error('No se pudo eliminar la orden.');
            }

            await fetchOrders();
            if (editingId === order.id) {
                resetForm();
            }
            setActionMessage('Orden eliminada.');
        } catch (deleteError) {
            setError(deleteError.message);
        }
    };

    const handleDownload = async (order) => {
        try {
            const response = await fetch(`${API_OTS}/${order.id}/export`, {
                headers: { Authorization: 'Bearer ' + token }
            });

            if (!response.ok) {
                throw new Error('No se pudo generar el archivo.');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `ot-${order.patente}-${order.id}.json`;
            link.click();
            window.URL.revokeObjectURL(url);
        } catch (downloadError) {
            setError(downloadError.message);
        }
    };

    const handlePrint = (order) => {
        const printWindow = window.open('', '_blank', 'width=900,height=700');
        if (!printWindow) return;

        const repuestos = Array.isArray(order.repuestos)
            ? order.repuestos
            : [];

        const rows = repuestos
            .map(
                (item) =>
                    `<tr><td>${item.nombre}</td><td>${item.cantidad}</td><td>${formatCurrency(item.costo)}</td><td>${formatCurrency(
                        (Number(item.cantidad) || 0) * (Number(item.costo) || 0)
                    )}</td></tr>`
            )
            .join('');

        const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Orden de trabajo #${order.id}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 2rem; }
    h1 { margin-bottom: 0; }
    table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
    th, td { border: 1px solid #ccc; padding: 0.5rem; text-align: left; }
    th { background: #f5f5f5; }
    .meta { margin-top: 1rem; }
  </style>
</head>
<body>
  <h1>Orden de trabajo #${order.id}</h1>
  <p class="meta">Patente: <strong>${order.patente}</strong></p>
  <p class="meta">Mecánico: <strong>${order.mecanico || '—'}</strong></p>
  <p class="meta">Proveedor: <strong>${providerMap.get(order.proveedorId)?.empresa || '—'}</strong></p>
  <p class="meta">Conductor: <strong>${order.conductor || '—'}</strong></p>
  <p class="meta">Fecha solicitud: <strong>${order.fechaSolicitud ? new Date(order.fechaSolicitud).toLocaleDateString() : '—'}</strong></p>
  <p class="meta">Prioridad: <strong>${order.prioridad}</strong> | Estado: <strong>${order.estado}</strong></p>
  <h2>Descripción</h2>
  <p>${order.descripcion || 'Sin descripción'}</p>
  <h2>Repuestos</h2>
  <table>
    <thead>
      <tr>
        <th>Descripción</th>
        <th>Cantidad</th>
        <th>Costo unitario</th>
        <th>Subtotal</th>
      </tr>
    </thead>
    <tbody>
      ${rows || '<tr><td colspan="4">Sin repuestos registrados</td></tr>'}
    </tbody>
  </table>
  <h3>Total: ${formatCurrency(order.totalCosto)}</h3>
</body>
</html>`;

        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    };

    const providerMap = useMemo(() => {
        const map = new Map();
        providers.forEach((provider) => {
            map.set(provider.id, provider);
        });
        return map;
    }, [providers]);

    return (
        <div className="container">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="mb-0">Órdenes de trabajo</h1>
                    <p className="text-muted mb-0">Registra, edita y descarga OT con sus repuestos asociados</p>
                </div>
            </div>

            <div className="help-callout mb-4">
                <strong>Guía rápida</strong>
                <ul className="mb-0">
                    {ayuda.map((tip) => (
                        <li key={tip}>{tip}</li>
                    ))}
                </ul>
            </div>

            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            {actionMessage && (
                <div className="alert alert-success" role="alert">
                    {actionMessage}
                </div>
            )}

            <div className="row g-4">
                <div className="col-lg-5">
                    <NuevaOTForm
                        formData={formData}
                        providers={providers}
                        trucks={trucks}
                        drivers={drivers}
                        onFieldChange={handleFieldChange}
                        onRepuestoChange={handleRepuestoChange}
                        onAddRepuesto={handleAddRepuesto}
                        onRemoveRepuesto={handleRemoveRepuesto}
                        onSubmit={handleSubmit}
                        onCancel={resetForm}
                        saving={saving}
                        editing={Boolean(editingId)}
                    />
                </div>

                <div className="col-lg-7">
                    <div className="card shadow-sm h-100">
                        <div className="card-header bg-white d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Listado de órdenes ({orders.length})</h5>
                            <button className="btn btn-outline-secondary btn-sm" onClick={fetchOrders} disabled={loading}>
                                {loading ? 'Actualizando...' : 'Refrescar'}
                            </button>
                        </div>
                        <div className="card-body p-0">
                            {loading ? (
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
                                                <th>Proveedor</th>
                                                <th>Estado</th>
                                                <th>Total</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders.map((order) => (
                                                <tr key={order.id}>
                                                    <td>
                                                        <div className="fw-semibold">{order.titulo}</div>
                                                        <div className="text-muted small">{order.mecanico}</div>
                                                    </td>
                                                    <td>
                                                        <span className="badge text-bg-dark">{order.patente}</span>
                                                        {order.conductor && (
                                                            <div className="text-muted small">Conductor: {order.conductor}</div>
                                                        )}
                                                    </td>
                                                    <td>{providerMap.get(order.proveedorId)?.empresa || 'N/A'}</td>
                                                    <td>
                                                        <span className="badge text-bg-secondary">{order.estado}</span>
                                                    </td>
                                                    <td>{formatCurrency(order.totalCosto)}</td>
                                                    <td className="text-end">
                                                        <div className="btn-group btn-group-sm" role="group">
                                                            <button className="btn btn-outline-primary" onClick={() => handleEdit(order)}>
                                                                Editar
                                                            </button>
                                                            <button
                                                                className="btn btn-outline-success"
                                                                onClick={() => handlePrint(order)}
                                                            >
                                                                Imprimir
                                                            </button>
                                                            <button
                                                                className="btn btn-outline-secondary"
                                                                onClick={() => handleDownload(order)}
                                                            >
                                                                Archivo
                                                            </button>
                                                            <button
                                                                className="btn btn-outline-danger"
                                                                onClick={() => handleDelete(order)}
                                                            >
                                                                Eliminar
                                                            </button>
                                                        </div>
                                                    </td>
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

export default NuevaOTPage;
