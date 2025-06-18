import mongoose from "mongoose"

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: function () {
      return this.recipientType === "user"
    },
  },
  recipientType: {
    type: String,
    enum: ["user", "admin"],
    required: true,
  },
  type: {
    type: String,
    enum: ["new_report", "status_update", "admin_note"],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  reportId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Report",
    required: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Index for efficient queries
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 })
notificationSchema.index({ recipientType: 1, read: 1, createdAt: -1 })

const Notification = mongoose.model("Notification", notificationSchema)

export default Notification
