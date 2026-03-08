import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import WeatherScreen from './src/screens/WeatherScreen';
import CropsScreen from './src/screens/CropsScreen';
import MarketplaceScreen from './src/screens/MarketplaceScreen';
import SoilScreen from './src/screens/SoilScreen';
import LandRecordsScreen from './src/screens/LandRecordsScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Weather') iconName = focused ? 'cloud' : 'cloud-outline';
          else if (route.name === 'Crops') iconName = focused ? 'leaf' : 'leaf-outline';
          else if (route.name === 'Market') iconName = focused ? 'cart' : 'cart-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#10b981',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
        tabBarStyle: { paddingBottom: 5, height: 60 }
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Weather" component={WeatherScreen} />
      <Tab.Screen name="Crops" component={CropsScreen} />
      <Tab.Screen name="Market" component={MarketplaceScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen name="Soil" component={SoilScreen} />
        <Stack.Screen name="LandRecords" component={LandRecordsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
