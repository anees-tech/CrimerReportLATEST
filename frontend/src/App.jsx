"use client"

import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Navbar from "./components/Navbar"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"
import UserDashboard from "./pages/UserDashboard" // New: User-specific dashboard
import ReportCrime from "./pages/ReportCrime"
import AdminLogin from "./pages/AdminLogin"
import AdminOverviewDashboard from "./pages/AdminOverviewDashboard"
import AdminReportList from "./pages/AdminReportList"
import ReportDetails from "./pages/ReportDetails"
import AdminReportDetails from "./pages/AdminReportDetails"
import TotalUsersReports from "./pages/TotalUsersReports"
import EditReport from "./pages/EditReport"
import AdminEditUser from "./pages/AdminEditUser";
import Footer from "./components/Footer"
import ForgotPassword from "./pages/ForgotPassword";
import VerifyOTP from "./pages/VerifyOTP";
import ResetPassword from "./pages/ResetPassword";
import "./App.css"

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const userId = sessionStorage.getItem("userId");
    const adminStatus = sessionStorage.getItem("isAdmin");
    
    if (userId) {
      setIsLoggedIn(true);
      setCurrentUser(userId);
    }
    if (adminStatus === "true") {
      setIsAdmin(true);
    }
    setAuthChecked(true);
  }, []);

  const ProtectedRoute = ({ children }) => {
    if (!authChecked) {
      return <div>Loading...</div>;
    }
    if (!isLoggedIn) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  const AdminRoute = ({ children }) => {
    if (!authChecked) {
      return <div>Loading...</div>;
    }
    if (!isAdmin) {
      return <Navigate to="/admin/login" replace />;
    }
    return children;
  };

  if (!authChecked) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <h2>Loading Application...</h2>
      </div>
    );
  }

  return (
    <Router>
      <div className="app-container">
        <Navbar
          isLoggedIn={isLoggedIn}
          isAdmin={isAdmin}
          setIsLoggedIn={setIsLoggedIn}
          setIsAdmin={setIsAdmin}
          setCurrentUser={setCurrentUser}
        />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} setCurrentUser={setCurrentUser} setIsAdmin={setIsAdmin} />} />
            <Route
              path="/register"
              element={<Register setIsLoggedIn={setIsLoggedIn} setCurrentUser={setCurrentUser} />}
            />
            <Route path="/report-crime" element={<ReportCrime currentUser={currentUser} isLoggedIn={isLoggedIn} />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <UserDashboard currentUser={currentUser} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/report/:id"
              element={
                <ProtectedRoute>
                  <ReportDetails currentUser={currentUser} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/report/edit/:id"
              element={
                <ProtectedRoute>
                  <EditReport currentUser={currentUser} />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin setIsAdmin={setIsAdmin} />} />
            <Route
              path="/admin/dashboard"
              element={
                <AdminRoute>
                  <AdminOverviewDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <AdminRoute>
                  <AdminReportList />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/report/:id"
              element={
                <AdminRoute>
                  <AdminReportDetails />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/users-reports"
              element={
                <AdminRoute>
                  <TotalUsersReports />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/edit-user/:userId"
              element={
                <AdminRoute>
                  <AdminEditUser />
                </AdminRoute>
              }
            />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

