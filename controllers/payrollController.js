
const mongoose = require("mongoose");
const Payroll = require("../models/Payroll");
const User = require("../models/User");

exports.createPayroll = async (req, res) => {
  try {
    const { employeeId, month } = req.body;
    const bonus = Number(req.body.bonus ?? 0);
    const deductions = Number(req.body.deductions ?? 0);

    if (!mongoose.isValidObjectId(employeeId) ||
        !/^\d{4}-(0[1-9]|1[0-2])$/.test(month || "")) {
      return res.status(400).json({
        message: "Valid employee ID and month (YYYY-MM) required"
      });
    }

    if (![bonus, deductions].every(Number.isFinite) ||
        bonus < 0 || deductions < 0) {
      return res.status(400).json({
        message: "Invalid bonus or deductions"
      });
    }

    const employee = await User.findOne({
      _id: employeeId,
      role: "employee",
      isActive: true
    });

    if (!employee) {
      return res.status(404).json({
        message: "Active employee not found"
      });
    }

    const basicSalary = employee.salary;
    const netSalary = basicSalary + bonus - deductions;

    if (netSalary < 0) {
      return res.status(400).json({
        message: "Deductions exceed total salary"
      });
    }

    const payroll = await Payroll.create({
      employee: employee._id,
      month,
      basicSalary,
      bonus,
      deductions,
      netSalary
    });

    res.status(201).json(payroll);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Payroll already exists for this employee and month"
      });
    }

    res.status(500).json({ message: "Failed to create payroll" });
  }
};

exports.getAllPayroll = async (req, res) => {
  try {
    const payroll = await Payroll.find()
      .populate("employee", "name email department")
      .sort({ month: -1 });

    res.json(payroll);
  } catch (error) {
    res.status(500).json({ message: "Failed to load payroll" });
  }
};

exports.getMyPayroll = async (req, res) => {
  try {
    const payroll = await Payroll.find({
      employee: req.user._id
    }).sort({ month: -1 });

    res.json(payroll);
  } catch (error) {
    res.status(500).json({ message: "Failed to load payroll" });
  }
};

exports.markPaid = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid payroll ID" });
    }

    const payroll = await Payroll.findOneAndUpdate(
      { _id: req.params.id, status: "Pending" },
      { $set: { status: "Paid", paidAt: new Date() } },
      { new: true }
    );

    if (!payroll) {
      return res.status(404).json({
        message: "Pending payroll record not found"
      });
    }

    res.json(payroll);
  } catch (error) {
    res.status(500).json({ message: "Failed to update payroll" });
  }
};
