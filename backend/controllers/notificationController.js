import Notification from "../models/notificationModel.js"
import mongoose from "mongoose"

// Get notifications for a user
export const getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params
    const { page = 1, limit = 20 } = req.query

    console.log("🔔 Getting user notifications for userId:", userId)

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log("❌ Invalid user ID:", userId)
      return res.status(400).json({ message: "Invalid user ID" })
    }

    const notifications = await Notification.find({ 
      userId, 
      isAdmin: false 
    })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean()

    const unreadCount = await Notification.countDocuments({ 
      userId, 
      isAdmin: false, 
      read: false 
    })

    console.log("✅ Found notifications:", notifications.length, "unread:", unreadCount)

    res.json({
      notifications,
      unreadCount,
      currentPage: page,
      totalPages: Math.ceil(notifications.length / limit)
    })
  } catch (error) {
    console.error("❌ Get user notifications error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Get notifications for admin
export const getAdminNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query

    console.log("🔔 Getting admin notifications")

    const notifications = await Notification.find({ isAdmin: true })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean()

    const unreadCount = await Notification.countDocuments({ 
      isAdmin: true, 
      read: false 
    })

    console.log("✅ Found admin notifications:", notifications.length, "unread:", unreadCount)

    res.json({
      notifications,
      unreadCount,
      currentPage: page,
      totalPages: Math.ceil(notifications.length / limit)
    })
  } catch (error) {
    console.error("❌ Get admin notifications error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Mark notification as read
export const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params
    
    console.log("📖 Marking notification as read:", notificationId)
    
    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      console.log("❌ Invalid notification ID:", notificationId)
      return res.status(400).json({ message: "Invalid notification ID" })
    }
    
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    ).lean()

    if (!notification) {
      console.log("❌ Notification not found:", notificationId)
      return res.status(404).json({ message: "Notification not found" })
    }

    console.log("✅ Notification marked as read:", notification)
    res.json(notification)
  } catch (error) {
    console.error("❌ Mark notification as read error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Mark all notifications as read for a user
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const { userId } = req.params
    const { isAdmin } = req.body

    console.log("📖 Marking all notifications as read - userId:", userId, "isAdmin:", isAdmin)

    let query = { isAdmin: true }
    
    if (!isAdmin && userId) {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid user ID" })
      }
      query = { userId, isAdmin: false }
    }
    
    const result = await Notification.updateMany(query, { read: true })
    console.log("✅ Updated notifications:", result)

    res.json({ message: "All notifications marked as read" })
  } catch (error) {
    console.error("❌ Mark all notifications as read error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params
    
    console.log("🗑️ Deleting notification:", notificationId)
    
    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      return res.status(400).json({ message: "Invalid notification ID" })
    }
    
    const notification = await Notification.findByIdAndDelete(notificationId)

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" })
    }

    console.log("✅ Notification deleted:", notification)
    res.json({ message: "Notification deleted successfully" })
  } catch (error) {
    console.error("❌ Delete notification error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Clear all notifications for a user
export const clearAllNotifications = async (req, res) => {
  try {
    const { userId } = req.params
    const { isAdmin } = req.body

    console.log("🗑️ Clearing all notifications - userId:", userId, "isAdmin:", isAdmin)

    let query = { isAdmin: true }
    
    if (!isAdmin && userId) {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid user ID" })
      }
      query = { userId, isAdmin: false }
    }
    
    const result = await Notification.deleteMany(query)
    console.log("✅ Deleted notifications:", result)

    res.json({ message: "All notifications cleared" })
  } catch (error) {
    console.error("❌ Clear all notifications error:", error)
    res.status(500).json({ message: "Server error" })
  }
}