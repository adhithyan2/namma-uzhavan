const weatherService = require('../services/weatherService');

const weatherController = {
  // GET /api/weather
  getCurrentWeather: async (req, res) => {
    try {
      const { city } = req.query;
      
      if (!city) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a city name'
        });
      }

      const result = await weatherService.getCurrentWeather(city);
      res.json(result);
    } catch (error) {
      console.error('Weather error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch weather data'
      });
    }
  },

  // GET /api/weather/forecast
  getForecast: async (req, res) => {
    try {
      const { city, days = 7 } = req.query;
      
      if (!city) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a city name'
        });
      }

      const result = await weatherService.getForecast(city, Number(days));
      res.json(result);
    } catch (error) {
      console.error('Forecast error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch forecast data'
      });
    }
  },

  // GET /api/weather/current - Combined current + forecast
  getWeatherComplete: async (req, res) => {
    try {
      const { city } = req.query;
      
      if (!city) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a city name'
        });
      }

      const [current, forecast] = await Promise.all([
        weatherService.getCurrentWeather(city),
        weatherService.getForecast(city, 7)
      ]);

      res.json({
        success: true,
        current: current.current,
        forecast: forecast.forecast
      });
    } catch (error) {
      console.error('Complete weather error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch weather data'
      });
    }
  }
};

module.exports = weatherController;
