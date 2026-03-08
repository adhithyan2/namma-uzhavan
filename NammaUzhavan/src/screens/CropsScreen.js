import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { api } from '../services/api';

export default function CropsScreen() {
  const [form, setForm] = useState({ N: '60', P: '55', K: '45', temp: '25', humidity: '70', ph: '6.5', rain: '150' });
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(false);

  const getRecommendations = async () => {
    setLoading(true);
    try {
      const result = await api.getCrops(form.N, form.P, form.K, form.temp, form.humidity, form.ph, form.rain);
      setCrops(result);
    } catch (error) {
      console.log('Error:', error);
    }
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🌾 Crop Recommendations</Text>
        <Text style={styles.subtitle}>AI-powered suggestions based on soil & weather</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Nitrogen (N)</Text>
        <TextInput style={styles.input} value={form.N} onChangeText={(v) => setForm({...form, N: v})} keyboardType="numeric" />

        <Text style={styles.label}>Phosphorus (P)</Text>
        <TextInput style={styles.input} value={form.P} onChangeText={(v) => setForm({...form, P: v})} keyboardType="numeric" />

        <Text style={styles.label}>Potassium (K)</Text>
        <TextInput style={styles.input} value={form.K} onChangeText={(v) => setForm({...form, K: v})} keyboardType="numeric" />

        <Text style={styles.label}>Temperature (°C)</Text>
        <TextInput style={styles.input} value={form.temp} onChangeText={(v) => setForm({...form, temp: v})} keyboardType="numeric" />

        <Text style={styles.label}>Humidity (%)</Text>
        <TextInput style={styles.input} value={form.humidity} onChangeText={(v) => setForm({...form, humidity: v})} keyboardType="numeric" />

        <Text style={styles.label}>pH Level</Text>
        <TextInput style={styles.input} value={form.ph} onChangeText={(v) => setForm({...form, ph: v})} keyboardType="numeric" />

        <Text style={styles.label}>Rainfall (mm)</Text>
        <TextInput style={styles.input} value={form.rain} onChangeText={(v) => setForm({...form, rain: v})} keyboardType="numeric" />

        <TouchableOpacity style={styles.button} onPress={getRecommendations} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Analyzing...' : 'Get Recommendations'}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Top Recommendations</Text>
      {crops.map((crop, index) => (
        <View key={index} style={[styles.cropCard, index === 0 && styles.topCrop]}>
          <View style={styles.rankBadge}>
            <Text style={styles.rankText}>#{index + 1}</Text>
          </View>
          <View style={styles.cropInfo}>
            <Text style={styles.cropName}>{crop.crop}</Text>
            <Text style={styles.cropProbability}>{(crop.probability * 100).toFixed(1)}% Success Rate</Text>
          </View>
          <View style={styles.cropProfit}>
            <Text style={styles.profitLabel}>Profit</Text>
            <Text style={styles.profitValue}>₹{crop.profit || '50,000'}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { padding: 20, paddingTop: 50, backgroundColor: '#10b981' },
  title: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  subtitle: { color: 'rgba(255,255,255,0.8)', marginTop: 5 },
  form: { backgroundColor: 'white', margin: 15, borderRadius: 15, padding: 15 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginTop: 10 },
  input: { backgroundColor: '#f5f5f5', borderRadius: 10, padding: 12, marginTop: 5 },
  button: { backgroundColor: '#10b981', borderRadius: 10, padding: 15, alignItems: 'center', marginTop: 20 },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', margin: 15 },
  cropCard: { backgroundColor: 'white', marginHorizontal: 15, marginBottom: 10, borderRadius: 12, padding: 15, flexDirection: 'row', alignItems: 'center' },
  topCrop: { borderWidth: 2, borderColor: '#10b981' },
  rankBadge: { backgroundColor: '#10b981', width: 35, height: 35, borderRadius: 17.5, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  rankText: { color: 'white', fontWeight: 'bold' },
  cropInfo: { flex: 1 },
  cropName: { fontSize: 18, fontWeight: 'bold', textTransform: 'capitalize' },
  cropProbability: { color: '#10b981' },
  cropProfit: { alignItems: 'flex-end' },
  profitLabel: { fontSize: 12, color: '#666' },
  profitValue: { fontSize: 16, fontWeight: 'bold', color: '#10b981' }
});
