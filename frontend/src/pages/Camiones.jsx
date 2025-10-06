import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || `${window.location.origin}/api`;
const API_TRUCKS = API_BASE + '/trucks';

const formatKm = (value) => {
    if (value === null || value === undefined || value === '') {
        return '—';
    }

    const numeric = Number(value);

    if (!Number.isFinite(numeric)) {
        return value;
    }

    return numeric.toLocaleString('es-CL');
};

const documentBadgeClass = (estado) => {
    if (estado === 'Vencido') return 'badge text-bg-danger';
    if (estado === 'Por vencer') return 'badge text-bg-warning';
    if (estado === 'Sin fecha') return 'badge text-bg-secondary';
    return 'badge text-bg-success';
};

const summarizeDocuments = (docs = []) => {
    const total = docs.length;
    if (total === 0) {
        return { text: 'Sin registros', className: 'badge text-bg-secondary' };
    }

    const vencidos = docs.filter((doc) => doc.estado === 'Vencido').length;
    const porVencer = docs.filter((doc) => doc.estado === 'Por vencer').length;

    if (vencidos > 0) {
        return { text: total + ' doc. (' + vencidos + ' vencidos)', className: 'badge text-bg-danger' };
    }

    if (porVencer > 0) {
        return { text: total + ' doc. (' + porVencer + ' por vencer)', className: 'badge text-bg-warning' };
    }

    return { text: total + ' documentos', className: 'badge text-bg-success' };
};

const emptyForm = {
    patente: '',
    marca: '',
    modelo: '',
    anio: '',
    km: '',
    fechaEntrada: '',
    fechaSalida: '',
    estado: 'Operativo',
    notas: '',
    conductor: ''
};

