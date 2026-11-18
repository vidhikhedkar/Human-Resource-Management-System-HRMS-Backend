
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const leaveRoutes = require("./routes/leaveRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const payrollRoutes = require("./routes/payrollRoutes");

const app = express();

app.use(
    cors({
        origin: [
            "http://localhost:5173",
            process.env.FRONTEND_URL,
        ].filter(Boolean),
        credentials: true,
    })
);

app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "WorkSphere HRMS API is running",
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/payroll", payrollRoutes);

app.use((err, req, res, next) => {
    console.error(err);

    res.status(500).json({
        message: "Internal server error",
    });
});

const PORT = process.env.PORT || 8080;

async function startServer() {
    try {
        if (
            !process.env.MONGO_URI ||
            !process.env.JWT_SECRET
        ) {
            throw new Error(
                "MONGO_URI or JWT_SECRET is missing"
            );
        }

        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected successfully");

        app.listen(PORT, () => {
            console.log(
                `WorkSphere backend running on port ${PORT}`
            );
        });
    } catch (error) {
        console.error("Startup error:", error.message);
        process.exit(1);
    }
}

startServer();
