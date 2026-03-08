const mongoose = require('mongoose');

const soilMoistureReadingSchema = new mongoose.Schema({
  deviceId: { type: String, required: true },
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer' },
  location: {
    latitude: Number,
    longitude: Number,
    district: String,
    village: String
  },
  sensors: {
    moisture0: Number,
    moisture1: Number,
    moisture2: Number,
    moisture3: Number,
    moisture4: Number,
    temperature: Number,
    humidity: Number
  },
  irrigation: { type: Boolean, default: false },
  recordedAt: { type: Date, default: Date.now }
});

soilMoistureReadingSchema.index({ deviceId: 1, recordedAt: -1 });
soilMoistureReadingSchema.index({ farmerId: 1, recordedAt: -1 });

soilMoistureReadingSchema.virtual('averageMoisture').get(function() {
  const values = [
    this.sensors.moisture0,
    this.sensors.moisture1,
    this.sensors.moisture2,
    this.sensors.moisture3,
    this.sensors.moisture4
  ].filter(v => v !== undefined && v !== null);
  
  return values.length > 0 
    ? values.reduce((a, b) => a + b, 0) / values.length 
    : 0;
});

soilMoistureReadingSchema.set('toJSON', { virtuals: true });

const SoilMoistureReading = mongoose.model('SoilMoistureReading', soilMoistureReadingSchema);

module.exports = SoilMoistureReading;
