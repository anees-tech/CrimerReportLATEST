"use client"

import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { FaBell, FaFileAlt, FaEdit, FaStickyNote, FaSpinner } from "react-icons/fa"
import { useNotifications } from "../hooks/useNotifications"
import "./NotificationBell.css"

const NotificationBell = ({ userId, isAdmin }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  // Get the actual userId for regular users
  const actualUserId = isAdmin ? null : userId || sessionStorage.getItem("userId")

  console.log("NotificationBell props:", { userId, isAdmin, actualUserId })

  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, clearNotifications } = useNotifications(
    actualUserId,
    isAdmin,
  )

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const getNotificationIcon = (type) => {
    switch (type) {
      case "new_report":
        return <FaFileAlt className="notification-type-icon notification-type-new_report" />
      case "status_update":
        return <FaEdit className="notification-type-icon notification-type-status_update" />
      case "admin_note":
        return <FaStickyNote className="notification-type-icon notification-type-admin_note" />
      default:
        return <FaBell className="notification-type-icon" />
    }
  }

  const formatTime = (timestamp) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now - time) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const handleNotificationClick = (notification) => {
    const notificationId = notification.id || notification._id
    markAsRead(notificationId)
    setIsOpen(false)

    // Extract report ID correctly (handles different formats)
    let reportId

    if (typeof notification.reportId === "string") {
      // If reportId is already a string, use it directly
      reportId = notification.reportId
    } else if (notification.reportId && notification.reportId._id) {
      // If reportId is an object with _id property
      reportId = notification.reportId._id
    } else if (notification.reportId && typeof notification.reportId.toString === "function") {
      // If reportId is an object with toString method
      reportId = notification.reportId.toString()
    }

    console.log("Navigating to report with ID:", reportId, "Type:", typeof reportId)

    // Only navigate if we have a valid ID
    if (reportId) {
      if (isAdmin) {
        navigate(`/admin/report/${reportId}`)
      } else {
        navigate(`/report/${reportId}`)
      }
    } else {
      console.error("Invalid report ID in notification:", notification)
    }
  }

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div className="notification-bell-container" ref={dropdownRef}>
      <button className="notification-bell-button" onClick={toggleDropdown} aria-label="Notifications">
        <FaBell />
        {unreadCount > 0 && <span className="notification-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications ({unreadCount} unread)</h3>
            <div className="notification-actions">
              {notifications.length > 0 && !loading && (
                <>
                  <button className="notification-action-btn" onClick={markAllAsRead}>
                    Mark all read
                  </button>
                  <button className="notification-action-btn" onClick={clearNotifications}>
                    Clear all
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="notification-list">
            {loading ? (
              <div className="notification-empty">
                <FaSpinner className="spinner" /> Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="notification-empty">No notifications yet</div>
            ) : (
              notifications.map((notification) => {
                const notificationId = notification.id || notification._id
                const timestamp = notification.timestamp || notification.createdAt
                return (
                  <div
                    key={notificationId}
                    className={`notification-item ${!notification.read ? "unread" : ""}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="notification-content">
                      <p className="notification-title">
                        {getNotificationIcon(notification.type)}
                        {notification.title}
                      </p>
                      <p className="notification-message">{notification.message}</p>
                      <span className="notification-time">{formatTime(timestamp)}</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationBell
