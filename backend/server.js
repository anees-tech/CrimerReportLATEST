import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"
import multer from "multer"
import fs from "fs"
import { createServer } from "http"
import { initializeSocket } from "./socket/socketHandler.js"

// Routes
import userRoutes from "./routes/userRoutes.js"
import reportRoutes from "./routes/reportRoutes.js"
import adminRoutes from "./routes/adminRoutes.js"
import notificationRoutes from "./routes/notificationRoutes.js"

// Configuration
dotenv.config()
const app = express()
const server = createServer(app)
const PORT = process.env.PORT || 5000
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Initialize Socket.io
const io = initializeSocket(server)

// Middleware
app.use(cors())
app.use(express.json())
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "uploads")
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname))
  },
})

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err))

// Routes
app.use("/api/users", userRoutes)
app.use("/api/reports", reportRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/notifications", notificationRoutes)

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
