# Namma Uzhavan - Smart Agriculture Platform

<p align="center">
  <img src="https://img.shields.io/badge/Version-2.0-green" alt="Version">
  <img src="https://img.shields.io/badge/Node.js-Express-brightgreen" alt="Stack">
  <img src="https://img.shields.io/badge/Database-MongoDB Atlas-blue" alt="Database">
  <img src="https://img.shields.io/badge/License-MIT-yellow" alt="License">
</p>

## 🌾 Overview

**Namma Uzhavan** (Our Farmer) is a comprehensive Smart Agriculture Platform designed to help farmers with AI-powered crop recommendations, real-time soil monitoring, weather forecasting, and marketplace facilities. The platform supports multiple Indian languages for better accessibility.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Installation](#installation)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)
- [IoT Integration](#iot-integration)
- [Language Support](#language-support)
- [License](#license)

## ✨ Features

### 1. 🔐 Authentication System
- **Farmer Login/Registration** - Phone number & password based auth
- **Agent Login** - Booth agent management system
- **JWT Authentication** - Secure token-based sessions
- **bcrypt Password Hashing** - Encrypted password storage

### 2. 🌤️ Weather Forecasting
- **Current Weather** - Real-time weather data
- **7-Day Forecast** - Extended forecast with rain probability
- **Temperature Trends** - Historical and predicted trends
- **District-based** - Location-specific weather

### 3. 🌱 AI Crop Recommendation Engine
- **Smart Analysis** - Based on NPK, pH, temperature, humidity, rainfall
- **Multiple Recommendations** - Best crop + alternatives
- **Profitability Analysis** - Expected returns per acre
- **Season Information** - Optimal sowing time

### 4. 🌍 Soil Health Analysis
- **NPK Monitoring** - Nitrogen, Phosphorus, Potassium levels
- **pH Level Tracking** - Soil acidity/alkalinity
- **Health Status** - Optimal/Low/Critical indicators
- **Recommendations** - Fertilizer application advice

### 5. 📡 IoT Soil Moisture Monitoring
- **ESP8266/ESP32 Support** - Arduino-compatible sensors
- **Real-time Data** - Live moisture readings
- **5-Sensor Array** - Multi-point monitoring
- **Irrigation Control** - Auto-detection of irrigation events

### 6. 🗺️ Crop Health Map
- **Leaflet.js Integration** - Interactive map visualization
- **Color-coded Status** - Green/Yellow/Red indicators
- **District Filtering** - View by region
- **Farmer Details** - Click for more info

### 7. 🤖 AI Farming Advisor
- **Smart Notifications** - Based on soil & weather
- **Multi-language Support** - 5 Indian languages
- **Priority Alerts** - High/Medium/Low severity
- **Actionable Advice** - Specific recommendations

### 8. 🛒 Farmer Marketplace
- **Product Listings** - Seeds, fertilizers, pesticides
- **Price Comparison** - Compare dealer prices
- **Dealer Management** - Verified sellers
- **Contact System** - Direct farmer-dealer communication

### 9. 📄 Land Records Management
- **Survey Number Search** - Easy record lookup
- **Ownership Details** - Owner information
- **Area Tracking** - Land size in acres
- **Verification Status** - Verified/unverified

### 10. 🌍 Multi-Language Support
- English (en)
- Tamil (ta)
- Hindi (hi)
- Malayalam (ml)
- Kannada (kn)

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| HTML5 | Structure |
| CSS3 | Styling |
| Bootstrap 5.3 | UI Framework |
| JavaScript | Client Logic |
| Chart.js | Data Visualization |
| Leaflet.js | Maps |
| Font Awesome 6.4 | Icons |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime |
| Express.js | Web Framework |
| MongoDB | Database |
| Mongoose | ODM |
| JWT | Authentication |
| bcrypt | Password Hashing |
| axios | HTTP Client |

### External APIs
- **OpenWeather API** - Weather data

## 📂 Project Structure

```
namma-uzhavan/
├── backend/
│   ├── controllers/          # Route handlers
│   │   ├── aiAdvisorController.js
│   │   ├── cropController.js
│   │   ├── cropHealthController.js
│   │   ├── soilController.js
│   │   └── weatherController.js
│   ├── middleware/           # Custom middleware
│   │   └── auth.js
│   ├── models/               # MongoDB schemas
│   │   ├── CropHealth.js
│   │   ├── Farmer.js
│   │   ├── LandRecord.js
│   │   ├── Product.js
│   │   ├── SoilHealth.js
│   │   └── SoilMoistureReading.js
│   ├── routes/               # API routes
│   │   ├── aiAdvisorRoutes.js
│   │   ├── cropHealthRoutes.js
│   │   ├── cropRoutes.js
│   │   ├── soilRoutes.js
│   │   └── weatherRoutes.js
│   ├── services/             # Business logic
│   │   ├── aiAdvisorService.js
│   │   ├── cropRecommendationService.js
│   │   └── weatherService.js
│   ├── data/                 # CSV datasets
│   │   ├── Crop_recommendation.csv
│   │   └── soil_moisture.csv
│   ├── .env                  # Environment config
│   ├── package.json
│   └── server.js             # Entry point
│
├── frontend/
│   ├── index.html            # Login page
│   ├── intro.html            # Landing page
│   ├── smart-dashboard.html # Farmer dashboard
│   ├── soil-dashboard.html  # Soil monitoring
│   ├── crop-health-map.html  # Crop health map
│   ├── marketplace.html      # Buy/sell
│   ├── land-search.html      # Land records
│   ├── language-switcher.js  # i18n handler
│   ├── locales/              # Translation JSONs
│   │   ├── en.json, ta.json, hi.json, ml.json, kn.json
│   └── videos/               # Media assets
│
├── NammaUzhavan/            # React Native Mobile App
│   ├── src/
│   │   ├── screens/         # App screens
│   │   └── services/        # API service
│   ├── App.js
│   └── package.json
│
├── README.md
└── .gitignore
```

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/farmer-register` | Register new farmer |
| POST | `/api/farmer-login` | Farmer login |
| POST | `/api/agent-login` | Agent login |
| GET | `/api/farmers` | Get all farmers |

### Weather
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/weather` | Current weather |
| GET | `/api/weather/forecast` | 7-day forecast |
| GET | `/api/weather/current` | Complete weather |

### Crop Recommendation
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/crop-recommendation` | AI recommendations |
| GET | `/api/crops` | Get crop list |

### Soil Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/soil-health` | Add soil record |
| GET | `/api/soil-health/:farmerId` | Get farmer's soil data |
| POST | `/api/soil-moisture` | IoT sensor data |

### Crop Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/crop-health` | Add crop record |
| GET | `/api/crop-health/:farmerId` | Get farmer's crops |
| GET | `/api/crop-health/map/:district` | Map view data |

### AI Advisor
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai-advisor` | Get farming advice |
| GET | `/api/ai-advisor/quick` | Quick advice |

### Marketplace
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all products |
| POST | `/api/products` | Add new product |

### Land Records
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/land-records` | Get records |
| POST | `/api/land-records` | Add record |

## 🗄️ Database Schema

### Farmer
```javascript
{
  name: String,
  phone: String (unique),
  password: String (hashed),
  district: String,
  village: String,
  acres: Number,
  createdAt: Date
}
```

### SoilHealth
```javascript
{
  farmerId: ObjectId,
  N: Number,        // Nitrogen
  P: Number,         // Phosphorus
  K: Number,         // Potassium
  ph: Number,
  organicMatter: Number,
  recordedAt: Date
}
```

### SoilMoistureReading
```javascript
{
  deviceId: String,
  farmerId: ObjectId,
  location: { lat, lng, district, village },
  sensors: { moisture0-4, temperature, humidity },
  irrigation: Boolean,
  recordedAt: Date
}
```

### CropHealth
```javascript
{
  farmerId: ObjectId,
  crop: String,
  location: { lat, lng, area, district, village },
  health: { status, ndvi, moistureLevel, pestDamage },
  irrigation: { type, schedule },
  estimatedYield: { value, unit }
}
```

## 🚀 Installation

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Git

### Local Development

```bash
# Clone repository
git clone https://github.com/adhithyan2/namma-uzhavan.git
cd namma-uzhavan

# Install backend dependencies
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your values

# Start server
npm start
# Server runs on http://localhost:5000

# For frontend (in another terminal)
npx serve frontend
```

### Mobile App (React Native)

```bash
cd NammaUzhavan
npm install
npx expo start
```

## ☁️ Deployment

### Backend (Render.com)

1. Push code to GitHub
2. Connect GitHub to Render
3. Set environment variables:
   - `MONGODB_URI` - MongoDB Atlas connection string
   - `JWT_SECRET` - Your secret key
   - `WEATHER_API_KEY` - OpenWeather API key
   - `PORT` - 5000

### Database (MongoDB Atlas)

1. Create MongoDB Atlas account
2. Create cluster (free tier)
3. Create database user
4. Get connection string
5. Add to `.env`

### Frontend

The frontend is served by the Express backend. Deploy backend to Render and it will serve the frontend automatically.

## 📦 Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/

# JWT
JWT_SECRET=your_super_secret_key

# OpenWeather API
WEATHER_API_KEY=your_api_key

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

## 🔌 IoT Integration

### ESP8266/ESP32 Code Example

```cpp
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>

const char* ssid = "YOUR_WIFI";
const char* password = "YOUR_PASSWORD";
const char* serverUrl = "https://your-app.onrender.com/api/soil-moisture";

float moisture0, moisture1, moisture2, moisture3, moisture4;

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    // Read sensors
    moisture0 = analogRead(A0) / 1023.0;
    // ... read other sensors
    
    // Send data
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");
    
    String payload = "{\"deviceId\":\"ESP001\"," +
                     "\"moisture0\":" + String(moisture0) + "," +
                     "\"moisture1\":" + String(moisture1) + "," +
                     "\"temperature\":25," +
                     "\"humidity\":70}";
    
    http.POST(payload);
    http.end();
  }
  delay(300000); // Send every 5 minutes
}
```

## 🌍 Language Support

The platform supports 5 languages:

| Code | Language | Native Name |
|------|----------|-------------|
| en | English | English |
| ta | Tamil | தமிழ் |
| hi | Hindi | हिंदी |
| ml | Malayalam | മലയാളം |
| kn | Kannada | ಕನ್ನಡ |

To switch language, use:
```javascript
changeLanguage('ta') // Switch to Tamil
```

## 📄 License

MIT License - feel free to use this project for educational and commercial purposes.

---

<p align="center">
  Made with ❤️ for Indian Farmers
</p>
