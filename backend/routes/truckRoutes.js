const express = require('express');
const router = express.Router();
const truckController = require('../controller/truckController');
const upload = require('../middleware/upload');

const documentUpload = upload.fields([{ name: 'documentos', maxCount: 10 }]);

router.get('/', truckController.obtenerCamiones);
router.get('/:id/documentos', truckController.obtenerDocumentosCamion);
router.post('/', documentUpload, truckController.crearCamion);
router.put('/:id', documentUpload, truckController.actualizarCamion);
router.delete('/:id', truckController.eliminarCamion);

module.exports = router;
