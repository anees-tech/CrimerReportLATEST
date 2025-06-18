import User from "../models/userModel.js"
import PasswordReset from "../models/passwordResetModel.js"
import { sendPasswordResetEmail } from "../utils/emailService.js"

// Register a new user
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Check if user already exists
    const userExists = await User.findOne({ email })
    if (userExists) {
      return res.status(400).json({ message: "User already exists" })
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password, // In a real app, you would hash this password
    })

    if (user) {
      res.status(201).json({
        userId: user._id,
        name: user.name,
        email: user.email,
      })
    } else {
      res.status(400).json({ message: "Invalid user data" })
    }
  } catch (error) {
    console.error("Register error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Login user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user by email
    const user = await User.findOne({ email })

    // Check if user exists and password matches
    if (user && password === user.password) {
      // In a real app, you would compare hashed passwords
      res.json({
        userId: user._id,
        name: user.name,
        email: user.email,
      })
    } else {
      res.status(401).json({ message: "Invalid email or password" })
    }
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.query.userId

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" })
    }

    const user = await User.findById(userId).select("-password")

    if (user) {
      res.json(user)
    } else {
      res.status(404).json({ message: "User not found" })
    }
  } catch (error) {
    console.error("Get profile error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Generate a random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Forgot password - send OTP
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body
    
    // Validate email
    if (!email) {
      return res.status(400).json({ message: "Email is required" })
    }

    // Check if user exists
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ message: "User with this email does not exist" })
    }

    // Generate OTP
    const otp = generateOTP()
    
    // Save OTP to database
    // First delete any existing tokens for this email
    await PasswordReset.deleteMany({ email })
    
    // Create new token
    await PasswordReset.create({
      email,
      otp,
    })

    // Send email
    const emailSent = await sendPasswordResetEmail(email, otp)
    if (!emailSent) {
      return res.status(500).json({ message: "Failed to send reset email" })
    }

    res.json({ message: "Password reset OTP sent to your email" })
  } catch (error) {
    console.error("Forgot password error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Verify OTP
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body
    
    // Validate inputs
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" })
    }

    // Find token in database
    const resetToken = await PasswordReset.findOne({ email, otp })
    
    if (!resetToken) {
      return res.status(400).json({ message: "Invalid or expired OTP" })
    }

    res.json({ message: "OTP verified successfully" })
  } catch (error) {
    console.error("Verify OTP error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Reset password
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body
    
    // Validate inputs
    if (!email || !otp || !password) {
      return res.status(400).json({ message: "All fields are required" })
    }

    // Verify OTP again
    const resetToken = await PasswordReset.findOne({ email, otp })
    
    if (!resetToken) {
      return res.status(400).json({ message: "Invalid or expired OTP" })
    }

    // Update user password
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Update password (without encryption as per requirements)
    user.password = password
    await user.save()

    // Delete all reset tokens for this email
    await PasswordReset.deleteMany({ email })

    res.json({ message: "Password reset successfully" })
  } catch (error) {
    console.error("Reset password error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

