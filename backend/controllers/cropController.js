const cropRecommendationService = require('../services/cropRecommendationService');

const cropRecommendationController = {
  // POST /api/crop-recommendation
  recommend: (req, res) => {
    try {
      const { N, P, K, temperature, humidity, ph, rainfall, district } = req.body;

      // Validate required fields
      if (!temperature || !humidity || !rainfall) {
        return res.status(400).json({
          success: false,
          message: 'Please provide temperature, humidity, and rainfall values'
        });
      }

      const result = cropRecommendationService.recommend({
        N: Number(N) || 60,
        P: Number(P) || 55,
        K: Number(K) || 45,
        temperature: Number(temperature),
        humidity: Number(humidity),
        ph: Number(ph) || 6.5,
        rainfall: Number(rainfall),
        district: district || 'Coimbatore'
      });

      res.json(result);
    } catch (error) {
      console.error('Crop recommendation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate crop recommendations'
      });
    }
  },

  // GET /api/crops - Legacy endpoint
  getAllCrops: (req, res) => {
    try {
      const { N, P, K, temperature, humidity, ph, rainfall } = req.query;

      const result = cropRecommendationService.recommend({
        N: Number(N) || 60,
        P: Number(P) || 55,
        K: Number(K) || 45,
        temperature: Number(temperature) || 25,
        humidity: Number(humidity) || 70,
        ph: Number(ph) || 6.5,
        rainfall: Number(rainfall) || 150
      });

      res.json(result.recommendations || []);
    } catch (error) {
      console.error('Get crops error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get crops'
      });
    }
  }
};

module.exports = cropRecommendationController;
