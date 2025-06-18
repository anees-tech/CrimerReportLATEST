import { Server } from "socket.io"
import Notification from "../models/notificationModel.js"

let io

// Store connected users and admins
const connectedUsers = new Map() // userId -> socketId
const connectedAdmins = new Set() // Set of admin socketIds

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: ["http://localhost:3000", "http://localhost:5173"],
      methods: ["GET", "POST"],
    },
  })

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id)

    // Handle user joining
    socket.on("join_user", async (userId) => {
      if (!userId) {
        console.log("No userId provided for join_user")
        return
      }
      connectedUsers.set(userId, socket.id)
      socket.userId = userId
      console.log(`User ${userId} joined with socket ${socket.id}`)

      // Send unread notifications to user
      try {
        const unreadNotifications = await Notification.find({
          recipient: userId,
          recipientType: "user",
          read: false,
        })
          .sort({ createdAt: -1 })
          .limit(50)

        socket.emit("load_notifications", unreadNotifications)
        console.log(`Sent ${unreadNotifications.length} unread notifications to user ${userId}`)
      } catch (error) {
        console.error("Error loading user notifications:", error)
      }
    })

    // Handle admin joining
    socket.on("join_admin", async () => {
      connectedAdmins.add(socket.id)
      socket.isAdmin = true
      console.log(`Admin joined with socket ${socket.id}`)

      // Send unread admin notifications
      try {
        const unreadNotifications = await Notification.find({
          recipientType: "admin",
          read: false,
        })
          .sort({ createdAt: -1 })
          .limit(50)

        socket.emit("load_notifications", unreadNotifications)
        console.log(`Sent ${unreadNotifications.length} unread notifications to admin`)
      } catch (error) {
        console.error("Error loading admin notifications:", error)
      }
    })

    // Handle marking notification as read
    socket.on("mark_notification_read", async (notificationId) => {
      try {
        await Notification.findByIdAndUpdate(notificationId, { read: true })
        console.log(`Marked notification ${notificationId} as read`)
      } catch (error) {
        console.error("Error marking notification as read:", error)
      }
    })

    // Handle marking all notifications as read
    socket.on("mark_all_notifications_read", async (data) => {
      try {
        if (data.isAdmin) {
          await Notification.updateMany({ recipientType: "admin", read: false }, { read: true })
        } else if (data.userId) {
          await Notification.updateMany({ recipient: data.userId, read: false }, { read: true })
        }
        console.log("Marked all notifications as read")
      } catch (error) {
        console.error("Error marking all notifications as read:", error)
      }
    })

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id)

      if (socket.userId) {
        connectedUsers.delete(socket.userId)
        console.log(`Removed user ${socket.userId} from connected users`)
      }

      if (socket.isAdmin) {
        connectedAdmins.delete(socket.id)
        console.log(`Removed admin ${socket.id} from connected admins`)
      }
    })
  })

  return io
}

// Notify all admins about new report
export const notifyAdminsNewReport = async (reportData) => {
  if (!io) {
    console.log("Socket.io not initialized")
    return
  }

  console.log("Notifying admins about new report:", reportData.title)

  const notificationData = {
    recipientType: "admin",
    type: "new_report",
    title: "New Crime Report",
    message: `New report: "${reportData.title}" from ${reportData.location}`,
    reportId: reportData._id,
  }

  try {
    // Save to database
    const notification = await Notification.create(notificationData)
    console.log("Saved admin notification to database:", notification._id)

    // Send to all connected admins
    const notificationWithId = {
      id: notification._id,
      ...notificationData,
      timestamp: notification.createdAt,
      read: false,
    }

    connectedAdmins.forEach((adminSocketId) => {
      console.log(`Sending notification to admin socket: ${adminSocketId}`)
      io.to(adminSocketId).emit("new_notification", notificationWithId)
    })
  } catch (error) {
    console.error("Error saving admin notification:", error)
  }
}

// Notify specific user about status update
export const notifyUserStatusUpdate = async (userId, reportData, oldStatus, newStatus) => {
  if (!io) {
    console.log("Socket.io not initialized")
    return
  }

  console.log(`Notifying user ${userId} about status update`)

  const notificationData = {
    recipient: userId,
    recipientType: "user",
    type: "status_update",
    title: "Report Status Updated",
    message: `Your report "${reportData.title}" status changed from ${oldStatus} to ${newStatus}`,
    reportId: reportData._id,
  }

  try {
    // Save to database
    const notification = await Notification.create(notificationData)
    console.log("Saved user status notification to database:", notification._id)

    // Send to user if connected
    const userSocketId = connectedUsers.get(userId)
    if (userSocketId) {
      const notificationWithId = {
        id: notification._id,
        ...notificationData,
        timestamp: notification.createdAt,
        read: false,
      }

      console.log(`Sending status update notification to user socket: ${userSocketId}`)
      io.to(userSocketId).emit("new_notification", notificationWithId)
    } else {
      console.log(`User ${userId} not connected, notification saved to database`)
    }
  } catch (error) {
    console.error("Error saving user status notification:", error)
  }
}

// Notify user about admin note
export const notifyUserAdminNote = async (userId, reportData, noteContent) => {
  if (!io) {
    console.log("Socket.io not initialized")
    return
  }

  console.log(`Notifying user ${userId} about admin note`)

  const notificationData = {
    recipient: userId,
    recipientType: "user",
    type: "admin_note",
    title: "New Update on Your Report",
    message: `Admin added a note to your report "${reportData.title}": ${noteContent.substring(0, 100)}${noteContent.length > 100 ? "..." : ""}`,
    reportId: reportData._id,
  }

  try {
    // Save to database
    const notification = await Notification.create(notificationData)
    console.log("Saved user admin note notification to database:", notification._id)

    // Send to user if connected
    const userSocketId = connectedUsers.get(userId)
    if (userSocketId) {
      const notificationWithId = {
        id: notification._id,
        ...notificationData,
        timestamp: notification.createdAt,
        read: false,
      }

      console.log(`Sending admin note notification to user socket: ${userSocketId}`)
      io.to(userSocketId).emit("new_notification", notificationWithId)
    } else {
      console.log(`User ${userId} not connected, notification saved to database`)
    }
  } catch (error) {
    console.error("Error saving user admin note notification:", error)
  }
}

export const getIO = () => io
