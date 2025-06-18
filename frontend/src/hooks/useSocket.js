"use client"

import { useEffect, useRef } from "react"
import { io } from "socket.io-client"

export const useSocket = (serverUrl = "http://localhost:5000") => {
  const socketRef = useRef(null)

  useEffect(() => {
    console.log("Connecting to socket server:", serverUrl)

    // Create socket connection
    socketRef.current = io(serverUrl, {
      transports: ["websocket", "polling"],
      timeout: 20000,
    })

    socketRef.current.on("connect", () => {
      console.log("Socket connected successfully:", socketRef.current.id)
    })

    socketRef.current.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason)
    })

    socketRef.current.on("connect_error", (error) => {
      console.error("Socket connection error:", error)
    })

    return () => {
      if (socketRef.current) {
        console.log("Disconnecting socket")
        socketRef.current.disconnect()
      }
    }
  }, [serverUrl])

  return socketRef.current
}
