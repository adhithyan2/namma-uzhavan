import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Image } from 'react-native';
import { api } from '../services/api';

export default function LoginScreen({ navigation }) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFarmer, setIsFarmer] = useState(true);

  const handleLogin = async () => {
    if (!phone || !password) {
      Alert.alert('Error', 'Please enter phone and password');
      return;
    }

    setLoading(true);
    try {
      const result = isFarmer 
        ? await api.farmerLogin(phone, password)
        : await api.agentLogin(phone, password);

      if (result.success) {
        navigation.replace('Main', { user: result.user });
      } else {
        Alert.alert('Login Failed', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Server not reachable. Make sure backend is running.');
    }
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.logoContainer}>
        <Text style={styles.logo}>🌾</Text>
        <Text style={styles.title}>Namma Uzhavan</Text>
        <Text style={styles.subtitle}>Smart Farmers Portal</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, isFarmer && styles.tabActive]} 
          onPress={() => setIsFarmer(true)}
        >
          <Text style={[styles.tabText, isFarmer && styles.tabTextActive]}>Farmer</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, !isFarmer && styles.tabActive]} 
          onPress={() => setIsFarmer(false)}
        >
          <Text style={[styles.tabText, !isFarmer && styles.tabTextActive]}>Agent</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>{isFarmer ? 'Phone Number' : 'Agent ID'}</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder={isFarmer ? 'Enter phone number' : 'Enter Agent ID'}
          keyboardType={isFarmer ? 'phone-pad' : 'default'}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder='Enter password'
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Login'}</Text>
        </TouchableOpacity>

        {isFarmer && (
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.link}>Don't have an account? Register</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity style={styles.skipButton} onPress={() => navigation.replace('Main')}>
        <Text style={styles.skipText}>Skip Login (Demo)</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#10b981' },
  content: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  logoContainer: { alignItems: 'center', marginBottom: 30 },
  logo: { fontSize: 80 },
  title: { fontSize: 32, fontWeight: 'bold', color: 'white' },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.8)', marginTop: 5 },
  tabs: { flexDirection: 'row', marginBottom: 20, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10, padding: 4 },
  tab: { flex: 1, padding: 12, alignItems: 'center', borderRadius: 8 },
  tabActive: { backgroundColor: 'white' },
  tabText: { color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  tabTextActive: { color: '#10b981' },
  form: { backgroundColor: 'white', borderRadius: 20, padding: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 5, marginTop: 10 },
  input: { backgroundColor: '#f5f5f5', borderRadius: 10, padding: 15, fontSize: 16 },
  button: { backgroundColor: '#10b981', borderRadius: 10, padding: 15, alignItems: 'center', marginTop: 20 },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  link: { color: '#10b981', textAlign: 'center', marginTop: 15, fontSize: 16 },
  skipButton: { marginTop: 20, alignItems: 'center' },
  skipText: { color: 'white', fontSize: 16 }
});
