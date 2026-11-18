
const User = require("../models/User");
const bcrypt = require("bcryptjs");

const allowedFields = [
  "name", "email", "department", "designation",
  "salary", "joiningDate", "isActive"
];

const pickFields = (body) =>
  Object.fromEntries(
    allowedFields
      .filter((key) => body[key] !== undefined)
      .map((key) => [key, body[key]])
  );

const handleError = (res, error) => {
  if (error.code === 11000) {
    return res.status(409).json({
      message: "Email already exists"
    });
  }

  if (error.name === "ValidationError" ||
      error.name === "CastError") {
    return res.status(400).json({
      message: error.message
    });
  }

  res.status(500).json({ message: "Server error" });
};

exports.getEmployees = async (req, res) => {
  try {
    const employees = await User.find({
      role: "employee"
    }).sort({ createdAt: -1 });

    res.json(employees);
  } catch (error) {
    handleError(res, error);
  }
};

exports.createEmployee = async (req, res) => {
  try {
    const { password } = req.body;

    if (typeof password !== "string" ||
        password.length < 8) {
      return res.status(400).json({
        message: "Password must contain at least 8 characters"
      });
    }

    const data = pickFields(req.body);

    if (!data.name || !data.email) {
      return res.status(400).json({
        message: "Name and email are required"
      });
    }

    delete data.isActive;

    const employee = await User.create({
      ...data,
      role: "employee",
      password: await bcrypt.hash(password, 12)
    });

    res.status(201).json(employee);
  } catch (error) {
    handleError(res, error);
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    const employee = await User.findOneAndUpdate(
      { _id: req.params.id, role: "employee" },
      { $set: pickFields(req.body) },
      { new: true, runValidators: true }
    );

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found"
      });
    }

    res.json(employee);
  } catch (error) {
    handleError(res, error);
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await User.findOneAndUpdate(
      { _id: req.params.id, role: "employee" },
      { $set: { isActive: false } },
      { new: true }
    );

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found"
      });
    }

    res.json({ message: "Employee deactivated successfully" });
  } catch (error) {
    handleError(res, error);
  }
};
