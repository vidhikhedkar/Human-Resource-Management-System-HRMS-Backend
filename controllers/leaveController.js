
const mongoose = require("mongoose");
const Leave = require("../models/Leave");

exports.applyLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    if (!leaveType || !startDate || !endDate ||
        typeof reason !== "string" || !reason.trim()) {
      return res.status(400).json({
        message: "All leave fields are required"
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) {
      return res.status(400).json({
        message: "Invalid leave dates"
      });
    }

    const leave = await Leave.create({
      employee: req.user._id,
      leaveType,
      startDate: start,
      endDate: end,
      reason: reason.trim()
    });

    res.status(201).json({
      message: "Leave application submitted",
      leave
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.myLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({
      employee: req.user._id
    }).sort({ createdAt: -1 });

    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: "Failed to load leaves" });
  }
};

exports.allLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate("employee", "name email department")
      .sort({ createdAt: -1 });

    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: "Failed to load leaves" });
  }
};

exports.updateLeaveStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({
        message: "Status must be Approved or Rejected"
      });
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid leave ID"
      });
    }

    const leave = await Leave.findOneAndUpdate(
      {
        _id: req.params.id,
        status: "Pending"
      },
      {
        $set: {
          status,
          reviewedBy: req.user._id
        }
      },
      { new: true, runValidators: true }
    );

    if (!leave) {
      return res.status(404).json({
        message: "Pending leave request not found"
      });
    }

    res.json({
      message: `Leave ${status.toLowerCase()} successfully`,
      leave
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update leave" });
  }
};
