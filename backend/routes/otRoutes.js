// routes/otRoutes.js
const express = require('express');
const router = express.Router();
const otController = require('../controller/otController');

// Multer centralizado (diskStorage) ya configurado en middleware/upload.js
// Soporta multipart/form-data con o sin archivo. Campo de archivo opcional: 'archivo'.
const upload = require('../middleware/upload');

// Crear OT (soporta FormData y archivo opcional en campo 'archivo')
router.post('/', upload.single('archivo'), otController.crearOT);

// Listar OTs
router.get('/', otController.obtenerOTs);

// Actualizar OT (también permite FormData + archivo opcional)
router.put('/:id', upload.single('archivo'), otController.actualizarOT);

// Eliminar y exportar no requieren multer
router.delete('/:id', otController.eliminarOT);
router.get('/:id/export', otController.descargarOT);

module.exports = router;

