import { Router } from "express";
const router = Router();
import { hash, compare } from "bcrypt";
import User from "../models/User.js";
import pkg from "jsonwebtoken";
const { sign } = pkg;

// Register Route
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // 1. Validate input
    if (!username || !email || !password || !role) {
      return res
        .status(400)
        .json({ message: "Username, email, password and role are required" });
    }

    // 2. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // 3. Hash password
    const hashedPassword = await hash(password, 10);

    // 4. Create user
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role,
    });

    // 5. Generate token
    const token = sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

//  Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // 2. Check user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 3. Check password
    const isMatch = await compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 4. Generate token
    const token = sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
