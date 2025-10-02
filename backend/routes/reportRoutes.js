const express = require('express');
const router = express.Router();
const reportController = require('../controller/reportController');

router.get('/dashboard', reportController.getDashboardReport);
router.get('/costos-por-camion', reportController.getCostPerTruck);

module.exports = router;
