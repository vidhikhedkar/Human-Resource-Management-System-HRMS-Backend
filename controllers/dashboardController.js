
const User = require("../models/User");
const Attendance = require("../models/Attendance");
const Leave = require("../models/Leave");

exports.getDashboardStats = async (req, res) => {
  try {
    const date = new Date().toLocaleDateString("en-CA", {
      timeZone: "Asia/Kolkata"
    });

    const [
      totalEmployees,
      activeEmployees,
      presentToday,
      pendingLeaves,
      approvedLeaves,
      departments,
      salaryStats
    ] = await Promise.all([
      User.countDocuments({ role: "employee" }),
      User.countDocuments({ role: "employee", isActive: true }),
      Attendance.countDocuments({ date }),
      Leave.countDocuments({ status: "Pending" }),
      Leave.countDocuments({ status: "Approved" }),
      User.distinct("department", {
        role: "employee",
        isActive: true
      }),
      User.aggregate([
        {
          $match: {
            role: "employee",
            isActive: true
          }
        },
        {
          $group: {
            _id: null,
            totalSalary: { $sum: "$salary" }
          }
        }
      ])
    ]);

    res.json({
      totalEmployees,
      activeEmployees,
      presentToday,
      pendingLeaves,
      approvedLeaves,
      totalDepartments: departments.length,
      monthlyBaseSalary: salaryStats[0]?.totalSalary || 0
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to load dashboard statistics"
    });
  }
};
