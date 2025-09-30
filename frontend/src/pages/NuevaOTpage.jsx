// frontend/src/components/NuevaOTForm.jsx
import React, { useState } from 'react';

function NuevaOTForm() {
    const [formData, setFormData] = useState({ id_equipo: '', descripcion: '', prioridad: 'Media' });
    
    // Función de manejo del cambio
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Función de envío (POST)
    const handleSubmit = async (e) => {
        e.preventDefault(); 
        try {
            const response = await fetch('http://localhost:5000/api/ots', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData), 
            });
            if (response.ok) {
                alert('¡OT registrada con éxito!');
                setFormData({ id_equipo: '', descripcion: '', prioridad: 'Media' });
            } else {
                alert('Error al crear OT.');
            }
        } catch (error) {
            alert('Error de conexión con el servidor.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 border rounded shadow-sm bg-light">
            {/* ... Campos del formulario de OT ... */}
            <h4 className="mb-4">Formulario de OT</h4>
            
            <div className="row">
                <div className="col-md-4 mb-3">
                    <label className="form-label">Trabajo</label>
                    <input type="text" name="patente" value={formData.patente} onChange={handleChange} className="form-control" required />
                </div>
                <div className="col-md-4 mb-3">
                    <label className="form-label">Patente</label>
                    <input type="text" name="marca" value={formData.marca} onChange={handleChange} className="form-control" required />
                </div>
                <div className="col-md-4 mb-3">
                    <label className="form-label">Mécanico</label>
                    <input type="text" name="modelo" value={formData.modelo} onChange={handleChange} className="form-control" required />
                </div>
                <div className="row">
                <div className="col-md-6 mb-3">
                    <label className="form-label">Fecha de Inicio</label>
                    <input type="date" name="fecha_entrada" value={formData.fecha_entrada} onChange={handleChange} className="form-control" required />
                </div>
                <div className="col-md-6 mb-3">
                    <label className="form-label">Fecha de Término</label>
                    <input type="date" name="fecha_salida" value={formData.fecha_salida} onChange={handleChange} className="form-control" />
                </div>
                <div className="col-md-4 mb-3">
                <label className="form-label">Proveedores</label>
                <select name="modelo" value={formData.modelo} onChange={handleChange} className="form-control" required>
                <option value="en_proceso">...</option>
                </select>
                </div>
                <div className="col-md-4 mb-3">
                <label className="form-label">Estado</label>
        <select name="modelo" value={formData.modelo} onChange={handleChange} className="form-control" required>
        <option value="en_proceso">En proceso</option>
        <option value="terminado">Terminado</option>
        <option value="iniciando">Iniciando</option>
                </select>
                </div>

                <div className="col-md-4 mb-3">
                    <label className="form-label">Comentarios</label>
                    <textarea name="comentarios" value={formData.comentarios} onChange={handleChange} className="form-control" rows="3"></textarea>
                </div>
                

            </div>
            </div>
            {/* ... más campos ... */}
            <button type="submit" className="btn btn-primary w-100">Registrar OT</button>
        </form>
    );
}

export default NuevaOTForm;