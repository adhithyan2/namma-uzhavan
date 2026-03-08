import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';

export default function ProfileScreen({ navigation }) {
  const [farmer, setFarmer] = useState({
    name: 'Demo Farmer',
    phone: '9876543210',
    district: 'Coimbatore',
    village: 'Velliangadu',
    acres: '5'
  });
  const [editing, setEditing] = useState(false);

  const handleSave = () => {
    setEditing(false);
    Alert.alert('Success', 'Profile updated successfully!');
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: () => navigation.replace('Login'), style: 'destructive' }
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>👨‍🌾</Text>
        </View>
        <Text style={styles.name}>{farmer.name}</Text>
        <Text style={styles.phone}>📱 {farmer.phone}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Personal Details</Text>
          <TouchableOpacity onPress={() => setEditing(!editing)}>
            <Text style={styles.editBtn}>{editing ? 'Cancel' : 'Edit'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Name</Text>
          {editing ? (
            <TextInput style={styles.input} value={farmer.name} onChangeText={(v) => setFarmer({...farmer, name: v})} />
          ) : (
            <Text style={styles.fieldValue}>{farmer.name}</Text>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Phone</Text>
          <Text style={styles.fieldValue}>{farmer.phone}</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>District</Text>
          {editing ? (
            <TextInput style={styles.input} value={farmer.district} onChangeText={(v) => setFarmer({...farmer, district: v})} />
          ) : (
            <Text style={styles.fieldValue}>{farmer.district}</Text>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Village</Text>
          {editing ? (
            <TextInput style={styles.input} value={farmer.village} onChangeText={(v) => setFarmer({...farmer, village: v})} />
          ) : (
            <Text style={styles.fieldValue}>{farmer.village}</Text>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Land Size</Text>
          {editing ? (
            <TextInput style={styles.input} value={farmer.acres} onChangeText={(v) => setFarmer({...farmer, acres: v})} keyboardType="numeric" />
          ) : (
            <Text style={styles.fieldValue}>{farmer.acres} acres</Text>
          )}
        </View>

        {editing && (
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Save Changes</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Links</Text>
        <TouchableOpacity style={styles.linkBtn} onPress={() => navigation.navigate('LandRecords')}>
          <Text style={styles.linkBtnText}>🗺️ Land Records</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkBtn} onPress={() => navigation.navigate('Soil')}>
          <Text style={styles.linkBtnText}>🌱 Soil Monitoring</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkBtn} onPress={() => {}}>
          <Text style={styles.linkBtnText}>🏛️ Government Schemes</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutBtnText}>Logout</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Version 1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#10b981', padding: 20, paddingTop: 50, alignItems: 'center' },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 50 },
  name: { fontSize: 24, fontWeight: 'bold', color: 'white', marginTop: 10 },
  phone: { color: 'rgba(255,255,255,0.8)', marginTop: 5 },
  section: { backgroundColor: 'white', margin: 15, borderRadius: 15, padding: 15 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  editBtn: { color: '#10b981', fontWeight: 'bold' },
  field: { marginBottom: 15 },
  fieldLabel: { color: '#666', fontSize: 12 },
  fieldValue: { fontSize: 16, color: '#333', marginTop: 3 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginTop: 3 },
  saveBtn: { backgroundColor: '#10b981', borderRadius: 10, padding: 15, alignItems: 'center', marginTop: 10 },
  saveBtnText: { color: 'white', fontWeight: 'bold' },
  linkBtn: { backgroundColor: '#f5f5f5', borderRadius: 10, padding: 15, marginBottom: 10 },
  linkBtnText: { fontSize: 16 },
  logoutBtn: { backgroundColor: '#ffebee', marginHorizontal: 15, borderRadius: 10, padding: 15, alignItems: 'center' },
  logoutBtnText: { color: '#f44336', fontWeight: 'bold' },
  version: { textAlign: 'center', color: '#999', marginTop: 20, marginBottom: 50 }
});
