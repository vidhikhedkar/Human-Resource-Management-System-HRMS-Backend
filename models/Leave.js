
const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    leaveType: {
      type: String,
      enum: ["Sick", "Casual", "Annual", "Other"],
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    reason: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending"
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    }
  },
  { timestamps: true }
);

leaveSchema.path("endDate").validate(function (value) {
  return !this.startDate || value >= this.startDate;
}, "End date must be on or after start date");

module.exports = mongoose.model("Leave", leaveSchema);
