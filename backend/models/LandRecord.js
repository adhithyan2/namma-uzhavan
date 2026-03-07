const mongoose = require('mongoose');

const landRecordSchema = new mongoose.Schema({
  ownerName: { type: String, required: true },
  aadhaarNumber: String,
  pattaNumber: { type: String, required: true },
  surveyNumber: { type: String, required: true },
  village: String,
  taluk: String,
  district: String,
  landSize: String,
  landType: String,
  currentCrop: String,
  guidelineValue: Number,
  lastSalePrice: Number,
  lastSaleDate: Date,
  createdAt: { type: Date, default: Date.now }
});

const saleHistorySchema = new mongoose.Schema({
  surveyNumber: String,
  previousOwner: String,
  buyerName: String,
  saleAmount: Number,
  saleDate: Date
});

const landDocumentSchema = new mongoose.Schema({
  surveyNumber: String,
  documentType: String,
  fileName: String,
  filePath: String,
  uploadedAt: { type: Date, default: Date.now }
});

const LandRecord = mongoose.model('LandRecord', landRecordSchema);
const SaleHistory = mongoose.model('SaleHistory', saleHistorySchema);
const LandDocument = mongoose.model('LandDocument', landDocumentSchema);

module.exports = { LandRecord, SaleHistory, LandDocument };
