import mongoose from "mongoose"

const StopSchema = new mongoose.Schema(
  {
    order: { type: Number, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    coordinates: { type: [Number], required: true },
    address: { type: String, required: true },
    estimatedArrival: { type: String, required: true },
    wasteEntryIds: [
      { type: mongoose.Schema.Types.ObjectId, ref: "WasteEntry" }
    ]
  },
  { _id: false }
)

const CollectionRouteSchema = new mongoose.Schema(
  {
    zone: {
      type: String,
      enum: ["NW", "NE", "SW", "SE"],
      required: true
    },
    collectionDate: { type: Date, required: true },
    generatedAt: { type: Date, required: true },
    assignedDriverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    stops: [StopSchema],
    totalDistanceKm: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed"],
      default: "pending"
    },
    optimizedPolyline: { type: [[Number]], required: true },
    skippedUserIds: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    ]
  },
  { timestamps: true }
)

CollectionRouteSchema.index({ zone: 1, collectionDate: 1 }, { unique: true })
CollectionRouteSchema.index({ assignedDriverId: 1, collectionDate: 1 })

export default mongoose.model("CollectionRoute", CollectionRouteSchema)
