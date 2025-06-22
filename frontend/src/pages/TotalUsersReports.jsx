"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import "./TotalUsersReports.css"

const TotalUsersReports = () => {
  const [usersReports, setUsersReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [toggleLoading, setToggleLoading] = useState({})
  const navigate = useNavigate()

  const currentAdminId = sessionStorage.getItem("adminId") // Get current admin ID

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
    navigate(`/admin/edit-user/${userId}`)
  }

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      try {
        setLoading(true)
        await axios.delete(`http://localhost:5000/api/admin/users/${userId}`)
        setUsersReports(usersReports.filter((user) => user._id !== userId))
        setError("")
      } catch (err) {
        setError(err.response?.data?.message || "Failed to delete user")
      } finally {
        setLoading(false)
      }
    }
  }

  const handleToggleRole = async (userId, currentRole) => {
    const action = currentRole === "admin" ? "demote to user" : "promote to admin"
    
    if (window.confirm(`Are you sure you want to ${action}? This will change their access permissions.`)) {
      try {
        setToggleLoading(prev => ({ ...prev, [userId]: true }))
        
        const response = await axios.put(
          `http://localhost:5000/api/admin/users/${userId}/toggle-role`,
          { currentAdminId }
        )
        
        // Update the user in the list with new role and ID
        setUsersReports(prevUsers => 
          prevUsers.map(user => 
            user._id === userId 
              ? { 
                  ...user, 
                  _id: response.data.newId, 
                  role: response.data.newRole,
                  name: response.data.newRole === "admin" ? "Admin User" : user.name
                }
              : user
          )
        )
        
        setError("")
        alert(response.data.message)
      } catch (err) {
        setError(err.response?.data?.message || "Failed to toggle user role")
        alert(err.response?.data?.message || "Failed to toggle user role")
      } finally {
        setToggleLoading(prev => ({ ...prev, [userId]: false }))
      }
    }
  }

  const getRoleBadgeClass = (role) => {
    return role === "admin" ? "role-badge-admin" : "role-badge-user"
  }

  const isCurrentAdmin = (userId) => {
    return userId === currentAdminId
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
              <th>Role</th>
              <th>Total Reports</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {usersReports.map((user) => (
              <tr key={user._id}>
                <td>{user.name || "Anonymous"}</td>
                <td>{user.email || "N/A"}</td>
                <td>
                  <span className={`role-badge ${getRoleBadgeClass(user.role)}`}>
                    {user.role === "admin" ? "Admin" : "User"}
                  </span>
                </td>
                <td>{user.reportsCount}</td>
                <td className="actions-cell">
                  <button
                    onClick={() => handleEditUser(user._id)}
                    className="action-button edit-button"
                    disabled={loading || isCurrentAdmin(user._id)}
                    title={isCurrentAdmin(user._id) ? "Cannot edit your own account" : "Edit user"}
                  >
                    Edit
                  </button>
                  
                  <button
                    onClick={() => handleToggleRole(user._id, user.role)}
                    className={`action-button toggle-button ${user.role === "admin" ? "demote" : "promote"}`}
                    disabled={loading || toggleLoading[user._id] || isCurrentAdmin(user._id)}
                    title={isCurrentAdmin(user._id) ? "Cannot change your own role" : `${user.role === "admin" ? "Demote to User" : "Promote to Admin"}`}
                  >
                    {toggleLoading[user._id] ? "Processing..." : (user.role === "admin" ? "Demote" : "Promote")}
                  </button>
                  
                  <button
                    onClick={() => handleDeleteUser(user._id)}
                    className="action-button delete-button"
                    disabled={loading || isCurrentAdmin(user._id)}
                    title={isCurrentAdmin(user._id) ? "Cannot delete your own account" : "Delete user"}
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