"use client"

import { useState, useEffect, useCallback } from "react"
import { useSocket } from "./useSocket"
import axios from "axios"

export const useNotifications = (userId = null, isAdmin = false) => {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const socket = useSocket()

  // Load notifications from database on mount
  useEffect(() => {
    const loadNotifications = async () => {
      if (!userId && !isAdmin) {
        setLoading(false)
        return
      }

      try {
        const endpoint = isAdmin
          ? "http://localhost:5000/api/notifications/admin"
          : `http://localhost:5000/api/notifications/user/${userId}`

        const response = await axios.get(endpoint)
        setNotifications(response.data.notifications || [])
        setUnreadCount(response.data.unreadCount || 0)
      } catch (error) {
        console.error("Error loading notifications:", error)
      } finally {
        setLoading(false)
      }
    }

    loadNotifications()
  }, [userId, isAdmin])

  useEffect(() => {
    if (!socket) {
      console.log("Socket not available yet")
      return
    }

    console.log("Setting up notifications for:", { userId, isAdmin })

    // Join appropriate room
    if (isAdmin) {
      console.log("Joining admin room")
      socket.emit("join_admin")
    } else if (userId) {
      console.log("Joining user room with ID:", userId)
      socket.emit("join_user", userId)
    }

    // Listen for loading existing notifications
    const handleLoadNotifications = (loadedNotifications) => {
      console.log("Loaded notifications from server:", loadedNotifications.length)
      setNotifications((prev) => {
        // Merge with existing notifications, avoiding duplicates
        const existingIds = new Set(prev.map((n) => n.id || n._id))
        const newNotifications = loadedNotifications.filter((n) => !existingIds.has(n._id))
        return [...newNotifications.map((n) => ({ ...n, id: n._id })), ...prev]
      })
      setUnreadCount((prev) => prev + loadedNotifications.filter((n) => !n.read).length)
    }

    // Listen for new notifications
    const handleNewNotification = (notification) => {
      console.log("Received new notification:", notification)
      setNotifications((prev) => [notification, ...prev])
      setUnreadCount((prev) => prev + 1)

      // Show browser notification if permission granted
      if (Notification.permission === "granted") {
        new Notification(notification.title, {
          body: notification.message,
          icon: "/favicon.ico",
        })
      }
    }

    socket.on("load_notifications", handleLoadNotifications)
    socket.on("new_notification", handleNewNotification)

    // Cleanup
    return () => {
      console.log("Cleaning up socket listeners")
      socket.off("load_notifications", handleLoadNotifications)
      socket.off("new_notification", handleNewNotification)
    }
  }, [socket, userId, isAdmin])

  // Request notification permission on mount
  useEffect(() => {
    if (Notification.permission === "default") {
      Notification.requestPermission().then((permission) => {
        console.log("Notification permission:", permission)
      })
    }
  }, [])

  const markAsRead = useCallback(
    async (notificationId) => {
      try {
        // Update in database
        await axios.put(`http://localhost:5000/api/notifications/${notificationId}/read`)

        // Update local state
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === notificationId || notif._id === notificationId ? { ...notif, read: true } : notif,
          ),
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))

        // Notify socket
        if (socket) {
          socket.emit("mark_notification_read", notificationId)
        }
      } catch (error) {
        console.error("Error marking notification as read:", error)
      }
    },
    [socket],
  )

  const markAllAsRead = useCallback(async () => {
    try {
      // Update in database
      const endpoint = isAdmin
        ? "http://localhost:5000/api/notifications/admin/read-all"
        : `http://localhost:5000/api/notifications/user/${userId}/read-all`

      await axios.put(endpoint)

      // Update local state
      setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })))
      setUnreadCount(0)

      // Notify socket
      if (socket) {
        socket.emit("mark_all_notifications_read", { isAdmin, userId })
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    }
  }, [socket, isAdmin, userId])

  const clearNotifications = useCallback(() => {
    setNotifications([])
    setUnreadCount(0)
  }, [])

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  }
}
