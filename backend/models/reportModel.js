import mongoose from "mongoose"

const adminNoteSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  attachment: {
    type: String, // Store file path
    required: false,
  },
  originalFileName: {
    type: String, // Store original file name for display
    required: false,
  },
  date: {
    type: Date,
    default: Date.now,
  },
})

const reportSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  cnic: {
    type: String,
    required: true,
  },
  
  description: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Investigating", "Resolved", "Closed"],
    default: "Pending",
  },
  isAnonymous: {
    type: Boolean,
    default: false,
  },
  image: {
    type: String,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  adminNotes: [adminNoteSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

const Report = mongoose.model("Report", reportSchema)

export default Report

