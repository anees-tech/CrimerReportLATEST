import Admin from "../models/adminModel.js"
import User from "../models/userModel.js"
import Report from "../models/reportModel.js"
import { notifyUserStatusUpdate, notifyUserAdminNote } from "../socket/socketHandler.js"
import multer from "multer"
import path from "path"
import fs from "fs"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configure multer for admin note file uploads
const adminNoteStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads/admin-notes")
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    // Keep original extension and add timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, 'admin-note-' + uniqueSuffix + path.extname(file.originalname))
  },
})

const adminNoteFileFilter = (req, file, cb) => {
  // Allow common file types
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|zip|rar/
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = allowedTypes.test(file.mimetype) || 
                   file.mimetype === 'application/pdf' ||
                   file.mimetype === 'application/msword' ||
                   file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                   file.mimetype === 'text/plain' ||
                   file.mimetype === 'application/zip' ||
                   file.mimetype === 'application/x-rar-compressed'

  if (mimetype && extname) {
    return cb(null, true)
  } else {
    cb(new Error('Only images, PDFs, documents, and archive files are allowed!'))
  }
}

// Update this export to ensure it's a properly configured multer middleware
export const uploadAdminNoteFile = multer({
  storage: adminNoteStorage,
  fileFilter: adminNoteFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
})

