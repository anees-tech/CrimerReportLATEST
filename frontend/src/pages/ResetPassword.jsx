import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import "./AuthForms.css"

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
    otp: "", // Add OTP field if not in session storage
  })
  const [email, setEmail] = useState("")
  const [otpFromSession, setOtpFromSession] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Get email and OTP from session storage
    const resetEmail = sessionStorage.getItem("resetEmail")
    const resetOtp = sessionStorage.getItem("resetOtp")
    
    if (!resetEmail) {
      // Redirect to forgot password if no email is found
      navigate("/forgot-password")
    } else {
      setEmail(resetEmail)
      if (resetOtp) {
        setOtpFromSession(resetOtp)
      }
    }
  }, [navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    // Validate password strength
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setLoading(true)

    try {
      // Use OTP from session storage if available, otherwise use from form
      const otpToUse = otpFromSession || formData.otp
      
      if (!otpToUse) {
        setError("OTP is required")
        setLoading(false)
        return
      }
      
      const response = await axios.post("http://localhost:5000/api/users/reset-password", {
        email,
        otp: otpToUse,
        password: formData.password,
      })
      
      setSuccess(response.data.message)
      
      // Clear reset data from session storage
      sessionStorage.removeItem("resetEmail")
      sessionStorage.removeItem("resetOtp")
      
      // Navigate to login after successful password reset
      setTimeout(() => {
        navigate("/login")
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <h2 className="auth-title">Reset Password</h2>

        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          {!otpFromSession && (
            <div className="form-group">
              <label htmlFor="otp" className="form-label">
                OTP Code
              </label>
              <input
                type="text"
                id="otp"
                name="otp"
                className="form-input"
                value={formData.otp}
                onChange={handleChange}
                placeholder="Enter your OTP code"
                required
                maxLength={6}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              New Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className="form-input"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ResetPassword