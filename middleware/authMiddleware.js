
const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
    try {
        const token = req.cookies?.token;
        if (!token) {
            return res.status(401).json({
                message: "Not authorized. Please log in.",
            });
        }
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const user = await User.findById(decoded.id)
            .select("-password");

        if (!user || !user.isActive) {
            return res.status(401).json({
                message: "Account not found or inactive",
            });
        }
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired session. Please log in again.",
        });
    }
};


exports.adminOnly = (req, res, next) => {
    if (req.user?.role !== "admin") {
        return res.status(403).json({
            message: "Admin access required",
        });
    }
    next();
};
