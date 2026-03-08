import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { api } from '../services/api';

const { width } = Dimensions.get('window');

export default function SoilScreen() {
  const [latest, setLatest] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const latestData = await api.getSoilMoistureLatest();
      const statsData = await api.getSoilMoistureStats();
      setLatest(latestData);
      setStats(statsData);
    } catch (error) {
      console.log('Error:', error);
    }
  };

  const getStatus = (value) => {
    if (value < 0.3) return { label: 'DRY', color: '#ff9800' };
    if (value > 0.5) return { label: 'WET', color: '#2196f3' };
    return { label: 'OPTIMAL', color: '#4caf50' };
  };

  const sensors = latest ? [
    { name: 'Sensor 1', value: latest.moisture0 },
    { name: 'Sensor 2', value: latest.moisture1 },
    { name: 'Sensor 3', value: latest.moisture2 },
    { name: 'Sensor 4', value: latest.moisture3 },
    { name: 'Sensor 5', value: latest.moisture4 },
  ] : [];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🌱 Soil Moisture</Text>
        <Text style={styles.subtitle}>Real-time monitoring</Text>
      </View>

      {/* Status Card */}
      <View style={styles.statusCard}>
        <Text style={styles.statusLabel}>Average Moisture</Text>
        <Text style={styles.statusValue}>
          {latest ? `${(Object.values(latest).reduce((a, b) => a + b, 0) / 5 * 100).toFixed(0)}%` : '--%'}
        </Text>
        <Text style={styles.statusStatus}>Status: OPTIMAL</Text>
      </View>

      {/* Sensor Cards */}
      <Text style={styles.sectionTitle}>Sensor Readings</Text>
      <View style={styles.sensorsGrid}>
        {sensors.map((sensor, index) => {
          const status = getStatus(sensor.value);
          return (
            <View key={index} style={[styles.sensorCard, { borderLeftColor: status.color }]}>
              <Text style={styles.sensorName}>{sensor.name}</Text>
              <Text style={styles.sensorValue}>{(sensor.value * 100).toFixed(0)}%</Text>
              <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
                <Text style={styles.statusBadgeText}>{status.label}</Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* Irrigation Info */}
      <View style={styles.irrigationCard}>
        <Text style={styles.irrigationTitle}>💧 Irrigation Status</Text>
        <Text style={styles.irrigationText}>
          {latest?.irrigation ? 'Irrigation is ON' : 'Irrigation is OFF'}
        </Text>
        <Text style={styles.irrigationTime}>Last updated: {latest?.time}</Text>
      </View>

      {/* Stats */}
      {stats && (
        <View style={styles.statsCard}>
          <Text style={styles.sectionTitle}>Statistics</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Min</Text>
              <Text style={styles.statValue}>{(stats.min * 100).toFixed(0)}%</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Max</Text>
              <Text style={styles.statValue}>{(stats.max * 100).toFixed(0)}%</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Avg</Text>
              <Text style={styles.statValue}>{(stats.avg * 100).toFixed(0)}%</Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { padding: 20, paddingTop: 50, backgroundColor: '#10b981' },
  title: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  subtitle: { color: 'rgba(255,255,255,0.8)' },
  statusCard: { backgroundColor: '#10b981', margin: 15, borderRadius: 15, padding: 20, alignItems: 'center' },
  statusLabel: { color: 'rgba(255,255,255,0.8)' },
  statusValue: { fontSize: 48, fontWeight: 'bold', color: 'white' },
  statusStatus: { color: 'white', marginTop: 5 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', margin: 15 },
  sensorsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 10, justifyContent: 'space-between' },
  sensorCard: { width: (width - 40) / 2, backgroundColor: 'white', borderRadius: 12, padding: 15, marginBottom: 10, borderLeftWidth: 4 },
  sensorName: { color: '#666' },
  sensorValue: { fontSize: 28, fontWeight: 'bold', color: '#333' },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, marginTop: 5 },
  statusBadgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  irrigationCard: { backgroundColor: '#e3f2fd', margin: 15, borderRadius: 12, padding: 15 },
  irrigationTitle: { fontWeight: 'bold', fontSize: 16 },
  irrigationText: { color: '#1976d2', marginTop: 5 },
  irrigationTime: { color: '#666', fontSize: 12, marginTop: 5 },
  statsCard: { backgroundColor: 'white', margin: 15, borderRadius: 15, padding: 15 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statLabel: { color: '#666' },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#333' }
});
