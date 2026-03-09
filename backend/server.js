const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const User = require('./models/User');
const FarmerProfile = require('./models/FarmerProfile');
const Product = require('./models/Product');
const Dealer = require('./models/Dealer');
const Farmer = require('./models/Farmer');
const { LandRecord, SaleHistory, LandDocument } = require('./models/LandRecord');
const SoilHealth = require('./models/SoilHealth');
const SoilMoistureReading = require('./models/SoilMoistureReading');
const CropHealth = require('./models/CropHealth');

// Import Routes
const cropRoutes = require('./routes/cropRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const aiAdvisorRoutes = require('./routes/aiAdvisorRoutes');
const soilRoutes = require('./routes/soilRoutes');
const cropHealthRoutes = require('./routes/cropHealthRoutes');

let farmers = [];

// Load Kaggle Crop Dataset
let cropDataset = [];
try {
    const csvData = fs.readFileSync(path.join(__dirname, 'data/Crop_recommendation.csv'), 'utf8');
    const lines = csvData.split('\n').slice(1); // Skip header
    lines.forEach(line => {
        const parts = line.split(',');
        if (parts.length >= 8) {
            cropDataset.push({
                N: parseFloat(parts[0]),
                P: parseFloat(parts[1]),
                K: parseFloat(parts[2]),
                temperature: parseFloat(parts[3]),
                humidity: parseFloat(parts[4]),
                ph: parseFloat(parts[5]),
                rainfall: parseFloat(parts[6]),
                label: parts[7].trim()
            });
        }
    });
    console.log(`Loaded ${cropDataset.length} crop records from Kaggle dataset`);
} catch (err) {
    console.log('Could not load Kaggle dataset:', err.message);
}

// Get unique crops from dataset
const kaggleCrops = [...new Set(cropDataset.map(d => d.label))];
console.log('Crops in dataset:', kaggleCrops.join(', '));

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'climate_crop_secret_key_2024';
const WEATHER_API_KEY = process.env.WEATHER_API_KEY || '09043d37fbaf47dc1c785458c7385a7c';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api', cropRoutes);
app.use('/api', weatherRoutes);
app.use('/api', aiAdvisorRoutes);
app.use('/api', soilRoutes);
app.use('/api', cropHealthRoutes);

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/climate_crop_engine';
console.log('MongoDB URI:', mongoUri ? mongoUri.substring(0, 30) + '...' : 'NOT SET');
mongoose.connect(mongoUri).then(() => {
  console.log('Connected to MongoDB');
  seedData();
}).catch(err => console.error('MongoDB connection error:', err.message));

// JWT Middleware
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ error: 'Access denied' });

  try {
    const verified = jwt.verify(token.split(' ')[1], JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

// Seed initial data
async function seedData() {
  const productCount = await Product.countDocuments();
  if (productCount === 0) {
    const products = [
      { name: 'Basmati Rice Seeds Premium', brand: 'India Seeds', category: 'Seeds', price: 450, rating: 4.5, dealerName: 'AgriCare Ltd', reviews: 120 },
      { name: 'Wheat Seeds HD-2329', brand: 'Govt Seeds', category: 'Seeds', price: 280, rating: 4.2, dealerName: 'Farmers Choice', reviews: 89 },
      { name: 'Urea Fertilizer 46-0-0', brand: 'IFFCO', category: 'Fertilizers', price: 320, rating: 4.7, dealerName: 'AgriCare Ltd', reviews: 234 },
      { name: 'DAP Fertilizer 18-46-0', brand: 'IPL', category: 'Fertilizers', price: 1350, rating: 4.4, dealerName: 'Farmers Choice', reviews: 156 },
      { name: 'NPK 10-26-26', brand: 'Coromandel', category: 'Fertilizers', price: 1200, rating: 4.3, dealerName: 'AgriPro', reviews: 98 },
      { name: 'Imidacloprid Pesticide', brand: 'Bayer', category: 'Pesticides', price: 450, rating: 4.6, dealerName: 'CropGuard', reviews: 178 },
      { name: 'Chlorpyrifos Insecticide', brand: 'Dow', category: 'Pesticides', price: 380, rating: 4.1, dealerName: 'CropGuard', reviews: 145 },
      { name: 'Drip Irrigation Kit', brand: 'Jain Irrigation', category: 'Irrigation Equipment', price: 8500, rating: 4.8, dealerName: 'Irrigation Pro', reviews: 67 },
      { name: 'Sprinkler System', brand: 'Finolex', category: 'Irrigation Equipment', price: 4200, rating: 4.3, dealerName: 'Irrigation Pro', reviews: 52 },
      { name: 'Cotton Seeds BT', brand: 'Monsanto', category: 'Seeds', price: 750, rating: 4.4, dealerName: 'AgriPro', reviews: 203 },
      { name: 'Vermicompost 1kg', brand: 'Organic Gold', category: 'Fertilizers', price: 45, rating: 4.5, dealerName: 'Organic Store', reviews: 89 },
      { name: 'Neem Pesticide', brand: 'Patanjali', category: 'Pesticides', price: 180, rating: 4.2, dealerName: 'Organic Store', reviews: 112 }
    ];
    await Product.insertMany(products);
    console.log('Products seeded');
  }

  const dealerCount = await Dealer.countDocuments();
  if (dealerCount === 0) {
    const dealers = [
      { name: 'Green Waste Management', location: 'Delhi', pricePerKg: 3, contact: '9876543210', wasteTypes: ['Crop Residue', 'Vegetable Waste'] },
      { name: 'BioEnergy Solutions', location: 'Haryana', pricePerKg: 4, contact: '9876543211', wasteTypes: ['Crop Residue', 'Animal Waste'] },
      { name: 'Organic Compost Dealers', location: 'UP', pricePerKg: 2.5, contact: '9876543212', wasteTypes: ['Vegetable Waste', 'Animal Waste'] },
      { name: 'Agro Waste Buyers', location: 'Punjab', pricePerKg: 3.5, contact: '9876543213', wasteTypes: ['Crop Residue'] },
      { name: 'Biogas Plant Operators', location: 'Maharashtra', pricePerKg: 5, contact: '9876543214', wasteTypes: ['Animal Waste', 'Vegetable Waste'] }
    ];
    await Dealer.insertMany(dealers);
    console.log('Dealers seeded');
  }
}

// ==================== ADVANCED CROP SCORING SYSTEM ====================

// Region-based crop preferences (increases score for regionally suitable crops)
const regionCrops = {
  // North India
  'delhi': { 'Wheat': 20, 'Mustard': 15, 'Rice': 10, 'Cotton': 10, 'Sugarcane': 5 },
  'haryana': { 'Wheat': 20, 'Mustard': 15, 'Cotton': 10, 'Rice': 5, 'Bajra': 10 },
  'punjab': { 'Wheat': 25, 'Rice': 15, 'Mustard': 10, 'Cotton': 5, 'Sugarcane': 5 },
  'up': { 'Wheat': 20, 'Rice': 15, 'Sugarcane': 10, 'Mustard': 10, 'Potato': 10 },
  'uttarakhand': { 'Wheat': 15, 'Rice': 10, 'Mustard': 10, 'Ragi': 15, 'Millets': 10 },
  'himachal': { 'Wheat': 10, 'Rice': 5, 'Apple': 20, 'Mustard': 10, 'Vegetables': 15 },
  'jammu': { 'Wheat': 15, 'Rice': 10, 'Mustard': 10, 'Vegetables': 15, 'Cotton': 5 },
  'rajasthan': { 'Bajra': 20, 'Cotton': 15, 'Mustard': 10, 'Wheat': 5, 'Millets': 15 },
  
  // South India
  'tamil nadu': { 'Rice': 20, 'Cotton': 15, 'Sugarcane': 10, 'Groundnut': 10, 'Millets': 5 },
  'karnataka': { 'Rice': 15, 'Cotton': 15, 'Sugarcane': 15, 'Groundnut': 10, 'Millets': 10 },
  'kerala': { 'Rice': 20, 'Rubber': 15, 'Pepper': 10, 'Cardamom': 10, 'Vegetables': 10 },
  'andhra': { 'Rice': 20, 'Cotton': 15, 'Groundnut': 10, 'Sugarcane': 10, 'Millets': 5 },
  'telangana': { 'Rice': 15, 'Cotton': 20, 'Groundnut': 10, 'Sugarcane': 10, 'Millets': 5 },
  
  // East India
  'west bengal': { 'Rice': 25, 'Jute': 15, 'Potato': 10, 'Mustard': 5, 'Vegetables': 10 },
  'odisha': { 'Rice': 20, 'Groundnut': 10, 'Cotton': 10, 'Millets': 10, 'Sugarcane': 5 },
  'bihar': { 'Rice': 20, 'Wheat': 15, 'Maize': 10, 'Potato': 10, 'Sugarcane': 5 },
  'jharkhand': { 'Rice': 15, 'Maize': 10, 'Millets': 15, 'Groundnut': 10, 'Vegetables': 10 },
  
  // West India
  'maharashtra': { 'Cotton': 20, 'Sugarcane': 15, 'Soybean': 10, 'Millets': 10, 'Grapes': 10 },
  'gujarat': { 'Cotton': 20, 'Groundnut': 15, 'Wheat': 10, 'Mustard': 5, 'Sugarcane': 10 },
  'goa': { 'Rice': 15, 'Cashew': 15, 'Mango': 10, 'Vegetables': 10, 'Coconut': 10 },
  
  // Central India
  'madhya pradesh': { 'Soybean': 20, 'Wheat': 15, 'Cotton': 10, 'Mustard': 10, 'Rice': 5 },
  'chhattisgarh': { 'Rice': 20, 'Soybean': 10, 'Millets': 10, 'Groundnut': 5, 'Vegetables': 10 },
  
  // Northeast India
  'assam': { 'Rice': 20, 'Tea': 15, 'Mustard': 10, 'Vegetables': 10, 'Cotton': 5 },
  'meghalaya': { 'Rice': 15, 'Vegetables': 15, 'Tea': 10, 'Maize': 10, 'Potato': 10 },
  'manipur': { 'Rice': 20, 'Vegetables': 15, 'Maize': 10, 'Mustard': 5, 'Soybean': 5 },
  'nagaland': { 'Rice': 15, 'Vegetables': 15, 'Maize': 10, 'Mustard': 10, 'Cotton': 5 },
  'arunachal': { 'Rice': 15, 'Vegetables': 20, 'Maize': 10, 'Mustard': 5, 'Tea': 10 },
  'tripura': { 'Rice': 20, 'Rubber': 10, 'Vegetables': 10, 'Mustard': 5, 'Cotton': 5 },
  'mizoram': { 'Rice': 15, 'Vegetables': 20, 'Maize': 10, 'Mustard': 5, 'Cotton': 5 },
  
  // Union Territories
  'puducherry': { 'Rice': 20, 'Groundnut': 10, 'Sugarcane': 10, 'Cotton': 5, 'Vegetables': 10 },
  'chandigarh': { 'Wheat': 15, 'Vegetables': 15, 'Rice': 5, 'Mustard': 10, 'Millets': 5 }
};

function getRegionScore(location, cropName) {
  if (!location) return 0;
  const loc = location.toLowerCase();
  
  for (const [region, crops] of Object.entries(regionCrops)) {
    if (loc.includes(region)) {
      return crops[cropName] || 0;
    }
  }
  return 0;
}

function calculateCropScore(temp, rain, soilType, location = '') {
  const crops = [
    { name: 'Wheat', nameKey: 'Wheat', minTemp: 15, maxTemp: 25, optimalTemp: 20, minRain: 400, maxRain: 500, soilPref: ['Loamy', 'Clay'], waterNeed: 'Medium', risk: 'Low' },
    { name: 'Potato', nameKey: 'Potato', minTemp: 15, maxTemp: 25, optimalTemp: 18, minRain: 500, maxRain: 700, soilPref: ['Sandy', 'Loamy'], waterNeed: 'Medium', risk: 'Low' },
    { name: 'Rice', nameKey: 'Rice', minTemp: 20, maxTemp: 35, optimalTemp: 28, minRain: 1200, maxRain: 1500, soilPref: ['Clay', 'Loamy'], waterNeed: 'High', risk: 'Medium' },
    { name: 'Cotton', nameKey: 'Cotton', minTemp: 20, maxTemp: 35, optimalTemp: 28, minRain: 600, maxRain: 900, soilPref: ['Black', 'Clay'], waterNeed: 'Medium', risk: 'Medium' },
    { name: 'Millets', nameKey: 'Millets', minTemp: 25, maxTemp: 40, optimalTemp: 32, minRain: 300, maxRain: 400, soilPref: ['Sandy', 'Loamy'], waterNeed: 'Low', risk: 'Low' },
    { name: 'Sorghum', nameKey: 'Sorghum', minTemp: 25, maxTemp: 38, optimalTemp: 32, minRain: 400, maxRain: 600, soilPref: ['Sandy', 'Loamy'], waterNeed: 'Low', risk: 'Low' },
    { name: 'Bajra', nameKey: 'Bajra', minTemp: 25, maxTemp: 40, optimalTemp: 33, minRain: 250, maxRain: 350, soilPref: ['Sandy', 'Arid'], waterNeed: 'Low', risk: 'Low' },
    { name: 'Ragi', nameKey: 'Ragi', minTemp: 20, maxTemp: 35, optimalTemp: 28, minRain: 300, maxRain: 400, soilPref: ['Red', 'Laterite'], waterNeed: 'Low', risk: 'Low' },
    { name: 'Paddy', nameKey: 'Paddy', minTemp: 20, maxTemp: 35, optimalTemp: 28, minRain: 1200, maxRain: 1500, soilPref: ['Clay'], waterNeed: 'High', risk: 'Medium' },
    { name: 'Groundnut', nameKey: 'Groundnut', minTemp: 20, maxTemp: 35, optimalTemp: 28, minRain: 500, maxRain: 700, soilPref: ['Sandy', 'Loamy'], waterNeed: 'Medium', risk: 'Low' },
    { name: 'Mustard', nameKey: 'Mustard', minTemp: 10, maxTemp: 25, optimalTemp: 18, minRain: 300, maxRain: 400, soilPref: ['Loamy', 'Clay'], waterNeed: 'Low', risk: 'Low' },
    { name: 'Sugarcane', nameKey: 'Sugarcane', minTemp: 20, maxTemp: 35, optimalTemp: 28, minRain: 1500, maxRain: 2000, soilPref: ['Loamy', 'Alluvial'], waterNeed: 'High', risk: 'Medium' }
  ];

  const scoredCrops = crops.map(crop => {
    let tempScore = 0;
    let rainScore = 0;
    let soilScore = 100;

    // Temperature scoring
    if (temp >= crop.minTemp && temp <= crop.maxTemp) {
      const distFromOptimal = Math.abs(temp - crop.optimalTemp);
      tempScore = Math.max(0, 100 - (distFromOptimal * 10));
    } else {
      tempScore = Math.max(0, 50 - Math.min(Math.abs(temp - crop.minTemp), Math.abs(temp - crop.maxTemp)) * 5);
    }

    // Rainfall scoring
    if (rain >= crop.minRain && rain <= crop.maxRain) {
      const distFromOptimal = Math.abs(rain - (crop.minRain + crop.maxRain) / 2);
      rainScore = Math.max(0, 100 - (distFromOptimal / 10));
    } else if (rain < crop.minRain) {
      rainScore = Math.max(0, 100 - (crop.minRain - rain) / 10);
    } else {
      rainScore = Math.max(0, 100 - (rain - crop.maxRain) / 20);
    }

    // Soil scoring
    if (soilType && crop.soilPref.some(s => soilType.toLowerCase().includes(s.toLowerCase()))) {
      soilScore = 100;
    } else if (soilType) {
      soilScore = 60;
    }

    // Calculate final score with region bonus
    const regionBonus = getRegionScore(location, crop.name);
    const finalScore = ((tempScore * 0.35) + (rainScore * 0.35) + (soilScore * 0.15) + regionBonus);

    // Calculate risk percentage
    const riskPercentage = Math.max(0, 100 - finalScore);

    // Calculate money saving tip
    const moneySavingTip = getMoneySavingTip(crop, temp, rain);

    // Calculate estimated profit potential
    const profitPotential = calculateProfitPotential(crop, finalScore);

    return {
      crop: crop.name,
      score: Math.round(finalScore),
      tempScore: Math.round(tempScore),
      rainScore: Math.round(rainScore),
      soilScore: Math.round(soilScore),
      riskPercentage: Math.round(riskPercentage),
      waterNeed: crop.waterNeed,
      moneySavingTip,
      profitPotential,
      reason: getCropReason(crop, temp, rain)
    };
  });

  return scoredCrops.sort((a, b) => b.score - a.score).slice(0, 5);
}

function getMoneySavingTip(crop, temp, rain) {
  const tips = [];
  
  if (temp > 35) {
    tips.push('Use mulching to reduce water evaporation');
    tips.push('Water crops early morning or evening');
  }
  
  if (rain < 300) {
    tips.push('Install drip irrigation to save water');
    tips.push('Avoid water-intensive crops');
    if (crop.waterNeed === 'High') {
      tips.push(`Switch from ${crop.name} to drought-resistant varieties to save ₹10,000-15,000 per acre`);
    }
  }
  
  if (rain > 100) {
    tips.push('Ensure proper drainage to prevent waterlogging');
    tips.push('Avoid planting in low-lying areas');
  }
  
  if (crop.waterNeed === 'High' && rain < 500) {
    tips.push(`Replace ${crop.name} with low-water alternatives to save irrigation costs`);
  }

  return tips.length > 0 ? tips : ['Continue with current farming practices'];
}

function calculateProfitPotential(crop, score) {
  const baseProfit = {
    'Wheat': 25000,
    'Potato': 40000,
    'Rice': 35000,
    'Cotton': 45000,
    'Millets': 20000,
    'Sorghum': 22000,
    'Bajra': 18000,
    'Ragi': 20000,
    'Paddy': 35000,
    'Groundnut': 30000,
    'Mustard': 20000,
    'Sugarcane': 50000
  };

  const base = baseProfit[crop.name] || 25000;
  const adjustedProfit = base * (score / 100);
  
  return {
    estimatedProfit: Math.round(adjustedProfit),
    confidenceLevel: score > 70 ? 'High' : score > 50 ? 'Medium' : 'Low',
    perAcre: `₹${Math.round(adjustedProfit).toLocaleString()}`
  };
}

function getCropReason(crop, temp, rain) {
  if (temp >= crop.minTemp && temp <= crop.maxTemp) {
    return `Optimal temperature for ${crop.name} cultivation`;
  } else if (temp > crop.maxTemp) {
    return `Temperature is high - consider heat-tolerant varieties`;
  } else {
    return `Temperature is low - may affect germination`;
  }
}

// POST /signup
app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const user = new User({ name, email, password });
    await user.save();

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({ 
      message: 'Signup successful', 
      token, 
      user: { id: user._id, name: user.name, email: user.email } 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '24h' });

    res.json({ 
      message: 'Login successful', 
      token, 
      user: { id: user._id, name: user.name, email: user.email } 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /farmer-profile
app.post('/api/farmer-profile', authenticateToken, async (req, res) => {
  try {
    const { farmerName, phoneNumber, landArea, soilType, farmingType, irrigationType, experience, location } = req.body;

    const existingProfile = await FarmerProfile.findOne({ userId: req.user.id });
    if (existingProfile) {
      return res.status(400).json({ error: 'Profile already exists' });
    }

    const profile = new FarmerProfile({
      userId: req.user.id,
      farmerName,
      phoneNumber,
      landArea,
      soilType,
      farmingType,
      irrigationType,
      experience,
      location
    });

    await profile.save();
    res.status(201).json({ message: 'Profile created successfully', profile });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /farmer-profile
app.get('/api/farmer-profile', authenticateToken, async (req, res) => {
  try {
    const profile = await FarmerProfile.findOne({ userId: req.user.id });
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /farmer-profile
app.put('/api/farmer-profile', authenticateToken, async (req, res) => {
  try {
    const { farmerName, phoneNumber, landArea, soilType, farmingType, irrigationType, experience, location } = req.body;

    const profile = await FarmerProfile.findOneAndUpdate(
      { userId: req.user.id },
      { farmerName, phoneNumber, landArea, soilType, farmingType, irrigationType, experience, location },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json({ message: 'Profile updated successfully', profile });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /weather
app.get('/api/weather', async (req, res) => {
  try {
    const { location } = req.query;
    const city = location || 'Delhi';
    
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${WEATHER_API_KEY}&units=metric`
    );

    const data = response.data;
    res.json({
      temperature: data.main.temp,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      weatherCondition: data.weather[0].main,
      weatherIcon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
      location: data.name,
      description: data.weather[0].description
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

// GET /forecast
app.get('/api/forecast', async (req, res) => {
  try {
    const { location } = req.query;
    const city = location || 'Delhi';
    
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${WEATHER_API_KEY}&units=metric`
    );

    const forecasts = [];
    const dailyData = {};

    response.data.list.forEach(item => {
      const date = item.dt_txt.split(' ')[0];
      if (!dailyData[date] || item.dt_txt.includes('12:00:00')) {
        dailyData[date] = {
          date: date,
          temperature: item.main.temp,
          humidity: item.main.humidity,
          weatherCondition: item.weather[0].main,
          weatherIcon: `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`,
          windSpeed: item.wind.speed
        };
      }
    });

    Object.values(dailyData).slice(0, 7).forEach(day => {
      forecasts.push(day);
    });

    // Check for heatwave and drought
    const heatwave = forecasts.some(f => f.temperature > 38);
    const drought = forecasts.filter(f => f.humidity < 40).length >= 5;

    res.json({
      forecasts,
      alerts: {
        heatwave,
        drought
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch forecast data' });
  }
});

// ==================== KAGGLE DATASET BASED RECOMMENDATIONS ====================

function getKaggleBasedRecommendations(temperature, humidity, soilType) {
    if (cropDataset.length === 0) return [];
    
    // Convert humidity to approximate rainfall (mm)
    const rainfall = humidity * 4; // Approximate conversion
    
    const cropScores = {};
    
    // Calculate scores for each crop based on Kaggle data
    kaggleCrops.forEach(cropName => {
        const cropData = cropDataset.filter(d => d.label === cropName);
        if (cropData.length === 0) return;
        
        // Get average values for this crop from dataset
        const avgTemp = cropData.reduce((sum, d) => sum + d.temperature, 0) / cropData.length;
        const avgHumidity = cropData.reduce((sum, d) => sum + d.humidity, 0) / cropData.length;
        const avgRainfall = cropData.reduce((sum, d) => sum + d.rainfall, 0) / cropData.length;
        const avgPh = cropData.reduce((sum, d) => sum + d.ph, 0) / cropData.length;
        const avgN = cropData.reduce((sum, d) => sum + d.N, 0) / cropData.length;
        const avgP = cropData.reduce((sum, d) => sum + d.P, 0) / cropData.length;
        const avgK = cropData.reduce((sum, d) => sum + d.K, 0) / cropData.length;
        
        // Calculate similarity score (lower is better)
        const tempDiff = Math.abs(temperature - avgTemp);
        const humidityDiff = Math.abs(humidity - avgHumidity);
        const rainDiff = Math.abs(rainfall - avgRainfall);
        
        // Score calculation (0-100)
        const tempScore = Math.max(0, 100 - tempDiff * 10);
        const humidityScore = Math.max(0, 100 - humidityDiff * 2);
        const rainScore = Math.max(0, 100 - rainDiff * 0.5);
        
        const finalScore = (tempScore * 0.4 + humidityScore * 0.3 + rainScore * 0.3);
        
        cropScores[cropName] = {
            score: Math.round(finalScore),
            avgTemp: avgTemp.toFixed(1),
            avgRainfall: avgRainfall.toFixed(1),
            sampleCount: cropData.length,
            data: cropData
        };
    });
    
    // Sort by score and return top 5
    const sortedCrops = Object.entries(cropScores)
        .sort((a, b) => b[1].score - a[1].score)
        .slice(0, 5);
    
    return sortedCrops.map(([cropName, data]) => {
        const riskPercentage = Math.max(0, 100 - data.score);
        return {
            crop: cropName.charAt(0).toUpperCase() + cropName.slice(1),
            reason: `Based on Kaggle dataset analysis (${data.sampleCount} samples). Optimal temp: ${data.avgTemp}°C, Rainfall: ${data.avgRainfall}mm`,
            score: data.score,
            riskPercentage: riskPercentage,
            waterNeed: data.score > 70 ? 'Low' : data.score > 50 ? 'Medium' : 'High',
            moneySavingTip: getMoneySavingTipFromScore(data.score, cropName),
            profitPotential: calculateProfitFromKaggle(cropName, data.score),
            source: 'Kaggle Dataset'
        };
    });
}

function getMoneySavingTipFromScore(score, cropName) {
    const tips = [];
    if (score > 70) {
        tips.push('Crop well-suited to current conditions - high yield expected');
        tips.push('Follow standard farming practices for best results');
    } else if (score > 50) {
        tips.push('Monitor crop closely for stress signs');
        tips.push('Consider soil amendments to improve conditions');
    } else {
        tips.push('Consider alternative crops better suited to conditions');
        tips.push('May require additional irrigation/fertilizers');
    }
    return tips;
}

function calculateProfitFromKaggle(cropName, score) {
    const baseProfit = {
        'rice': 35000, 'maize': 28000, 'jute': 32000, 'cotton': 45000,
        'coconut': 40000, 'papaya': 30000, 'orange': 35000, 'apple': 60000,
        'muskmelon': 25000, 'watermelon': 25000, 'mango': 50000, 'banana': 35000,
        'pomegranate': 45000, 'lentil': 20000, 'blackgram': 18000, 'mungbean': 18000,
        'mothbeans': 18000, 'pigeonpeas': 22000, 'kidneybeans': 25000, 'chickpeas': 22000,
        'coffee': 55000
    };
    
    const base = baseProfit[cropName.toLowerCase()] || 25000;
    const adjustedProfit = base * (score / 100);
    
    return {
        estimatedProfit: Math.round(adjustedProfit),
        confidenceLevel: score > 70 ? 'High' : score > 50 ? 'Medium' : 'Low',
        perAcre: `₹${Math.round(adjustedProfit).toLocaleString()}`
    };
}

// GET /api/kaggle-crops - List crops from Kaggle dataset
app.get('/api/kaggle-crops', (req, res) => {
    res.json({
        totalRecords: cropDataset.length,
        crops: kaggleCrops,
        message: cropDataset.length > 0 ? 'Kaggle dataset loaded successfully' : 'Kaggle dataset not loaded'
    });
});

// GET /api/exact-risk - Calculate exact risk based on GPS location and real-time weather
app.get('/api/exact-risk', async (req, res) => {
  try {
    const { lat, lon, village, temperature, humidity } = req.query;
    
    let weather;
    if (lat && lon) {
      const wRes = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=Metric`);
      weather = wRes.data;
    } else if (village) {
      const wRes = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${village},IN&appid=${WEATHER_API_KEY}&units=Metric`);
      weather = wRes.data;
    } else {
      return res.status(400).json({ error: 'Provide lat/lon or village' });
    }
    
    const temp = weather.main.temp;
    const hum = weather.main.humidity;
    const wind = weather.wind.speed;
    const condition = weather.weather[0].main;
    const description = weather.weather[0].description;
    
    // Exact Risk Calculation
    let riskScore = 0;
    let risks = [];
    let recommendations = [];
    
    // Temperature risks
    if (temp > 40) {
      riskScore += 40;
      risks.push({ type: 'Extreme Heat', severity: 'High', value: temp + '°C' });
      recommendations.push('Avoid outdoor work during 12PM-4PM');
    } else if (temp > 35) {
      riskScore += 25;
      risks.push({ type: 'High Temperature', severity: 'Medium', value: temp + '°C' });
    } else if (temp < 10) {
      riskScore += 30;
      risks.push({ type: 'Cold Wave', severity: 'Medium', value: temp + '°C' });
    }
    
    // Humidity risks
    if (hum < 30) {
      riskScore += 25;
      risks.push({ type: 'Drought Risk', severity: 'High', value: hum + '%' });
      recommendations.push('Use drip irrigation immediately');
    } else if (hum > 85) {
      riskScore += 20;
      risks.push({ type: 'High Humidity', severity: 'Medium', value: hum + '%' });
      recommendations.push('Watch for fungal diseases');
    }
    
    // Weather condition risks
    if (condition === 'Thunderstorm') {
      riskScore += 35;
      risks.push({ type: 'Storm Alert', severity: 'High', value: condition });
      recommendations.push('Secure crops and avoid field work');
    } else if (condition === 'Rain') {
      risks.push({ type: 'Rainfall', severity: 'Low', value: description });
      recommendations.push('Good for irrigation');
    }
    
    // Wind risks
    if (wind > 10) {
      riskScore += 15;
      risks.push({ type: 'High Wind', severity: 'Medium', value: wind + ' m/s' });
    }
    
    // Calculate final risk level
    let riskLevel = 'Low';
    if (riskScore >= 50) riskLevel = 'High';
    else if (riskScore >= 25) riskLevel = 'Medium';
    
    // Get crop suggestions for this exact location
    const cropRes = await axios.get(`http://localhost:${PORT}/api/crop-suggestion?temperature=${temp}&rainfall=${hum}&soilType=Loamy&location=${weather.name}`);
    const crops = cropRes.data;
    
    res.json({
      location: weather.name,
      coordinates: { lat: weather.coord.lat, lon: weather.coord.lon },
      temperature: temp,
      humidity: hum,
      windSpeed: wind,
      condition: condition,
      description: description,
      riskScore: riskScore,
      riskLevel: riskLevel,
      risks: risks,
      recommendations: recommendations,
      topCrops: crops.suggestions?.slice(0, 3) || [],
      fetchedAt: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /crop-suggestion
app.get('/api/crop-suggestion', async (req, res) => {
  try {
    const { temperature, rainfall, language, soilType, location } = req.query;
    const temp = parseFloat(temperature) || 25;
    const rain = parseFloat(rainfall) || 50;
    const lang = language || 'en';
    const soil = soilType || '';
    const loc = location || '';

    // Use Kaggle dataset for better recommendations if available
    let scoredCrops;
    if (cropDataset.length > 0) {
        scoredCrops = getKaggleBasedRecommendations(temp, rain, soil);
    } else {
        scoredCrops = calculateCropScore(temp, rain, soil, loc);
    }

    const translations = {
      en: {
        riskLevels: { Low: 'Low', Moderate: 'Moderate', High: 'High', Extreme: 'Extreme' },
        crops: { 'Wheat': 'Wheat', 'Potato': 'Potato', 'Rice': 'Rice', 'Cotton': 'Cotton', 'Millets': 'Millets', 'Sorghum': 'Sorghum', 'Bajra': 'Bajra', 'Ragi': 'Ragi', 'Paddy': 'Paddy', 'Groundnut': 'Groundnut', 'Mustard': 'Mustard', 'Sugarcane': 'Sugarcane' }
      },
      ta: {
        riskLevels: { Low: 'குறைந்த', Moderate: 'மிதமான', High: 'அதிக', Extreme: 'மிக அதிகம்' },
        crops: { 'Wheat': 'கோதுமை', 'Potato': 'உருளைக்கிழங்கு', 'Rice': 'அரிசி', 'Cotton': 'பருத்தி', 'Millets': 'தினை', 'Sorghum': 'சோளம்', 'Bajra': 'கம்பு', 'Ragi': 'ராகி', 'Paddy': 'நெல்', 'Groundnut': 'நிலக்கடலை', 'Mustard': 'வாத்து', 'Sugarcane': 'கரும்பு' }
      },
      hi: {
        riskLevels: { Low: 'कम', Moderate: 'मध्यम', High: 'उच्च', Extreme: 'अत्यधिक' },
        crops: { 'Wheat': 'गेहूं', 'Potato': 'आलू', 'Rice': 'चावल', 'Cotton': 'कपास', 'Millets': 'बाजरा', 'Sorghum': 'ज्वार', 'Bajra': 'बाजरा', 'Ragi': 'रागी', 'Paddy': 'धान', 'Groundnut': 'मूंगफली', 'Mustard': 'सरसों', 'Sugarcane': 'गन्ना' }
      },
      te: {
        riskLevels: { Low: 'తక్కువ', Moderate: 'মধ্যস্থ', High: 'అధిక', Extreme: 'चेల-la' },
        crops: { 'Wheat': 'গোధుమ', 'Potato': 'బంగాళాదుంప', 'Rice': 'బియ్యం', 'Cotton': 'पत्ती', 'Millets': 'শস్', 'Sorghum': 'జొన్న', 'Bajra': 'saaj', 'Ragi': 'रागी', 'Paddy': 'ధాన్యం', 'Groundnut': 'वलायत', 'Mustard': 'శనగ', 'Sugarcane': 'చెరుకు' }
      }
    };

    const t = translations[lang] || translations.en;

    // Determine overall risk level
    let riskLevelKey = 'Low';
    if (temp > 38) riskLevelKey = 'Extreme';
    else if (temp > 35) riskLevelKey = 'High';
    else if (temp > 30 || rain < 30) riskLevelKey = 'Moderate';

    // Get what to do/not to do
    const { whatToDo, whatNotToDo } = getWeatherAdvice(temp, rain, lang);

    res.json({
      temperature: temp,
      rainfall: rain,
      language: lang,
      soilType: soil,
      suggestions: scoredCrops.map(c => ({
        crop: t.crops[c.crop] || c.crop,
        reason: c.reason,
        score: c.score,
        riskPercentage: c.riskPercentage,
        waterNeed: c.waterNeed,
        moneySavingTip: c.moneySavingTip,
        profitPotential: c.profitPotential
      })),
      riskLevel: t.riskLevels[riskLevelKey],
      whatToDo,
      whatNotToDo,
      farmingTips: getFarmingTips(temp, rain, lang),
      governmentSchemes: getGovernmentSchemes(lang),
      marketInfo: getMarketInfo(lang),
      moneySavingSummary: {
        estimatedLossAvoided: riskLevelKey === 'High' || riskLevelKey === 'Extreme' ? '₹15,000-25,000 per acre' : '₹5,000-10,000 per acre',
        recommendation: riskLevelKey === 'High' ? 'Follow crop diversification to minimize risk' : 'Continue with recommended crops'
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

function getWeatherAdvice(temp, rain, lang) {
  const advice = {
    en: {
      whatToDo: [],
      whatNotToDo: []
    },
    ta: {
      whatToDo: [],
      whatNotToDo: []
    },
    hi: {
      whatToDo: [],
      whatNotToDo: []
    },
    te: {
      whatToDo: [],
      whatNotToDo: []
    }
  };

  if (temp > 38) {
    advice.en.whatToDo = ['Provide shade to sensitive crops', 'Increase irrigation frequency', 'Apply anti-transpirants', 'Use mulching'];
    advice.en.whatNotToDo = ['Avoid chemical spraying during heat hours', 'Do not fertilize in hot sun', 'Avoid transplanting'];
    advice.ta.whatToDo = ['உணர்திப்பயிர்களுக்கு நிழல் அளித்தல்', 'நீர் பாய்ச்சல் அதிர்வெண்ணை அதிகரித்தல்'];
    advice.ta.whatNotToDo = ['வெம்மை நேரத்தில் உரம் போடத் தவிர்க்கவும்'];
    advice.hi.whatToDo = ['संवेदनशील फसलों को छाया दें', 'सिंचाई की आवृत्ति बढ़ाएं'];
    advice.hi.whatNotToDo = ['गर्मी के समय उर्वरक न लगाएं'];
  } else if (temp > 30) {
    advice.en.whatToDo = ['Use mulching to retain moisture', 'Water crops early morning', 'Use drought-resistant varieties'];
    advice.en.whatNotToDo = ['Avoid midday irrigation', 'Do not overwater'];
    advice.ta.whatToDo = ['ஈரத்தைத் தக்கவைக்க மல்சிங் பயன்படுத்தவும்'];
    advice.ta.whatNotToDo = ['நடு நாள் பாசனத்தைத் தவிர்க்கவும்'];
  }

  if (rain < 30) {
    advice.en.whatToDo.push('Implement rainwater harvesting', 'Use drip irrigation');
    advice.ta.whatToDo.push('மழைநீர் சேகரிப்பைச் செயல்படுத்தவும்');
    advice.hi.whatToDo.push('वर्षा जल संग्रहण लागू करें');
  }

  if (rain > 100) {
    advice.en.whatToDo.push('Ensure proper drainage', 'Check for waterlogging');
    advice.en.whatNotToDo.push('Avoid sowing in low areas');
    advice.ta.whatToDo.push('சரியான வடிகட்டுதல் உறுதிப்படுத்தவும்');
    advice.hi.whatToDo.push('उचित जल निकासी सुनिश्चित करें');
  }

  return advice[lang] || advice.en;
}

// ==================== HELPER FUNCTIONS ====================

function getFarmingTips(temp, rain, lang) {
  const tips = {
    en: [
      'Check soil moisture before irrigation',
      'Use organic fertilizers for better yield',
      'Monitor pest attacks regularly',
      'Follow crop rotation for soil health',
      'Use mulch to conserve moisture'
    ],
    ta: [
      'நீர்ப்பாசனத்திற்கு முன் மண்ணின் ஈரப்பதத்தை சரிபார்க்கவும்',
      'சிறந்த விளைச்சலுக்கு கரிம உரங்களைப் பயன்படுத்தவும்',
      'தீங்குயிரி தாக்குதலை தவறாம கண்காணிப்பதற்கு',
      'மண் ஆரோக்கியத்திற்கு பயிர் சுழற்சியைப் பின்பற்றவும்',
      'ஈரத்தை பாதுகாக்க மல்சிங் பயன்படுத்தவும்'
    ],
    hi: [
      'सिंचाई से पहले मिट्टी की नमी जांचें',
      'बेहतर उपज के लिए जैविक उर्वरक का उपयोग करें',
      'कीट हमलों की नियमित निगरानी करें',
      'मिट्टी के स्वास्थ्य के लिए फसल चक्र का पालन करें',
      'नमी बनाए रखने के लिए मल्चिंग का उपयोग करें'
    ]
  };
  return tips[lang] || tips.en;
}

function getGovernmentSchemes(lang) {
  const schemes = {
    en: [
      'PM-KISAN: ₹6000/year to farmer families',
      'Fasal Bhima Yojana: Crop insurance scheme',
      'Kisan Credit Card: Easy credit for farmers',
      'Paramparagat Krishi Vikas Yojana: Organic farming'
    ],
    ta: [
      'PM-KISAN: ஆண்டுக்கு ₹6000 விவசாய குடும்பங்களுக்கு',
      'Fasal Bhima Yojana: பயிர் காப்பீடு திட்டம்',
      'Kisan Credit Card: விவசாயிகளுக்கு எளிதான கடன்',
      'Paramparagat Krishi Vikas Yojana: இயற்கை விவசாயம்'
    ],
    hi: [
      'PM-KISAN: किसान परिवारों को ₹6000/वर्ष',
      'Fasal Bhima Yojana: फसल बीमा योजना',
      'Kisan Credit Card: किसानों के लिए आसान ऋण',
      'Paramparagat Krishi Vikas Yojana: जैविक खेती'
    ]
  };
  return schemes[lang] || schemes.en;
}

function getMarketInfo(lang) {
  const info = {
    en: [
      'eNAM: Electronic National Agricultural Market',
      'APMC Mandis: Local market yards',
      'MSP: Minimum Support Price available',
      'Direct-to-consumer: FPO selling platforms'
    ],
    ta: [
      'eNAM: மின்னணு தேசிய விவசாய சந்தை',
      'APMC Mandis: உள்ளூர் சந்தை மைதானங்கள்',
      'MSP: குறைந்த ஆதரவு விலை கிடைக்கிறது',
      'நேரடி-நுகர்வோர்: FPO விற்பனை தளங்கள்'
    ],
    hi: [
      'eNAM: इलेक्ट्रोनिक नेशनल एग्रीकल्चरल मार्केट',
      'APMC Mandis: स्थानीय बाजार प्रांगण',
      'MSP: न्यूनतम समर्थन मूल्य उपलब्ध',
      'Direct-to-consumer: FPO बिक्री प्लेटफॉर्म'
    ]
  };
  return info[lang] || info.en;
}

function getCropDetails(cropName, lang) {
  const cropDatabase = {
    Wheat: {
      en: { season: 'Nov-Apr', water: '400-500mm', yield: '3-5 ton/ha', price: '₹2000-2500/quintal', soil: 'Loamy, well-drained' },
      ta: { season: 'நவ்-ஏப்', water: '400-500மிமீ', yield: '3-5 டன்/ஹெக்டர்', price: '₹2000-2500/குயிண்டல்', soil: 'செம்மண்' },
      hi: { season: 'नवं-अप्रै', water: '400-500मिमी', yield: '3-5 टन/हेक्टेयर', price: '₹2000-2500/क्विंटल', soil: 'दोमट, अच्छी जल निकासी' }
    },
    Potato: {
      en: { season: 'Oct-Mar', water: '500-700mm', yield: '20-30 ton/ha', price: '₹1000-1500/quintal', soil: 'Sandy loam' },
      ta: { season: 'அக்-மார்', water: '500-700மிமீ', yield: '20-30 டன்/ஹெக்டர்', price: '₹1000-1500/குயிண்டல்', soil: 'மணல் கலந்த மண்' },
      hi: { season: 'अक्टू-मार्च', water: '500-700मिमी', yield: '20-30 टन/हेक्टेयर', price: '₹1000-1500/क्विंटल', soil: 'बलुई दोमट' }
    },
    Rice: {
      en: { season: 'Jun-Nov', water: '1200-1500mm', yield: '3-6 ton/ha', price: '₹1800-2200/quintal', soil: 'Clay, lowland' },
      ta: { season: 'ஜூன்-நவ்', water: '1200-1500மிமீ', yield: '3-6 டன்/ஹெக்டர்', price: '₹1800-2200/குயிண்டல்', soil: 'களி,தாழ்நிலம்' },
      hi: { season: 'जून-नवं', water: '1200-1500मिमी', yield: '3-6 टन/हेक्टेयर', price: '₹1800-2200/क्विंटल', soil: 'चिकनी, निचली भूमि' }
    },
    Cotton: {
      en: { season: 'Apr-Oct', water: '600-900mm', yield: '1.5-3 ton/ha', price: '₹5000-6000/quintal', soil: 'Black cotton' },
      ta: { season: 'ஏப்-அக்', water: '600-900மிமீ', yield: '1.5-3 டன்/ஹெக்டர்', price: '₹5000-6000/குயிண்டல்', soil: 'கரு மண்' },
      hi: { season: 'अप्रै-अक्टू', water: '600-900मिमी', yield: '1.5-3 टन/हेक्टेयर', price: '₹5000-6000/क्विंटल', soil: 'काली मिट्टी' }
    },
    Millets: {
      en: { season: 'Jun-Nov', water: '300-400mm', yield: '1.5-3 ton/ha', price: '₹1500-2000/quintal', soil: 'Sandy, poor' },
      ta: { season: 'ஜூன்-நவ்', water: '300-400மிமீ', yield: '1.5-3 டன்/ஹெக்டர்', price: '₹1500-2000/குயிண்டல்', soil: 'மணல், வளம் குறைந்த' },
      hi: { season: 'जून-नवं', water: '300-400मिमी', yield: '1.5-3 टन/हेक्टेयर', price: '₹1500-2000/क्विंटल', soil: 'बालू, कमजोर' }
    },
    Bajra: {
      en: { season: 'Jul-Nov', water: '250-350mm', yield: '1-2 ton/ha', price: '₹1200-1800/quintal', soil: 'Sandy, arid' },
      ta: { season: 'ஜூலை-நவ்', water: '250-350மிமீ', yield: '1-2 டன்/ஹெக்டர்', price: '₹1200-1800/குயிண்டல்', soil: 'மணல், வறண்ட' },
      hi: { season: 'जुला-नवं', water: '250-350मिमी', yield: '1-2 टन/हेक्टेयर', price: '₹1200-1800/क्विंटल', soil: 'बालू, शुष्क' }
    },
    Ragi: {
      en: { season: 'Jun-Dec', water: '300-400mm', yield: '1.5-2.5 ton/ha', price: '₹2000-2800/quintal', soil: 'Red, laterite' },
      ta: { season: 'ஜூன்-டிச்', water: '300-400மிமீ', yield: '1.5-2.5 டன்/ஹெக்டர்', price: '₹2000-2800/குயிண்டல்', soil: 'சிவப்பு, பாசல்' },
      hi: { season: 'जून-दिसं', water: '300-400मिमी', yield: '1.5-2.5 टन/हेक्टेयर', price: '₹2000-2800/क्विंटल', soil: 'लाल, लैटेराइट' }
    },
    Paddy: {
      en: { season: 'Jun-Nov', water: '1200-1500mm', yield: '3-6 ton/ha', price: '₹1800-2200/quintal', soil: 'Clay, puddled' },
      ta: { season: 'ஜூன்-நவ்', water: '1200-1500மிமீ', yield: '3-6 டன்/ஹெக்டர்', price: '₹1800-2200/குயிண்டல்', soil: 'களி,அதிரி' },
      hi: { season: 'जून-नवं', water: '1200-1500मिमी', yield: '3-6 टन/हेक्टेयर', price: '₹1800-2200/क्विंटल', soil: 'चिकनी, की गई' }
    }
  };

  return cropDatabase[cropName]?.[lang] || cropDatabase[cropName]?.en || { season: 'N/A', water: 'N/A', yield: 'N/A', price: 'N/A', soil: 'N/A' };
}

// ==================== FARMER MANAGEMENT ====================

// POST /api/register-farmer (Booth Agent)
app.post('/api/register-farmer', async (req, res) => {
  try {
    const { farmerName, age, aadhaarNo, phoneNo, village, district, landSize, soilType, irrigationType, currentCrop, season, photo } = req.body;
    
    const year = new Date().getFullYear();
    const random = Math.floor(100 + Math.random() * 900);
    const farmerId = `FRM-${year}-${random}`;
    
    // Save to MongoDB
    const newFarmer = new Farmer({
      farmerName,
      age,
      aadhaarNo,
      phoneNo,
      village,
      district,
      landSize,
      soilType,
      irrigationType,
      currentCrop,
      season,
      photo,
      registeredDate: new Date(),
      riskLevel: 'Low'
    });
    
    await newFarmer.save();
    
    const savedFarmer = {
      id: farmerId,
      farmerName: newFarmer.farmerName,
      age: newFarmer.age,
      aadhaarNo: newFarmer.aadhaarNo,
      phoneNo: newFarmer.phoneNo,
      village: newFarmer.village,
      district: newFarmer.district,
      landSize: newFarmer.landSize,
      soilType: newFarmer.soilType,
      irrigationType: newFarmer.irrigationType,
      currentCrop: newFarmer.currentCrop,
      riskLevel: newFarmer.riskLevel,
      registeredDate: newFarmer.registeredDate
    };
    
    // Also keep in memory for quick access
    farmers.push(savedFarmer);
    
    res.status(201).json({ 
      message: 'Farmer registered successfully', 
      farmer: savedFarmer
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/farmers (Booth Agent - Get all farmers)
app.get('/api/farmers', async (req, res) => {
  try {
    // Try MongoDB first
    const dbFarmers = await Farmer.find().sort({ registeredDate: -1 });
    if (dbFarmers.length > 0) {
      const formattedFarmers = dbFarmers.map(f => ({
        id: f.id || `FRM-${new Date(f.registeredDate).getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        farmerName: f.farmerName,
        age: f.age,
        aadhaarNo: f.aadhaarNo,
        phoneNo: f.phoneNo,
        village: f.village,
        district: f.district,
        landSize: f.landSize,
        soilType: f.soilType,
        irrigationType: f.irrigationType,
        currentCrop: f.currentCrop,
        riskLevel: f.riskLevel,
        registeredDate: f.registeredDate
      }));
      return res.json(formattedFarmers);
    }
    // Fallback to memory
    res.json(farmers);
  } catch (error) {
    res.json(farmers);
  }
});

// GET /api/farmers/:id
app.get('/api/farmers/:id', async (req, res) => {
  try {
    // Try MongoDB first - search by id or _id
    const dbFarmer = await Farmer.findOne({ $or: [{ id: req.params.id }, { _id: req.params.id }] });
    if (dbFarmer) {
      return res.json({
        id: dbFarmer.id,
        farmerName: dbFarmer.farmerName,
        age: dbFarmer.age,
        aadhaarNo: dbFarmer.aadhaarNo,
        phoneNo: dbFarmer.phoneNo,
        village: dbFarmer.village,
        district: dbFarmer.district,
        landSize: dbFarmer.landSize,
        soilType: dbFarmer.soilType,
        irrigationType: dbFarmer.irrigationType,
        currentCrop: dbFarmer.currentCrop,
        riskLevel: dbFarmer.riskLevel,
        registeredDate: dbFarmer.registeredDate
      });
    }
    // Fallback to memory
    const farmer = farmers.find(f => f.id === req.params.id);
    if (!farmer) {
      return res.status(404).json({ error: 'Farmer not found' });
    }
    res.json(farmer);
  } catch (error) {
    const farmer = farmers.find(f => f.id === req.params.id);
    if (!farmer) {
      return res.status(404).json({ error: 'Farmer not found' });
    }
    res.json(farmer);
  }
});

// PUT /api/farmers/:id
app.put('/api/farmers/:id', async (req, res) => {
  try {
    const index = farmers.findIndex(f => f.farmerId === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Farmer not found' });
    }
    
    farmers[index] = { ...farmers[index], ...req.body };
    res.json({ message: 'Farmer updated successfully', farmer: farmers[index] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/farmer-profile-update - Update logged-in farmer profile
app.post('/api/farmer-profile-update', async (req, res) => {
  try {
    const { farmerId, name, phone, village, district, state, landSize, soilType, irrigationType, currentCrop } = req.body;
    
    if (!farmerId) {
      return res.status(400).json({ error: 'Farmer ID required' });
    }
    
    const index = farmers.findIndex(f => f.farmerId === farmerId);
    if (index === -1) {
      return res.status(404).json({ error: 'Farmer not found' });
    }
    
    // Update farmer details in memory
    if (name) farmers[index].farmerName = name;
    if (phone) farmers[index].phoneNo = phone;
    if (village) farmers[index].village = village;
    if (district) farmers[index].district = district;
    if (state) farmers[index].state = state;
    if (landSize) farmers[index].landSize = landSize;
    if (soilType) farmers[index].soilType = soilType;
    if (irrigationType) farmers[index].irrigationType = irrigationType;
    if (currentCrop) farmers[index].currentCrop = currentCrop;
    
    // Also update in MongoDB
    try {
      const updateData = {};
      if (name) updateData.farmerName = name;
      if (phone) updateData.phoneNo = phone;
      if (village) updateData.village = village;
      if (district) updateData.district = district;
      if (state) updateData.state = state;
      if (landSize) updateData.landSize = landSize;
      if (soilType) updateData.soilType = soilType;
      if (irrigationType) updateData.irrigationType = irrigationType;
      if (currentCrop) updateData.currentCrop = currentCrop;
      
      await Farmer.findOneAndUpdate({ id: farmerId }, updateData, { new: true });
    } catch (mongoErr) {
      console.log('MongoDB update error (non-fatal):', mongoErr.message);
    }
    
    res.json({ success: true, message: 'Profile updated successfully', farmer: farmers[index] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/farmers/:id
app.delete('/api/farmers/:id', async (req, res) => {
  try {
    const id = req.params.id;
    
    // Delete from memory
    const index = farmers.findIndex(f => f.id === id || f.farmerId === id);
    if (index !== -1) {
      farmers.splice(index, 1);
    }
    
    // Delete from MongoDB
    try {
      await Farmer.findOneAndDelete({ id: id });
      await Farmer.findOneAndDelete({ _id: id });
    } catch(e) {
      console.log('MongoDB delete error:', e.message);
    }
    
    res.json({ message: 'Farmer deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/villages
app.get('/api/villages', async (req, res) => {
  try {
    const villages = [
      { name: 'Kallur', district: 'Chittoor', state: 'Andhra Pradesh', lat: 13.3189, lon: 79.4243 },
      { name: 'Chittoor', district: 'Chittoor', state: 'Andhra Pradesh', lat: 13.2170, lon: 79.1000 },
      { name: 'Tirupati', district: 'Chittoor', state: 'Andhra Pradesh', lat: 13.6288, lon: 79.4192 },
      { name: 'Pileru', district: 'Chittoor', state: 'Andhra Pradesh', lat: 13.4667, lon: 79.6667 },
      { name: 'Madanapalle', district: 'Anantapur', state: 'Andhra Pradesh', lat: 13.9500, lon: 78.4833 },
      { name: 'Anantapur', district: 'Anantapur', state: 'Andhra Pradesh', lat: 14.6819, lon: 77.6086 },
      { name: 'Kadapa', district: 'Kadapa', state: 'Andhra Pradesh', lat: 14.4673, lon: 78.8242 },
      { name: 'Nellore', district: 'Nellore', state: 'Andhra Pradesh', lat: 14.4426, lon: 79.9865 },
      { name: 'Hyderabad', district: 'Hyderabad', state: 'Telangana', lat: 17.3850, lon: 78.4867 },
      { name: 'Warangal', district: 'Warangal', state: 'Telangana', lat: 17.9784, lon: 79.5941 },
      { name: 'Karimnagar', district: 'Karimnagar', state: 'Telangana', lat: 18.4386, lon: 79.1288 },
      { name: 'Nizamabad', district: 'Nizamabad', state: 'Telangana', lat: 18.6725, lon: 78.0941 },
      { name: 'Delhi', district: 'Delhi', state: 'Delhi', lat: 28.7041, lon: 77.1025 },
      { name: 'Mumbai', district: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lon: 72.8777 },
      { name: 'Pune', district: 'Pune', state: 'Maharashtra', lat: 18.5204, lon: 73.8567 },
      { name: 'Nagpur', district: 'Nagpur', state: 'Maharashtra', lat: 21.1458, lon: 79.0882 },
      { name: 'Ahmednagar', district: 'Ahmednagar', state: 'Maharashtra', lat: 19.0948, lon: 74.7380 },
      { name: 'Bangalore', district: 'Bangalore', state: 'Karnataka', lat: 12.9716, lon: 77.5946 },
      { name: 'Mysore', district: 'Mysore', state: 'Karnataka', lat: 12.2958, lon: 76.6394 },
      { name: 'Hubli', district: 'Dharwad', state: 'Karnataka', lat: 15.3647, lon: 75.1249 },
      { name: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lon: 80.2707 },
      { name: 'Coimbatore', district: 'Coimbatore', state: 'Tamil Nadu', lat: 11.0168, lon: 76.9558 },
      { name: 'Madurai', district: 'Madurai', state: 'Tamil Nadu', lat: 9.9252, lon: 78.1198 },
      { name: 'Tiruchirappalli', district: 'Tiruchirappalli', state: 'Tamil Nadu', lat: 10.7905, lon: 78.7045 },
      { name: 'Kolkata', district: 'Kolkata', state: 'West Bengal', lat: 22.5726, lon: 88.3639 },
      { name: 'Howrah', district: 'Howrah', state: 'West Bengal', lat: 22.5958, lon: 88.2896 },
      { name: 'Asansol', district: 'Paschim Bardhaman', state: 'West Bengal', lat: 23.6736, lon: 86.9523 },
      { name: 'Lucknow', district: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lon: 80.9462 },
      { name: 'Varanasi', district: 'Varanasi', state: 'Uttar Pradesh', lat: 25.3176, lon: 82.9739 },
      { name: 'Agra', district: 'Agra', state: 'Uttar Pradesh', lat: 27.1767, lon: 78.0081 },
      { name: 'Kanpur', district: 'Kanpur', state: 'Uttar Pradesh', lat: 26.4499, lon: 80.3319 },
      { name: 'Patna', district: 'Patna', state: 'Bihar', lat: 25.5941, lon: 85.1376 },
      { name: 'Gaya', district: 'Gaya', state: 'Bihar', lat: 24.7967, lon: 85.0076 },
      { name: 'Muzaffarpur', district: 'Muzaffarpur', state: 'Bihar', lat: 26.1209, lon: 85.3647 },
      { name: 'Jaipur', district: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lon: 75.7873 },
      { name: 'Jodhpur', district: 'Jodhpur', state: 'Rajasthan', lat: 26.2389, lon: 73.0243 },
      { name: 'Udaipur', district: 'Udaipur', state: 'Rajasthan', lat: 24.5854, lon: 73.7125 },
      { name: 'Kota', district: 'Kota', state: 'Rajasthan', lat: 25.2138, lon: 75.8648 },
      { name: 'Bhopal', district: 'Bhopal', state: 'Madhya Pradesh', lat: 23.2599, lon: 77.4126 },
      { name: 'Indore', district: 'Indore', state: 'Madhya Pradesh', lat: 22.7196, lon: 75.8577 },
      { name: 'Jabalpur', district: 'Jabalpur', state: 'Madhya Pradesh', lat: 23.1815, lon: 79.9864 },
      { name: 'Gwalior', district: 'Gwalior', state: 'Madhya Pradesh', lat: 26.2124, lon: 78.1772 },
      { name: 'Ahmedabad', district: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lon: 72.5714 },
      { name: 'Surat', district: 'Surat', state: 'Gujarat', lat: 21.1702, lon: 72.8311 },
      { name: 'Vadodara', district: 'Vadodara', state: 'Gujarat', lat: 22.3072, lon: 73.1812 },
      { name: 'Rajkot', district: 'Rajkot', state: 'Gujarat', lat: 22.3039, lon: 70.8022 },
      { name: 'Guwahati', district: 'Kamrup', state: 'Assam', lat: 26.1445, lon: 91.7362 },
      { name: 'Silchar', district: 'Cachar', state: 'Assam', lat: 24.8333, lon: 92.7833 },
      { name: 'Dibrugarh', district: 'Dibrugarh', state: 'Assam', lat: 27.4800, lon: 95.0000 }
    ];
    res.json(villages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/weather-by-coords
app.get('/api/weather-by-coords', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);
    
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`
    );

    const data = response.data;
    
    // Map to better location names for known areas in India
    let locationName = data.name;
    let region = 'India';
    
    // Location mapping based on coordinates and city names
    const locationMappings = [
      { names: ['coimbatore', 'singanallur', 'podanur', 'kurichi', 'pollachi', 'tirupur'], latMin: 10.9, latMax: 11.3, lonMin: 76.9, lonMax: 77.2, location: 'Coimbatore', region: 'Tamil Nadu' },
      { names: ['chennai', 'madras', 'kanchipuram', 'chengalpattu'], latMin: 12.8, latMax: 13.2, lonMin: 80.1, lonMax: 80.4, location: 'Chennai', region: 'Tamil Nadu' },
      { names: ['madurai', 'dindigul', 'theni', 'virudhunagar'], latMin: 9.8, latMax: 10.3, lonMin: 77.9, lonMax: 78.3, location: 'Madurai', region: 'Tamil Nadu' },
      { names: ['chittoor', 'tirupati', 'kanchipuram'], latMin: 13.1, latMax: 13.5, lonMin: 78.9, lonMax: 79.6, location: 'Chittoor', region: 'Andhra Pradesh' },
      { names: ['hyderabad', 'secunderabad', 'warangal', 'karimnagar'], latMin: 17.2, latMax: 17.5, lonMin: 78.3, lonMax: 78.7, location: 'Hyderabad', region: 'Telangana' },
      { names: ['bangalore', 'bengaluru', 'mysore', 'mysuru'], latMin: 12.8, latMax: 13.2, lonMin: 77.4, lonMax: 77.8, location: 'Bangalore', region: 'Karnataka' },
      { names: ['mangalore', 'mangaluru', 'udupi', 'dakshina kannada'], latMin: 12.1, latMax: 13.0, lonMin: 74.6, lonMax: 75.2, location: 'Mangalore', region: 'Karnataka' },
      { names: ['kochi', 'cochin', 'ernakulam', 'thrissur', 'alappuzha'], latMin: 9.5, latMax: 10.5, lonMin: 76.0, lonMax: 76.6, location: 'Kochi', region: 'Kerala' },
      { names: ['thiruvananthapuram', 'trivandrum', 'kollam'], latMin: 8.3, latMax: 8.8, lonMin: 76.8, lonMax: 77.4, location: 'Thiruvananthapuram', region: 'Kerala' },
      { names: ['delhi', 'new delhi', 'gurgaon', 'noida', 'faridabad'], latMin: 28.4, latMax: 28.9, lonMin: 76.8, lonMax: 77.4, location: 'Delhi', region: 'Delhi' },
      { names: ['mumbai', 'bombay', 'navi mumbai', 'than', 'palghar'], latMin: 18.8, latMax: 19.3, lonMin: 72.7, lonMax: 73.2, location: 'Mumbai', region: 'Maharashtra' },
      { names: ['pune', 'pcmc', ' Pimpri'], latMin: 18.4, latMax: 18.7, lonMin: 73.7, lonMax: 74.0, location: 'Pune', region: 'Maharashtra' },
      { names: ['kolkata', 'calcutta', 'howrah', '24 parganas'], latMin: 22.4, latMax: 22.7, lonMin: 88.2, lonMax: 88.5, location: 'Kolkata', region: 'West Bengal' },
      { names: ['jaipur', 'ajmer', ' Jodhpur'], latMin: 26.8, latMax: 27.3, lonMin: 75.5, lonMax: 76.0, location: 'Jaipur', region: 'Rajasthan' },
      { names: ['lucknow', 'kanpur', 'agra'], latMin: 26.5, latMax: 27.3, lonMin: 80.5, lonMax: 81.2, location: 'Lucknow', region: 'Uttar Pradesh' },
      { names: ['chandigarh', 'panchkula', 'mohali'], latMin: 30.6, latMax: 30.8, lonMin: 76.7, lonMax: 77.0, location: 'Chandigarh', region: 'Punjab' },
      { names: ['visakhapatnam', 'vizag', 'vijayawada', 'guntur'], latMin: 17.5, latMax: 17.9, lonMin: 78.3, lonMax: 83.5, location: 'Visakhapatnam', region: 'Andhra Pradesh' },
      { names: ['guwahati', 'shillong', 'dispur'], latMin: 26.0, latMax: 26.5, lonMin: 91.5, lonMax: 92.0, location: 'Guwahati', region: 'Assam' },
    ];

    // Check each mapping
    for (const mapping of locationMappings) {
      const nameMatch = mapping.names.some(name => 
        data.name.toLowerCase().includes(name)
      );
      const coordMatch = latNum >= mapping.latMin && latNum <= mapping.latMax && 
                        lonNum >= mapping.lonMin && lonNum <= mapping.lonMax;
      
      if (nameMatch || coordMatch) {
        locationName = mapping.location;
        region = mapping.region;
        break;
      }
    }
    
    res.json({
      temperature: data.main.temp,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      weatherCondition: data.weather[0].main,
      weatherIcon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
      location: locationName,
      exactLocation: data.name,
      description: data.weather[0].description,
      coordinates: { lat: latNum, lon: lonNum },
      pressure: data.main.pressure,
      visibility: data.visibility,
      sunrise: data.sys.sunrise,
      sunset: data.sys.sunset,
      region: region
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

// GET /api/forecast-by-coords
app.get('/api/forecast-by-coords', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`
    );

    const forecasts = [];
    const dailyData = {};

    response.data.list.forEach(item => {
      const date = item.dt_txt.split(' ')[0];
      if (!dailyData[date] || item.dt_txt.includes('12:00:00')) {
        dailyData[date] = {
          date: date,
          temperature: item.main.temp,
          tempMin: item.main.temp_min,
          tempMax: item.main.temp_max,
          humidity: item.main.humidity,
          weatherCondition: item.weather[0].main,
          weatherIcon: `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`,
          windSpeed: item.wind.speed,
          description: item.weather[0].description
        };
      }
    });

    Object.values(dailyData).slice(0, 7).forEach(day => {
      forecasts.push(day);
    });

    const heatwave = forecasts.some(f => f.temperature > 38);
    const drought = forecasts.filter(f => f.humidity < 40).length >= 5;
    const heavyRain = forecasts.some(f => f.humidity > 80);

    res.json({
      forecasts,
      alerts: {
        heatwave,
        drought,
        heavyRain
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch forecast data' });
  }
});

// Store OTPs temporarily (in production, use Redis)
const otpStore = {};

// POST /send-otp - Send OTP to phone/email
app.post('/api/send-otp', async (req, res) => {
  console.log('=== SEND OTP ===', req.body);
  try {
    const { contact } = req.body;
    
    if (!contact) {
      return res.status(400).json({ error: 'Contact required' });
    }
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with expiry (5 minutes)
    otpStore[contact] = { otp, expiry: Date.now() + 5 * 60 * 1000 };
    
    console.log(`OTP for ${contact}: ${otp}`); // In production, send via SMS
    
    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /verify-otp - Verify OTP
app.post('/api/verify-otp', async (req, res) => {
  console.log('=== VERIFY OTP START ===');
  console.log('Full body:', req.body);
  console.log('Headers:', req.headers['content-type']);
  
  try {
    let contact = req.body.contact;
    let otp = req.body.otp;
    
    console.log('Extracted:', { contact, otp, contactType: typeof contact, otpType: typeof otp });
    
    // Handle if sent as string
    if (typeof contact === 'string') contact = contact.trim();
    if (typeof otp === 'string') otp = otp.trim();
    
    if (!contact || !otp) {
      console.log('Missing contact or otp');
      return res.status(400).json({ error: 'Contact and OTP required', received: { contact: !!contact, otp: !!otp } });
    }
    
    // DEV MODE: Allow 123456 for testing
    if (otp === '123456') {
      console.log('DEV MODE: Accepting OTP 123456');
      return res.json({ success: true, message: 'OTP verified' });
    }
    
    const stored = otpStore[contact];
    
    if (!stored) {
      return res.status(400).json({ error: 'OTP not requested' });
    }
    
    if (Date.now() > stored.expiry) {
      delete otpStore[contact];
      return res.status(400).json({ error: 'OTP expired' });
    }
    
    if (stored.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }
    
    delete otpStore[contact];
    console.log('=== VERIFY OTP SUCCESS ===');
    res.json({ success: true, message: 'OTP verified' });
  } catch (error) {
    console.log('=== VERIFY OTP ERROR ===', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /farmer-register - Register new farmer
app.post('/api/farmer-register', async (req, res) => {
  try {
    const { name, contact, password, village, district, state, landSize, soilType, irrigationType, currentCrop } = req.body;
    
    if (!name || !contact || !password) {
      return res.status(400).json({ error: 'Name, contact and password required' });
    }
    
    // Check if farmer already exists in memory
    const existingFarmer = farmers.find(f => f.phoneNo === contact || f.email === contact);
    if (existingFarmer) {
      return res.status(400).json({ error: 'Farmer already registered with this contact' });
    }
    
    // Check if farmer exists in MongoDB
    const dbFarmer = await Farmer.findOne({ phoneNo: contact });
    if (dbFarmer) {
      return res.status(400).json({ error: 'Farmer already registered with this contact' });
    }
    
    // Generate farmer ID
    const farmerId = 'FRM' + Date.now().toString().slice(-6);
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newFarmer = {
      farmerId,
      farmerName: name,
      phoneNo: contact,
      email: contact.includes('@') ? contact : '',
      password: hashedPassword,
      village: village || '',
      district: district || '',
      state: state || '',
      landSize: landSize || 0,
      soilType: soilType || '',
      irrigationType: irrigationType || '',
      currentCrop: currentCrop || '',
      riskLevel: 'Low',
      registrationDate: new Date()
    };
    
    // Save to memory
    farmers.push(newFarmer);
    
    // Also save to MongoDB
    try {
      const mongoFarmer = new Farmer({
        id: farmerId,
        farmerName: name,
        phoneNo: contact,
        email: contact.includes('@') ? contact : '',
        password: hashedPassword,
        village: village || '',
        district: district || '',
        state: state || '',
        landSize: landSize || '',
        soilType: soilType || '',
        irrigationType: irrigationType || '',
        currentCrop: currentCrop || '',
        riskLevel: 'Low',
        registeredDate: new Date()
      });
      await mongoFarmer.save();
    } catch (mongoErr) {
      console.log('MongoDB save error (non-fatal):', mongoErr.message);
    }
    
    console.log(`New farmer registered: ${farmerId} - ${name}`);
    
    res.json({ success: true, farmerId, message: 'Registration successful' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /agent-login
app.post('/api/agent-login', async (req, res) => {
  try {
    const { agentId, password } = req.body;
    
    // Demo agent credentials (can be stored in DB in production)
    if (agentId === 'AGT001' && password === 'agent123') {
      const token = jwt.sign({ id: agentId, type: 'agent' }, JWT_SECRET, { expiresIn: '24h' });
      res.json({ success: true, token, agentId, name: 'Rajesh Kumar', message: 'Login successful' });
    } else if (agentId === 'AGT002' && password === 'agent456') {
      const token = jwt.sign({ id: agentId, type: 'agent' }, JWT_SECRET, { expiresIn: '24h' });
      res.json({ success: true, token, agentId, name: 'Mahesh Patel', message: 'Login successful' });
    } else {
      res.status(401).json({ error: 'Invalid Agent ID or Password' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /farmer-login
app.post('/api/farmer-login', async (req, res) => {
  try {
    const { contact, password } = req.body;
    
    if (!contact || !password) {
      return res.status(400).json({ error: 'Contact and password required' });
    }
    
    // Find farmer in memory first
    let farmer = farmers.find(f => f.phoneNo === contact || f.email === contact);
    
    // If not in memory, check MongoDB
    if (!farmer) {
      try {
        const dbFarmer = await Farmer.findOne({ phoneNo: contact });
        if (dbFarmer) {
          // Add to memory
          farmer = {
            farmerId: dbFarmer.id || dbFarmer._id,
            farmerName: dbFarmer.farmerName,
            phoneNo: dbFarmer.phoneNo,
            email: dbFarmer.email,
            password: dbFarmer.password,
            village: dbFarmer.village,
            district: dbFarmer.district,
            state: dbFarmer.state,
            landSize: dbFarmer.landSize,
            soilType: dbFarmer.soilType,
            irrigationType: dbFarmer.irrigationType,
            currentCrop: dbFarmer.currentCrop
          };
          farmers.push(farmer);
        }
      } catch(e) {
        console.log('MongoDB lookup error:', e.message);
      }
    }
    
    if (!farmer) {
      return res.status(401).json({ error: 'Farmer not found. Please register first.' });
    }
    
    // Verify password
    const isValid = await bcrypt.compare(password, farmer.password);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    
    const token = jwt.sign({ id: farmer.farmerId, type: 'farmer' }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ 
      success: true, 
      token, 
      farmerId: farmer.farmerId, 
      name: farmer.farmerName,
      phone: farmer.phoneNo,
      village: farmer.village,
      district: farmer.district,
      state: farmer.state,
      landSize: farmer.landSize,
      soilType: farmer.soilType,
      irrigationType: farmer.irrigationType,
      currentCrop: farmer.currentCrop,
      message: 'Login successful' 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /farmer-login-otp (Alternative OTP login)
app.post('/api/farmer-login-otp', async (req, res) => {
  try {
    const { contact, otp } = req.body;
    
    const stored = otpStore[contact];
    
    if (!stored) {
      return res.status(400).json({ error: 'OTP not requested' });
    }
    
    if (Date.now() > stored.expiry) {
      delete otpStore[contact];
      return res.status(400).json({ error: 'OTP expired' });
    }
    
    if (stored.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }
    
    delete otpStore[contact];
    
    // Find or create farmer
    let farmer = farmers.find(f => f.phoneNo === contact || f.email === contact);
    
    if (!farmer) {
      // Auto-register for OTP login
      const farmerId = 'FRM' + Date.now().toString().slice(-6);
      farmer = {
        farmerId,
        farmerName: 'Farmer',
        phoneNo: contact,
        riskLevel: 'Low',
        registrationDate: new Date()
      };
      farmers.push(farmer);
    }
    
    const token = jwt.sign({ id: farmer.farmerId, type: 'farmer' }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ 
      success: true, 
      token, 
      farmerId: farmer.farmerId, 
      name: farmer.farmerName,
      message: 'Login successful' 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== ROUTES ====================

// GET /products
app.get('/api/products', async (req, res) => {
  try {
    const { category } = req.query;
    let query = {};
    if (category && category !== 'All') {
      query.category = category;
    }
    const products = await Product.find(query);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /waste-calc
app.post('/api/waste-calc', async (req, res) => {
  try {
    const { wasteType, quantity } = req.body;

    // Calculation rates
    const compostValue = 2; // ₹2 per kg
    const biogasRate = 0.5; // 0.5 m³ per kg
    const biogasPrice = 15; // ₹15 per m³
    const resaleValue = 3; // ₹3 per kg (average)

    let compostIncome = 0;
    let biogasIncome = 0;
    let resaleIncome = 0;

    if (wasteType === 'Crop Residue') {
      compostIncome = quantity * compostValue;
      biogasIncome = quantity * biogasRate * biogasPrice;
      resaleIncome = quantity * resaleValue;
    } else if (wasteType === 'Vegetable Waste') {
      compostIncome = quantity * (compostValue * 1.5);
      biogasIncome = quantity * (biogasRate * 1.2) * biogasPrice;
      resaleIncome = quantity * (resaleValue * 1.2);
    } else if (wasteType === 'Animal Waste') {
      compostIncome = quantity * (compostValue * 2);
      biogasIncome = quantity * (biogasRate * 2) * biogasPrice;
      resaleIncome = quantity * (resaleValue * 2);
    }

    const totalIncome = Math.max(compostIncome, biogasIncome, resaleIncome);
    const bestOption = totalIncome === compostIncome ? 'Compost' : totalIncome === biogasIncome ? 'Biogas' : 'Resale';

    // Get relevant dealers
    const dealers = await Dealer.find({ wasteTypes: wasteType });

    res.json({
      wasteType,
      quantity,
      compostIncome: Math.round(compostIncome * 100) / 100,
      biogasIncome: Math.round(biogasIncome * 100) / 100,
      resaleIncome: Math.round(resaleIncome * 100) / 100,
      totalIncome: Math.round(totalIncome * 100) / 100,
      bestOption,
      dealers
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /dealers
app.get('/api/dealers', async (req, res) => {
  try {
    const { wasteType } = req.query;
    let query = {};
    if (wasteType) {
      query.wasteTypes = wasteType;
    }
    const dealers = await Dealer.find(query);
    res.json(dealers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
});

// Debug test endpoint
app.post('/api/test-verify', (req, res) => {
  console.log('TEST ENDPOINT:', req.body);
  res.json({ success: true, message: 'Test endpoint works!' });
});

// ========================================
// LAND RECORD MANAGEMENT APIs
// ========================================

// Search land records
app.get('/api/land-records/search', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: 'Search query required' });
    }
    
    const results = await LandRecord.find({
      $or: [
        { surveyNumber: { $regex: query, $options: 'i' } },
        { pattaNumber: { $regex: query, $options: 'i' } },
        { ownerName: { $regex: query, $options: 'i' } }
      ]
    }).limit(20);
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single land record by ID
app.get('/api/land-records/:id', async (req, res) => {
  try {
    const record = await LandRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ error: 'Land record not found' });
    }
    res.json(record);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get land record by survey number
app.get('/api/land-records/by-survey/:surveyNumber', async (req, res) => {
  try {
    const record = await LandRecord.findOne({ surveyNumber: req.params.surveyNumber });
    if (!record) {
      return res.status(404).json({ error: 'Land record not found' });
    }
    
    // Get sale history
    const saleHistory = await SaleHistory.find({ surveyNumber: req.params.surveyNumber }).sort({ saleDate: -1 });
    
    // Get documents
    const documents = await LandDocument.find({ surveyNumber: req.params.surveyNumber });
    
    res.json({ record, saleHistory, documents });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new land record
app.post('/api/land-records', async (req, res) => {
  try {
    const {
      ownerName, aadhaarNumber, pattaNumber, surveyNumber,
      village, taluk, district, landSize, landType,
      currentCrop, guidelineValue, lastSalePrice, lastSaleDate
    } = req.body;
    
    if (!ownerName || !pattaNumber || !surveyNumber) {
      return res.status(400).json({ error: 'Owner name, patta number and survey number required' });
    }
    
    const newRecord = new LandRecord({
      ownerName, aadhaarNumber, pattaNumber, surveyNumber,
      village, taluk, district, landSize, landType,
      currentCrop, guidelineValue, lastSalePrice, lastSaleDate
    });
    
    await newRecord.save();
    res.json({ success: true, record: newRecord });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update land record
app.put('/api/land-records/:id', async (req, res) => {
  try {
    const record = await LandRecord.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json({ success: true, record });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete land record
app.delete('/api/land-records/:id', async (req, res) => {
  try {
    await LandRecord.findByIdAndDelete(req.params.id);
    await SaleHistory.deleteMany({ surveyNumber: req.params.surveyNumber });
    await LandDocument.deleteMany({ surveyNumber: req.params.surveyNumber });
    res.json({ success: true, message: 'Land record deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add sale history
app.post('/api/land-records/sale-history', async (req, res) => {
  try {
    const { surveyNumber, previousOwner, buyerName, saleAmount, saleDate } = req.body;
    
    const sale = new SaleHistory({ surveyNumber, previousOwner, buyerName, saleAmount, saleDate });
    await sale.save();
    res.json({ success: true, sale });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add document
app.post('/api/land-records/documents', async (req, res) => {
  try {
    const { surveyNumber, documentType, fileName, filePath } = req.body;
    
    const doc = new LandDocument({ surveyNumber, documentType, fileName, filePath });
    await doc.save();
    res.json({ success: true, document: doc });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all land records (for admin)
app.get('/api/land-records', async (req, res) => {
  try {
    const records = await LandRecord.find().sort({ createdAt: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Seed sample land records
async function seedLandRecords() {
  try {
    const count = await LandRecord.countDocuments();
    if (count > 0) return;
    
    const sampleRecords = [
      { ownerName: 'Ramasamy', aadhaarNumber: '123456789012', pattaNumber: 'PT/001/2020', surveyNumber: 'SY/101/001', village: 'Coimbatore', taluk: 'Coimbatore North', district: 'Coimbatore', landSize: '3.25', landType: 'Wet', currentCrop: 'Paddy', guidelineValue: 2500000, lastSalePrice: 1800000, lastSaleDate: new Date('2022-05-15') },
      { ownerName: 'Kumarasamy', aadhaarNumber: '234567890123', pattaNumber: 'PT/002/2020', surveyNumber: 'SY/101/002', village: 'Coimbatore', taluk: 'Coimbatore North', district: 'Coimbatore', landSize: '2.50', landType: 'Dry', currentCrop: 'Groundnut', guidelineValue: 1800000, lastSalePrice: 1200000, lastSaleDate: new Date('2021-08-20') },
      { ownerName: 'Palaniappan', aadhaarNumber: '345678901234', pattaNumber: 'PT/003/2020', surveyNumber: 'SY/102/001', village: 'Chittoor', taluk: 'Chittoor', district: 'Chittoor', landSize: '5.00', landType: 'Garden', currentCrop: 'Mango', guidelineValue: 5000000, lastSalePrice: 3500000, lastSaleDate: new Date('2023-01-10') },
      { ownerName: 'Maruthamuthu', aadhaarNumber: '456789012345', pattaNumber: 'PT/004/2020', surveyNumber: 'SY/102/002', village: 'Chittoor', taluk: 'Chittoor', district: 'Chittoor', landSize: '1.75', landType: 'Wet', currentCrop: 'Sugarcane', guidelineValue: 2100000, lastSalePrice: 1500000, lastSaleDate: new Date('2022-11-25') },
      { ownerName: 'Natarajan', aadhaarNumber: '567890123456', pattaNumber: 'PT/005/2020', surveyNumber: 'SY/103/001', village: 'Kallur', taluk: 'Kallur', district: 'Kadapa', landSize: '4.00', landType: 'Dry', currentCrop: 'Cotton', guidelineValue: 3200000, lastSalePrice: 2400000, lastSaleDate: new Date('2023-02-14') },
      { ownerName: 'Venkatachalapathy', aadhaarNumber: '678901234567', pattaNumber: 'PT/006/2020', surveyNumber: 'SY/103/002', village: 'Kallur', taluk: 'Kallur', district: 'Kadapa', landSize: '2.25', landType: 'Garden', currentCrop: 'Banana', guidelineValue: 2800000, lastSalePrice: 2000000, lastSaleDate: new Date('2022-07-30') },
      { ownerName: 'Srinivasan', aadhaarNumber: '789012345678', pattaNumber: 'PT/007/2020', surveyNumber: 'SY/104/001', village: 'Bangalore', taluk: 'Bangalore North', district: 'Bangalore', landSize: '1.00', landType: 'Dry', currentCrop: 'Ragi', guidelineValue: 15000000, lastSalePrice: 12000000, lastSaleDate: new Date('2023-03-05') },
      { ownerName: 'Ravikumar', aadhaarNumber: '890123456789', pattaNumber: 'PT/008/2020', surveyNumber: 'SY/104/002', village: 'Bangalore', taluk: 'Bangalore South', district: 'Bangalore', landSize: '0.50', landType: 'Wet', currentCrop: 'Vegetables', guidelineValue: 8000000, lastSalePrice: 6500000, lastSaleDate: new Date('2022-09-12') },
      { ownerName: 'Chinnasamy', aadhaarNumber: '901234567890', pattaNumber: 'PT/009/2020', surveyNumber: 'SY/105/001', village: 'Madurai', taluk: 'Madurai North', district: 'Madurai', landSize: '6.00', landType: 'Wet', currentCrop: 'Paddy', guidelineValue: 4200000, lastSalePrice: 3200000, lastSaleDate: new Date('2023-04-18') },
      { ownerName: 'Thangaraj', aadhaarNumber: '012345678901', pattaNumber: 'PT/010/2020', surveyNumber: 'SY/105/002', village: 'Madurai', taluk: 'Madurai South', district: 'Madurai', landSize: '3.50', landType: 'Garden', currentCrop: 'Grapes', guidelineValue: 5500000, lastSalePrice: 4200000, lastSaleDate: new Date('2022-12-08') },
      { ownerName: 'Muthusamy', aadhaarNumber: '112233445566', pattaNumber: 'PT/011/2020', surveyNumber: 'SY/106/001', village: 'Kochi', taluk: 'Kochi', district: 'Ernakulam', landSize: '2.00', landType: 'Wet', currentCrop: 'Paddy', guidelineValue: 6000000, lastSalePrice: 4800000, lastSaleDate: new Date('2023-01-22') },
      { ownerName: 'Ponnusamy', aadhaarNumber: '223344556677', pattaNumber: 'PT/012/2020', surveyNumber: 'SY/106/002', village: 'Kochi', taluk: 'Kochi', district: 'Ernakulam', landSize: '1.50', landType: 'Garden', currentCrop: 'Coconut', guidelineValue: 4500000, lastSalePrice: 3600000, lastSaleDate: new Date('2022-10-15') },
      { ownerName: 'Karuppannan', aadhaarNumber: '334455667788', pattaNumber: 'PT/013/2020', surveyNumber: 'SY/107/001', village: 'Hyderabad', taluk: 'Secunderabad', district: 'Hyderabad', landSize: '0.75', landType: 'Dry', currentCrop: 'Groundnut', guidelineValue: 12000000, lastSalePrice: 9500000, lastSaleDate: new Date('2023-02-28') },
      { ownerName: 'Jayaraman', aadhaarNumber: '445566778899', pattaNumber: 'PT/014/2020', surveyNumber: 'SY/107/002', village: 'Hyderabad', taluk: 'Charminar', district: 'Hyderabad', landSize: '0.25', landType: 'Dry', currentCrop: 'Vegetables', guidelineValue: 8000000, lastSalePrice: 6500000, lastSaleDate: new Date('2022-08-05') },
      { ownerName: 'Manickam', aadhaarNumber: '556677889900', pattaNumber: 'PT/015/2020', surveyNumber: 'SY/108/001', village: 'Thiruvananthapuram', taluk: 'Neyyattinkara', district: 'Thiruvananthapuram', landSize: '1.25', landType: 'Wet', currentCrop: 'Paddy', guidelineValue: 3500000, lastSalePrice: 2800000, lastSaleDate: new Date('2023-03-10') },
      { ownerName: 'Vijayaraghavan', aadhaarNumber: '667788990011', pattaNumber: 'PT/016/2020', surveyNumber: 'SY/108/002', village: 'Thiruvananthapuram', taluk: 'Kollam', district: 'Thiruvananthapuram', landSize: '2.75', landType: 'Garden', currentCrop: 'Rubber', guidelineValue: 4800000, lastSalePrice: 3800000, lastSaleDate: new Date('2022-11-20') },
      { ownerName: 'Narayanan', aadhaarNumber: '778899001122', pattaNumber: 'PT/017/2020', surveyNumber: 'SY/109/001', village: 'Mangalore', taluk: 'Mangalore North', district: 'Dakshina Kannada', landSize: '3.00', landType: 'Garden', currentCrop: 'Arecanut', guidelineValue: 7200000, lastSalePrice: 5600000, lastSaleDate: new Date('2023-01-30') },
      { ownerName: 'Subramaniyan', aadhaarNumber: '889900112233', pattaNumber: 'PT/018/2020', surveyNumber: 'SY/109/002', village: 'Mangalore', taluk: 'Mangalore South', district: 'Dakshina Kannada', landSize: '4.50', landType: 'Wet', currentCrop: 'Paddy', guidelineValue: 6500000, lastSalePrice: 5000000, lastSaleDate: new Date('2022-06-25') },
      { ownerName: 'Gopalakrishnan', aadhaarNumber: '990011223344', pattaNumber: 'PT/019/2020', surveyNumber: 'SY/110/001', village: 'Chennai', taluk: 'Chennai Central', district: 'Chennai', landSize: '0.35', landType: 'Dry', currentCrop: 'Vegetables', guidelineValue: 25000000, lastSalePrice: 20000000, lastSaleDate: new Date('2023-04-01') },
      { ownerName: 'Balasubramaniam', aadhaarNumber: '001122334455', pattaNumber: 'PT/020/2020', surveyNumber: 'SY/110/002', village: 'Chennai', taluk: 'Chennai South', district: 'Chennai', landSize: '0.60', landType: 'Dry', currentCrop: 'Fruits', guidelineValue: 18000000, lastSalePrice: 14500000, lastSaleDate: new Date('2022-12-15') }
    ];
    
    await LandRecord.insertMany(sampleRecords);
    console.log('Sample land records seeded successfully');
  } catch (error) {
    console.log('Error seeding land records:', error.message);
  }
}

// Call seed function
seedLandRecords();

// ========================================
// SOIL MOISTURE MONITORING APIs
// ========================================

// Load soil moisture dataset
let soilMoistureData = [];
function loadSoilMoistureData() {
    try {
        const csvPath = path.join(__dirname, 'data/soil_moisture.csv');
        if (fs.existsSync(csvPath)) {
            const data = fs.readFileSync(csvPath, 'utf-8');
            const lines = data.split('\n').slice(1); // Skip header
            soilMoistureData = lines.filter(line => line.trim()).map(line => {
                const [year, month, day, hour, minute, second, moisture0, moisture1, moisture2, moisture3, moisture4, irrigation] = line.split(',');
                return {
                    date: `${year}-${month.padStart(2,'0')}-${day.padStart(2,'0')}`,
                    time: `${hour.padStart(2,'0')}:${minute.padStart(2,'0')}`,
                    moisture0: parseFloat(moisture0),
                    moisture1: parseFloat(moisture1),
                    moisture2: parseFloat(moisture2),
                    moisture3: parseFloat(moisture3),
                    moisture4: parseFloat(moisture4),
                    irrigation: parseInt(irrigation)
                };
            });
            console.log(`Loaded ${soilMoistureData.length} soil moisture records`);
        }
    } catch(e) {
        console.log('No soil moisture data file found');
    }
}
loadSoilMoistureData();

// Get all soil moisture data
app.get('/api/soil-moisture', (req, res) => {
    res.json(soilMoistureData);
});

// Get latest soil moisture readings
app.get('/api/soil-moisture/latest', (req, res) => {
    if (soilMoistureData.length === 0) {
        return res.json({ error: 'No data available' });
    }
    const latest = soilMoistureData[soilMoistureData.length - 1];
    const avgMoisture = (latest.moisture0 + latest.moisture1 + latest.moisture2 + latest.moisture3 + latest.moisture4) / 5;
    
    let status = 'Optimal';
    let recommendation = 'Soil moisture is good';
    if (avgMoisture < 0.30) {
        status = 'Dry - Irrigation Needed';
        recommendation = 'Immediate irrigation recommended';
    } else if (avgMoisture > 0.60) {
        status = 'Too Wet';
        recommendation = 'Avoid irrigation, check drainage';
    }
    
    res.json({
        ...latest,
        averageMoisture: avgMoisture,
        status,
        recommendation,
        alerts: avgMoisture < 0.30 ? ['⚠ Soil moisture critically low!'] : []
    });
});

// Get moisture statistics
app.get('/api/soil-moisture/stats', (req, res) => {
    if (soilMoistureData.length === 0) {
        return res.json({ error: 'No data available' });
    }
    
    const moisture0 = soilMoistureData.map(d => d.moisture0);
    const moisture1 = soilMoistureData.map(d => d.moisture1);
    const moisture2 = soilMoistureData.map(d => d.moisture2);
    const moisture3 = soilMoistureData.map(d => d.moisture3);
    const moisture4 = soilMoistureData.map(d => d.moisture4);
    
    const avg = arr => arr.reduce((a,b) => a+b, 0) / arr.length;
    const min = arr => Math.min(...arr);
    const max = arr => Math.max(...arr);
    
    res.json({
        sensor1: { avg: avg(moisture0).toFixed(2), min: min(moisture0).toFixed(2), max: max(moisture0).toFixed(2) },
        sensor2: { avg: avg(moisture1).toFixed(2), min: min(moisture1).toFixed(2), max: max(moisture1).toFixed(2) },
        sensor3: { avg: avg(moisture2).toFixed(2), min: min(moisture2).toFixed(2), max: max(moisture2).toFixed(2) },
        sensor4: { avg: avg(moisture3).toFixed(2), min: min(moisture3).toFixed(2), max: max(moisture3).toFixed(2) },
        sensor5: { avg: avg(moisture4).toFixed(2), min: min(moisture4).toFixed(2), max: max(moisture4).toFixed(2) },
        irrigationEvents: soilMoistureData.filter(d => d.irrigation === 1).length
    });
});

// Serve intro page at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/intro.html'));
});

// Serve frontend for all other routes (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});
