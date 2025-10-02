// routes/otRoutes.js
const express = require('express');
const router = express.Router();
const otController = require('../controller/otController');

router.post('/', otController.crearOT);
router.get('/', otController.obtenerOTs);
router.put('/:id', otController.actualizarOT);
router.delete('/:id', otController.eliminarOT);
router.get('/:id/export', otController.descargarOT);

module.exports = router;
