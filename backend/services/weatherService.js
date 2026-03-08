const axios = require('axios');

const WEATHER_API_KEY = process.env.WEATHER_API_KEY || '09043d37fbaf47dc1c785458c7385a7c';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

class WeatherService {
  async getCurrentWeather(city) {
    try {
      const response = await axios.get(`${BASE_URL}/weather`, {
        params: {
          q: city,
          appid: WEATHER_API_KEY,
          units: 'metric'
        }
      });
      
      const data = response.data;
      return {
        success: true,
        current: {
          temp: Math.round(data.main.temp),
          feels_like: Math.round(data.main.feels_like),
          humidity: data.main.humidity,
          pressure: data.main.pressure,
          wind: data.wind.speed,
          condition: data.weather[0].main,
          description: data.weather[0].description,
          icon: data.weather[0].icon,
          city: data.name,
          country: data.sys.country,
          rain: data.rain ? data.rain['1h'] || 0 : 0
        }
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch weather data'
      };
    }
  }

  async getForecast(city, days = 7) {
    try {
      const response = await axios.get(`${BASE_URL}/forecast`, {
        params: {
          q: city,
          appid: WEATHER_API_KEY,
          units: 'metric',
          cnt: days * 8
        }
      });

      const list = response.data.list;
      const dailyData = {};
      
      list.forEach(item => {
        const date = item.dt_txt.split(' ')[0];
        if (!dailyData[date]) {
          dailyData[date] = {
            temps: [],
            humidity: [],
            conditions: [],
            rain: []
          };
        }
        dailyData[date].temps.push(item.main.temp);
        dailyData[date].humidity.push(item.main.humidity);
        dailyData[date].conditions.push(item.weather[0].main);
        dailyData[date].rain.push(item.pop * 100);
      });

      const forecast = Object.entries(dailyData).slice(0, days).map(([date, values]) => ({
        date,
        day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        temp: {
          min: Math.round(Math.min(...values.temps)),
          max: Math.round(Math.max(...values.temps)),
          avg: Math.round(values.temps.reduce((a, b) => a + b, 0) / values.temps.length)
        },
        humidity: Math.round(values.humidity.reduce((a, b) => a + b, 0) / values.humidity.length),
        condition: this.getMostFrequent(values.conditions),
        rainProbability: Math.round(Math.max(...values.rain))
      }));

      return { success: true, forecast };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch forecast'
      };
    }
  }

  async getWeatherByCoords(lat, lon) {
    try {
      const response = await axios.get(`${BASE_URL}/weather`, {
        params: {
          lat,
          lon,
          appid: WEATHER_API_KEY,
          units: 'metric'
        }
      });
      
      const data = response.data;
      return {
        success: true,
        current: {
          temp: Math.round(data.main.temp),
          feels_like: Math.round(data.main.feels_like),
          humidity: data.main.humidity,
          pressure: data.main.pressure,
          wind: data.wind.speed,
          condition: data.weather[0].main,
          description: data.weather[0].description,
          icon: data.weather[0].icon,
          city: data.name,
          country: data.sys.country
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch weather data'
      };
    }
  }

  getMostFrequent(arr) {
    return arr.sort((a, b) =>
      arr.filter(v => v === a).length - arr.filter(v => v === b).length
    ).pop();
  }
}

module.exports = new WeatherService();
