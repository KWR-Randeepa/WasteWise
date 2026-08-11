import React, { useState } from 'react';
import { Text, View, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { WebView } from 'react-native-webview';
import { BASE_URL } from '../config';

// The HTML content containing the Leaflet Map script
const leafletHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    body { padding: 0; margin: 0; }
    html, body, #map { height: 100%; width: 100%; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', {zoomControl: false}).setView([6.9271, 79.8612], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 25,
      attribution: '© OpenStreetMap'
    }).addTo(map);

    // When the map stops moving, send the new center coordinate back to React Native
    map.on('moveend', function() {
      var center = map.getCenter();
      window.ReactNativeWebView.postMessage(JSON.stringify({
        latitude: center.lat,
        longitude: center.lng
      }));
    });
    
    // Listen for messages from React Native to animate the map to a new location
    function handleLocationUpdate(event) {
      try {
        var data = JSON.parse(event.data);
        if (data.latitude && data.longitude) {
           map.flyTo([data.latitude, data.longitude], 16);
        }
      } catch (e) {}
    }
    
    document.addEventListener("message", handleLocationUpdate);
    window.addEventListener("message", handleLocationUpdate);
  </script>
</body>
</html>
`;

export default function SignupScreen({ navigation }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [location, setLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password || !address.trim()) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `${firstName.trim()} ${lastName.trim()}`,
          email: email.trim().toLowerCase(),
          password,
          address: address.trim(),
          location,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        Alert.alert('Success', 'Account created successfully!');
        navigation.navigate('Dashboard', { user: data.user });
      } else {
        Alert.alert('Signup Failed', data.error || 'Failed to create account');
      }
    } catch (error) {
      console.error('Signup error:', error);
      Alert.alert('Network Error', `Could not connect to backend server at:\n${BASE_URL}\n\nPlease verify that the backend server is running and accessible.`);
    } finally {
      setLoading(false);
    }
  };
  
  const webViewRef = React.useRef(null);

  const handleGetLocation = async () => {
    setLoadingLocation(true);
    setErrorMsg(null);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setLoadingLocation(false);
        return;
      }

      let currentLocation;
      try {
        currentLocation = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      } catch (e) {
        // Fallback if getCurrentPositionAsync fails (common on emulators)
        currentLocation = await Location.getLastKnownPositionAsync({});
        if (!currentLocation) throw e; // throw original error if fallback also fails
      }

      const newLoc = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      };
      
      setLocation(newLoc);
      
      // Tell the WebView to move the map to the new location
      webViewRef.current?.postMessage(JSON.stringify(newLoc));
      
    } catch (error) {
      console.error("Location Fetch Error:", error);
      setErrorMsg('Error fetching location: ' + (error.message || 'Please check if GPS is enabled.'));
    } finally {
      setLoadingLocation(false);
    }
  };

  const onMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.latitude && data.longitude) {
        setLocation({
          latitude: data.latitude,
          longitude: data.longitude
        });
      }
    } catch (e) {
      console.log('Error parsing WebView message', e);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 px-6 pt-8 pb-10" showsVerticalScrollIndicator={false}>
        <Text className="text-3xl font-bold text-gray-800 mb-2">Create Account</Text>
        <Text className="text-base text-gray-500 mb-8">Join WasteWise today!</Text>
        
        {/* Basic Info */}
        <View className="mb-6">
          <View className="flex-row gap-4 mb-4">
            <TextInput 
              className="flex-1 h-14 bg-white rounded-xl px-4 border border-gray-200 text-base"
              placeholder="First Name"
              placeholderTextColor="#9CA3AF"
              value={firstName}
              onChangeText={setFirstName}
            />
            <TextInput 
              className="flex-1 h-14 bg-white rounded-xl px-4 border border-gray-200 text-base"
              placeholder="Last Name"
              placeholderTextColor="#9CA3AF"
              value={lastName}
              onChangeText={setLastName}
            />
          </View>
          <TextInput 
            className="w-full h-14 bg-white rounded-xl px-4 mb-4 border border-gray-200 text-base"
            placeholder="Street Address"
            placeholderTextColor="#9CA3AF"
            value={address}
            onChangeText={setAddress}
          />
          <TextInput 
            className="w-full h-14 bg-white rounded-xl px-4 mb-4 border border-gray-200 text-base"
            placeholder="Email Address"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput 
            className="w-full h-14 bg-white rounded-xl px-4 mb-4 border border-gray-200 text-base"
            placeholder="Password"
            placeholderTextColor="#9CA3AF"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {/* Location Section */}
        <Text className="text-lg font-bold text-gray-800 mb-2">Home Location</Text>
        <Text className="text-sm text-gray-500 mb-4">Drag the map to pin your exact location.</Text>

        <TouchableOpacity 
          className="w-full h-12 bg-emerald-100 rounded-xl justify-center items-center mb-4 flex-row" 
          onPress={handleGetLocation}
          disabled={loadingLocation}
        >
          {loadingLocation ? (
            <ActivityIndicator color="#10B981" />
          ) : (
            <Text className="text-emerald-600 text-base font-semibold">Get My Current Location</Text>
          )}
        </TouchableOpacity>

        {errorMsg && <Text className="text-red-500 text-sm mb-2">{errorMsg}</Text>}

        <View className="h-72 rounded-xl overflow-hidden mb-8 border border-gray-200 relative">
          <WebView
            ref={webViewRef}
            source={{ html: leafletHTML }}
            onMessage={onMessage}
            className="flex-1"
          />
          {/* Static pin in center of map */}
          <View className="absolute inset-0 justify-center items-center pointer-events-none" style={{ paddingBottom: 32 }}>
            <Text className="text-4xl shadow-md">📍</Text>
          </View>
        </View>

        <TouchableOpacity 
          className="w-full h-14 bg-emerald-500 rounded-xl justify-center items-center mb-4" 
          onPress={handleSignup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-white text-lg font-semibold">Sign Up</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')} className="mb-10 items-center">
          <Text className="text-gray-500">Already have an account? <Text className="text-emerald-500 font-bold">Log In</Text></Text>
        </TouchableOpacity>
        
      </ScrollView>
    </SafeAreaView>
  );
}
