// frontend/src/pages/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Dashboard() {
    const [ots, setOts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Llama a la API para obtener el listado de OTs
        fetch('http://localhost:5000/api/ots') 
          .then(res => res.json())
          .then(data => {
            setOts(data);
            setLoading(false);
          })
          .catch(error => {
            console.error('Error al obtener OTs:', error);
            setLoading(false);
          });
    }, []); 

    if (loading) return <div className="text-center p-5">Cargando Órdenes de Trabajo...</div>;

    return (
        <div className="container mt-4">
            <h1 className="mb-4">Dashboard de Mantenimiento</h1>
            
            <div className="d-flex justify-content-between mb-3">
                <h3>Órdenes de Trabajo Activas ({ots.length})</h3>
                {/* Botón para navegar al formulario de nueva OT */}
                <Link to="/nueva" className="btn btn-primary">➕ Crear Nueva OT</Link>
            </div>
            
            <table className="table table-striped table-hover">
                <thead className="table-dark">
                    <tr>
                        <th>ID</th>
                        <th>Equipo</th>
                        <th>Prioridad</th>
                        <th>Estado</th>
                        <th>Fecha</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {ots.map(ot => (
                        <tr key={ot.id}>
                            <td>{ot.id}</td>
                            <td>{ot.id_equipo || 'N/A'}</td>
                            <td><span className={`badge text-bg-${ot.prioridad === 'Alta' ? 'danger' : 'warning'}`}>{ot.prioridad}</span></td>
                            <td>{ot.estado}</td>
                            <td>{new Date(ot.fecha_solicitud).toLocaleDateString()}</td>
                            <td>
                                {/* Aquí puedes agregar lógica para botones de "Ver Detalle" */}
                                <button className="btn btn-sm btn-info me-2">Ver</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            
        </div>
    );
}

export default Dashboard;