const mongoose = require('mongoose');

const dealerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  pricePerKg: {
    type: Number,
    required: true
  },
  contact: {
    type: String,
    required: true
  },
  wasteTypes: [{
    type: String,
    enum: ['Crop Residue', 'Vegetable Waste', 'Animal Waste']
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Dealer', dealerSchema);
