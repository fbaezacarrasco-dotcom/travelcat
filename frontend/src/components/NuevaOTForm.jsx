// frontend/src/components/NuevaOTForm.jsx
import React, { useState } from 'react';

function NuevaOTForm() {
    // 1. Estado para capturar los datos del formulario
    const [formData, setFormData] = useState({
        id_equipo: '', 
        descripcion: '',
        prioridad: 'Media', 
    });

    // 2. Manejo de cambios en los campos (input, textarea, select)
    const handleChange = (e) => {
        setFormData({
            ...formData, 
            [e.target.name]: e.target.value, 
        });
    };

    // 3. Envío del formulario (Llamada POST a la API)
    const handleSubmit = async (e) => {
        e.preventDefault(); 
        
        try {
            const response = await fetch('http://localhost:5000/api/ots', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData), 
            });

            if (response.ok) {
                alert('¡Orden de Trabajo registrada con éxito!');
                // Limpiar el formulario después del envío exitoso
                setFormData({ id_equipo: '', descripcion: '', prioridad: 'Media' }); 
                // Aquí podrías redirigir al usuario al dashboard
            } else {
                alert('Error al crear OT. Verifica los datos.');
            }
        } catch (error) {
            console.error('Error de conexión:', error);
            alert('No se pudo conectar con el servidor API.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 border rounded shadow-sm bg-light">
            <h4 className="mb-4">Registro Rápido de OT</h4>
            
           {/* GRUPO 1: Identificación y Características */}
            <div className="row">
                <div className="col-md-4 mb-3">
                    <label className="form-label">Patente</label>
                    <input type="text" name="patente" value={formData.patente} onChange={handleChange} className="form-control" required />
                </div>
                <div className="col-md-4 mb-3">
                    <label className="form-label">Marca</label>
                    <input type="text" name="marca" value={formData.marca} onChange={handleChange} className="form-control" required />
                </div>
                <div className="col-md-4 mb-3">
                    <label className="form-label">Modelo</label>
                    <input type="text" name="modelo" value={formData.modelo} onChange={handleChange} className="form-control" required />
                </div>
            </div>

            <div className="mb-3">
                <label className="form-label fw-bold">Descripción / Solicitud</label>
                <textarea 
                    name="descripcion" 
                    value={formData.descripcion} 
                    onChange={handleChange} 
                    className="form-control" 
                    rows="3" 
                    required
                ></textarea>
            </div>

            <div className="mb-4">
                <label className="form-label fw-bold">Prioridad</label>
                <select 
                    name="prioridad" 
                    value={formData.prioridad} 
                    onChange={handleChange} 
                    className="form-select"
                >
                    <option value="Baja">Baja</option>
                    <option value="Media">Media</option>
                    <option value="Alta">Alta</option>
                </select>
            </div>

            <button type="submit" className="btn btn-primary w-100">
                Registrar Orden
            </button>
        </form>
    );
}

export default NuevaOTForm;