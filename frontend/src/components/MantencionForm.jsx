import React from 'react';

const MantencionForm = ({ formData, handleChange, handleSubmit }) => {
    return (
        <form onSubmit={handleSubmit}>
            <div className="mb-3">
                <label className="form-label">Patente</label>
                <input
                    type="text"
                    name="patente"
                    value={formData.patente}
                    onChange={handleChange}
                    className="form-control"
                    required
                />
            </div>

            <div className="mb-3">
                <label className="form-label">Tarea</label>
                <input
                    type="text"
                    name="tarea"
                    value={formData.tarea}
                    onChange={handleChange}
                    className="form-control"
                    required
                />
            </div>

            <div className="mb-3">
                <label className="form-label">Tipo de Control</label>
                <select
                    name="tipoControl"
                    value={formData.tipoControl}
                    onChange={handleChange}
                    className="form-control"
                    required
                >
                    <option value="km">Por KM</option>
                    <option value="preventivo">Preventivo</option>
                </select>
            </div>

            <div className="mb-3">
                <label className="form-label">Fecha</label>
                <input
                    type="date"
                    name="fecha"
                    value={formData.fecha}
                    onChange={handleChange}
                    className="form-control"
                    required
                />
            </div>

            <div className="mb-3">
                <label className="form-label">Último KM</label>
                <input
                    type="number"
                    name="ultimoKm"
                    value={formData.ultimoKm}
                    onChange={handleChange}
                    className="form-control"
                    required
                />
            </div>

            <button type="submit" className="btn btn-primary">Guardar Mantenimiento</button>
        </form>
    );
};

export default MantencionForm;