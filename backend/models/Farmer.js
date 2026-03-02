const mongoose = require('mongoose');

const farmerSchema = new mongoose.Schema({
  farmerName: { type: String, required: true },
  age: String,
  aadhaarNo: String,
  phoneNo: String,
  email: String,
  password: String,
  village: String,
  district: String,
  state: String,
  landSize: String,
  soilType: String,
  irrigationType: String,
  currentCrop: String,
  season: String,
  photo: String,
  riskLevel: { type: String, default: 'Low' },
  registeredDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Farmer', farmerSchema);
