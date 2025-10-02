const express = require('express');
const router = express.Router();
const expenseController = require('../controller/expenseController');
const upload = require('../middleware/upload');

router.get('/', expenseController.obtenerGastos);
router.post('/', upload.single('boleta'), expenseController.registrarGasto);

module.exports = router;
