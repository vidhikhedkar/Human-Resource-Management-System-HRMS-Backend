
require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password || password.length < 12) {
      throw new Error("Set ADMIN_EMAIL and a strong ADMIN_PASSWORD in .env");
    }

    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log("Admin account already exists");
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await User.create({
      name: "Admin",
      email,
      password: hashedPassword,
      role: "admin"
    });

    console.log("Admin created successfully!");
  } catch (error) {
    console.log("Error:", error.message);
  } finally {
    await mongoose.disconnect();
  }
};

createAdmin();
