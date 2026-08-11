// ─── API Base URL ─────────────────────────────────────────────────────────────
// Priority 1: Set EXPO_PUBLIC_API_URL in .env to your Railway/cloud URL
//             e.g.  EXPO_PUBLIC_API_URL=https://wastewise-api.up.railway.app/api
//
// Priority 2: Fallback for local Wi-Fi development (update IP to match your PC)
//             Run `ipconfig` to find your current IP.
// ──────────────────────────────────────────────────────────────────────────────
export const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://10.255.142.185:5000/api';

console.log(`🌐 [WasteWise API] Using BASE_URL: ${BASE_URL}`);
