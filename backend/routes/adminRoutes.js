import express from "express"
import {
  loginAdmin,
  getAllReports,
  getReportById,
  updateReportStatus,
  addAdminNote,
  uploadAdminNoteFile,
  getUsersReports,
  getUserByIdForAdmin,
  updateUserByAdmin,
  deleteUserByAdmin,
  getDashboardStats,
  toggleUserRole,
} from "../controllers/adminController.js"
import { deleteReport } from "../controllers/reportController.js"

const router = express.Router()

// Admin login
router.post("/login", loginAdmin)

// Get Dashboard Stats
router.get("/dashboard-stats", getDashboardStats)

// Get all reports
router.get("/reports", getAllReports)

// Get a single report by ID
router.get("/reports/:id", getReportById)

// Update report status
router.put("/reports/:id/status", updateReportStatus)

// Add admin note to report
router.post("/reports/:id/notes", uploadAdminNoteFile.single("attachment"), addAdminNote)

// Fetch total users and their reports
router.get("/users-reports", getUsersReports)

// --- User Management by Admin ---
// Get a single user by ID (for admin to view/edit)
router.get("/users/:userId", getUserByIdForAdmin)

// Update a user by ID (for admin)
router.put("/users/:userId", updateUserByAdmin)

// Delete a user by ID (for admin)
router.delete("/users/:userId", deleteUserByAdmin)

// Toggle user role (admin <-> user) - Make sure this is properly defined
router.put("/users/:userId/toggle-role", (req, res, next) => {
  console.log("🔄 Toggle role route hit:", req.params.userId)
  console.log("📝 Request body:", req.body)
  next()
}, toggleUserRole)

// Delete a report by ID
router.delete("/reports/:id", deleteReport)

export default router

