const fs = require('fs');
const path = require('path');

class CropRecommendationService {
  constructor() {
    this.dataset = [];
    this.loadDataset();
  }

  loadDataset() {
    try {
      const csvPath = path.join(__dirname, '../data/Crop_recommendation.csv');
      const csvData = fs.readFileSync(csvPath, 'utf8');
      const lines = csvData.split('\n').slice(1);
      
      this.dataset = lines.filter(line => line.trim()).map(line => {
        const parts = line.split(',');
        if (parts.length >= 8) {
          return {
            N: parseFloat(parts[0]),
            P: parseFloat(parts[1]),
            K: parseFloat(parts[2]),
            temperature: parseFloat(parts[3]),
            humidity: parseFloat(parts[4]),
            ph: parseFloat(parts[5]),
            rainfall: parseFloat(parts[6]),
            label: parts[7].trim()
          };
        }
        return null;
      }).filter(c => c !== null);

      console.log(`CropRecommendationService: Loaded ${this.dataset.length} crop records`);
    } catch (err) {
      console.log('CropRecommendationService: Could not load dataset', err.message);
    }
  }

  // Calculate similarity score between input and crop requirements
  calculateScore(input, cropData) {
    const weights = {
      N: 0.15,
      P: 0.15,
      K: 0.15,
      temperature: 0.20,
      humidity: 0.15,
      ph: 0.10,
      rainfall: 0.10
    };

    let score = 0;
    
    // NPK differences (normalized)
    const nDiff = Math.abs(input.N - cropData.N) / 100;
    const pDiff = Math.abs(input.P - cropData.P) / 100;
    const kDiff = Math.abs(input.K - cropData.K) / 100;
    
    // Temperature difference
    const tempDiff = Math.abs(input.temperature - cropData.temperature) / 30;
    
    // Humidity difference
    const humDiff = Math.abs(input.humidity - cropData.humidity) / 100;
    
    // pH difference
    const phDiff = Math.abs(input.ph - cropData.ph) / 7;
    
    // Rainfall difference
    const rainDiff = Math.abs(input.rainfall - cropData.rainfall) / 200;

    score = 1 - (
      weights.N * Math.min(nDiff, 1) +
      weights.P * Math.min(pDiff, 1) +
      weights.K * Math.min(kDiff, 1) +
      weights.temperature * Math.min(tempDiff, 1) +
      weights.humidity * Math.min(humDiff, 1) +
      weights.ph * Math.min(phDiff, 1) +
      weights.rainfall * Math.min(rainDiff, 1)
    );

    return Math.max(0, score);
  }

  // Get crop recommendations based on soil and weather
  recommend(input) {
    const {
      N = 60,
      P = 55,
      K = 45,
      temperature = 25,
      humidity = 70,
      ph = 6.5,
      rainfall = 150,
      district = 'Coimbatore'
    } = input;

    const cropScores = {};
    const cropCounts = {};

    // Calculate average scores for each crop
    this.dataset.forEach(data => {
      if (!cropScores[data.label]) {
        cropScores[data.label] = 0;
        cropCounts[data.label] = 0;
      }
      cropScores[data.label] += this.calculateScore(
        { N, P, K, temperature, humidity, ph, rainfall },
        data
      );
      cropCounts[data.label]++;
    });

    // Calculate average scores and sort
    const recommendations = Object.keys(cropScores).map(crop => ({
      crop: crop.charAt(0).toUpperCase() + crop.slice(1),
      score: cropScores[crop] / cropCounts[crop],
      probability: (cropScores[crop] / cropCounts[crop]).toFixed(2),
      profitability: this.getProfitability(crop),
      season: this.getSeason(crop),
      waterRequirement: this.getWaterRequirement(crop),
      daysToHarvest: this.getDaysToHarvest(crop)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

    return {
      success: true,
      input: { N, P, K, temperature, humidity, ph, rainfall, district },
      recommendations,
      bestCrop: recommendations[0],
      alternatives: recommendations.slice(1, 4)
    };
  }

  getProfitability(crop) {
    const profits = {
      rice: 'High',
      wheat: 'Medium',
      maize: 'High',
      cotton: 'High',
      sugarcane: 'High',
      potato: 'Medium',
      tomato: 'High',
      onion: 'Medium',
      mango: 'Very High',
      banana: 'High',
      coconut: 'High',
      groundnut: 'Medium',
      soybean: 'Medium',
      sunflower: 'Medium',
      mustard: 'Medium',
      gram: 'Medium',
      lentil: 'Medium',
      pigeonpea: 'Medium',
      millets: 'Low',
      jute: 'Medium'
    };
    return profits[crop.toLowerCase()] || 'Medium';
  }

  getSeason(crop) {
    const seasons = {
      rice: 'Kharif (Jun-Oct)',
      maize: 'Rabi & Kharif',
      wheat: 'Rabi (Nov-Apr)',
      cotton: 'Kharif (Jun-Oct)',
      sugarcane: 'Annual',
      mango: 'Spring',
      banana: 'Year-round',
      coconut: 'Year-round'
    };
    return seasons[crop.toLowerCase()] || 'Kharif';
  }

  getWaterRequirement(crop) {
    const requirements = {
      rice: 'High',
      wheat: 'Medium',
      maize: 'Medium',
      cotton: 'Medium',
      sugarcane: 'High',
      mango: 'Low',
      banana: 'High',
      coconut: 'Medium'
    };
    return requirements[crop.toLowerCase()] || 'Medium';
  }

  getDaysToHarvest(crop) {
    const days = {
      rice: '120-150',
      wheat: '120-150',
      maize: '80-120',
      cotton: '150-180',
      sugarcane: '12-18 months',
      mango: '3-5 years',
      banana: '9-12 months',
      coconut: '5-7 years'
    };
    return days[crop.toLowerCase()] || '90-120';
  }
}

module.exports = new CropRecommendationService();
