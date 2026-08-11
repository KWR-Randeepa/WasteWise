import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\S+@\S+\.\S+$/,
        "Please add a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
      minlength: 6,
      select: false, // Doesn't return password in simple queries for security
    },
    role: {
      type: String,
      enum: ["resident", "council"],
      default: "resident",
    },
    address: {
      type: String,
      required: [true, "Please add an address"],
    },
    location: {
      latitude: { type: Number },
      longitude: { type: Number },
    },
    points: {
      type: Number,
      default: 0, // For Yasith's Reward System
    },
  },
  { timestamps: true },
);

// Encrypt password before saving using bcrypt
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", UserSchema);
