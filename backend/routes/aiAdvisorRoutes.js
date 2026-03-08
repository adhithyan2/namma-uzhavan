const express = require('express');
const router = express.Router();
const aiAdvisorController = require('../controllers/aiAdvisorController');

// POST /api/ai-advisor
router.post('/ai-advisor', aiAdvisorController.getAdvice);

// GET /api/ai-advisor/quick
router.get('/ai-advisor/quick', aiAdvisorController.quickAdvice);

module.exports = router;
