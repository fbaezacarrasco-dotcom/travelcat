// frontend/src/components/CamionForm.jsx

import React, { useState } from 'react';

// NOTA: La función 'onSuccess' se usa para notificar a la página padre (Camiones.jsx) 
// que recargue la lista después de un registro exitoso.
function CamionForm({ onSuccess }) {
    const [formData, setFormData] = useState({
        // Datos principales del vehículo
        patente: '',
        modelo: '',
        anio: '', // Cambiado de 'año' a 'anio' por convención de JavaScript/Bases de Datos
        marca: '',
        km: '',
        
        // Datos de fechas
        fecha_entrada: '',
        fecha_salida: '',
        
        // Documentos (Manejo simulado de archivos)
        padron_doc: null, 
        permiso_circulacion_doc: null,
        revision_tecnica_doc: null,
    });

    // Maneja cambios en campos de texto/número/fecha
    const handleChange = (e) => {
        setFormData({
            ...formData, 
            [e.target.name]: e.target.value, 
        });
    };

    // Maneja cambios en campos de TIPO ARCHIVO (files)
    const handleFileChange = (e) => {
        // En una aplicación real, aquí se usaría FormData para enviar el archivo al servidor.
        setFormData({
            ...formData,
            [e.target.name]: e.target.files[0] // Guarda el objeto de archivo
        });
    };

    // Envío del formulario (Llamada POST al Backend)
    const handleSubmit = async (e) => {
        e.preventDefault(); 
        
        // En una implementación real, aquí se construiría un objeto FormData
        // para enviar los archivos junto con los metadatos.
        
        // SIMULACIÓN DE ENVÍO DE DATOS
        const datosCamion = {
            nombre: `${formData.marca} ${formData.modelo} (${formData.patente})`,
            tipo_activo: 'Camión',
            ...formData,
            // Quitamos los objetos de archivo de la simulación de envío JSON
            padron_doc: formData.padron_doc ? formData.padron_doc.name : 'sin archivo',
            permiso_circulacion_doc: formData.permiso_circulacion_doc ? formData.permiso_circulacion_doc.name : 'sin archivo',
            revision_tecnica_doc: formData.revision_tecnica_doc ? formData.revision_tecnica_doc.name : 'sin archivo',
        };

        try {
            // Utilizamos la misma ruta genérica de Assets que creamos antes
            const response = await fetch('http://localhost:5000/api/assets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosCamion), 
            });

            if (response.ok) {
                alert('Camión registrado con éxito.');
                
                // Limpiar formulario y notificar al padre
                setFormData({ patente: '', modelo: '', anio: '', marca: '', km: '', fecha_entrada: '', fecha_salida: '', padron_doc: null, permiso_circulacion_doc: null, revision_tecnica_doc: null });
                if (onSuccess) onSuccess(); 

            } else {
                alert('Error al crear Camión. Verifica los datos.');
            }
        } catch (error) {
            console.error('Error de conexión:', error);
            alert('No se pudo conectar con el servidor API.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 border rounded shadow-sm bg-light">
            <h4 className="mb-4 text-primary">Detalles del Vehículo</h4>
            
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

            <div className="row">
                 <div className="col-md-4 mb-3">
                    <label className="form-label">Año</label>
                    <input type="number" name="anio" value={formData.anio} onChange={handleChange} className="form-control" required />
                </div>
                <div className="col-md-4 mb-3">
                    <label className="form-label">Kilometraje (km)</label>
                    <input type="number" name="km" value={formData.km} onChange={handleChange} className="form-control" required />
                </div>
            </div>
            
            <hr className="my-4" />

            {/* GRUPO 2: Fechas de Servicio */}
            <h4 className="mb-4 text-primary">Fechas de Servicio</h4>
            <div className="row">
                <div className="col-md-6 mb-3">
                    <label className="form-label">Fecha de Entrada a Operación</label>
                    <input type="date" name="fecha_entrada" value={formData.fecha_entrada} onChange={handleChange} className="form-control" required />
                </div>
                <div className="col-md-6 mb-3">
                    <label className="form-label">Fecha de Salida (Retiro)</label>
                    <input type="date" name="fecha_salida" value={formData.fecha_salida} onChange={handleChange} className="form-control" />
                </div>
            </div>

            <hr className="my-4" />

            {/* GRUPO 3: Documentación del Vehículo (Archivos) */}
            <h4 className="mb-4 text-primary">Documentación (Subida de Archivos)</h4>
            <p className="text-danger small">*Nota: La subida de archivos es una simulación en el Frontend. Requiere configuración de Multer/Express en el Backend.</p>

            <div className="mb-3">
                <label className="form-label">Padrón</label>
                <input type="file" name="padron_doc" onChange={handleFileChange} className="form-control" accept=".pdf, .jpg, .png" />
            </div>

            <div className="mb-3">
                <label className="form-label">Permiso de Circulación</label>
                <input type="file" name="permiso_circulacion_doc" onChange={handleFileChange} className="form-control" accept=".pdf, .jpg, .png" />
            </div>

            <div className="mb-4">
                <label className="form-label">Revisión Técnica</label>
                <input type="file" name="revision_tecnica_doc" onChange={handleFileChange} className="form-control" accept=".pdf, .jpg, .png" />
            </div>
            
            <button type="submit" className="btn btn-primary w-100">
                ✅ Registrar Camión
            </button>
        </form>
    );
}

export default CamionForm;