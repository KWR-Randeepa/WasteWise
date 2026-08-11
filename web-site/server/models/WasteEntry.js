import mongoose from "mongoose";

// ✅ RANDOM WEIGHT GENERATOR
const generateWeight = (size) => {
  if (size === "small") {
    return Math.floor(Math.random() * 5) + 1; // 1-5 KG
  }

  if (size === "medium") {
    return Math.floor(Math.random() * 11) + 5; // 5-15 KG
  }

  if (size === "large") {
    return Math.floor(Math.random() * 6) + 15; // 15-20 KG
  }

  return 0;
};

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
      required: true,
    },

    wasteSize: {
      type: String,
      enum: ["small", "medium", "large"],
      required: true,
    },

    // ✅ RANDOM GENERATED WEIGHT
    weight: {
      type: Number,
    },

    status: {
      type: String,
      enum: ["pending", "collected", "rejected"],
      default: "pending",
    },

    readyForCollection: {
      type: Boolean,
      default: false
    },

    scheduledDate: {
      type: Date
    },

    collectionStatus: {
      type: String,
      enum: ["pending", "collected"],
      default: "pending"
    }
  },
  { timestamps: true }
);

// ✅ BEFORE SAVE GENERATE RANDOM WEIGHT
WasteEntrySchema.pre("save", function () {
  if (!this.weight) {
    this.weight = generateWeight(this.wasteSize);
  }
});

WasteEntrySchema.index({ readyForCollection: 1, scheduledDate: 1 });

export default mongoose.model(
  "WasteEntry",
  WasteEntrySchema
);