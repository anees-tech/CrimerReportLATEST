import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import "./AuthForms.css"

const VerifyOTP = () => {
  const [otp, setOtp] = useState("")
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Get email from session storage
    const resetEmail = sessionStorage.getItem("resetEmail")
    if (!resetEmail) {
      // Redirect to forgot password if no email is found
      navigate("/forgot-password")
    } else {
      setEmail(resetEmail)
    }
  }, [navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      const response = await axios.post("http://localhost:5000/api/users/verify-otp", { email, otp })
      setSuccess(response.data.message)
      
      // Save OTP to session storage for the reset password page
      sessionStorage.setItem("resetOtp", otp)
      
      // Navigate to reset password page after a delay
      setTimeout(() => {
        navigate("/reset-password")
      }, 1500)
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      const response = await axios.post("http://localhost:5000/api/users/forgot-password", { email })
      setSuccess("OTP resent to your email")
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <h2 className="auth-title">Verify OTP</h2>
        <p className="auth-subtitle">Enter the OTP sent to {email}</p>

        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="otp" className="form-label">
              OTP Code
            </label>
            <input
              type="text"
              id="otp"
              className="form-input"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit OTP"
              required
              maxLength={6}
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        <div className="auth-links">
          <p>
            Didn't receive OTP? <button className="link-button" onClick={handleResendOTP} disabled={loading}>Resend OTP</button>
          </p>
          <p>
            <Link to="/forgot-password">Use a different email</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default VerifyOTP