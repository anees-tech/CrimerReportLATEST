"use client"

import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import axios from "axios"
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch"
import { FaDownload, FaFileAlt, FaPaperclip } from "react-icons/fa"
import "./AdminReportDetails.css"

const AdminReportDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [noteContent, setNoteContent] = useState("")
  const [noteFile, setNoteFile] = useState(null)
  const [statusUpdate, setStatusUpdate] = useState("")
  const [updateLoading, setUpdateLoading] = useState(false)
  const [updateSuccess, setUpdateSuccess] = useState("")
  const [actionError, setActionError] = useState("")
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)

  useEffect(() => {
    const fetchReportDetails = async () => {
      setLoading(true)
      setError("")
      setActionError("")
      setUpdateSuccess("")
      try {
        const response = await axios.get(`http://localhost:5000/api/admin/reports/${id}`)
        setReport(response.data)
        setStatusUpdate(response.data.status || "")
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch report details")
      } finally {
        setLoading(false)
      }
    }

    fetchReportDetails()
  }, [id])

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Pending":
        return "badge-pending"
      case "Investigating":
        return "badge-investigating"
      case "Resolved":
        return "badge-resolved"
      case "Closed":
        return "badge-closed"
      default:
        return "badge-pending"
    }
  }

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const getFileIcon = (filename) => {
    const extension = filename.split('.').pop().toLowerCase()
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
      return '🖼️'
    } else if (['pdf'].includes(extension)) {
      return '📄'
    } else if (['doc', 'docx'].includes(extension)) {
      return '📝'
    } else if (['zip', 'rar'].includes(extension)) {
      return '📦'
    }
    return '📎'
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setActionError("File size must be less than 10MB")
        return
      }
      setNoteFile(file)
      setActionError("")
    }
  }

  const handleAddNote = async (e) => {
    e.preventDefault()
    
    // Clear any previous errors
    setActionError("")
    
    // Validate note content
    const trimmedContent = noteContent.trim()
    if (!trimmedContent) {
      setActionError("Note content is required")
      return
    }

    setUpdateLoading(true)
    setUpdateSuccess("")

    try {
      // Create a fresh FormData object
      const formData = new FormData()
      
      // Append the content as a plain string
      formData.append('content', trimmedContent)
      
      // Only append file if present
      if (noteFile) {
        formData.append('attachment', noteFile)
      }
      
      const response = await axios.post(
        `http://localhost:5000/api/admin/reports/${id}/notes`,
        formData,
        {
          headers: {
            // Let axios set the correct content type with boundary for multipart/form-data
            'Content-Type': 'multipart/form-data',
          }
        }
      )
      
      // Update the report with the new data
      setReport(response.data)
      
      // Clear the form
      setNoteContent("")
      setNoteFile(null)
      
      // Reset file input
      const fileInput = document.getElementById('noteAttachment')
      if (fileInput) fileInput.value = ''
      
      setUpdateSuccess("Note added successfully")
      
      // Clear success message after 3 seconds
      setTimeout(() => setUpdateSuccess(""), 3000)
      
    } catch (err) {
      console.error("Error adding note:", err)
      setActionError(err.response?.data?.message || "Failed to add note")
    } finally {
      setUpdateLoading(false)
    }
  }

  const handleUpdateStatus = async (e) => {
    e.preventDefault()
    if (statusUpdate === report?.status) return

    setUpdateLoading(true)
    setUpdateSuccess("")
    setActionError("")
    try {
      const response = await axios.put(`http://localhost:5000/api/admin/reports/${id}/status`, {
        status: statusUpdate,
      })

      setReport(response.data)
      setUpdateSuccess("Status updated successfully")
      
      // Clear success message after 3 seconds
      setTimeout(() => setUpdateSuccess(""), 3000)
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to update status")
    } finally {
      setUpdateLoading(false)
    }
  }

  const handleDeleteReport = async () => {
    if (!window.confirm("Are you sure you want to delete this report? This action cannot be undone.")) {
      return
    }

    setUpdateLoading(true)
    setUpdateSuccess("")
    setActionError("")

    try {
      await axios.delete(`http://localhost:5000/api/admin/reports/${id}`)
      alert("Report deleted successfully.")
      navigate("/admin/dashboard")
    } catch (err) {
      const errMsg = err.response?.data?.message || "Failed to delete report. Please try again."
      setActionError(errMsg)
      console.error("Failed to delete the report:", err)
    } finally {
      setUpdateLoading(false)
    }
  }

  const openImageModal = () => {
    setIsImageModalOpen(true)
  }

  const closeImageModal = () => {
    setIsImageModalOpen(false)
  }

  const downloadAttachment = (attachmentPath, originalFileName) => {
    const downloadUrl = `http://localhost:5000/${attachmentPath}`
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = originalFileName || 'attachment'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return <div className="admin-report-details-loading">Loading report details...</div>
  }

  if (error) {
    return <div className="admin-report-details-error">{error}</div>
  }

  if (!report) {
    return <div className="admin-report-details-error">Report not found</div>
  }

  const imageUrl = report && report.image ? `http://localhost:5000/${report.image}` : ''

  return (
    <div className="admin-report-details-container">
      <div className="admin-report-details-header">
        <Link to="/admin/dashboard" className="back-link">
          ← Back to Dashboard
        </Link>
        <div className="admin-report-details-title-container">
          <h2 className="admin-report-details-title">{report.title}</h2>
          <span className={`badge ${getStatusBadgeClass(report.status)}`}>{report.status}</span>
        </div>
        <button
          onClick={handleDeleteReport}
          className="btn btn-danger"
          disabled={updateLoading || loading}
        >
          {updateLoading ? "Processing..." : "Delete Report"}
        </button>
      </div>

      {updateSuccess && <div className="admin-update-success">{updateSuccess}</div>}
      {actionError && <div className="admin-report-details-error">{actionError}</div>}

      <div className="admin-report-details-grid">
        <div className="admin-report-details-main">
          <div className="admin-report-details-card">
            <div className="admin-report-details-section">
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
                <div className="report-info-item">
                  <span className="info-label">phone:</span>
                  <span className="info-value">{report.phone}</span>
                </div>

                <div className="report-info-item">
                  <span className="info-label">Reported By:</span>
                  <span className="info-value">
                    {report.isAnonymous ? "Anonymous" : report.user ? report.user.name : "Unknown"}
                  </span>
                </div>
                {!report.isAnonymous && report.user && (
                  <div className="report-info-item">
                    <span className="info-label">Contact Email:</span>
                    <span className="info-value">{report.user.email}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="admin-report-details-section">
              <h3 className="section-title">Description</h3>
              <p className="report-description">{report.description}</p>
            </div>

            {report.image && (
              <div className="admin-report-details-section">
                <h3 className="section-title">Evidence Image</h3>
                <div className="report-image-preview-container" onClick={openImageModal} style={{ cursor: 'pointer' }}>
                  <img src={imageUrl} alt="Evidence Preview" className="report-image-preview" />
                </div>
              </div>
            )}

            {report.adminNotes && report.adminNotes.length > 0 && (
              <div className="admin-report-details-section">
                <h3 className="section-title">Admin Notes</h3>
                <div className="admin-notes-container">
                  {report.adminNotes.map((note, index) => (
                    <div className="admin-note" key={index}>
                      <div className="admin-note-header">
                        <span className="admin-note-date">{formatDate(note.date)}</span>
                      </div>
                      <p className="admin-note-content">{note.content}</p>
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
        </div>

        <div className="admin-report-details-sidebar">
          <div className="admin-actions-card">
            <h3 className="admin-actions-title">Update Status</h3>
            <form onSubmit={handleUpdateStatus} className="admin-status-form">
              <div className="form-group">
                <label htmlFor="status" className="form-label">
                  Current Status: {report.status}
                </label>
                <select
                  id="status"
                  className="form-select"
                  value={statusUpdate}
                  onChange={(e) => setStatusUpdate(e.target.value)}
                >
                  <option value="Pending">Pending</option>
                  <option value="Investigating">Investigating</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
              <button
                type="submit"
                className="admin-action-button"
                disabled={updateLoading || statusUpdate === report.status}
              >
                {updateLoading ? "Processing..." : "Update Status"}
              </button>
            </form>
          </div>

          <div className="admin-actions-card">
            <h3 className="admin-actions-title">Add Response Note</h3>
            <form onSubmit={handleAddNote} className="admin-note-form">
              <div className="form-group">
                <label htmlFor="noteContent" className="form-label">
                  Note Content *
                </label>
                <textarea
                  id="noteContent"
                  className="form-textarea"
                  value={noteContent}
                  onChange={(e) => {
                    setNoteContent(e.target.value)
                    // Clear error when user starts typing
                    if (actionError === "Note content is required") {
                      setActionError("")
                    }
                  }}
                  placeholder="Add a note or response to this report..."
                  rows="5"
                  disabled={updateLoading}
                ></textarea>
              </div>
              
              <div className="form-group">
                <label htmlFor="noteAttachment" className="form-label">
                  <FaPaperclip /> Attach File (Optional)
                </label>
                <input
                  type="file"
                  id="noteAttachment"
                  className="form-file-input"
                  onChange={handleFileChange}
                  accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt,.zip,.rar"
                  disabled={updateLoading}
                />
                {noteFile && (
                  <div className="selected-file-info">
                    <span className="file-icon">{getFileIcon(noteFile.name)}</span>
                    <span className="file-name">{noteFile.name}</span>
                    <button 
                      type="button" 
                      className="remove-file-btn"
                      onClick={() => {
                        setNoteFile(null)
                        document.getElementById('noteAttachment').value = ''
                      }}
                      disabled={updateLoading}
                    >
                      ×
                    </button>
                  </div>
                )}
                <small className="file-help-text">
                  Supported formats: Images, PDF, Documents, Archives (Max: 10MB)
                </small>
              </div>
              
              <button 
                type="submit" 
                className="admin-action-button" 
                disabled={updateLoading || !noteContent.trim()}
              >
                {updateLoading ? "Adding Note..." : "Add Note"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {isImageModalOpen && report && report.image && (
        <div className="image-zoom-modal-overlay" onClick={closeImageModal}>
          <div className="image-zoom-modal-content" onClick={(e) => e.stopPropagation()}>
            <TransformWrapper
              initialScale={1}
              initialPositionX={0}
              initialPositionY={0}
            >
              {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
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
                    <img src={imageUrl} alt="Evidence" style={{ width: "100%", height: "100%", objectFit: "contain" }}/>
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

export default AdminReportDetails

