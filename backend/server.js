// backend/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Permite peticiones desde React (frontend)
app.use(express.json()); // Permite a Express leer cuerpos JSON

// Rutas de Prueba
app.get('/', (req, res) => {
    res.status(200).send('API de Mantenimiento Funcionando');
});

// Implementación de Rutas (Paso 4)
// const otRoutes = require('./routes/otRoutes');
// app.use('/api/ots', otRoutes); 

app.listen(PORT, () => {
    console.log(`Servidor en puerto ${PORT}`);
});