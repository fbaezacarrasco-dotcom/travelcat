import React, { useCallback, useEffect, useMemo, useState } from 'react';
import MantencionForm from '../components/MantencionForm';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || `${window.location.origin}/api`;
const API_TRUCKS = API_BASE + '/trucks';
const API_MAINTENANCE = API_BASE + '/maintenance-programs';

const initialForm = {
    patente: '',
    tarea: '',
    tipoControl: 'km',
    fecha: new Date().toISOString().slice(0, 10),
    ultimoKm: '',
    intervalo: ''
};

const Mantencion = () => {
    const { token } = useAuth();
    const [formData, setFormData] = useState(initialForm);
    const [programas, setProgramas] = useState([]);
    const [cargandoProgramas, setCargandoProgramas] = useState(false);
    const [mensaje, setMensaje] = useState(null);
    const [error, setError] = useState(null);
    const [camiones, setCamiones] = useState([]);
    const [cargandoCamiones, setCargandoCamiones] = useState(false);

    const fetchCamiones = useCallback(async () => {
        if (!token) return;
        setCargandoCamiones(true);
        try {
            const response = await fetch(API_TRUCKS, {
                headers: { Authorization: 'Bearer ' + token }
            });

            if (!response.ok) {
                throw new Error('No se pudieron obtener los camiones registrados.');
            }

            const data = await response.json();
            setCamiones(data);
        } catch (truckError) {
            console.warn(truckError.message);
        } finally {
            setCargandoCamiones(false);
        }
    }, [token]);

    const fetchProgramas = useCallback(async () => {
        if (!token) return;
        setCargandoProgramas(true);
        try {
            const response = await fetch(API_MAINTENANCE, {
                headers: { Authorization: 'Bearer ' + token }
            });

            if (!response.ok) {
                throw new Error('No se pudieron obtener los programas de mantenimiento.');
            }

            const data = await response.json();
            setProgramas(data);
        } catch (programError) {
            console.warn(programError.message);
        } finally {
            setCargandoProgramas(false);
        }
    }, [token]);

    useEffect(() => {
        fetchCamiones();
        fetchProgramas();
    }, [fetchCamiones, fetchProgramas]);

    const handleChange = (event) => {
        const { name } = event.target;
        let { value } = event.target;

        if (mensaje) setMensaje(null);
        if (error) setError(null);

        if (name === 'patente') {
            value = value.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 10);
        }

        if (name === 'tarea') {
            value = value.replace(/[^\p{L}0-9\s.,-]/gu, '').slice(0, 120);
        }

        if (name === 'ultimoKm' || name === 'intervalo') {
            value = value.replace(/[^0-9]/g, '');
        }

        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const calcularProximoControl = useCallback((datos) => {
        const intervalo = Number(datos.intervalo || 0);

        if (datos.tipoControl === 'km') {
            const ultimo = Number(datos.ultimoKm || 0);
            if (!intervalo || !ultimo) {
                return '—';
            }
            return `${ultimo + intervalo} km`;
        }

        if (!datos.fecha || !intervalo) {
            return '—';
        }

        const base = new Date(datos.fecha);
        if (Number.isNaN(base.getTime())) {
            return '—';
        }
        const next = new Date(base);
        next.setDate(base.getDate() + intervalo);
        return next.toLocaleDateString();
    }, []);

    const handleSubmit = (event) => {
        event.preventDefault();

        const intervalo = Number(formData.intervalo);
        const ultimoKm = Number(formData.ultimoKm);

        if (!formData.patente) {
            setError('Debes seleccionar una patente registrada.');
            return;
        }

        if (formData.tipoControl === 'km' && (!ultimoKm || !intervalo)) {
            setError('Para control por kilometraje ingresa último kilometraje y el intervalo.');
            return;
        }

        if (formData.tipoControl === 'fecha' && (!formData.fecha || !intervalo)) {
            setError('Para control por fecha ingresa la fecha base y el intervalo en días.');
            return;
        }

        const requestBody = {
            ...formData,
            ultimoKm: formData.tipoControl === 'km' ? ultimoKm : '',
            intervalo
        };

        fetch(API_MAINTENANCE, {
            method: 'POST',
            headers: {
                Authorization: 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error('No se pudo registrar el programa.');
                }
                return res.json();
            })
            .then((nuevo) => {
                setProgramas((prev) => [nuevo, ...prev]);
                setMensaje('Programa de mantenimiento guardado correctamente.');
                setFormData({ ...initialForm });
                fetchProgramas();
            })
            .catch((err) => {
                setError(err.message);
            });
    };

    const handleDelete = (programa) => {
        if (!window.confirm('¿Eliminar el programa de mantenimiento seleccionado?')) return;

        fetch(`${API_MAINTENANCE}/${programa.id}`, {
            method: 'DELETE',
            headers: { Authorization: 'Bearer ' + token }
        })
            .then((res) => {
                if (res.status === 204) {
                    setProgramas((prev) => prev.filter((item) => item.id !== programa.id));
                    return;
                }
                throw new Error('No se pudo eliminar el programa.');
            })
            .catch((err) => setError(err.message));
    };

    const ayuda = useMemo(
        () => [
            'Escoge la patente del camión registrado para vincular el plan.',
            'Define si el control es por kilometraje o por días, luego ingresa el intervalo.',
            'Se calcula automáticamente la próxima intervención estimada.'
        ],
        []
    );

    return (
        <div className="container">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                    <h1 className="mb-0">Mantenimiento preventivo</h1>
                    <p className="text-muted mb-0">Planifica controles por kilometraje o por fecha según tu flota</p>
                </div>
            </div>

            <div className="help-callout mb-4">
                <strong>¿Cómo usar esta sección?</strong>
                <ul className="mb-0">
                    {ayuda.map((pista) => (
                        <li key={pista}>{pista}</li>
                    ))}
                </ul>
            </div>

            {error && (
                <div className="alert alert-warning" role="alert">
                    {error}
                </div>
            )}
            {mensaje && (
                <div className="alert alert-success" role="alert">
                    {mensaje}
                </div>
            )}

            <div className="row g-4">
                <div className="col-lg-5">
                    <MantencionForm
                        formData={formData}
                        handleChange={handleChange}
                        handleSubmit={handleSubmit}
                        camiones={camiones}
                        cargandoCamiones={cargandoCamiones}
                        proximoControlPreview={calcularProximoControl(formData)}
                    />
                </div>

                <div className="col-lg-7">
                    <div className="card shadow-sm h-100">
                        <div className="card-header bg-white d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Programas registrados ({programas.length})</h5>
                        </div>
                        <div className="card-body p-0">
                            {cargandoProgramas ? (
                                <div className="p-4 text-center text-muted">Cargando programas...</div>
                            ) : programas.length === 0 ? (
                                <div className="p-4 text-center text-muted">Aún no registras programas preventivos.</div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Patente</th>
                                                <th>Tarea</th>
                                                <th>Tipo</th>
                                                <th>Intervalo</th>
                                                <th>Último KM</th>
                                                <th>Próximo control</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {programas.map((programa) => (
                                                <tr key={programa.id}>
                                                    <td>{programa.patente}</td>
                                                    <td>{programa.tarea}</td>
                                                    <td>{programa.tipoControl === 'km' ? 'Kilometraje' : 'Fecha'}</td>
                                                    <td>
                                                        {programa.tipoControl === 'km'
                                                            ? `${programa.intervalo} km`
                                                            : `${programa.intervalo} días`}
                                                    </td>
                                                    <td>{programa.tipoControl === 'km' ? (programa.ultimoKm || '—') : '—'}</td>
                                                    <td>{programa.proximoControl}</td>
                                                    <td className="text-end">
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => handleDelete(programa)}
                                                        >
                                                            Eliminar
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="card shadow-sm mt-4">
                        <div className="card-header bg-white">
                            <h6 className="mb-0">Camiones disponibles</h6>
                        </div>
                        <div className="card-body">
                            {cargandoCamiones ? (
                                <div className="text-muted">Cargando listado...</div>
                            ) : camiones.length === 0 ? (
                                <div className="text-muted">Registra camiones en la sección flota para seleccionarlos aquí.</div>
                            ) : (
                                <ul className="list-group list-group-flush">
                                    {camiones.map((truck) => (
                                        <li key={truck.id} className="list-group-item d-flex justify-content-between align-items-center">
                                            <span className="fw-semibold">{truck.patente}</span>
                                            <span className="text-muted small">{truck.marca} {truck.modelo}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Mantencion;
