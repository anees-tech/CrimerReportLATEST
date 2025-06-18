"use client"

import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import axios from "axios"
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch"
import "./ReportDetails.css"
import { FaEdit, FaTrash, FaDownload } from "react-icons/fa" // Added FaDownload import

const ReportDetails = ({ currentUser }) => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const fetchReportDetails = async () => {
      setLoading(true)
      setError("")
      try {
        if (!currentUser) {
          setError("You must be logged in to view report details.")
          setLoading(false)
          return
        }
        const response = await axios.get(`http://localhost:5000/api/reports/${id}?userId=${currentUser}`)
        setReport(response.data)
      } catch (err) {
        if (err.response) {
          setError(err.response.data?.message || "Failed to fetch report details. Please check permissions or report ID.")
        } else {
          setError("An unexpected error occurred while fetching report details.")
        }
        console.error("Fetch report details error:", err)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchReportDetails()
    } else {
      setError("Report ID is missing.")
      setLoading(false)
    }
  }, [id, currentUser])

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "badge-pending"
      case "investigating":
        return "badge-investigating"
      case "resolved":
        return "badge-resolved"
      case "closed":
        return "badge-closed"
      case "cancel":
        return "badge-cancelled"
      default:
        return "badge-default"
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const options = { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const openImageModal = () => {
    setIsImageModalOpen(true)
  }

  const closeImageModal = () => {
    setIsImageModalOpen(false)
  }

  const handleDeleteReport = async () => {
    const reportOwnerId = report?.user?._id || report?.user
    if (reportOwnerId !== currentUser) {
      alert("You are not authorized to delete this report.")
      return
    }

    if (window.confirm("Are you sure you want to delete this report? This action cannot be undone.")) {
      setIsDeleting(true)
      setError("")
      try {
        await axios.delete(`http://localhost:5000/api/reports/${id}`)
        alert("Report deleted successfully.")
        navigate("/dashboard")
      } catch (err) {
        setError(err.response?.data?.message || "Failed to delete report. Please try again.")
        console.error("Delete report error:", err)
        setIsDeleting(false)
      }
    }
  }

  const getFileIcon = (filename) => {
    if (!filename) return '📎';
    const extension = filename.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
      return '🖼️';
    } else if (['pdf'].includes(extension)) {
      return '📄';
    } else if (['doc', 'docx'].includes(extension)) {
      return '📝';
    } else if (['zip', 'rar'].includes(extension)) {
      return '📦';
    }
    return '📎';
  }

  const downloadAttachment = (attachmentPath, originalFileName) => {
    const downloadUrl = `http://localhost:5000/${attachmentPath}`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = originalFileName || 'attachment';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  if (loading) {
    return <div className="report-details-loading">Loading report details...</div>
  }

  if (error && !report) {
    return <div className="report-details-error">{error}</div>
  }

  if (!report) {
    return <div className="report-details-error">Report not found or data is unavailable.</div>
  }

  const reportOwnerId = report.user?._id || report.user
  const isOwner = reportOwnerId === currentUser
  const canModify = isOwner

  const imageUrl = report.image ? `http://localhost:5000/${report.image}` : ""

  return (
    <div className="report-details-container">
      {error && <div className="report-details-error-banner">{error}</div>}
      <div className="report-details-header">
        <Link to="/dashboard" className="back-link">
          ← Back to My Reports
        </Link>
        <div className="report-header-actions">
          {canModify && (
            <Link to={`/report/edit/${report._id}`} className="btn btn-secondary edit-report-button">
              <FaEdit /> Edit Report
            </Link>
          )}
          {canModify && (
            <button
              onClick={handleDeleteReport}
              className="btn btn-danger delete-report-button"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : <><FaTrash /> Delete Report</>}
            </button>
          )}
        </div>
      </div>
      <div className="report-details-title-container">
        <h2 className="report-details-title">{report.title}</h2>
        <span className={`badge ${getStatusBadgeClass(report.status)}`}>{report.status || "N/A"}</span>
      </div>

      <div className="report-details-card">
        <div className="report-details-section">
          <h3 className="section-title">Report Information</h3>
          <div className="report-info-grid">
            <div className="report-info-item">
              <span className="info-label">Report ID:</span>
              <span className="info-value">{report._id}</span>
            </div>
            <div className="report-info-item">
              <span className="info-label">Submitted On:</span>
              <span className="info-value">{formatDate(report.createdAt)}</span>
            </div>
            <div className="report-info-item">
              <span className="info-label">Last Updated:</span>
              <span className="info-value">{formatDate(report.updatedAt)}</span>
            </div>
            <div className="report-info-item">
              <span className="info-label">Location:</span>
              <span className="info-value">{report.location}</span>
            </div>
            {report.phone && (
              <div className="report-info-item">
                <span className="info-label">Contact Phone:</span>
                <span className="info-value">{report.phone}</span>
              </div>
            )}
            <div className="report-info-item">
              <span className="info-label">Reported Anonymously:</span>
              <span className="info-value">{report.isAnonymous ? "Yes" : "No"}</span>
            </div>
          </div>
        </div>

        <div className="report-details-section">
          <h3 className="section-title">Description</h3>
          <p className="report-description">{report.description}</p>
        </div>

        {report.image && (
          <div className="report-details-section">
            <h3 className="section-title">Evidence Image</h3>
            <div className="report-image-preview-container" onClick={openImageModal} style={{ cursor: "pointer" }}>
              <img src={imageUrl} alt="Evidence Preview" className="report-image-preview" />
            </div>
          </div>
        )}

        {report.adminNotes && report.adminNotes.length > 0 && (
          <div className="report-details-section">
            <h3 className="section-title">Updates from Authorities</h3>
            <div className="admin-notes-container">
              {report.adminNotes.map((note, index) => (
                <div className="admin-note" key={index}>
                  <div className="admin-note-header">
                    <span className="admin-note-date">{formatDate(note.date)}</span>
                  </div>
                  <p className="admin-note-content">{note.content}</p>
                  
                  {/* Add file attachment display */}
                  {note.attachment && (
                    <div className="admin-note-attachment">
                      <div className="attachment-info">
                        <span className="attachment-icon">{getFileIcon(note.originalFileName || note.attachment)}</span>
                        <span className="attachment-name">{note.originalFileName || 'Attachment'}</span>
                        <button
                          className="download-btn"
                          onClick={() => downloadAttachment(note.attachment, note.originalFileName)}
                          title="Download attachment"
                        >
                          <FaDownload />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {isImageModalOpen && report.image && (
        <div className="image-zoom-modal-overlay" onClick={closeImageModal}>
          <div className="image-zoom-modal-content" onClick={(e) => e.stopPropagation()}>
            <TransformWrapper initialScale={1} initialPositionX={0} initialPositionY={0}>
              {({ zoomIn, zoomOut, resetTransform }) => (
                <>
                  <div className="zoom-controls">
                    <button onClick={() => zoomIn()} className="zoom-button">+</button>
                    <button onClick={() => zoomOut()} className="zoom-button">-</button>
                    <button onClick={() => resetTransform()} className="zoom-button">Reset</button>
                  </div>
                  <TransformComponent
                    wrapperStyle={{ width: "100%", height: "calc(100% - 40px)" }}
                    contentStyle={{ width: "100%", height: "100%" }}
                  >
                    <img
                      src={imageUrl}
                      alt="Evidence"
                      style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    />
                  </TransformComponent>
                </>
              )}
            </TransformWrapper>
            <button onClick={closeImageModal} className="close-zoom-modal-button">&times;</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReportDetails

