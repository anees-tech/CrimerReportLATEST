"use client";

import { useState, useEffect, useMemo } from 'react'; // Added useMemo
import axios from 'axios';
import { Link } from 'react-router-dom';
import './UserDashboard.css';
import { FaPlusCircle, FaListAlt, FaEye, FaEdit, FaHourglassHalf, FaTasks, FaCheckCircle, FaTimesCircle, FaBan, FaFileMedicalAlt, FaSpinner } from 'react-icons/fa'; // Added more icons

const UserDashboard = ({ currentUser }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const fetchUserDataAndReports = async () => {
      if (!currentUser) {
        setError("User not identified. Please log in.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const storedUserName = sessionStorage.getItem("userName");
        if (storedUserName) {
            setUserName(storedUserName);
        }
        // Fetch reports for the current user
        const response = await axios.get(`http://localhost:5000/api/reports/user/${currentUser}`);
        setReports(response.data);
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch your reports.');
        console.error("Failed to fetch user reports:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDataAndReports();
  }, [currentUser]);

  // Calculate statistics using useMemo to avoid recalculation on every render
  const reportStats = useMemo(() => {
    if (!reports || reports.length === 0) {
      return {
        total: 0,
        pending: 0,
        investigating: 0,
        resolved: 0,
        closed: 0,
        cancelled: 0,
      };
    }
    return reports.reduce(
      (acc, report) => {
        acc.total += 1;
        const status = report.status?.toLowerCase();
        if (status === 'pending') acc.pending += 1;
        else if (status === 'investigating') acc.investigating += 1;
        else if (status === 'resolved') acc.resolved += 1;
        else if (status === 'closed') acc.closed += 1;
        else if (status === 'cancel') acc.cancelled += 1;
        return acc;
      },
      { total: 0, pending: 0, investigating: 0, resolved: 0, closed: 0, cancelled: 0 }
    );
  }, [reports]);

  const getStatusBadgeDetails = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return { class: 'badge-pending', icon: <FaHourglassHalf />, text: 'Pending' };
      case 'investigating':
        return { class: 'badge-investigating', icon: <FaTasks />, text: 'Investigating' };
      case 'resolved':
        return { class: 'badge-resolved', icon: <FaCheckCircle />, text: 'Resolved' };
      case 'closed':
        return { class: 'badge-closed', icon: <FaTimesCircle />, text: 'Closed' };
      case 'cancel':
        return { class: 'badge-cancelled', icon: <FaBan />, text: 'Cancelled' };
      default:
        return { class: 'badge-default', icon: <FaListAlt />, text: status || 'Unknown' };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const statCardsData = [
    { title: "Total Reports", count: reportStats.total, icon: <FaFileMedicalAlt />, color: "#007bff" },
    { title: "Pending", count: reportStats.pending, icon: <FaHourglassHalf />, color: "#ffc107" },
    { title: "Investigating", count: reportStats.investigating, icon: <FaTasks />, color: "#17a2b8" },
    { title: "Resolved", count: reportStats.resolved, icon: <FaCheckCircle />, color: "#28a745" },
    { title: "Closed", count: reportStats.closed, icon: <FaTimesCircle />, color: "#6c757d" },
    { title: "Cancelled", count: reportStats.cancelled, icon: <FaBan />, color: "#dc3545" },
  ];


  if (loading) {
    return <div className="user-dashboard-loading"><FaSpinner className="spinner-icon" /> Loading your dashboard...</div>;
  }

  return (
    <div className="user-dashboard-container">
      <div className="user-dashboard-header">
        <h1 className="user-dashboard-title">
          {userName ? `${userName}'s Dashboard` : "My Dashboard"}
        </h1>
        <Link to="/report-crime" className="btn btn-primary report-new-crime-btn">
          <FaPlusCircle /> Report New Crime
        </Link>
      </div>

      {error && <div className="user-dashboard-error">{error}</div>}

      {/* Statistics Section */}
      <h2 className="section-title-ud stats-title-ud">Your Report Summary</h2>
      <div className="user-stats-grid-ud">
        {statCardsData.map(stat => (
          // Render only if count is > 0 for status cards, or always for total
          (stat.title === "Total Reports" || stat.count > 0) && (
            <div key={stat.title} className="user-stat-card-ud" style={{borderColor: stat.color}}>
              <div className="user-stat-card-icon-ud" style={{ backgroundColor: stat.color }}>
                {stat.icon}
              </div>
              <div className="user-stat-card-info-ud">
                <h2>{stat.count}</h2>
                <p>{stat.title}</p>
              </div>
            </div>
          )
        ))}
      </div>
      {reportStats.total === 0 && !loading && !error && (
         <div className="no-reports-message-ud summary-no-reports">
            <p>You haven't submitted any reports yet to show a summary.</p>
        </div>
      )}


      <h2 className="section-title-ud list-title-ud">Your Reported Incidents</h2>
      {reports.length === 0 && !loading && !error ? (
        <div className="no-reports-message-ud">
          <p>You haven't reported any incidents yet.</p>
          <Link to="/report-crime" className="btn btn-secondary">Report Your First Incident</Link>
        </div>
      ) : (
        <div className="reports-grid-ud">
          {reports.map((report) => {
            const statusDetails = getStatusBadgeDetails(report.status);
            return (
              <div key={report._id} className="report-card-ud">
                <div className="report-card-header-ud">
                  <h3 className="report-title-ud">{report.title}</h3>
                  <span className={`badge-ud ${statusDetails.class}`}>
                    {statusDetails.icon} {statusDetails.text}
                  </span>
                </div>
                <p className="report-detail-ud"><strong>Location:</strong> {report.location}</p>
                <p className="report-detail-ud"><strong>Reported On:</strong> {formatDate(report.createdAt)}</p>
                <p className="report-description-ud">
                  {report.description.substring(0, 100)}{report.description.length > 100 ? '...' : ''}
                </p>
                <div className="report-actions-ud">
                  <Link to={`/report/${report._id}`} className="btn btn-sm btn-outline-info action-btn-ud">
                    <FaEye /> View Details
                  </Link>
                  {(report.status?.toLowerCase() === 'pending' || report.status?.toLowerCase() === 'investigating') && (
                     <Link to={`/report/edit/${report._id}`} className="btn btn-sm btn-outline-secondary action-btn-ud">
                        <FaEdit /> Edit Report
                     </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;