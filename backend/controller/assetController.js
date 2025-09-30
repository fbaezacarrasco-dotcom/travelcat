// backend/controllers/assetController.js (VERIFICACIÓN)

exports.obtenerAssets = async (req, res) => {
    const { tipo } = req.query; // <-- ¡Esto es crucial!
    
    let query = 'SELECT * FROM equipos';
    let params = [];

    // Lógica para filtrar por tipo
    if (tipo) {
        query += ' WHERE tipo_activo = ?';
        params.push(tipo);
    }
    // ... (el resto del código sigue igual)
};