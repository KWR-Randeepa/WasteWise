import React from 'react';
import { Text, View, TouchableOpacity, SafeAreaView } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 justify-around px-6">
        <View className="items-center mt-16">
          <Text className="text-[42px] font-bold text-emerald-500 mb-2">WasteWise</Text>
          <Text className="text-base text-gray-500 text-center">Smart recycling, cleaner world.</Text>
        </View>

        <View className="w-full gap-4 mb-10">
          <TouchableOpacity 
            className="w-full h-14 bg-emerald-500 rounded-xl justify-center items-center"
            onPress={() => navigation.navigate('Login')}
          >
            <Text className="text-white text-lg font-semibold">Log In</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="w-full h-14 bg-transparent border-2 border-emerald-500 rounded-xl justify-center items-center"
            onPress={() => navigation.navigate('Signup')}
          >
            <Text className="text-emerald-500 text-lg font-semibold">Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
