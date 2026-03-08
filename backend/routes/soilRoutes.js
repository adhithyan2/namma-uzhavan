const express = require('express');
const router = express.Router();
const soilController = require('../controllers/soilController');

// Soil Health Routes
router.post('/soil-health', soilController.addSoilHealth);
router.get('/soil-health/:farmerId', soilController.getSoilHealth);

// Soil Moisture Routes (IoT)
router.post('/soil-moisture', soilController.addSoilMoistureReading);
router.get('/soil-moisture/:deviceId', soilController.getSoilMoistureReadings);
router.get('/soil-moisture/latest/:deviceId', soilController.getLatestReading);

module.exports = router;
