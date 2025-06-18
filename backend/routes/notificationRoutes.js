import express from "express"
import Notification from "../models/notificationModel.js"

const router = express.Router()

// Get notifications for a user
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params
    const { page = 1, limit = 20 } = req.query

    const notifications = await Notification.find({
      recipient: userId,
      recipientType: "user",
    })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("reportId", "title")

    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      recipientType: "user",
      read: false,
    })

    res.json({
      notifications,
      unreadCount,
      currentPage: page,
      totalPages: Math.ceil(notifications.length / limit),
    })
  } catch (error) {
    console.error("Error fetching user notifications:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get notifications for admin
router.get("/admin", async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query

    const notifications = await Notification.find({
      recipientType: "admin",
    })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("reportId", "title")

    const unreadCount = await Notification.countDocuments({
      recipientType: "admin",
      read: false,
    })

    res.json({
      notifications,
      unreadCount,
      currentPage: page,
      totalPages: Math.ceil(notifications.length / limit),
    })
  } catch (error) {
    console.error("Error fetching admin notifications:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Mark notification as read
router.put("/:notificationId/read", async (req, res) => {
  try {
    const { notificationId } = req.params

    const notification = await Notification.findByIdAndUpdate(notificationId, { read: true }, { new: true })

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" })
    }

    res.json({ message: "Notification marked as read" })
  } catch (error) {
    console.error("Error marking notification as read:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Mark all notifications as read for user
router.put("/user/:userId/read-all", async (req, res) => {
  try {
    const { userId } = req.params

    await Notification.updateMany({ recipient: userId, recipientType: "user", read: false }, { read: true })

    res.json({ message: "All notifications marked as read" })
  } catch (error) {
    console.error("Error marking all user notifications as read:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Mark all admin notifications as read
router.put("/admin/read-all", async (req, res) => {
  try {
    await Notification.updateMany({ recipientType: "admin", read: false }, { read: true })

    res.json({ message: "All admin notifications marked as read" })
  } catch (error) {
    console.error("Error marking all admin notifications as read:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Delete notification
router.delete("/:notificationId", async (req, res) => {
  try {
    const { notificationId } = req.params

    const notification = await Notification.findByIdAndDelete(notificationId)

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" })
    }

    res.json({ message: "Notification deleted" })
  } catch (error) {
    console.error("Error deleting notification:", error)
    res.status(500).json({ message: "Server error" })
  }
})

export default router
