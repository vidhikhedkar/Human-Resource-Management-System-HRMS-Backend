
const Attendance = require("../models/Attendance");

const today = () => new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata"
});

exports.checkIn = async (req, res) => {
    try {
        const date = today();
        const existing = await Attendance.findOne({
            employee: req.user._id,
            date
        });

        if (existing) {
            return res.status(409).json({
                message: "Already checked in today"
            });
        }

        const attendance = await Attendance.create({
            employee: req.user._id,
            date,
            checkIn: new Date()
        });

        res.status(201).json({
            message: "Check-in successful",
            attendance
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "Already checked in today"
            });
        }

        res.status(500).json({ message: "Check-in failed" });
    }
};

exports.checkOut = async (req, res) => {
    try {
        const attendance = await Attendance.findOneAndUpdate(
            {
                employee: req.user._id,
                date: today(),
                checkOut: null
            },
            {
                $set: { checkOut: new Date() }
            },
            { new: true }
        );
        if (!attendance) {
            return res.status(400).json({
                message: "No active check-in found for today"
            });
        }
        res.json({
            message: "Check-out successful",
            attendance
        });
    } catch (error) {
        res.status(500).json({ message: "Check-out failed" });
    }
};

exports.myAttendance = async (req, res) => {
    try {
        const records = await Attendance.find({
            employee: req.user._id
        }).sort({ date: -1 });

        res.json(records);
    } catch (error) {
        res.status(500).json({ message: "Failed to load attendance" });
    }
};

exports.allAttendance = async (req, res) => {
    try {
        const records = await Attendance.find()
            .populate("employee", "name email department")
            .sort({ date: -1, checkIn: -1 });

        res.json(records);
    } catch (error) {
        res.status(500).json({ message: "Failed to load attendance" });
    }
};
