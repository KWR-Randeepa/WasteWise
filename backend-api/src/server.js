require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Initialize Express
const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors()); // Allows Ravindu's mobile app to connect
app.use(express.json()); // Parses incoming JSON reports

// Basic Test Route
app.get('/', (req, res) => {
  res.send('WasteWise API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));