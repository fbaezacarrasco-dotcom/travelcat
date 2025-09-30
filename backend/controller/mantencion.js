const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Importa CORS si necesitas permitir solicitudes desde tu frontend
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Ruta para manejar los datos de mantenimiento
app.post('/api/mantenimiento', (req, res) => {
    const mantenimientoData = req.body;
    // Aquí puedes guardar la información en una base de datos
    console.log('Datos de mantenimiento recibidos:', mantenimientoData);
    // Responde al cliente
    res.status(200).send({ message: 'Mantenimiento guardado correctamente' });
});

// Inicia el servidor
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});