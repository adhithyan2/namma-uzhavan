const express = require('express');
const router = express.Router();
const cropRecommendationController = require('../controllers/cropController');

// POST /api/crop-recommendation
router.post('/crop-recommendation', cropRecommendationController.recommend);

// GET /api/crops - Legacy endpoint
router.get('/crops', cropRecommendationController.getAllCrops);

module.exports = router;
