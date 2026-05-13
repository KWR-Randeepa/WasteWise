import React, { useState } from 'react';
import { Text, View, TouchableOpacity, SafeAreaView, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { BASE_URL } from '../config';

export default function DashboardScreen({ navigation, route }) {
  const user = route.params?.user;
  
  const [wasteType, setWasteType] = useState(null);
  const [wasteSize, setWasteSize] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  const handleSubmit = async () => {
    if (!wasteType || !wasteSize) {
      Alert.alert("Missing Fields", "Please select both a waste type and a waste size.");
      return;
    }

    if (!user || !user.id) {
      Alert.alert("Error", "User not found. Please log in again.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/waste`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          wasteType,
          wasteSize
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        Alert.alert("Success", "Waste entry saved successfully! Thank you for recycling.");
        setWasteType(null);
        setWasteSize(null);
      } else {
        Alert.alert("Failed", data.error || "Could not save entry.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Network Error", "Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const renderTypeButton = (label, value, emoji) => {
    const isSelected = wasteType === value;
    return (
      <TouchableOpacity
        onPress={() => setWasteType(value)}
        className={`flex-1 h-24 rounded-2xl justify-center items-center border-2 shadow-sm ${
          isSelected ? 'bg-emerald-500 border-emerald-600' : 'bg-white border-gray-200'
        }`}
      >
        <Text className="text-3xl mb-1">{emoji}</Text>
        <Text className={`font-bold text-lg ${isSelected ? 'text-white' : 'text-gray-700'}`}>{label}</Text>
      </TouchableOpacity>
    );
  };

  const renderSizeButton = (label, value, subtext) => {
    const isSelected = wasteSize === value;
    return (
      <TouchableOpacity
        onPress={() => setWasteSize(value)}
        className={`w-full h-20 rounded-2xl flex-row px-5 items-center border-2 shadow-sm mb-3 ${
          isSelected ? 'bg-emerald-50 border-emerald-500' : 'bg-white border-gray-200'
        }`}
      >
        <View className={`w-6 h-6 rounded-full border-2 mr-4 items-center justify-center ${isSelected ? 'border-emerald-500' : 'border-gray-300'}`}>
           {isSelected && <View className="w-3 h-3 rounded-full bg-emerald-500" />}
        </View>
        <View>
          <Text className={`font-bold text-lg ${isSelected ? 'text-emerald-700' : 'text-gray-800'}`}>{label}</Text>
          <Text className={`text-sm ${isSelected ? 'text-emerald-600' : 'text-gray-500'}`}>{subtext}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Account Header Section */}
      <View className="flex-row items-center px-6 pt-6 pb-4 bg-white border-b border-gray-200 shadow-sm z-10">
        <View className="w-14 h-14 bg-emerald-100 rounded-full justify-center items-center border-2 border-emerald-500 mr-4 shadow-sm">
          <Text className="text-emerald-600 text-2xl font-bold">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-0.5">My Account</Text>
          <Text className="text-xl font-bold text-gray-800">
            {user?.name || 'User'}
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
        
        <Text className="text-base text-gray-500 mb-6">Record your daily waste disposal here to earn points!</Text>
        
        <View className="mb-8">
          <Text className="text-xl font-bold text-gray-800 mb-4">1. Select Waste Type</Text>
          <View className="flex-row gap-4">
            {renderTypeButton('Organic', 'organic', '🍏')}
            {renderTypeButton('Solid', 'solid', '🥤')}
          </View>
        </View>

        <View className="mb-8">
          <Text className="text-xl font-bold text-gray-800 mb-4">2. Select Waste Size</Text>
          {renderSizeButton('Small Bag', 'small', 'Under 5kg - Fits in one hand')}
          {renderSizeButton('Medium Bag', 'medium', '5kg to 15kg - Standard grocery bag')}
          {renderSizeButton('Large Bag', 'large', 'Over 15kg - Full garbage bin')}
        </View>

        <TouchableOpacity 
          className="w-full h-14 bg-emerald-500 rounded-xl justify-center items-center mb-6 shadow-md"
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-white text-lg font-bold">Save Waste Entry</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          className="w-full h-14 bg-red-50 rounded-xl justify-center items-center mb-10 border border-red-200"
          onPress={handleLogout}
        >
          <Text className="text-red-500 text-lg font-bold">Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
