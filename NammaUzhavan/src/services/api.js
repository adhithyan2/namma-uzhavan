const BASE_URL = 'https://namma-uzhavan.onrender.com';

export const api = {
  // Auth
  farmerLogin: async (phone, password) => {
    const response = await fetch(`${BASE_URL}/api/farmer-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password })
    });
    return response.json();
  },

  farmerRegister: async (data) => {
    const response = await fetch(`${BASE_URL}/api/farmer-register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  agentLogin: async (agentId, password) => {
    const response = await fetch(`${BASE_URL}/api/agent-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId, password })
    });
    return response.json();
  },

  // Weather
  getWeather: async (city) => {
    const response = await fetch(`${BASE_URL}/api/weather?city=${city}`);
    return response.json();
  },

  // Crops
  getCrops: async (N, P, K, temperature, humidity, ph, rainfall) => {
    const response = await fetch(`${BASE_URL}/api/crops`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ N: Number(N), P: Number(P), K: Number(K), temperature, humidity, ph, rainfall })
    });
    return response.json();
  },

  // Marketplace
  getProducts: async () => {
    const response = await fetch(`${BASE_URL}/api/products`);
    return response.json();
  },

  addProduct: async (data) => {
    const response = await fetch(`${BASE_URL}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  // Soil Moisture
  getSoilMoisture: async () => {
    const response = await fetch(`${BASE_URL}/api/soil-moisture`);
    return response.json();
  },

  getSoilMoistureLatest: async () => {
    const response = await fetch(`${BASE_URL}/api/soil-moisture/latest`);
    return response.json();
  },

  getSoilMoistureStats: async () => {
    const response = await fetch(`${BASE_URL}/api/soil-moisture/stats`);
    return response.json();
  },

  // Land Records
  getLandRecords: async () => {
    const response = await fetch(`${BASE_URL}/api/land-records`);
    return response.json();
  },

  addLandRecord: async (data) => {
    const response = await fetch(`${BASE_URL}/api/land-records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  // Farmers
  getFarmers: async () => {
    const response = await fetch(`${BASE_URL}/api/farmers`);
    return response.json();
  }
};
