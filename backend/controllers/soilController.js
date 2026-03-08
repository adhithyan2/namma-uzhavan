const SoilHealth = require('../models/SoilHealth');
const SoilMoistureReading = require('../models/SoilMoistureReading');

const soilController = {
  // POST /api/soil-health - Add new soil health record
  addSoilHealth: async (req, res) => {
    try {
      const { farmerId, N, P, K, ph, organicMatter, district, village } = req.body;

      const soilHealth = new SoilHealth({
        farmerId,
        N: Number(N) || 0,
        P: Number(P) || 0,
        K: Number(K) || 0,
        ph: Number(ph) || 7.0,
        organicMatter: Number(organicMatter) || 0,
        district,
        village,
        recordedAt: new Date()
      });

      await soilHealth.save();

      res.status(201).json({
        success: true,
        message: 'Soil health record added',
        data: soilHealth
      });
    } catch (error) {
      console.error('Add soil health error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add soil health record'
      });
    }
  },

  // GET /api/soil-health/:farmerId - Get farmer's soil health history
  getSoilHealth: async (req, res) => {
    try {
      const { farmerId } = req.params;
      const { limit = 10 } = req.query;

      const records = await SoilHealth.find({ farmerId })
        .sort({ recordedAt: -1 })
        .limit(Number(limit));

      const latest = records[0];
      const healthStatus = latest ? latest.getHealthStatus() : null;

      res.json({
        success: true,
        records,
        latest,
        healthStatus
      });
    } catch (error) {
      console.error('Get soil health error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get soil health records'
      });
    }
  },

  // POST /api/soil-moisture - IoT sensor data ingestion
  addSoilMoistureReading: async (req, res) => {
    try {
      const { 
        deviceId, 
        farmerId, 
        moisture0, 
        moisture1, 
        moisture2, 
        moisture3, 
        moisture4,
        temperature,
        humidity,
        irrigation,
        latitude,
        longitude,
        district,
        village
      } = req.body;

      if (!deviceId) {
        return res.status(400).json({
          success: false,
          message: 'Device ID is required'
        });
      }

      const reading = new SoilMoistureReading({
        deviceId,
        farmerId,
        location: {
          latitude: Number(latitude),
          longitude: Number(longitude),
          district,
          village
        },
        sensors: {
          moisture0: Number(moisture0),
          moisture1: Number(moisture1),
          moisture2: Number(moisture2),
          moisture3: Number(moisture3),
          moisture4: Number(moisture4),
          temperature: Number(temperature),
          humidity: Number(humidity)
        },
        irrigation: Boolean(irrigation),
        recordedAt: new Date()
      });

      await reading.save();

      res.status(201).json({
        success: true,
        message: 'Soil moisture reading saved',
        data: reading
      });
    } catch (error) {
      console.error('Add soil moisture error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to save soil moisture reading'
      });
    }
  },

  // GET /api/soil-moisture/:deviceId - Get device readings
  getSoilMoistureReadings: async (req, res) => {
    try {
      const { deviceId } = req.params;
      const { limit = 50, from, to } = req.query;

      const query = { deviceId };
      
      if (from || to) {
        query.recordedAt = {};
        if (from) query.recordedAt.$gte = new Date(from);
        if (to) query.recordedAt.$lte = new Date(to);
      }

      const readings = await SoilMoistureReading.find(query)
        .sort({ recordedAt: -1 })
        .limit(Number(limit));

      // Calculate statistics
      const stats = readings.length > 0 ? {
        count: readings.length,
        latest: readings[0],
        avgMoisture: readings.reduce((sum, r) => sum + r.averageMoisture, 0) / readings.length,
        avgTemperature: readings.reduce((sum, r) => sum + (r.sensors.temperature || 0), 0) / readings.length,
        irrigationCount: readings.filter(r => r.irrigation).length
      } : null;

      res.json({
        success: true,
        readings,
        stats
      });
    } catch (error) {
      console.error('Get soil moisture error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get soil moisture readings'
      });
    }
  },

  // GET /api/soil-moisture/latest/:deviceId - Get latest reading
  getLatestReading: async (req, res) => {
    try {
      const { deviceId } = req.params;

      const reading = await SoilMoistureReading.findOne({ deviceId })
        .sort({ recordedAt: -1 });

      if (!reading) {
        return res.status(404).json({
          success: false,
          message: 'No readings found for this device'
        });
      }

      res.json({
        success: true,
        reading
      });
    } catch (error) {
      console.error('Get latest reading error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get latest reading'
      });
    }
  }
};

module.exports = soilController;
