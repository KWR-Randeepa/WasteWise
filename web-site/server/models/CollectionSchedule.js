import mongoose from "mongoose"

const CollectionScheduleSchema = new mongoose.Schema(
  {
    zone: {
      type: String,
      enum: ["NW", "NE", "SW", "SE"],
      required: true
    },
    collectionDayOfWeek: {
      type: Number,
      min: 0,
      max: 6,
      required: true
    },
    assignedDriverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
)

CollectionScheduleSchema.index({ zone: 1 })
CollectionScheduleSchema.index({ collectionDayOfWeek: 1 })

export default mongoose.model("CollectionSchedule", CollectionScheduleSchema)
