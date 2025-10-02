const express = require('express');
const router = express.Router();
const referenceController = require('../controller/referenceController');

router.get('/conductores', referenceController.obtenerConductores);
router.get('/catalogos', referenceController.obtenerResumenCatalogos);

module.exports = router;
