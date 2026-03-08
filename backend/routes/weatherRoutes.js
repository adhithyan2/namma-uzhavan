const express = require('express');
const router = express.Router();
const weatherController = require('../controllers/weatherController');

// GET /api/weather
router.get('/weather', weatherController.getCurrentWeather);

// GET /api/weather/forecast
router.get('/weather/forecast', weatherController.getForecast);

// GET /api/weather/current - Combined
router.get('/weather/current', weatherController.getWeatherComplete);

module.exports = router;
