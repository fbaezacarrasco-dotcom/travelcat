import React from 'react';

const MantencionForm = ({ formData, handleChange, handleSubmit, camiones, cargandoCamiones, proximoControlPreview }) => {
    const intervaloLabel = formData.tipoControl === 'km' ? 'Intervalo (km)' : 'Intervalo (días)';

    return (
        <form onSubmit={handleSubmit} className="card shadow-sm">
            <div className="card-header bg-white">
                <h5 className="mb-0">Planificar programa</h5>
            </div>
            <div className="card-body">
                <div className="mb-3">
                    <label className="form-label">Patente</label>
                    <input
                        list="patentes-registradas"
                        name="patente"
                        value={formData.patente}
                        onChange={handleChange}
                        className="form-control"
                        maxLength={10}
                        placeholder={cargandoCamiones ? 'Cargando camiones...' : 'Ej. AA-BB11'}
                        required
                    />
                    <datalist id="patentes-registradas">
                        {camiones.map((truck) => (
                            <option key={truck.id} value={truck.patente}>
                                {truck.marca} {truck.modelo}
                            </option>
                        ))}
                    </datalist>
                    <div className="form-text">Selecciona una patente de la lista o escribe una manualmente.</div>
                </div>

                <div className="mb-3">
                    <label className="form-label">Tarea</label>
                    <input
                        name="tarea"
                        value={formData.tarea}
                        onChange={handleChange}
                        className="form-control"
                        maxLength={120}
                        placeholder="Ej. Cambio de aceite motor"
                        required
                    />
                    <div className="form-text">Máximo 120 caracteres. Usa texto descriptivo.</div>
                </div>

                <div className="mb-3">
                    <label className="form-label">Tipo de control</label>
                    <select
                        name="tipoControl"
                        value={formData.tipoControl}
                        onChange={handleChange}
                        className="form-select"
                        required
                    >
                        <option value="km">Por kilometraje</option>
                        <option value="fecha">Por fecha</option>
                    </select>
                </div>

                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Fecha base</label>
                        <input
                            type="date"
                            name="fecha"
                            value={formData.fecha}
                            onChange={handleChange}
                            className="form-control"
                            required={formData.tipoControl === 'fecha'}
                        />
                        <div className="form-text">Se usa como referencia para el próximo control por fecha.</div>
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="form-label">{intervaloLabel}</label>
                        <input
                            name="intervalo"
                            value={formData.intervalo}
                            onChange={handleChange}
                            className="form-control"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            required
                        />
                    </div>
                </div>

                {formData.tipoControl === 'km' && (
                    <div className="mb-3">
                        <label className="form-label">Último kilometraje registrado</label>
                        <input
                            name="ultimoKm"
                            value={formData.ultimoKm}
                            onChange={handleChange}
                            className="form-control"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            required
                        />
                        <div className="form-text">Ingresa el valor numérico sin puntos.</div>
                    </div>
                )}

                <div className="alert alert-info" role="status">
                    Próximo control estimado: <strong>{proximoControlPreview}</strong>
                </div>
            </div>
            <div className="card-footer text-end bg-white">
                <button type="submit" className="btn btn-primary">
                    Guardar programa
                </button>
            </div>
        </form>
    );
};

MantencionForm.defaultProps = {
    camiones: [],
    cargandoCamiones: false,
    proximoControlPreview: '—'
};

export default MantencionForm;
