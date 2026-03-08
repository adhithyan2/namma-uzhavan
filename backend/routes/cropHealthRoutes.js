const express = require('express');
const router = express.Router();
const cropHealthController = require('../controllers/cropHealthController');

// POST /api/crop-health
router.post('/crop-health', cropHealthController.addCropHealth);

// GET /api/crop-health/:farmerId
router.get('/crop-health/:farmerId', cropHealthController.getFarmerCropHealth);

// GET /api/crop-health/map/:district
router.get('/crop-health/map/:district', cropHealthController.getDistrictCropHealth);

// PUT /api/crop-health/:id
router.put('/crop-health/:id', cropHealthController.updateCropHealth);

// DELETE /api/crop-health/:id
router.delete('/crop-health/:id', cropHealthController.deleteCropHealth);

module.exports = router;
