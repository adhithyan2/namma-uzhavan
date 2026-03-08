const aiAdvisorService = require('../services/aiAdvisorService');

const aiAdvisorController = {
  // POST /api/ai-advisor
  getAdvice: (req, res) => {
    try {
      const { 
        soilMoisture, 
        temperature, 
        humidity, 
        rainfall, 
        ph, 
        crop, 
        language = 'en' 
      } = req.body;

      // Validate at least one input
      if (!soilMoisture && !temperature && !humidity && !rainfall && !ph) {
        return res.status(400).json({
          success: false,
          message: 'Please provide at least one parameter (soilMoisture, temperature, humidity, rainfall, or ph)'
        });
      }

      const result = aiAdvisorService.getAdvice({
        soilMoisture: Number(soilMoisture),
        temperature: Number(temperature),
        humidity: Number(humidity),
        rainfall: Number(rainfall),
        ph: Number(ph),
        crop,
        language
      });

      res.json(result);
    } catch (error) {
      console.error('AI Advisor error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate farming advice'
      });
    }
  },

  // GET /api/ai-advisor/quick - Quick advice with just soil moisture
  quickAdvice: (req, res) => {
    try {
      const { moisture, temp, crop, lang = 'en' } = req.query;

      const result = aiAdvisorService.getAdvice({
        soilMoisture: moisture ? Number(moisture) : undefined,
        temperature: temp ? Number(temp) : undefined,
        crop,
        language: lang
      });

      res.json(result);
    } catch (error) {
      console.error('Quick advice error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate advice'
      });
    }
  }
};

module.exports = aiAdvisorController;
