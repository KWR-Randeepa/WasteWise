import mongoose from "mongoose";

/**
 * Truck Model
 * Represents a waste collection truck in the fleet.
 * The assignedRoute array is populated by the CVRP optimizer
 * and holds the ordered list of stops for the current day.
 */
const TruckSchema = new mongoose.Schema(
  {
    truckId: {
      type: String,
      required: [true, "Please provide a truck ID"],
      unique: true,
      trim: true,
    },

    maxCapacity: {
      type: Number,
      required: [true, "Please provide the truck's max capacity (kg)"],
      min: [1, "Capacity must be at least 1 kg"],
    },

    /**
     * Each stop in the route contains enough data for the driver app
     * to display the stop details without extra API calls.
     */
    assignedRoute: [
      {
        wasteEntryId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "WasteEntry",
        },
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        userName: { type: String },
        address: { type: String },
        location: {
          latitude: { type: Number },
          longitude: { type: Number },
        },
        wasteType: { type: String },
        wasteSize: { type: String }, // "small" | "medium" | "large"
        wasteSizeKg: { type: Number }, // numeric kg used by optimizer
        stopOrder: { type: Number },  // position in the route (1-indexed)
      },
    ],

    status: {
      type: String,
      enum: ["idle", "active"],
      default: "idle",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Truck", TruckSchema);
