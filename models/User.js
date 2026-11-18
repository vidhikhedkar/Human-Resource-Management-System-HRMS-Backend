
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["admin", "employee"],
      default: "employee"
    },
    department: { type: String, default: "General" },
    designation: { type: String, default: "Employee" },
    salary: { type: Number, default: 0, min: 0 },
    joiningDate: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
