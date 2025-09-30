import React, { useState, useEffect } from 'react';

const Proveedores = () => {
    const [proveedores, setProveedores] = useState([]);
    const [formData, setFormData] = useState({
        razonSocial: '',
        empresa: '',
        rut: '',
        contacto: ''
    });

    useEffect(() => {
        const data = localStorage.getItem('proveedores');
        if (data) {
            setProveedores(JSON.parse(data));
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const nuevosProveedores = [...proveedores, formData];
        setProveedores(nuevosProveedores);
        localStorage.setItem('proveedores', JSON.stringify(nuevosProveedores));
        setFormData({ razonSocial: '', empresa: '', rut: '', contacto: '' });
    };

    const handleDelete = (index) => {
        const newProveedores = proveedores.filter((_, i) => i !== index);
        setProveedores(newProveedores);
        localStorage.setItem('proveedores', JSON.stringify(newProveedores)); // Actualizar localStorage
    };

    return (
        <div className="container">
            <h2>Proveedores</h2>
            <form onSubmit={handleSubmit}>
                {/* Campos del formulario */}
                <div className="mb-3">
                    <label className="form-label">Razón Social</label>
                    <input
                        type="text"
                        name="razonSocial"
                        value={formData.razonSocial}
                        onChange={handleChange}
                        className="form-control"
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Empresa</label>
                    <input
                        type="text"
                        name="empresa"
                        value={formData.empresa}
                        onChange={handleChange}
                        className="form-control"
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">RUT de Empresa</label>
                    <input
                        type="text"
                        name="rut"
                        value={formData.rut}
                        onChange={handleChange}
                        className="form-control"
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Contacto</label>
                    <input
                        type="text"
                        name="contacto"
                        value={formData.contacto}
                        onChange={handleChange}
                        className="form-control"
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary">Agregar Proveedor</button>
            </form>

            <h3 className="mt-4">Lista de Proveedores</h3>
            <ul className="list-group">
                {proveedores.map((proveedor, index) => (
                    <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                        {`${proveedor.razonSocial} - ${proveedor.empresa}`}
                        <button className="btn btn-danger" onClick={() => handleDelete(index)}>Eliminar</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Proveedores;