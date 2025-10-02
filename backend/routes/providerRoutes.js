const express = require('express');
const router = express.Router();
const providerController = require('../controller/providerController');

router.get('/', providerController.obtenerProveedores);
router.post('/', providerController.crearProveedor);
router.put('/:id', providerController.actualizarProveedor);
router.delete('/:id', providerController.eliminarProveedor);

module.exports = router;
