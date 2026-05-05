const mongoose = require('mongoose');

const WasteReportSchema = new mongoose.Schema({
  // Link to the Resident who reported
  residentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Geospatial data for mapping in Colombo/Gampaha
  location: {
    type: {
      type: String, 
      enum: ['Point'], 
      required: true 
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  // Core report data
  binFullness: {
    type: Number, // 0 to 100 percentage
    required: true,
    min: 0,
    max: 100
  },
  wasteType: {
    type: String,
    enum: ['Organic', 'Plastic', 'Paper', 'Metal', 'Glass', 'Mixed'],
    default: 'Mixed'
  },
  // Prediction data (to be filled by Udeesha's FastAPI service)
  predictedWeightKg: {
    type: Number,
    default: 0
  },
  // Operational Status
  status: {
    type: String,
    enum: ['Pending', 'Scheduled', 'Collected', 'Verified'],
    default: 'Pending'
  },
  // Assigned Resource
  assignedTruck: {
    type: String,
    enum: ['Small', 'Medium', 'Large', 'None'],
    default: 'None'
  }
}, { timestamps: true });

// Index for proximity-based searches (critical for the dashboard map)
WasteReportSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('WasteReport', WasteReportSchema);