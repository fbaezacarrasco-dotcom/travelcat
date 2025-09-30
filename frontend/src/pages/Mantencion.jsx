import React, { useState } from 'react';
import MantencionForm from '../components/MantencionForm'; // Asegúrate de que la ruta sea correcta




const Mantencion = () => {
    const [formData, setFormData] = useState({
        patente: '',
        tarea: '',
        tipoControl: 'km',
        fecha: '',
        ultimoKm: ''
    });

    

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("formulario enviado:", fromdata);
        try {
            const response = await fetch('/api/mantenimiento', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            console.log(data);
            // Aquí puedes manejar la respuesta, por ejemplo, mostrar un mensaje de éxito
        } catch (error) {
            console.error('Error al guardar el mantenimiento:', error);
        }
    };

    return (
        <div className="container">
            <h2>Mantenimiento Preventivo</h2>
            <MantencionForm 
                formData={formData} 
                handleChange={handleChange} 
                handleSubmit={handleSubmit} 
            />
        </div>
    );
};

export default Mantencion;