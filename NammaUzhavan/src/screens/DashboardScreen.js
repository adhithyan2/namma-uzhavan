import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { api } from '../services/api';

export default function DashboardScreen({ navigation }) {
  const [weather, setWeather] = useState(null);
  const [crops, setCrops] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const weatherData = await api.getWeather('Coimbatore');
      setWeather(weatherData);
      
      const cropsData = await api.getCrops(60, 55, 45, 25, 70, 6.5, 150);
      setCrops(cropsData.slice(0, 3));
    } catch (error) {
      console.log('Error loading data:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome Farmer! 👋</Text>
          <Text style={styles.location}>📍 Coimbatore, Tamil Nadu</Text>
        </View>
        <TouchableOpacity style={styles.alertBtn}>
          <Text style={styles.alertIcon}>🔔</Text>
          <View style={styles.badge}><Text style={styles.badgeText}>3</Text></View>
        </TouchableOpacity>
      </View>

      {/* Weather Card */}
      <View style={styles.weatherCard}>
        <View style={styles.weatherMain}>
          <Text style={styles.temp}>{weather?.current?.temp || '--'}°C</Text>
          <View>
            <Text style={styles.weatherDesc}>{weather?.current?.condition || 'Clear'}</Text>
            <Text style={styles.weatherLocation}>Coimbatore</Text>
          </View>
        </View>
        <View style={styles.weatherDetails}>
          <View style={styles.weatherItem}><Text>💧</Text><Text>{weather?.current?.humidity || '--'}%</Text></View>
          <View style={styles.weatherItem}><Text>💨</Text><Text>{weather?.current?.wind || '--'} m/s</Text></View>
          <View style={styles.weatherItem}><Text>🌧️</Text><Text>{weather?.current?.rain || '0'}%</Text></View>
        </View>
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Soil')}>
          <Text style={styles.actionIcon}>🌱</Text>
          <Text style={styles.actionText}>Soil Monitor</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('LandRecords')}>
          <Text style={styles.actionIcon}>🗺️</Text>
          <Text style={styles.actionText}>Land Records</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Market')}>
          <Text style={styles.actionIcon}>🛒</Text>
          <Text style={styles.actionText}>Market</Text>
        </TouchableOpacity>
      </View>

      {/* Crop Suggestions */}
      <Text style={styles.sectionTitle}>🌾 Recommended Crops</Text>
      {crops.map((crop, index) => (
        <View key={index} style={styles.cropCard}>
          <View style={styles.cropInfo}>
            <Text style={styles.cropName}>{crop.crop}</Text>
            <Text style={styles.cropMatch}>{(crop.probability * 100).toFixed(0)}% Match</Text>
          </View>
          <View style={styles.cropProfit}>
            <Text style={styles.profitText}>₹{crop.profit || '50,000'}/acre</Text>
          </View>
        </View>
      ))}

      {/* Alerts */}
      <Text style={styles.sectionTitle}>⚠️ Risk Alerts</Text>
      <View style={styles.alertCard}>
        <Text style={styles.alertTitle}>Drought Warning</Text>
        <Text style={styles.alertDesc}>Low rainfall expected next week. Consider irrigation.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50, backgroundColor: '#10b981' },
  greeting: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  location: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  alertBtn: { position: 'relative' },
  alertIcon: { fontSize: 24 },
  badge: { position: 'absolute', top: -5, right: -5, backgroundColor: 'red', borderRadius: 10, width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  weatherCard: { backgroundColor: '#10b981', margin: 15, borderRadius: 15, padding: 20 },
  weatherMain: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  temp: { fontSize: 48, fontWeight: 'bold', color: 'white' },
  weatherDesc: { fontSize: 18, color: 'white' },
  weatherLocation: { color: 'rgba(255,255,255,0.8)' },
  weatherDetails: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20, paddingTop: 15, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)' },
  weatherItem: { alignItems: 'center', color: 'white' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginHorizontal: 15, marginTop: 20, marginBottom: 10 },
  quickActions: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 10 },
  actionBtn: { backgroundColor: 'white', borderRadius: 15, padding: 15, alignItems: 'center', width: 100 },
  actionIcon: { fontSize: 30 },
  actionText: { fontSize: 12, marginTop: 5, textAlign: 'center' },
  cropCard: { backgroundColor: 'white', marginHorizontal: 15, marginBottom: 10, borderRadius: 12, padding: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cropInfo: {},
  cropName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  cropMatch: { color: '#10b981' },
  cropProfit: { backgroundColor: '#e8f5e9', padding: 10, borderRadius: 8 },
  profitText: { color: '#10b981', fontWeight: 'bold' },
  alertCard: { backgroundColor: '#fff3e0', marginHorizontal: 15, borderRadius: 12, padding: 15, borderLeftWidth: 4, borderLeftColor: '#ff9800' },
  alertTitle: { fontWeight: 'bold', color: '#e65100' },
  alertDesc: { color: '#666', marginTop: 5 }
});
