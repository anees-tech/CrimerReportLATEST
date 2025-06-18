"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom" // Import useNavigate
import axios from "axios"
import "./TotalUsersReports.css"

const TotalUsersReports = () => {
  const [usersReports, setUsersReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const navigate = useNavigate() // Initialize useNavigate

  useEffect(() => {
    const fetchUsersReports = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/admin/users-reports")
        setUsersReports(response.data)
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch users and reports")
      } finally {
        setLoading(false)
      }
    }

    fetchUsersReports()
  }, [])

  const handleEditUser = (userId) => {
    // Navigate to an edit user page (you'll need to create this component and route)
    navigate(`/admin/edit-user/${userId}`)
    console.log("Edit user:", userId) // Placeholder
  }

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      try {
        setLoading(true)
        await axios.delete(`http://localhost:5000/api/admin/users/${userId}`)
        setUsersReports(usersReports.filter((user) => user._id !== userId))
        setError("") // Clear any previous error
      } catch (err) {
        setError(err.response?.data?.message || "Failed to delete user")
      } finally {
        setLoading(false)
      }
    }
  }

  if (loading && usersReports.length === 0) {
    return <div className="loading">Loading users and reports...</div>
  }

  if (error) {
    return <div className="error">{error}</div>
  }

  return (
    <div className="users-reports-container">
      <h2>Total Users and Their Reports</h2>
      {usersReports.length === 0 && !loading ? (
        <p>No users or reports found.</p>
      ) : (
        <table className="users-reports-table">
          <thead>
            <tr>
              <th>User Name</th>
              <th>Email</th>
              <th>Total Reports</th>
              <th>Actions</th> {/* Add Actions header */}
            </tr>
          </thead>
          <tbody>
            {usersReports.map((user) => (
              <tr key={user._id}>
                <td>{user.name || "Anonymous"}</td>
                <td>{user.email || "N/A"}</td>
                <td>{user.reportsCount}</td>
                <td>
                  <button
                    onClick={() => handleEditUser(user._id)}
                    className="action-button edit-button"
                    disabled={loading}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user._id)}
                    className="action-button delete-button"
                    disabled={loading}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default TotalUsersReports