"use client"

import { Link, useNavigate } from "react-router-dom"
import "./Navbar.css"
import {
  FaUserShield,
  FaSignOutAlt,
  FaTachometerAlt,
  FaListUl,
  FaUsersCog,
  FaHome,
  FaSignInAlt,
  FaUserPlus,
  FaClipboardList,
  FaPlusCircle,
} from "react-icons/fa"
import NotificationBell from "./NotificationBell"

const Navbar = ({ isLoggedIn, isAdmin, setIsLoggedIn, setIsAdmin, setCurrentUser }) => {
  const navigate = useNavigate()

  const handleLogout = () => {
    sessionStorage.removeItem("userId")
    sessionStorage.removeItem("userName")
    sessionStorage.removeItem("userEmail")
    setIsLoggedIn(false)
    setCurrentUser(null)
    navigate("/")
  }

  const handleAdminLogout = () => {
    sessionStorage.removeItem("isAdmin")
    sessionStorage.removeItem("adminToken")
    setIsAdmin(false)
    navigate("/admin/login")
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">🛡️</span> Crime Reporting
        </Link>

        <ul className="navbar-menu">
          <li className="navbar-item">
            <Link to="/" className="navbar-link">
              <FaHome /> Home
            </Link>
          </li>

          {!isLoggedIn && !isAdmin ? (
            <>
              <li className="navbar-item">
                <Link to="/login" className="navbar-link">
                  <FaSignInAlt /> Login
                </Link>
              </li>
              <li className="navbar-item">
                <Link to="/register" className="navbar-link">
                  <FaUserPlus /> Register
                </Link>
              </li>
              <li className="navbar-item">
                <Link to="/admin/login" className="navbar-link admin-link">
                  <FaUserShield /> Admin
                </Link>
              </li>
            </>
          ) : isAdmin ? (
            <>
              <li className="navbar-item">
                <Link to="/admin/dashboard" className="navbar-link">
                  <FaTachometerAlt /> Overview
                </Link>
              </li>
              <li className="navbar-item">
                <Link to="/admin/reports" className="navbar-link">
                  <FaListUl /> All Reports
                </Link>
              </li>
              <li className="navbar-item">
                <Link to="/admin/users-reports" className="navbar-link">
                  <FaUsersCog /> Manage Users
                </Link>
              </li>
              <li className="navbar-item">
                <NotificationBell isAdmin={true} />
              </li>
              <li className="navbar-item">
                <button onClick={handleAdminLogout} className="navbar-button logout-button">
                  <FaSignOutAlt /> Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="navbar-item">
                <Link to="/dashboard" className="navbar-link">
                  <FaClipboardList /> My Reports
                </Link>
              </li>
              <li className="navbar-item">
                <Link to="/report-crime" className="navbar-link">
                  <FaPlusCircle /> Report Crime
                </Link>
              </li>
              <li className="navbar-item">
                <NotificationBell userId={sessionStorage.getItem("userId")} isAdmin={false} />
              </li>
              <li className="navbar-item">
                <button onClick={handleLogout} className="navbar-button logout-button">
                  <FaSignOutAlt /> Logout
                </button>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  )
}

export default Navbar
