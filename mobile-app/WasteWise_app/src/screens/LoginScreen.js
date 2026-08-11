import React, { useState } from 'react';
import { Text, View, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BASE_URL } from '../config';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        Alert.alert('Success', 'Logged in successfully!');
        // You can save the token here using AsyncStorage
        navigation.navigate('Dashboard', { user: data.user });
      } else {
        Alert.alert('Login Failed', data.error || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Network Error', `Could not connect to backend server at:\n${BASE_URL}\n\nPlease verify that the backend server is running and accessible.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 px-6 justify-center">
        <Text className="text-3xl font-bold text-gray-800 mb-2">Welcome Back!</Text>
        <Text className="text-base text-gray-500 mb-8">Please log in to continue.</Text>
        
        <View className="mb-6">
          <TextInput 
            className="w-full h-14 bg-white rounded-xl px-4 mb-4 border border-gray-200 text-base"
            placeholder="Email or Username"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
          <TextInput 
            className="w-full h-14 bg-white rounded-xl px-4 border border-gray-200 text-base"
            placeholder="Password"
            placeholderTextColor="#9CA3AF"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity 
          className="w-full h-14 bg-emerald-500 rounded-xl justify-center items-center" 
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-white text-lg font-semibold">Log In</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Signup')} className="mt-4 items-center">
          <Text className="text-gray-500">Don't have an account? <Text className="text-emerald-500 font-bold">Sign Up</Text></Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
