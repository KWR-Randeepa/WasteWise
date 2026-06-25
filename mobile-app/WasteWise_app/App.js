import './global.css';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import Screens
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import RewardScreen from './src/screens/RewardScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ 
              title: '', 
              headerShadowVisible: false,
              headerStyle: { backgroundColor: '#F9FAFB' }
            }} 
          />
          <Stack.Screen 
            name="Signup" 
            component={SignupScreen} 
            options={{ 
              title: '', 
              headerShadowVisible: false,
              headerStyle: { backgroundColor: '#F9FAFB' }
            }} 
          />
          <Stack.Screen 
            name="Dashboard" 
            component={DashboardScreen} 
            options={{ 
              title: '', 
              headerLeft: () => null, // Prevents going back to login screen easily
              headerShadowVisible: false,
              headerStyle: { backgroundColor: '#F9FAFB' }
            }} 
          />
          <Stack.Screen 
            name="Reward" 
            component={RewardScreen} 
            options={{ 
              title: 'Eco Rewards', 
              headerShadowVisible: false,
              headerTintColor: '#10B981',
              headerStyle: { backgroundColor: '#F9FAFB' }
            }} 
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
