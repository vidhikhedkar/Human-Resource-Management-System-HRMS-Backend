
const mongoose = require("mongoose");

const payrollSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    month: {
      type: String,
      required: true,
      match: /^\d{4}-(0[1-9]|1[0-2])$/
    },
    basicSalary: {
      type: Number,
      required: true,
      min: 0
    },
    bonus: {
      type: Number,
      default: 0,
      min: 0
    },
    deductions: {
      type: Number,
      default: 0,
      min: 0
    },
    netSalary: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ["Pending", "Paid"],
      default: "Pending"
    },
    paidAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

payrollSchema.index(
  { employee: 1, month: 1 },
  { unique: true }
);

module.exports = mongoose.model("Payroll", payrollSchema);
