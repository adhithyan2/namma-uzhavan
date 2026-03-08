const mongoose = require('mongoose');

const soilHealthSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: true
  },
  district: { type: String, default: '' },
  village: { type: String, default: '' },
  N: { type: Number, default: 0 }, // Nitrogen
  P: { type: Number, default: 0 }, // Phosphorus
  K: { type: Number, default: 0 }, // Potassium
  ph: { type: Number, default: 7.0 },
  organicMatter: { type: Number, default: 0 }, // Percentage
  moisture: { type: Number, default: 0 },
  recordedAt: { type: Date, default: Date.now }
});

soilHealthSchema.methods.getHealthStatus = function() {
  const status = {
    N: this.getNStatus(),
    P: this.getPStatus(),
    K: this.getKStatus(),
    ph: this.getPhStatus()
  };
  
  const overall = Object.values(status).every(s => s.status === 'Optimal') ? 'Optimal' :
                 Object.values(status).some(s => s.status === 'Critical') ? 'Critical' : 'Moderate';
  
  return { ...status, overall };
};

soilHealthSchema.methods.getNStatus = function() {
  const n = this.N;
  if (n < 20) return { value: n, status: 'Critical', recommendation: 'Apply urea immediately' };
  if (n < 40) return { value: n, status: 'Low', recommendation: 'Apply nitrogen fertilizer' };
  if (n < 60) return { value: n, status: 'Optimal', recommendation: 'Nitrogen level is good' };
  if (n < 80) return { value: n, status: 'High', recommendation: 'Reduce nitrogen application' };
  return { value: n, status: 'Very High', recommendation: 'Excess nitrogen - avoid fertilizer' };
};

soilHealthSchema.methods.getPStatus = function() {
  const p = this.P;
  if (p < 10) return { value: p, status: 'Critical', recommendation: 'Apply DAP immediately' };
  if (p < 20) return { value: p, status: 'Low', recommendation: 'Apply phosphorus fertilizer' };
  if (p < 35) return { value: p, status: 'Optimal', recommendation: 'Phosphorus level is good' };
  if (p < 50) return { value: p, status: 'High', recommendation: 'Reduce phosphorus application' };
  return { value: p, status: 'Very High', recommendation: 'Excess phosphorus' };
};

soilHealthSchema.methods.getKStatus = function() {
  const k = this.K;
  if (k < 15) return { value: k, status: 'Critical', recommendation: 'Apply potash immediately' };
  if (k < 25) return { value: k, status: 'Low', recommendation: 'Apply potassium fertilizer' };
  if (k < 40) return { value: k, status: 'Optimal', recommendation: 'Potassium level is good' };
  if (k < 55) return { value: k, status: 'High', recommendation: 'Reduce potassium application' };
  return { value: k, status: 'Very High', recommendation: 'Excess potassium' };
};

soilHealthSchema.methods.getPhStatus = function() {
  const ph = this.ph;
  if (ph < 5.0) return { value: ph, status: 'Critical', recommendation: 'Very acidic - apply lime' };
  if (ph < 5.5) return { value: ph, status: 'Acidic', recommendation: 'Apply lime to raise pH' };
  if (ph < 6.0) return { value: ph, status: 'Slightly Acidic', recommendation: 'Suitable for most crops' };
  if (ph <= 7.0) return { value: ph, status: 'Optimal', recommendation: 'Ideal pH for crops' };
  if (ph <= 7.5) return { value: ph, status: 'Slightly Alkaline', recommendation: 'Suitable for most crops' };
  if (ph <= 8.0) return { value: ph, status: 'Alkaline', recommendation: 'Apply gypsum to lower pH' };
  return { value: ph, status: 'Critical', recommendation: 'Very alkaline - apply sulfur' };
};

const SoilHealth = mongoose.model('SoilHealth', soilHealthSchema);

module.exports = SoilHealth;
