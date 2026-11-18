
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const isProduction = process.env.NODE_ENV === "production";


const cookieSameSite =
    process.env.COOKIE_SAME_SITE === "none" ? "none" : "lax";

const cookieOptions = {
    httpOnly: true,
    secure: isProduction || cookieSameSite === "none",
    sameSite: cookieSameSite,
    path: "/",
};

const generateToken = (id) => {
    return jwt.sign(
        { id },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );
};

// LOGIN
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                message: "Email and password are required",
            });
        }
        const user = await User.findOne({
            email: email.trim().toLowerCase(),
        }).select("+password");

        if (!user || !user.isActive) {
            return res.status(401).json({
                message: "Invalid credentials",
            });
        }

        const valid = await bcrypt.compare(
            password,
            user.password
        );

        if (!valid) {
            return res.status(401).json({
                message: "Invalid credentials",
            });
        }

        const token = generateToken(user._id);

        res.cookie("token", token, {
            ...cookieOptions,
            maxAge: 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            message: "Login failed",
        });
    }
};

// REGISTER
exports.registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string" ||
            !name.trim() ||
            !email.trim()
        ) {
            return res.status(400).json({
                message: "Name, email and password are required",
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must contain at least 8 characters",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({
            email: normalizedEmail,
        });

        if (existingUser) {
            return res.status(409).json({
                message: "An account with this email already exists",
            });
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role: "employee",
            department: "",
            designation: "",
            salary: 0,
            isActive: true,
        });

        return res.status(201).json({
            success: true,
            message: "Account created successfully. Please sign in.",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "An account with this email already exists",
            });
        }
        console.error("Registration error:", error);
        return res.status(500).json({
            message: "Unable to create account",
        });
    }
};

// CURRENT LOGGED-IN USER
exports.me = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role,
            },
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch user",
        });
    }
};

// LOGOUT
exports.logout = async (req, res) => {
    try {
        res.clearCookie("token", cookieOptions);

        return res.status(200).json({
            success: true,
            message: "Logged out successfully",
        });
    } catch (error) {
        return res.status(500).json({
            message: "Logout failed",
        });
    }
};
