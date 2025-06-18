import express from "express"
import {
  createReport,
  getUserReports,
  getReportById,
  deleteReport,
  updateReport, // Import the new controller function
} from "../controllers/reportController.js"
import { upload } from "../controllers/reportController.js" // Import upload middleware

const router = express.Router()

// Create a new report
router.post("/", upload.single("image"), createReport)

// Get all reports for a user
router.get("/user/:userId", getUserReports) // Ensure this is protected if needed

// Get a single report by ID
router.get("/:id", getReportById) // Ensure this is protected

// Delete a report by ID
router.delete("/:id", deleteReport) // Ensure this is protected
// Update a report by ID
router.put("/:id", upload.single("image"), updateReport)

export default router

