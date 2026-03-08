const CropHealth = require('../models/CropHealth');

const cropHealthController = {
  // POST /api/crop-health - Add new crop health record
  addCropHealth: async (req, res) => {
    try {
      const { 
        farmerId, 
        landRecordId, 
        crop, 
        sowingDate, 
        expectedHarvest,
        latitude, 
        longitude,
        area,
        district,
        village,
        health,
        irrigation,
        estimatedYield,
        notes
      } = req.body;

      const cropHealth = new CropHealth({
        farmerId,
        landRecordId,
        crop,
        sowingDate: sowingDate ? new Date(sowingDate) : undefined,
        expectedHarvest: expectedHarvest ? new Date(expectedHarvest) : undefined,
        location: {
          latitude: Number(latitude),
          longitude: Number(longitude),
          area: Number(area),
          district,
          village
        },
        health: {
          status: health?.status || 'Healthy',
          ndvi: health?.ndvi,
          leafGreenness: health?.leafGreenness,
          moistureLevel: health?.moistureLevel,
          pestDamage: health?.pestDamage || 'None',
          diseaseSigns: health?.diseaseSigns || [],
          lastChecked: new Date()
        },
        irrigation: {
          type: irrigation?.type || 'Rain-fed',
          schedule: irrigation?.schedule,
          lastIrrigated: irrigation?.lastIrrigated ? new Date(irrigation.lastIrrigated) : undefined
        },
        estimatedYield: {
          value: Number(estimatedYield?.value),
          unit: estimatedYield?.unit || 'quintals'
        },
        notes,
        updatedAt: new Date()
      });

      await cropHealth.save();

      res.status(201).json({
        success: true,
        message: 'Crop health record added',
        data: cropHealth
      });
    } catch (error) {
      console.error('Add crop health error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add crop health record'
      });
    }
  },

  // GET /api/crop-health/:farmerId - Get all crop health records for a farmer
  getFarmerCropHealth: async (req, res) => {
    try {
      const { farmerId } = req.params;

      const records = await CropHealth.find({ farmerId })
        .sort({ updatedAt: -1 });

      res.json({
        success: true,
        records
      });
    } catch (error) {
      console.error('Get crop health error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get crop health records'
      });
    }
  },

  // GET /api/crop-health/map/:district - Get all crop health in a district for map view
  getDistrictCropHealth: async (req, res) => {
    try {
      const { district } = req.params;
      const { status } = req.query;

      const query = {};
      if (district) query['location.district'] = district;
      if (status) query['health.status'] = status;

      const records = await CropHealth.find(query)
        .populate('farmerId', 'name phone')
        .sort({ updatedAt: -1 });

      // Format for map display
      const mapData = records.map(r => ({
        id: r._id,
        crop: r.crop,
        status: r.health.status,
        coordinates: {
          lat: r.location.latitude,
          lng: r.location.longitude
        },
        area: r.location.area,
        village: r.location.village,
        farmer: r.farmerId?.name,
        moistureLevel: r.health.moistureLevel,
        lastChecked: r.health.lastChecked
      }));

      res.json({
        success: true,
        records: mapData,
        summary: {
          total: records.length,
          healthy: records.filter(r => r.health.status === 'Healthy').length,
          moderate: records.filter(r => r.health.status === 'Moderate').length,
          stress: records.filter(r => r.health.status === 'Stress').length,
          critical: records.filter(r => r.health.status === 'Critical').length
        }
      });
    } catch (error) {
      console.error('Get district crop health error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get crop health map data'
      });
    }
  },

  // PUT /api/crop-health/:id - Update crop health
  updateCropHealth: async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const cropHealth = await CropHealth.findByIdAndUpdate(
        id,
        { 
          ...updates,
          'health.lastChecked': new Date(),
          updatedAt: new Date()
        },
        { new: true }
      );

      if (!cropHealth) {
        return res.status(404).json({
          success: false,
          message: 'Crop health record not found'
        });
      }

      res.json({
        success: true,
        message: 'Crop health updated',
        data: cropHealth
      });
    } catch (error) {
      console.error('Update crop health error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update crop health'
      });
    }
  },

  // DELETE /api/crop-health/:id - Delete crop health record
  deleteCropHealth: async (req, res) => {
    try {
      const { id } = req.params;

      const cropHealth = await CropHealth.findByIdAndDelete(id);

      if (!cropHealth) {
        return res.status(404).json({
          success: false,
          message: 'Crop health record not found'
        });
      }

      res.json({
        success: true,
        message: 'Crop health record deleted'
      });
    } catch (error) {
      console.error('Delete crop health error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete crop health record'
      });
    }
  }
};

module.exports = cropHealthController;
