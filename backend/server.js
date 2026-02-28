const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const path = require('path');

const User = require('./models/User');
const FarmerProfile = require('./models/FarmerProfile');
const Product = require('./models/Product');
const Dealer = require('./models/Dealer');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'climate_crop_secret_key_2024';
const WEATHER_API_KEY = '09043d37fbaf47dc1c785458c7385a7c';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/climate_crop_engine').then(() => {
  console.log('Connected to MongoDB');
  seedData();
}).catch(err => console.error('MongoDB connection error:', err));

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

// GET /crop-suggestion
app.get('/api/crop-suggestion', async (req, res) => {
  try {
    const { temperature, rainfall, language, soilType, location } = req.query;
    const temp = parseFloat(temperature) || 25;
    const rain = parseFloat(rainfall) || 50;
    const lang = language || 'en';
    const soil = soilType || '';
    const loc = location || '';

    // Get advanced crop scoring with location
    const scoredCrops = calculateCropScore(temp, rain, soil, loc);

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

// Serve frontend for all other routes (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});