function Camiones() {
    const { token } = useAuth();
    const [camiones, setCamiones] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({ ...emptyForm });
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [newDocuments, setNewDocuments] = useState([]);
    const [existingDocuments, setExistingDocuments] = useState([]);
    const [documentsToRemove, setDocumentsToRemove] = useState([]);
    const ayuda = useMemo(
        () => [
            'Registra nuevos camiones con patente, estado y conductor asignado.',
            'Utiliza el botón Refrescar para sincronizar la flota cuando otro usuario haga cambios.',
            'Desde aquí puedes editar o eliminar camiones; se reflejarán en los demás módulos.'
        ],
        []
    );

    const headers = useMemo(() => ({
        Authorization: 'Bearer ' + token
    }), [token]);

    const fetchCamiones = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(API_TRUCKS, {
                headers: {
                    Authorization: 'Bearer ' + token
                }
            });

            if (!response.ok) {
                throw new Error('No se pudo obtener la flota.');
            }

            const data = await response.json();
            setCamiones(data);
        } catch (fetchError) {
            setError(fetchError.message);
        } finally {
            setLoading(false);
        }
    }, [token]);

    const fetchDrivers = useCallback(async () => {
        if (!token) return;

        try {
            const response = await fetch(API_BASE + '/reference/conductores', {
                headers: {
                    Authorization: 'Bearer ' + token
                }
            });

            if (!response.ok) {
                throw new Error('No se pudieron obtener los conductores.');
            }

            const data = await response.json();
            setDrivers(data);
        } catch (driverError) {
            console.warn(driverError.message);
        }
    }, [token]);

    useEffect(() => {
        fetchCamiones();
        fetchDrivers();
    }, [fetchCamiones, fetchDrivers]);

    const handleChange = (event) => {
        const { name } = event.target;
        let { value } = event.target;

        if (name === 'patente') {
            value = value.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 10);
        }

        if (name === 'anio' || name === 'km') {
            value = value.replace(/[^0-9]/g, '');
        }

        if (name === 'marca' || name === 'modelo') {
            value = value.replace(/[^\p{L}0-9\s.-]/gu, '').slice(0, 80);
        }

        if (name === 'conductor') {
            value = value.replace(/[^\p{L}\s]/gu, '').replace(/\s{2,}/g, ' ').slice(0, 80);
        }

        if (name === 'notas') {
            value = value.replace(/[^\p{L}0-9\s.,-]/gu, '').slice(0, 300);
        }

        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleEdit = (truck) => {
        setFormData({
            patente: truck.patente || '',
            marca: truck.marca || '',
            modelo: truck.modelo || '',
            anio: truck.anio ?? '',
            km: truck.km ?? '',
            fechaEntrada: truck.fechaEntrada || '',
            fechaSalida: truck.fechaSalida || '',
            estado: truck.estado || 'Operativo',
            notas: truck.notas || '',
            conductor: truck.conductor || ''
        });
        setExistingDocuments((truck.documentos || []).map((doc) => ({ ...doc }))); 
        setNewDocuments([]);
        setDocumentsToRemove([]);
        setEditingId(truck.id);
    };

    const resetForm = () => {
        setFormData({ ...emptyForm });
        setEditingId(null);
        setNewDocuments([]);
        setExistingDocuments([]);
        setDocumentsToRemove([]);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!token) return;

        setSaving(true);
        setError(null);

        const method = editingId ? 'PUT' : 'POST';
        const endpoint = editingId ? API_TRUCKS + '/' + editingId : API_TRUCKS;

        const formPayload = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                formPayload.append(key, value);
            }
        });

        const hasIncompleteDocument = newDocuments.some((doc) => doc.file === null);
        if (hasIncompleteDocument) {
            setError('Adjunta un archivo para cada documento nuevo.');
            setSaving(false);
            return;
        }

        const docsWithFile = newDocuments.filter((doc) => doc.file);
        if (docsWithFile.length) {
            const meta = docsWithFile.map((doc) => ({
                tipo: doc.tipo,
                vence: doc.vence,
                responsable: doc.responsable
            }));
            formPayload.append('documentosMeta', JSON.stringify(meta));
            docsWithFile.forEach((doc) => {
                formPayload.append('documentos', doc.file);
            });
        }

        if (documentsToRemove.length) {
            formPayload.append('documentosEliminar', JSON.stringify(documentsToRemove));
        }

        try {
            const response = await fetch(endpoint, {
                method,
                headers,
                body: formPayload
            });

            if (!response.ok) {
                const payload = await response.json().catch(() => ({}));
                const message = payload.error || 'No se pudo guardar el camión.';
                throw new Error(message);
            }

            await fetchCamiones();
            resetForm();
        } catch (submitError) {
            setError(submitError.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!token) return;
        setDeletingId(id);
        setError(null);

        try {
            const response = await fetch(API_TRUCKS + '/' + id, {
                method: 'DELETE',
                headers: {
                    Authorization: 'Bearer ' + token
                }
            });

            if (!response.ok) {
                const payload = await response.json().catch(() => ({}));
                const message = payload.error || 'No se pudo eliminar el camión.';
                throw new Error(message);
            }

            await fetchCamiones();
        } catch (deleteError) {
            setError(deleteError.message);
        } finally {
            setDeletingId(null);
        }
    };

    const handleAddDocument = () => {
        setNewDocuments((prev) => [
            ...prev,
            {
                tipo: 'Permiso de circulación',
                vence: '',
                responsable: '',
                file: null
            }
        ]);
    };

    const handleNewDocumentChange = (index, field, value) => {
        setNewDocuments((prev) =>
            prev.map((doc, idx) => (idx === index ? { ...doc, [field]: value } : doc))
        );
    };

    const handleNewDocumentFileChange = (index, file) => {
        setNewDocuments((prev) =>
            prev.map((doc, idx) => (idx === index ? { ...doc, file } : doc))
        );
    };

    const handleRemoveNewDocument = (index) => {
        setNewDocuments((prev) => prev.filter((_, idx) => idx !== index));
    };

    const toggleExistingDocument = (docId) => {
        setDocumentsToRemove((prev) =>
            prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
        );
    };

    const isDocumentMarkedForRemoval = (docId) => documentsToRemove.includes(docId);

    return (
        <div className="container">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="mb-0">Gestión de flota</h1>
                    <p className="text-muted mb-0">Administra la información operativa de tus camiones</p>
                </div>
                <button className="btn btn-outline-secondary" type="button" onClick={fetchCamiones} disabled={loading}>
                    {loading ? 'Actualizando...' : 'Refrescar'}
                </button>
            </div>

            <div className="help-callout mb-4">
                <strong>Consejos rápidos</strong>
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

            <div className="row g-4">
                <div className="col-lg-7">
                    <div className="card shadow-sm">
                        <div className="card-header bg-primary text-white">
                            Flota registrada ({camiones.length})
                        </div>
                        <div className="card-body p-0">
                            {loading ? (
                                <div className="p-4 text-center text-muted">Cargando camiones...</div>
                            ) : camiones.length === 0 ? (
                                <div className="p-4 text-center text-muted">Aún no hay camiones registrados.</div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Patente</th>
                                                <th>Marca</th>
                                                <th>Modelo</th>
                                                <th>Año</th>
                                                <th>Km</th>
                                                <th>Estado</th>
                                                <th>Documentos</th>
                                                <th>Conductor</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {camiones.map((truck) => (
                                                <tr key={truck.id}>
                                                    <td className="fw-semibold">{truck.patente}</td>
                                                    <td>{truck.marca}</td>
                                                    <td>{truck.modelo}</td>
                                                    <td>{truck.anio || '—'}</td>
                                                    <td>{formatKm(truck.km)}</td>
                                                    <td>
                                                        <span className="badge text-bg-secondary">{truck.estado || 'Sin estado'}</span>
                                                    </td>
                                                    <td>
                                                        {(() => {
                                                            const info = summarizeDocuments(truck.documentos || []);
                                                            return <span className={info.className}>{info.text}</span>;
                                                        })()}
                                                    </td>
                                                    <td>{truck.conductor || '—'}</td>
                                                    <td className="text-end">
                                                        <div className="btn-group btn-group-sm" role="group">
                                                            <button
                                                                className="btn btn-outline-primary"
                                                                onClick={() => handleEdit(truck)}
                                                            >
                                                                Editar
                                                            </button>
                                                            <button
                                                                className="btn btn-outline-danger"
                                                                onClick={() => handleDelete(truck.id)}
                                                                disabled={deletingId === truck.id}
                                                            >
                                                                {deletingId === truck.id ? 'Eliminando...' : 'Eliminar'}
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

                <div className="col-lg-5">
                    <div className="card shadow-sm">
                        <div className="card-header bg-white">
                            <h5 className="mb-0">{editingId ? 'Editar camión' : 'Agregar camión'}</h5>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Patente</label>
                                        <input
                                            name="patente"
                                            value={formData.patente}
                                            onChange={handleChange}
                                            className="form-control"
                                            placeholder="Ej. AA-BB11"
                                            required
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Estado</label>
                                        <select
                                            name="estado"
                                            value={formData.estado}
                                            onChange={handleChange}
                                            className="form-select"
                                        >
                                            <option value="Operativo">Operativo</option>
                                            <option value="En mantención">En mantención</option>
                                            <option value="Fuera de servicio">Fuera de servicio</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-4 mb-3">
                                        <label className="form-label">Marca</label>
                                        <input
                                            name="marca"
                                            value={formData.marca}
                                            onChange={handleChange}
                                            className="form-control"
                                            required
                                        />
                                    </div>
                                    <div className="col-md-4 mb-3">
                                        <label className="form-label">Modelo</label>
                                        <input
                                            name="modelo"
                                            value={formData.modelo}
                                            onChange={handleChange}
                                            className="form-control"
                                            required
                                        />
                                    </div>
                                    <div className="col-md-4 mb-3">
                                        <label className="form-label">Año</label>
                                        <input
                                            type="number"
                                            name="anio"
                                            value={formData.anio}
                                            onChange={handleChange}
                                            className="form-control"
                                            min="1970"
                                            max={new Date().getFullYear() + 1}
                                        />
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Kilometraje</label>
                                        <input
                                            type="number"
                                            name="km"
                                            value={formData.km}
                                            onChange={handleChange}
                                            className="form-control"
                                            min="0"
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Fecha entrada</label>
                                        <input
                                            type="date"
                                            name="fechaEntrada"
                                            value={formData.fechaEntrada}
                                            onChange={handleChange}
                                            className="form-control"
                                        />
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Fecha salida</label>
                                        <input
                                            type="date"
                                            name="fechaSalida"
                                            value={formData.fechaSalida}
                                            onChange={handleChange}
                                            className="form-control"
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Notas</label>
                                        <input
                                            name="notas"
                                            value={formData.notas}
                                            onChange={handleChange}
                                            className="form-control"
                                            placeholder="Detalle libre"
                                        />
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Conductor asignado</label>
                                    <select
                                        name="conductor"
                                        value={formData.conductor}
                                        onChange={handleChange}
                                        className="form-select"
                                    >
                                        <option value="">Sin asignar</option>
                                        {drivers.map((driver) => (
                                            <option key={driver.id} value={driver.nombre}>
                                                {driver.nombre} ({driver.licencia})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mb-3">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <label className="form-label mb-0">Documentación</label>
                                        <button type="button" className="btn btn-sm btn-outline-primary" onClick={handleAddDocument}>
                                            Añadir documento
                                        </button>
                                    </div>

                                    {existingDocuments.length > 0 && (
                                        <div className="mb-3">
                                            <p className="text-muted small mb-2">Documentos registrados</p>
                                            <ul className="list-group">
                                                {existingDocuments.map((doc) => (
                                                    <li key={doc.id} className="list-group-item d-flex justify-content-between align-items-center">
                                                        <div>
                                                            <strong>{doc.tipo}</strong>
                                                            <div className="small text-muted">Vence: {doc.vence ? new Date(doc.vence).toLocaleDateString() : '—'}</div>
                                                            {doc.fileUrl && (
                                                                <a href={doc.fileUrl} className="btn btn-sm btn-outline-secondary mt-2" target="_blank" rel="noreferrer">
                                                                    Ver archivo
                                                                </a>
                                                            )}
                                                        </div>
                                                        <div className="d-flex align-items-center gap-2">
                                                            <span className={documentBadgeClass(doc.estado)}>{doc.estado}</span>
                                                            <div className="form-check form-switch">
                                                                <input
                                                                    className="form-check-input"
                                                                    type="checkbox"
                                                                    role="switch"
                                                                    checked={isDocumentMarkedForRemoval(doc.id)}
                                                                    onChange={() => toggleExistingDocument(doc.id)}
                                                                />
                                                                <label className="form-check-label small">Eliminar</label>
                                                            </div>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {newDocuments.length === 0 && (
                                        <p className="text-muted small mb-0">No has agregado nuevos documentos.</p>
                                    )}

                                    {newDocuments.map((doc, index) => (
                                        <div key={index} className="border rounded p-3 mb-3">
                                            <div className="row g-3">
                                                <div className="col-md-4">
                                                    <label className="form-label">Tipo</label>
                                                    <select
                                                        className="form-select"
                                                        value={doc.tipo}
                                                        onChange={(event) => handleNewDocumentChange(index, 'tipo', event.target.value)}
                                                    >
                                                        <option value="Permiso de circulación">Permiso de circulación</option>
                                                        <option value="Revisión técnica">Revisión técnica</option>
                                                        <option value="Seguro obligatorio">Seguro obligatorio</option>
                                                        <option value="Otro">Otro</option>
                                                    </select>
                                                </div>
                                                <div className="col-md-4">
                                                    <label className="form-label">Fecha vencimiento</label>
                                                    <input
                                                        type="date"
                                                        className="form-control"
                                                        value={doc.vence}
                                                        onChange={(event) => handleNewDocumentChange(index, 'vence', event.target.value)}
                                                    />
                                                </div>
                                                <div className="col-md-4">
                                                    <label className="form-label">Responsable</label>
                                                    <input
                                                        className="form-control"
                                                        value={doc.responsable}
                                                        onChange={(event) => handleNewDocumentChange(index, 'responsable', event.target.value)}
                                                        placeholder="Ej. Administración"
                                                    />
                                                </div>
                                            </div>
                                            <div className="mt-3 d-flex align-items-center gap-3">
                                                <div>
                                                    <input
                                                        type="file"
                                                        className="form-control"
                                                        accept="application/pdf,image/*"
                                                        onChange={(event) => handleNewDocumentFileChange(index, event.target.files?.[0] || null)}
                                                    />
                                                    <small className="text-muted">Adjunta el archivo correspondiente (PDF o imagen).</small>
                                                </div>
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-danger btn-sm"
                                                    onClick={() => handleRemoveNewDocument(index)}
                                                >
                                                    Quitar
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="d-flex gap-2">
                                    <button type="submit" className="btn btn-primary" disabled={saving}>
                                        {saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Registrar'}
                                    </button>
                                    {editingId && (
                                        <button type="button" className="btn btn-outline-secondary" onClick={resetForm}>
                                            Cancelar
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Camiones;