// Admin login
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body

    // Find admin by email
    const admin = await Admin.findOne({ email })

    // Check if admin exists and password matches
    if (admin && password === admin.password) {
      // In a real app, you would compare hashed passwords
      res.json({
        adminId: admin._id,
        email: admin.email,
      })
    } else {
      res.status(401).json({ message: "Invalid email or password" })
    }
  } catch (error) {
    console.error("Admin login error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Get all reports for admin
export const getAllReports = async (req, res) => {
  try {
    // Fetch all reports, including anonymous ones
    const reports = await Report.find()
      .populate("user", "name email") // Populate user details if available
      .sort({ createdAt: -1 }) // Sort by creation date

    res.json(reports)
  } catch (error) {
    console.error("Get all reports error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Get report by ID
export const getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id).populate("user", "name email")

    if (!report) {
      return res.status(404).json({ message: "Report not found" })
    }

    res.json(report)
  } catch (error) {
    console.error("Get report by ID error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Update report status
export const updateReportStatus = async (req, res) => {
  try {
    const { status } = req.body

    if (!["Pending", "Investigating", "Resolved", "Closed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" })
    }

    const report = await Report.findById(req.params.id)

    if (!report) {
      return res.status(404).json({ message: "Report not found" })
    }

    const oldStatus = report.status
    report.status = status
    report.updatedAt = Date.now()

    const updatedReport = await report.save()

    // Notify user if report has a user associated
    if (updatedReport.user && !updatedReport.isAnonymous) {
      notifyUserStatusUpdate(updatedReport.user.toString(), updatedReport, oldStatus, status)
    }

    res.json(updatedReport)
  } catch (error) {
    console.error("Update report status error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Add admin note to report (with optional file)
export const addAdminNote = async (req, res) => {
  try {
    console.log("📝 Add admin note request received")
    console.log("Request body:", req.body)
    console.log("Request file:", req.file)

    // Get content from request body
    const content = req.body.content

    console.log("📝 Note content:", content)

    if (!content || content.trim() === '') {
      console.log("❌ No content provided")
      return res.status(400).json({ message: "Note content is required" })
    }

    const report = await Report.findById(req.params.id)

    if (!report) {
      console.log("❌ Report not found:", req.params.id)
      return res.status(404).json({ message: "Report not found" })
    }

    // Create the note object
    const noteData = { content: content.trim() }

    // Add file information if a file was uploaded
    if (req.file) {
      console.log("📎 File uploaded:", req.file.originalname)
      noteData.attachment = `uploads/admin-notes/${req.file.filename}`
      noteData.originalFileName = req.file.originalname
    }

    console.log("📝 Note data to save:", noteData)

    report.adminNotes.push(noteData)
    report.updatedAt = Date.now()

    const updatedReport = await report.save()
    console.log("✅ Admin note saved successfully")

    // Notify user about admin note
    if (updatedReport.user && !updatedReport.isAnonymous) {
      console.log("📢 Notifying user about admin note")
      notifyUserAdminNote(updatedReport.user.toString(), updatedReport, content.trim())
    }

    res.json(updatedReport)
  } catch (error) {
    console.error("❌ Add admin note error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Fetch total users and their reports (including admins)
export const getUsersReports = async (req, res) => {
  try {
    // Get regular users
    const users = await User.find()
    const regularUsersReports = await Promise.all(
      users.map(async (user) => {
        const reportsCount = await Report.countDocuments({ user: user._id })
        return {
          _id: user._id,
          name: user.name,
          email: user.email,
          reportsCount,
          role: "user"
        }
      }),
    )

    // Get admin users
    const admins = await Admin.find()
    const adminUsersReports = await Promise.all(
      admins.map(async (admin) => {
        const reportsCount = await Report.countDocuments({ user: admin._id })
        return {
          _id: admin._id,
          name: "Admin User", // Admins don't have names in the schema
          email: admin.email,
          reportsCount,
          role: "admin"
        }
      }),
    )

    // Combine both arrays
    const allUsersReports = [...regularUsersReports, ...adminUsersReports]
    
    res.json(allUsersReports)
  } catch (error) {
    console.error("Error fetching users and reports:", error)
    res.status(500).json({ message: "Failed to fetch users and reports" })
  }
}

// Get user by ID for admin
export const getUserByIdForAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("-password")
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    res.json(user)
  } catch (error) {
    console.error("Error fetching user by ID for admin:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Update user by admin
export const updateUserByAdmin = async (req, res) => {
  try {
    const { name, email } = req.body
    const user = await User.findById(req.params.userId)

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    user.name = name || user.name
    user.email = email || user.email
    // Add password update logic here if needed, including hashing

    const updatedUser = await user.save()
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
    })
  } catch (error) {
    console.error("Error updating user by admin:", error)
    if (error.code === 11000) {
      // Duplicate key error (e.g., email already exists)
      return res.status(400).json({ message: "Email already in use by another account." })
    }
    res.status(500).json({ message: "Server error" })
  }
}

// Delete user by admin
export const deleteUserByAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Optional: Handle user's reports (e.g., delete them or disassociate)
    // For now, we'll just delete the user. Reports will be orphaned.
    // await Report.deleteMany({ user: req.params.userId });

    await User.deleteOne({ _id: req.params.userId }) // Use deleteOne

    res.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Error deleting user by admin:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    const totalReports = await Report.countDocuments()
    const totalUsers = await User.countDocuments()

    const reportsByStatus = await Report.aggregate([
      {
        $group: {
          _id: "$status", // Group by the status field
          count: { $sum: 1 }, // Count documents in each group
        },
      },
      {
        $project: {
          _id: 0, // Exclude the default _id field from the output
          status: "$_id", // Rename _id to status
          count: 1, // Include the count
        },
      },
    ])

    // Transform the aggregation result into the desired format: { Pending: X, Investigating: Y, ... }
    const formattedReportsByStatus = reportsByStatus.reduce((acc, item) => {
      if (item.status) {
        // Ensure status is not null or undefined
        acc[item.status] = item.count
      }
      return acc
    }, {})

    // Ensure all expected statuses are present, even if count is 0
    const allStatuses = ["Pending", "Investigating", "Resolved", "Closed", "cancel"] // Add "cancel" if it's a possible status
    allStatuses.forEach((status) => {
      if (!formattedReportsByStatus.hasOwnProperty(status)) {
        formattedReportsByStatus[status] = 0
      }
    })

    res.json({
      totalReports,
      totalUsers,
      reportsByStatus: formattedReportsByStatus,
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    res.status(500).json({ message: "Server error fetching dashboard stats" })
  }
}

// Toggle user role between admin and regular user
export const toggleUserRole = async (req, res) => {
  try {
    console.log("🔄 toggleUserRole function called")
    console.log("📋 Request params:", req.params)
    console.log("📋 Request body:", req.body)
    
    const { userId } = req.params
    const { currentAdminId } = req.body // Destructure properly
    
    console.log("👤 User ID to toggle:", userId)
    console.log("👤 Current Admin ID:", currentAdminId)
    
    // Prevent admin from changing their own role
    if (userId === currentAdminId) {
      console.log("❌ Admin trying to change own role")
      return res.status(400).json({ message: "You cannot change your own role" })
    }

    // Check if user exists in User collection
    console.log("🔍 Checking User collection...")
    const regularUser = await User.findById(userId)
    
    if (regularUser) {
      console.log("✅ Found regular user, promoting to admin")
      // User is currently a regular user, promote to admin
      const newAdmin = await Admin.create({
        email: regularUser.email,
        password: regularUser.password,
      })
      
      // Remove from User collection
      await User.deleteOne({ _id: userId })
      
      console.log("✅ User promoted successfully")
      return res.json({ 
        message: "User promoted to admin successfully",
        newRole: "admin",
        newId: newAdmin._id
      })
    }
    
    // Check if user exists in Admin collection
    console.log("🔍 Checking Admin collection...")
    const adminUser = await Admin.findById(userId)
    
    if (adminUser) {
      console.log("✅ Found admin user, demoting to regular user")
      // User is currently an admin, demote to regular user
      const userReports = await Report.findOne({ user: userId })
      const userName = userReports?.user?.name || "Former Admin"
      
      const newUser = await User.create({
        name: userName,
        email: adminUser.email,
        password: adminUser.password,
      })
      
      // Remove from Admin collection
      await Admin.deleteOne({ _id: userId })
      
      console.log("✅ Admin demoted successfully")
      return res.json({ 
        message: "Admin demoted to user successfully",
        newRole: "user",
        newId: newUser._id
      })
    }
    
    console.log("❌ User not found in either collection")
    return res.status(404).json({ message: "User not found" })
    
  } catch (error) {
    console.error("❌ Error toggling user role:", error)
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email already exists in the target role" })
    }
    res.status(500).json({ message: "Server error" })
  }
}
