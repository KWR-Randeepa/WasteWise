import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Universal Base URL Resolution for WasteWise Mobile App
 * 
 * Resolution order:
 * 1. Environment Variable: EXPO_PUBLIC_API_URL (if specified in .env)
 * 2. Expo Dynamic Host: Automatically detects computer's IP when running via Expo Go/Dev Client across any Wi-Fi network.
 * 3. Android Emulator: 'http://10.0.2.2:5000/api'
 * 4. iOS Simulator / Web / Localhost: 'http://localhost:5000/api'
 */
const getBaseUrl = () => {
  // 1. Explicit override via environment variable
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // 2. Dynamic host detection via Expo CLI
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.manifest2?.extra?.expoGo?.developer?.tool ||
    Constants.manifest?.debuggerHost;

  if (hostUri) {
    const hostIp = hostUri.split(':')[0];
    if (hostIp && hostIp !== 'localhost' && hostIp !== '127.0.0.1') {
      return `http://${hostIp}:5000/api`;
    }
  }

  // 3. Android Emulator fallback
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000/api';
  }

  // 4. iOS Simulator / Web / standard localhost fallback
  return 'http://localhost:5000/api';
};

export const BASE_URL = getBaseUrl();

console.log(`🌐 [WasteWise API] Using BASE_URL: ${BASE_URL}`);
