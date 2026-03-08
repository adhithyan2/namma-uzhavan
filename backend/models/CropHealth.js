const mongoose = require('mongoose');

const cropHealthSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: true
  },
  landRecordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LandRecord'
  },
  crop: { type: String, required: true },
  sowingDate: Date,
  expectedHarvest: Date,
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    area: Number, // in acres
    district: String,
    village: String
  },
  health: {
    status: {
      type: String,
      enum: ['Healthy', 'Moderate', 'Stress', 'Critical'],
      default: 'Healthy'
    },
    ndvi: Number, // Normalized Difference Vegetation Index
    leafGreenness: Number,
    moistureLevel: Number,
    pestDamage: { type: String, enum: ['None', 'Minor', 'Moderate', 'Severe'], default: 'None' },
    diseaseSigns: [String],
    lastChecked: Date
  },
  irrigation: {
    type: { type: String, enum: ['Drip', 'Sprinkler', 'Flood', 'Rain-fed'], default: 'Rain-fed' },
    schedule: String,
    lastIrrigated: Date
  },
  fertilizer: {
    applied: [{ type: String, date: Date, quantity: Number }],
    nextApplication: Date
  },
  estimatedYield: {
    value: Number,
    unit: { type: String, default: 'quintals' }
  },
  marketPrice: Number,
  notes: String,
  updatedAt: { type: Date, default: Date.now }
});

cropHealthSchema.index({ 'location.latitude': 1, 'location.longitude': 1 });
cropHealthSchema.index({ farmerId: 1 });
cropHealthSchema.index({ 'health.status': 1 });

const CropHealth = mongoose.model('CropHealth', cropHealthSchema);

module.exports = CropHealth;
