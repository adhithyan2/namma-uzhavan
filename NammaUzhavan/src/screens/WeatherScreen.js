import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { api } from '../services/api';

export default function WeatherScreen() {
  const [city, setCity] = useState('Coimbatore');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);

  const fetchWeather = async () => {
    try {
      const data = await api.getWeather(city);
      setWeather(data);
      setForecast(data.forecast || []);
    } catch (error) {
      console.log('Error:', error);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🌤️ Weather</Text>
      </View>

      <View style={styles.searchBox}>
        <TextInput
          style={styles.input}
          value={city}
          onChangeText={setCity}
          placeholder="Enter city name"
        />
        <TouchableOpacity style={styles.searchBtn} onPress={fetchWeather}>
          <Text style={styles.searchBtnText}>Search</Text>
        </TouchableOpacity>
      </View>

      {weather && (
        <>
          <View style={styles.currentWeather}>
            <Text style={styles.temp}>{weather.current?.temp}°C</Text>
            <Text style={styles.condition}>{weather.current?.condition}</Text>
            <Text style={styles.location}>📍 {city}</Text>
          </View>

          <View style={styles.detailsGrid}>
            <View style={styles.detailCard}>
              <Text style={styles.detailIcon}>💧</Text>
              <Text style={styles.detailLabel}>Humidity</Text>
              <Text style={styles.detailValue}>{weather.current?.humidity}%</Text>
            </View>
            <View style={styles.detailCard}>
              <Text style={styles.detailIcon}>💨</Text>
              <Text style={styles.detailLabel}>Wind</Text>
              <Text style={styles.detailValue}>{weather.current?.wind} m/s</Text>
            </View>
            <View style={styles.detailCard}>
              <Text style={styles.detailIcon}>🌧️</Text>
              <Text style={styles.detailLabel}>Rain</Text>
              <Text style={styles.detailValue}>{weather.current?.rain}%</Text>
            </View>
            <View style={styles.detailCard}>
              <Text style={styles.detailIcon}>☀️</Text>
              <Text style={styles.detailLabel}>UV Index</Text>
              <Text style={styles.detailValue}>5</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>5-Day Forecast</Text>
          {forecast.map((day, index) => (
            <View key={index} style={styles.forecastCard}>
              <Text style={styles.forecastDay}>{day.day || `Day ${index + 1}`}</Text>
              <Text style={styles.forecastTemp}>{day.temp}°C</Text>
              <Text style={styles.forecastCondition}>{day.condition}</Text>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { padding: 20, paddingTop: 50, backgroundColor: '#10b981' },
  title: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  searchBox: { flexDirection: 'row', padding: 15, gap: 10 },
  input: { flex: 1, backgroundColor: 'white', borderRadius: 10, padding: 12, fontSize: 16 },
  searchBtn: { backgroundColor: '#10b981', borderRadius: 10, padding: 12, justifyContent: 'center' },
  searchBtnText: { color: 'white', fontWeight: 'bold' },
  currentWeather: { backgroundColor: '#10b981', margin: 15, borderRadius: 20, padding: 30, alignItems: 'center' },
  temp: { fontSize: 64, fontWeight: 'bold', color: 'white' },
  condition: { fontSize: 20, color: 'white' },
  location: { color: 'rgba(255,255,255,0.8)', marginTop: 10 },
  detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 10, justifyContent: 'space-between' },
  detailCard: { backgroundColor: 'white', borderRadius: 15, padding: 15, width: '48%', alignItems: 'center', marginBottom: 10 },
  detailIcon: { fontSize: 30 },
  detailLabel: { color: '#666', marginTop: 5 },
  detailValue: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', margin: 15 },
  forecastCard: { backgroundColor: 'white', marginHorizontal: 15, marginBottom: 10, borderRadius: 12, padding: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  forecastDay: { fontWeight: 'bold', width: 80 },
  forecastTemp: { fontSize: 18, fontWeight: 'bold', color: '#10b981' },
  forecastCondition: { color: '#666' }
});
