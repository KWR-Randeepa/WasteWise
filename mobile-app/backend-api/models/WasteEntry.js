import mongoose from "mongoose";

const WasteEntrySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    wasteType: {
      type: String,
      enum: ["organic", "solid"],
      required: [true, "Please select a waste type"],
    },
    wasteSize: {
      type: String,
      enum: ["small", "medium", "large"],
      required: [true, "Please select a waste size"],
    },
    status: {
      type: String,
      enum: ["pending", "collected", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("WasteEntry", WasteEntrySchema);
