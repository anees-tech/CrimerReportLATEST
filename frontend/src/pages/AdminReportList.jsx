"use client";

import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import "./AdminReportList.css";

const AdminReportList = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const location = useLocation();

  const getFilterFromUrl = () => {
    const queryParams = new URLSearchParams(location.search);
    return queryParams.get('status')?.toLowerCase() || "all";
  };

  const [filter, setFilter] = useState(getFilterFromUrl());

  useEffect(() => {
    const fetchAllReports = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5000/api/admin/reports");
        setReports(response.data);
        setError("");
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch reports");
      } finally {
        setLoading(false);
      }
    };
    fetchAllReports();
  }, []);

  useEffect(() => {
    setFilter(getFilterFromUrl());
  }, [location.search]);

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm("Are you sure you want to delete this report? This action cannot be undone.")) {
      return;
    }
    try {
      setLoading(true);
      await axios.delete(`http://localhost:5000/api/admin/reports/${reportId}`);
      setReports((prevReports) => prevReports.filter((report) => report._id !== reportId));
      alert("Report deleted successfully.");
      setError("");
    } catch (err) {
      console.error("Failed to delete the report:", err);
      const deleteError = err.response?.data?.message || "Failed to delete report. Please try again.";
      setError(deleteError);
      alert(deleteError);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    if (!status) return "badge-default";
    switch (status.toLowerCase()) {
      case "pending": return "badge-pending";
      case "investigating": return "badge-investigating";
      case "resolved": return "badge-resolved";
      case "closed": return "badge-closed";
      case "cancel": return "badge-cancelled";
      default: return "badge-default";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const filteredReports = reports.filter(report =>
    filter === "all" || (report.status && report.status.toLowerCase() === filter)
  );

  if (loading && reports.length === 0) {
    return <div className="admin-report-list-loading">Loading reports...</div>;
  }

  return (
    <div className="admin-report-list-container">
      <div className="admin-report-list-header">
        <h2 className="admin-report-list-title">All Crime Reports</h2>
        <Link to="/admin/dashboard" className="btn btn-outline-secondary back-to-overview-btn">
            ← Back to Overview
        </Link>
      </div>

      {error && <div className="admin-report-list-error">{error}</div>}

      <div className="admin-report-list-filters">
        <span className="filter-label">Filter by status:</span>
        <div className="filter-buttons">
          {["all", "Pending", "Investigating", "Resolved", "Closed", "cancel"].map(statusVal => (
            <button
              key={statusVal}
              className={`filter-button ${filter === statusVal.toLowerCase() ? "active" : ""}`}
              onClick={() => setFilter(statusVal.toLowerCase())}
            >
              {statusVal.charAt(0).toUpperCase() + statusVal.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filteredReports.length === 0 && !loading ? (
        <div className="no-reports-message">
          <p>No reports {filter === "all" ? "found" : `match the filter "${filter}"`}.</p>
        </div>
      ) : (
        <div className="admin-reports-table-container">
          <table className="admin-reports-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Location</th>
                <th>Phone</th>
                <th>Reported By</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report) => (
                <tr key={report._id}>
                  <td title={report._id}>{report._id.substring(0, 8)}...</td>
                  <td title={report.title}>{report.title}</td>
                  <td title={report.location}>{report.location}</td>
                  <td title={report.phone}>{report.phone || "N/A"}</td>
                  <td title={report.user?.name || (report.isAnonymous ? "Anonymous" : "N/A")}>
                    {report.isAnonymous ? "Anonymous" : report.user?.name || "User Deleted/Unknown"}
                  </td>
                  <td>{formatDate(report.createdAt)}</td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(report.status)}`}>
                      {report.status || "N/A"}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <Link
                      to={`/admin/report/${report._id}`}
                      className="btn btn-sm btn-action btn-view"
                    >
                      Details
                    </Link>
                    <button
                      className="btn btn-sm btn-action btn-delete"
                      onClick={() => handleDeleteReport(report._id)}
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminReportList;