import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || `${window.location.origin}/api`;
const API_PROVIDERS = API_BASE + '/providers';

const emptyProvider = {
    razonSocial: '',
    empresa: '',
    rut: '',
    contacto: '',
    telefono: '',
    email: '',
    rubro: ''
};

const sanitizeRut = (value = '') => value.replace(/[^0-9kK]/g, '').toUpperCase();

const formatRut = (value = '') => {
    const rut = sanitizeRut(value);
    if (rut.length < 2) return rut;

    const body = rut.slice(0, -1);
    const dv = rut.slice(-1);
    return body.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '-' + dv;
};

const isValidRut = (value = '') => {
    const rut = sanitizeRut(value);

    if (!/^[0-9]+[0-9K]$/.test(rut)) {
        return false;
    }

    const body = rut.slice(0, -1);
    const dv = rut.slice(-1);

    let sum = 0;
    let multiplier = 2;

    for (let i = body.length - 1; i >= 0; i -= 1) {
        sum += Number(body[i]) * multiplier;
        multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }

    const expected = 11 - (sum % 11);
    const dvCalculated = expected === 11 ? '0' : expected === 10 ? 'K' : String(expected);

    return dvCalculated === dv;
};

function Proveedores() {
    const { token } = useAuth();
    const [proveedores, setProveedores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({ ...emptyProvider });
    const [formError, setFormError] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const ayuda = useMemo(
        () => [
            'El RUT se valida automáticamente para evitar registros inválidos.',
            'Utiliza esta lista para alimentar la selección de proveedores en las órdenes de trabajo.',
            'Puedes actualizar o eliminar un proveedor sin afectar otros registros locales.'
        ],
        []
    );

        const headers = useMemo(() => ({
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json'
    }), [token]);

    const fetchProveedores = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(API_PROVIDERS, {
                headers: {
                    Authorization: 'Bearer ' + token
                }
            });

            if (!response.ok) {
                throw new Error('No se pudo obtener el listado de proveedores.');
            }

            const data = await response.json();
            setProveedores(data);
        } catch (fetchError) {
            setError(fetchError.message);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchProveedores();
    }, [fetchProveedores]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        if (formError) {
            setFormError(null);
        }

        if (name === 'rut') {
            const sanitized = sanitizeRut(value).slice(0, 9);
            setFormData((prev) => ({ ...prev, rut: formatRut(sanitized) }));
            return;
        }

        if (name === 'telefono') {
            const sanitized = value.replace(/[^0-9+\s]/g, '');
            setFormData((prev) => ({ ...prev, telefono: sanitized }));
            return;
        }
        if (name === 'contacto') {
            const sanitized = value.replace(/[^\p{L}\s]/gu, '').replace(/\s{2,}/g, ' ').slice(0, 80);
            setFormData((prev) => ({ ...prev, contacto: sanitized }));
            return;
        }

        if (name === 'razonSocial' || name === 'empresa' || name === 'rubro') {
            const sanitized = value.replace(/[^\p{L}0-9\s.,-]/gu, '').slice(0, 120);
            setFormData((prev) => ({ ...prev, [name]: sanitized }));
            return;
        }

        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleEdit = (provider) => {
        setFormData({
            razonSocial: provider.razonSocial || '',
            empresa: provider.empresa || '',
            rut: formatRut(provider.rut || ''),
            contacto: provider.contacto || '',
            telefono: provider.telefono || '',
            email: provider.email || '',
            rubro: provider.rubro || ''
        });
        setEditingId(provider.id);
        setFormError(null);
    };

    const resetForm = () => {
        setFormData({ ...emptyProvider });
        setEditingId(null);
        setFormError(null);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!token) return;

        setSaving(true);
        setError(null);
        setFormError(null);

        const method = editingId ? 'PUT' : 'POST';
        const endpoint = editingId ? API_PROVIDERS + '/' + editingId : API_PROVIDERS;

        const rutLimpio = sanitizeRut(formData.rut);

        if (!isValidRut(rutLimpio)) {
            setSaving(false);
            setFormError('El RUT ingresado no es válido.');
            return;
        }

        const payload = {
            ...formData,
            rut: rutLimpio
        };

        try {
            const response = await fetch(endpoint, {
                method,
                headers,
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const payload = await response.json().catch(() => ({}));
                const message = payload.error || 'No se pudo guardar el proveedor.';
                throw new Error(message);
            }

            await fetchProveedores();
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
            const response = await fetch(API_PROVIDERS + '/' + id, {
                method: 'DELETE',
                headers: {
                    Authorization: 'Bearer ' + token
                }
            });

            if (!response.ok) {
                const payload = await response.json().catch(() => ({}));
                const message = payload.error || 'No se pudo eliminar el proveedor.';
                throw new Error(message);
            }

            await fetchProveedores();
        } catch (deleteError) {
            setError(deleteError.message);
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="container">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="mb-0">Proveedores</h1>
                    <p className="text-muted mb-0">Registra y gestiona tus contactos estratégicos</p>
                </div>
                <button className="btn btn-outline-secondary" type="button" onClick={fetchProveedores} disabled={loading}>
                    {loading ? 'Actualizando...' : 'Refrescar'}
                </button>
            </div>

            <div className="help-callout mb-4">
                <strong>Cómo gestionar proveedores</strong>
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
                            Proveedores registrados ({proveedores.length})
                        </div>
                        <div className="card-body p-0">
                            {loading ? (
                                <div className="p-4 text-center text-muted">Cargando proveedores...</div>
                            ) : proveedores.length === 0 ? (
                                <div className="p-4 text-center text-muted">Aún no hay proveedores registrados.</div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Razón social</th>
                                                <th>RUT</th>
                                                <th>Contacto</th>
                                                <th>Teléfono</th>
                                                <th>Correo</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {proveedores.map((provider) => (
                                                <tr key={provider.id}>
                                                    <td>
                                                        <div className="fw-semibold">{provider.razonSocial}</div>
                                                        <div className="text-muted small">{provider.empresa}</div>
                                                    </td>
                                                    <td>{formatRut(provider.rut)}</td>
                                                    <td>
                                                        <div>{provider.contacto}</div>
                                                        {provider.rubro && <div className="text-muted small">{provider.rubro}</div>}
                                                    </td>
                                                    <td>{provider.telefono || '—'}</td>
                                                    <td>{provider.email || '—'}</td>
                                                    <td className="text-end">
                                                        <div className="btn-group btn-group-sm" role="group">
                                                            <button className="btn btn-outline-primary" onClick={() => handleEdit(provider)}>
                                                                Editar
                                                            </button>
                                                            <button
                                                                className="btn btn-outline-danger"
                                                                onClick={() => handleDelete(provider.id)}
                                                                disabled={deletingId === provider.id}
                                                            >
                                                                {deletingId === provider.id ? 'Eliminando...' : 'Eliminar'}
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
                            <h5 className="mb-0">{editingId ? 'Editar proveedor' : 'Nuevo proveedor'}</h5>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                {formError && (
                                    <div className="alert alert-warning" role="alert">
                                        {formError}
                                    </div>
                                )}
                                <div className="mb-3">
                                    <label className="form-label">Razón social</label>
                                    <input
                                        name="razonSocial"
                                        value={formData.razonSocial}
                                        onChange={handleChange}
                                        className="form-control"
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Nombre de fantasía</label>
                                    <input
                                        name="empresa"
                                        value={formData.empresa}
                                        onChange={handleChange}
                                        className="form-control"
                                        required
                                    />
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">RUT</label>
                                        <input
                                            name="rut"
                                            value={formData.rut}
                                            onChange={handleChange}
                                            className="form-control"
                                            placeholder="76.123.456-7"
                                            maxLength={12}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Contacto principal</label>
                                        <input
                                            name="contacto"
                                            value={formData.contacto}
                                            onChange={handleChange}
                                            className="form-control"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Teléfono</label>
                                        <input
                                            name="telefono"
                                            value={formData.telefono}
                                            onChange={handleChange}
                                            className="form-control"
                                            placeholder="+56 9 1234 5678"
                                            maxLength={16}
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Correo</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="form-control"
                                            placeholder="contacto@empresa.cl"
                                        />
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Rubro / Servicio</label>
                                    <input
                                        name="rubro"
                                        value={formData.rubro}
                                        onChange={handleChange}
                                        className="form-control"
                                        placeholder="Ej. Mantención hidráulica"
                                    />
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

export default Proveedores;
