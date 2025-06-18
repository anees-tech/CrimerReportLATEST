import express from "express"
import { registerUser, loginUser, getUserProfile, forgotPassword, verifyOTP, resetPassword } from "../controllers/userController.js"

const router = express.Router()

// Register a new user
router.post("/register", registerUser)

// Login user
router.post("/login", loginUser)

// Get user profile
router.get("/profile", getUserProfile)

// Password reset routes
router.post("/forgot-password", forgotPassword)
router.post("/verify-otp", verifyOTP)
router.post("/reset-password", resetPassword)

export default router

