import Report from "../models/reportModel.js"
import multer from "multer"
import path from "path"
import fs from "fs"
import { fileURLToPath } from "url"
import { notifyAdminsNewReport } from "../socket/socketHandler.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads")
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname))
  },
})

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true)
  } else {
    cb(new Error("Not an image! Please upload only images."), false)
  }
}

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
})

// Create a new report
export const createReport = async (req, res) => {
  try {
    console.log("Received req.body:", req.body) // Add this line to debug
    console.log("Received req.file:", req.file) // Add this line to debug
    const { title, description, location, cnic, isAnonymous, phone, userId } = req.body

    const reportData = {
      title,
      description,
      phone,
      cnic,
      location,
      isAnonymous: isAnonymous === "true",
    }

    // Add user reference if not anonymous and userId is provided
    if (!reportData.isAnonymous && userId) {
      reportData.user = userId
    }

    // Add image path if an image was uploaded
    if (req.file) {
      reportData.image = `uploads/${req.file.filename}`
    }

    const report = await Report.create(reportData)

    // Notify admins about new report
    notifyAdminsNewReport(report)

    res.status(201).json(report)
  } catch (error) {
    console.error("Create report error:", error) // It's good you're logging the error
    // To diagnose further, log req.body here:
    // console.log("req.body in createReport:", req.body)
    res.status(500).json({ message: "Server error", errorDetails: error.message }) // Send back more error detail
  }
}

// Get all reports for a user
export const getUserReports = async (req, res) => {
  try {
    const { userId } = req.params

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" })
    }

    const reports = await Report.find({ user: userId }).sort({ createdAt: -1 })

    res.json(reports)
  } catch (error) {
    console.error("Get user reports error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Get a single report by ID
export const getReportById = async (req, res) => {
  try {
    const { id } = req.params
    const { userId } = req.query

    const report = await Report.findById(id)

    if (!report) {
      return res.status(404).json({ message: "Report not found" })
    }

    // Check if the report belongs to the user or is anonymous
    if (report.user && report.user.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized to access this report" })
    }

    res.json(report)
  } catch (error) {
    console.error("Get report by ID error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Update a report
export const updateReport = async (req, res) => {
  try {
    const { title, description, location, cnic, phone, isAnonymous, removeCurrentImage, userId } = req.body
    const reportId = req.params.id

    // No need to access req.user._id, just use the userId from the form data
    if (!userId) {
      return res.status(401).json({ message: "User ID is required" })
    }

    const report = await Report.findById(reportId)

    if (!report) {
      return res.status(404).json({ message: "Report not found" })
    }

    // Check if the user is authorized to edit (owns the report)
    if (report.user && report.user.toString() !== userId) {
      return res.status(403).json({ message: "User not authorized to update this report" })
    }

    // Rest of the function remains the same
    report.title = title || report.title
    report.description = description || report.description
    report.location = location || report.location

    const newIsAnonymous = isAnonymous === "true" || isAnonymous === true

    // If the report is being made anonymous, or was anonymous, CNIC/phone might be cleared or not updated
    // If it's being made non-anonymous, ensure CNIC/phone are provided
    if (!newIsAnonymous) {
      if (!cnic || !phone) {
        // If model requires them and they are not provided for a non-anonymous report
        return res.status(400).json({ message: "CNIC and Phone are required for non-anonymous reports." })
      }
      report.cnic = cnic
      report.phone = phone
    } else {
      // If becoming anonymous, you might want to clear these fields
      if (cnic) report.cnic = cnic
      if (phone) report.phone = phone
    }
    report.isAnonymous = newIsAnonymous

    // Handle image update
    if (req.file) {
      // New image uploaded
      if (report.image) {
        // Delete old image
        const oldImagePath = path.join(__dirname, "../", report.image)
        if (fs.existsSync(oldImagePath)) {
          fs.unlink(oldImagePath, (err) => {
            if (err) console.error("Error deleting old image:", err)
          })
        }
      }
      report.image = `uploads/${req.file.filename}`
    } else if (removeCurrentImage === "true" || removeCurrentImage === true) {
      if (report.image) {
        const oldImagePath = path.join(__dirname, "../", report.image)
        if (fs.existsSync(oldImagePath)) {
          fs.unlink(oldImagePath, (err) => {
            if (err) console.error("Error deleting old image:", err)
          })
        }
        report.image = null
      }
    }

    const updatedReport = await report.save()
    res.json(updatedReport)
  } catch (error) {
    console.error("Update report error:", error)
    res.status(500).json({ message: "Server error updating report", errorDetails: error.message })
  }
}

// Delete a report by ID
export const deleteReport = async (req, res) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id)
    if (!report) {
      return res.status(404).json({ message: "Report not found" })
    }
    res.status(200).json({ message: "Report deleted successfully" })
  } catch (error) {
    console.error("Error deleting report:", error)
    res.status(500).json({ message: "Failed to delete report" })
  }
}
