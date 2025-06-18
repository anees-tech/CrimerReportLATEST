"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import "./AdminEditUser.css" // We'll create this CSS file next

const AdminEditUser = () => {
  const { userId } = useParams()
  const navigate = useNavigate()

  const [userData, setUserData] = useState({ name: "", email: "" })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`http://localhost:5000/api/admin/users/${userId}`)
        setUserData({
          name: response.data.name || "",
          email: response.data.email || "",
        })
        setError("")
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch user data.")
        console.error("Fetch user data error:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchUserData()
  }, [userId])

  const handleChange = (e) => {
    const { name, value } = e.target
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)
    try {
      await axios.put(`http://localhost:5000/api/admin/users/${userId}`, userData)
      setSuccess("User updated successfully!")
      // Optionally navigate back to the users list or show a success message
      // navigate("/admin/users-reports");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update user.")
      console.error("Update user error:", err)
    } finally {
      setLoading(false)
    }
  }

  if (loading && !userData.name && !userData.email) { // Initial loading
    return <div className="loading">Loading user data...</div>
  }

  return (
    <div className="admin-edit-user-container">
      <h2>Edit User</h2>
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}
      <form onSubmit={handleSubmit} className="edit-user-form">
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={userData.name}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={userData.email}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? "Updating..." : "Update User"}
        </button>
      </form>
      <button onClick={() => navigate("/admin/users-reports")} className="back-button" disabled={loading}>
        Back to Users List
      </button>
    </div>
  )
}

export default AdminEditUser