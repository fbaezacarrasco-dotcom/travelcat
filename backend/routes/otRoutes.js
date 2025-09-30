// routes/otRoutes.js
const express = require('express');
const router = express.Router();
const otController = require('../controllers/otController');

router.post('/', otController.crearOT);
router.get('/', otController.obtenerOTs);

module.exports = router;