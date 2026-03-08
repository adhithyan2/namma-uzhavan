import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { api } from '../services/api';

export default function RegisterScreen({ navigation }) {
  const [formData, setFormData] = useState({
    name: '', phone: '', password: '', district: '', village: '', acres: ''
  });
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!formData.name || !formData.phone || !formData.password) {
      Alert.alert('Error', 'Please fill required fields');
      return;
    }

    setLoading(true);
    try {
      const result = await api.farmerRegister({
        name: formData.name,
        phone: formData.phone,
        password: formData.password,
        district: formData.district,
        village: formData.village,
        acres: formData.acres
      });

      if (result.success) {
        Alert.alert('Success', 'Registration successful!', [
          { text: 'OK', onPress: () => navigation.navigate('Login') }
        ]);
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Server not reachable');
    }
    setLoading(false);
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Farmer Registration</Text>
      <Text style={styles.subtitle}>Join Namma Uzhavan</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Name *</Text>
        <TextInput style={styles.input} value={formData.name} onChangeText={(v) => updateField('name', v)} placeholder='Your name' />

        <Text style={styles.label}>Phone Number *</Text>
        <TextInput style={styles.input} value={formData.phone} onChangeText={(v) => updateField('phone', v)} placeholder='Phone number' keyboardType='phone-pad' />

        <Text style={styles.label}>Password *</Text>
        <TextInput style={styles.input} value={formData.password} onChangeText={(v) => updateField('password', v)} placeholder='Password' secureTextEntry />

        <Text style={styles.label}>District</Text>
        <TextInput style={styles.input} value={formData.district} onChangeText={(v) => updateField('district', v)} placeholder='Your district' />

        <Text style={styles.label}>Village</Text>
        <TextInput style={styles.input} value={formData.village} onChangeText={(v) => updateField('village', v)} placeholder='Your village' />

        <Text style={styles.label}>Land Size (Acres)</Text>
        <TextInput style={styles.input} value={formData.acres} onChangeText={(v) => updateField('acres', v)} placeholder='Acres' keyboardType='numeric' />

        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Registering...' : 'Register'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 20 },
  back: { marginBottom: 20 },
  backText: { fontSize: 16, color: '#10b981' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#333' },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 20 },
  form: { backgroundColor: 'white', borderRadius: 15, padding: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 5, marginTop: 10 },
  input: { backgroundColor: '#f5f5f5', borderRadius: 10, padding: 15, fontSize: 16 },
  button: { backgroundColor: '#10b981', borderRadius: 10, padding: 15, alignItems: 'center', marginTop: 20 },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' }
});
