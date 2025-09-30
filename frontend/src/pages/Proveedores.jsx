import React, { useState } from 'react';

const Proveedores = () => {
    const [proveedores, setProveedores] = useState([]);
    const [formData, setFormData] = useState({
        razonSocial: '',
        empresa: '',
        rut: '',
        contacto: ''
    });
    const [editIndex, setEditIndex] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        //validaciones
        if(!validarRut(formData.rut)) {
            alert('RUT inválido. Por favor, ingrese un RUT válido')
        return;
        }
        if (formData.razonSocial.trim() === '' || formData.empresa.trim() === '' ||formData.contacto.trim()=== '' ){
            alert('Todos los campos son obligatorios.');
            return;
        }
        if (editIndex !== null) {
            const updatedProveedores = proveedores.map((prov, index) =>
                index === editIndex ? formData : prov
            );
            setProveedores(updatedProveedores);
            setEditIndex(null);
        } else {
            setProveedores([...proveedores, formData]);
        }

        setFormData({ razonSocial: '', empresa: '', rut: '', contacto: '' });
    };

    const handleDelete = (index) => {
        const newProveedores = proveedores.filter((_, i) => i !== index);
        setProveedores(newProveedores);
    };

    const handleEdit = (index) => {
        setFormData(proveedores[index]);
        setEditIndex(index);
    };

    return (
        <div className="container">
            <h2>Proveedores</h2>
            <form onSubmit={handleSubmit}>
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
                <button type="submit" className="btn btn-primary">
                    {editIndex !== null ? 'Actualizar Proveedor' : 'Agregar Proveedor'}
                </button>
            </form>

            <h3 className="mt-4">Lista de Proveedores</h3>
            <ul className="list-group">
                {proveedores.map((proveedor, index) => (
                    <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                        {`${proveedor.razonSocial} - ${proveedor.empresa}`}
                        <div>
                            <button className="btn btn-warning me-2" onClick={() => handleEdit(index)}>Editar</button>
                            <button className="btn btn-danger" onClick={() => handleDelete(index)}>Eliminar</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Proveedores;