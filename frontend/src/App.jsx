// frontend/src/App.jsx (CORREGIDO)

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

// Importa los componentes de página. Asegúrate que estos archivos existan en src/pages/
import Dashboard from './pages/Dashboard';
import NuevaOTPage from './pages/NuevaOTpage'; // ¡CORRECCIÓN! Importa la página contenedora.
import Camiones from './pages/Camiones';      // <-- Página de Camiones
import Mantencion from './pages/Mantencion'; 
import Proveedores from './pages/Proveedores'; 



// Componente simple para la barra de navegación (AÑADIMOS ENLACE A CAMIONES)
const NavBar = () => (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
            <Link className="navbar-brand" to="/">Sistema de mantención</Link>
            <div className="collapse navbar-collapse">
                <ul className="navbar-nav me-auto">
                    <li className="nav-item">
                        <Link className="nav-link" to="/">Dashboard</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link" to="/nueva">Órden de Trabajo</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link" to="/camiones">Camiones</Link> {/* <-- ¡NUEVO ENLACE! */}
                    </li>
                     <li className="nav-item">
                        <Link className="nav-link" to="/mantencion">Mantencion</Link> {/* <-- ¡NUEVO ENLACE! */}
                    </li>
                     <li className="nav-item">
                        <Link className="nav-link" to="/proveedores">Proveedores</Link> {/* <-- ¡NUEVO ENLACE! */}
                    </li>
                    
                </ul>
            </div>
        </div>
    </nav>
);

function App() {
    return (
        <Router>
            <NavBar /> 
            
            <Routes>
                {/* 1. Dashboard (Raíz) */}
                <Route path="/" element={<Dashboard />} /> 
        
                {/* 2. Nueva OT (Usando el nombre correcto: NuevaOTPage) */}
                <Route path="/nueva" element={<NuevaOTPage/>} />                
                {/* 3. Gestión de Camiones */}
                <Route path="/camiones" element={<Camiones/>} /> {/* <-- ¡NUEVA RUTA! */}
                {/* Mantención */}
                <Route path="/mantencion" element={<Mantencion/>} /> {/* <-- ¡NUEVA RUTA! */}
                {/* Proveedores */}
                <Route path="/proveedores" element={<Proveedores/>} /> {/* <-- ¡NUEVA RUTA! */}
            </Routes>
        </Router>
    );
    
}

export default App;