// frontend/src/pages/Camiones.jsx (MODIFICADO)

import React, { useState, useEffect, useCallback } from 'react';
import AssetForm from '../components/AssetForm'; 

function Camiones() {
    const [camiones, setCamiones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);

    // 1. Crear una función para obtener los datos (Usamos useCallback para optimización)
    const fetchCamiones = useCallback(async () => {
        setLoading(true);
        try {
            // URL con filtro de tipo=camion
            const response = await fetch('http://localhost:5000/api/assets?tipo=Camión'); 
            const data = await response.json();
            setCamiones(data);
        } catch (error) {
            console.error('Error al obtener camiones:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // 2. Ejecutar al montar el componente
    useEffect(() => {
        fetchCamiones();
    }, [fetchCamiones]); // Depende de fetchCamiones

    // 3. Función para manejar el éxito del registro
    const handleSuccess = () => {
        setMostrarFormulario(false); // Ocultar el formulario
        fetchCamiones(); // Recargar la lista de camiones
    };

    if (loading) return <div className="text-center p-4">Cargando flota de camiones...</div>;

    return (
        <div className="container mt-4">
            <h1 className="mb-4">Gestión de Flota (Camiones)</h1>
            
            <button 
                className="btn btn-success mb-3"
                onClick={() => setMostrarFormulario(!mostrarFormulario)}
            >
                {mostrarFormulario ? 'Ocultar Formulario' : '➕ Registrar Nuevo Camión'}
            </button>

            {/* Formulario de Registro */}
            {mostrarFormulario && (
                <div className="card card-body mb-4">
                    <h3>Registrar Nuevo Camión</h3>
                    {/* 4. Pasar la función handleSuccess al formulario */}
                    <AssetForm 
                        tipoDefault="Camión" 
                        onSuccess={handleSuccess} 
                    /> 
                </div>
            )}

            {/* ... Resto del Listado de Camiones ... */}
        </div>
    );
}

export default Camiones;