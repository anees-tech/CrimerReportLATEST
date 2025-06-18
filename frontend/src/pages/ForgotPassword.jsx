import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import "./AuthForms.css"

const ForgotPassword = () => {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      const response = await axios.post("http://localhost:5000/api/users/forgot-password", { email })
      setSuccess(response.data.message)
      
      // Store email in sessionStorage for next steps
      sessionStorage.setItem("resetEmail", email)
      
      // Navigate to OTP verification after a delay
      setTimeout(() => {
        navigate("/verify-otp")
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to process request. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <h2 className="auth-title">Forgot Password</h2>

        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Sending..." : "Send Reset OTP"}
          </button>
        </form>

        <div className="auth-links">
          <p>
            Remember your password? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword