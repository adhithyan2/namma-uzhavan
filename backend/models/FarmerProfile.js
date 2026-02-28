const mongoose = require('mongoose');

const farmerProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  farmerName: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  landArea: {
    type: Number,
    required: true
  },
  soilType: {
    type: String,
    required: true,
    enum: ['Loamy', 'Sandy', 'Clay', 'Silty', 'Peaty', 'Chalky']
  },
  farmingType: [{
    type: String,
    enum: ['Paddy', 'Wheat', 'Millets', 'Vegetables', 'Cotton', 'Sugarcane']
  }],
  irrigationType: {
    type: String,
    required: true,
    enum: ['Rain-fed', 'Canal', 'Drip', 'Sprinkler', 'Tubewell']
  },
  experience: {
    type: Number,
    required: true
  },
  location: {
    type: String,
    default: 'Delhi'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('FarmerProfile', farmerProfileSchema);
