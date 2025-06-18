"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './AdminOverviewDashboard.css';
import { FaFileAlt, FaUsers, FaTasks, FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaBan, FaListAlt, FaUsersCog } from 'react-icons/fa';

const AdminOverviewDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // IMPORTANT: Ensure this backend endpoint exists and returns the expected data structure
        const response = await axios.get('http://localhost:5000/api/admin/dashboard-stats');
        setStats(response.data);
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch dashboard stats. Please ensure the backend endpoint is active and returns data like: { totalReports, totalUsers, reportsByStatus: { Pending: X, Investigating: Y, ... } }');
        console.error("Failed to fetch dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="admin-overview-loading">Loading dashboard data...</div>;
  }

  if (error) {
    return <div className="admin-overview-error">{error}</div>;
  }

  if (!stats) {
    return <div className="admin-overview-error">No statistics data available. Check API endpoint.</div>;
  }

  const { totalReports = 0, totalUsers = 0, reportsByStatus = {} } = stats;

  const statusDetails = {
    Pending: { icon: <FaHourglassHalf />, color: '#ffc107', name: 'Pending' },
    Investigating: { icon: <FaTasks />, color: '#17a2b8', name: 'Investigating' },
    Resolved: { icon: <FaCheckCircle />, color: '#28a745', name: 'Resolved' },
    Closed: { icon: <FaTimesCircle />, color: '#6c757d', name: 'Closed' },
    cancel: { icon: <FaBan />, color: '#dc3545', name: 'Cancelled' }, // Added cancel status
  };

  return (
    <div className="admin-overview-container">
      <h1 className="admin-overview-title">Admin Overview</h1>

      <div className="stats-grid">
        <Link to="/admin/reports" className="stat-card total-reports-card">
          <div className="stat-card-icon"><FaFileAlt /></div>
          <div className="stat-card-info">
            <h2>{totalReports}</h2>
            <p>Total Reports</p>
          </div>
        </Link>
        <Link to="/admin/users-reports" className="stat-card total-users-card">
          <div className="stat-card-icon"><FaUsers /></div>
          <div className="stat-card-info">
            <h2>{totalUsers}</h2>
            <p>Total Users</p>
          </div>
        </Link>
      </div>

      <h2 className="section-title">Reports by Status</h2>
      {Object.keys(reportsByStatus).length > 0 ? (
        <div className="status-grid">
          {Object.entries(reportsByStatus).map(([statusKey, count]) => {
            const detail = statusDetails[statusKey] || { icon: <FaFileAlt />, color: '#adb5bd', name: statusKey };
            const displayCount = typeof count === 'number' ? count : 0;
            return (
              <Link to={`/admin/reports?status=${statusKey.toLowerCase()}`} key={statusKey} className="stat-card status-card-item">
                <div className="stat-card-icon" style={{ backgroundColor: detail.color }}>{detail.icon}</div>
                <div className="stat-card-info">
                  <h2>{displayCount}</h2>
                  <p>{detail.name}</p>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <p className="no-data-message">Report status breakdown is not available.</p>
      )}
       <div className="quick-links-section">
          <h2 className="section-title">Quick Management Links</h2>
          <div className="quick-links-grid">
            <Link to="/admin/reports" className="quick-link-card">
                <FaListAlt className="quick-link-icon" />
                <span>View All Reports</span>
            </Link>
            <Link to="/admin/users-reports" className="quick-link-card">
                <FaUsersCog className="quick-link-icon" />
                <span>Manage Users</span>
            </Link>
          </div>
      </div>
    </div>
  );
};

export default AdminOverviewDashboard;