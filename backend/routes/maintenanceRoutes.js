const express = require('express');
const router = express.Router();
const maintenanceController = require('../controller/maintenanceController');

router.get('/', maintenanceController.listarProgramas);
router.post('/', maintenanceController.crearPrograma);
router.delete('/:id', maintenanceController.eliminarPrograma);

module.exports = router;
