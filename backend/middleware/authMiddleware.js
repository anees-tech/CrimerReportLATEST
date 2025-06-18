// Protect routes - User authentication
export const protect = (req, res, next) => {
  try {
    let token

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1]
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" })
    }

    // Verify token (in a real app, you would use jwt.verify)
    // For this demo, we'll just use the token as the user ID
    req.user = { _id: token }
    next()
  } catch (error) {
    console.error("Auth middleware error:", error)
    res.status(401).json({ message: "Not authorized, token failed" })
  }
}

// Admin authentication
export const adminProtect = (req, res, next) => {
  try {
    let token

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1]
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" })
    }

    // Verify it's an admin token (in a real app, you would use jwt.verify)
    if (!token.startsWith("admin-")) {
      return res.status(401).json({ message: "Not authorized as admin" })
    }

    // Extract admin ID from token
    const adminId = token.substring(6) // Remove 'admin-' prefix
    req.admin = { _id: adminId }
    next()
  } catch (error) {
    console.error("Admin auth middleware error:", error)
    res.status(401).json({ message: "Not authorized, token failed" })
  }
}

// Optional authentication - allows anonymous access
export const optionalProtect = (req, res, next) => {
  try {
    let token

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1]
      // Set user in request (in a real app, you would verify the token)
      req.user = { _id: token }
    }

    next()
  } catch (error) {
    console.error("Optional auth middleware error:", error)
    // Continue without setting req.user
    next()
  }
}

