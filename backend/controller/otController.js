// controllers/otController.js
const db = require('../config/db');

// CREATE: Crear una nueva OT
exports.crearOT = async (req, res) => {
    const { id_equipo, descripcion, prioridad } = req.body;
    const query = 'INSERT INTO ordenes_trabajo (id_equipo, descripcion, prioridad) VALUES (?, ?, ?)';

    try {
        const [result] = await db.execute(query, [id_equipo, descripcion, prioridad]);
        res.status(201).json({ id: result.insertId, mensaje: 'OT creada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear la OT' });
    }
};

// READ: Obtener todas las OTs
exports.obtenerOTs = async (req, res) => {
    const query = 'SELECT * FROM ordenes_trabajo ORDER BY fecha_solicitud DESC';

    try {
        const [rows] = await db.query(query);
        res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener OTs' });
    }
};
// Aquí irían las funciones para obtener una OT por ID, actualizar (PUT/PATCH) y eliminar (DELETE)