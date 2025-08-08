import mongoose from "mongoose";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

const createAdminUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@artcaps.com" });
    if (existingAdmin) {
      console.log("❌ Admin user already exists");
      return;
    }

    // Create admin user
    const adminUser = new User({
      username: "admin",
      email: "admin@artcaps.com",
      password: "admin123",
      firstName: "Admin",
      lastName: "User",
      role: "admin",
      isVerified: true,
      isActive: true
    });

    await adminUser.save();
    console.log("✅ Admin user created successfully");
    console.log("📧 Email: admin@artcaps.com");
    console.log("🔑 Password: admin123");
    console.log("🔐 Role: admin");

  } catch (error) {
    console.error("❌ Error creating admin user:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
};

createAdminUser();

