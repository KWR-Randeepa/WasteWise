require('dotenv').config();
const express = require('express');
const cors = require('cors');
const os = require('os');
const connectDB = require('./config/db');

// Initialize Express
const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors()); // Allows mobile app to connect
app.use(express.json()); // Parses incoming JSON reports

// Basic Test Route
app.get('/', (req, res) => {
  res.send('WasteWise API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`   - Localhost:        http://localhost:${PORT}`);
  console.log(`   - Android Emulator: http://10.0.2.2:${PORT}`);
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        console.log(`   - Network (Wi-Fi):  http://${iface.address}:${PORT}`);
      }
    }
  }
});
