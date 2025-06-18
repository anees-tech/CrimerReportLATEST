"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import axios from "axios"
import "./ReportForm.css" // You can reuse ReportCrime.css or create a specific ReportForm.css

const EditReport = ({ currentUser }) => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    cnic: "",
    phone: "",
    isAnonymous: false,
  })
  const [currentImage, setCurrentImage] = useState(null)
  const [newImageFile, setNewImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [removeCurrentImage, setRemoveCurrentImage] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [submitError, setSubmitError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    const fetchReport = async () => {
      try {
        if (!currentUser) {
          setError("You must be logged in to edit reports.");
          setLoading(false);
          return;
        }
        const response = await axios.get(`http://localhost:5000/api/reports/${id}?userId=${currentUser}`)
        const reportData = response.data
        setFormData({
          title: reportData.title || "",
          description: reportData.description || "",
          location: reportData.location || "",
          cnic: reportData.cnic || "",
          phone: reportData.phone || "",
          isAnonymous: reportData.isAnonymous || false,
        })
        if (reportData.image) {
          setCurrentImage(`http://localhost:5000/${reportData.image}`)
          setImagePreview(`http://localhost:5000/${reportData.image}`)
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch report data.")
        console.error("Fetch report error:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchReport()
  }, [id, currentUser])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        setNewImageFile(file);
        setRemoveCurrentImage(false);
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
    } else {
        setNewImageFile(null);
        setImagePreview(currentImage || null);
    }
  }

  const handleRemoveImageToggle = () => {
    const newRemoveState = !removeCurrentImage;
    setRemoveCurrentImage(newRemoveState);
    if (newRemoveState) {
        setNewImageFile(null);
        setImagePreview(null);
    } else if (currentImage) {
        setImagePreview(currentImage);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError("")
    setSuccessMessage("")
    setLoading(true)

    const data = new FormData()
    data.append("title", formData.title)
    data.append("description", formData.description)
    data.append("location", formData.location)
    data.append("cnic", formData.cnic)
    data.append("phone", formData.phone)
    data.append("isAnonymous", formData.isAnonymous)
    
    if (newImageFile) {
      data.append("image", newImageFile)
    } else if (removeCurrentImage && currentImage) {
      data.append("removeCurrentImage", "true")
    }

    const userInfo = sessionStorage.getItem("userId") ? sessionStorage.getItem("userId") : null;

    if (!userInfo) {
        setSubmitError("User not authenticated. Please log in.");
        setLoading(false);
        return;
    }
    
    // Add userId to the form data
    data.append("userId", userInfo)

    try {
      const config = {
        // No special headers needed
      };
      const response = await axios.put(`http://localhost:5000/api/reports/${id}`, data, config)
      setSuccessMessage("Report updated successfully!")
      
      if (response.data.image) {
        setCurrentImage(`http://localhost:5000/${response.data.image}`);
        setImagePreview(`http://localhost:5000/${response.data.image}`);
        setNewImageFile(null);
      } else if (removeCurrentImage) {
        setCurrentImage(null);
        setImagePreview(null);
      }
      setRemoveCurrentImage(false);

      setTimeout(() => navigate(`/report/${id}`), 2000)
    } catch (err) {
      setSubmitError(err.response?.data?.message || "Failed to update report.")
      console.error("Update report error:", err.response || err)
    } finally {
      setLoading(false)
    }
  }

  if (loading && !formData.title && !error) return <p className="form-loading">Loading report details...</p>
  if (error) return <p className="form-error">{error}</p>

  return (
    <div className="form-container report-form-container">
      <Link to={`/report/${id}`} className="back-link" style={{marginBottom: '20px', display: 'inline-block'}}>← Back to Report Details</Link>
      <h2>Edit Report</h2>
      {submitError && <p className="form-error">{submitError}</p>}
      {successMessage && <p className="form-success">{successMessage}</p>}
      <form onSubmit={handleSubmit} className="report-form">
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            className="form-input"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            className="form-textarea"
            value={formData.description}
            onChange={handleChange}
            rows="5"
            required
          ></textarea>
        </div>
        <div className="form-group">
          <label htmlFor="location">Location</label>
          <input
            type="text"
            id="location"
            name="location"
            className="form-input"
            value={formData.location}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="isAnonymous" className="form-checkbox-group">
            <input
              type="checkbox"
              id="isAnonymous"
              name="isAnonymous"
              className="form-checkbox"
              checked={formData.isAnonymous}
              onChange={handleChange}
            />
            Report Anonymously
          </label>
        </div>
        {!formData.isAnonymous && (
          <>
            <div className="form-group">
              <label htmlFor="cnic">CNIC</label>
              <input
                type="text"
                id="cnic"
                name="cnic"
                className="form-input"
                value={formData.cnic}
                onChange={handleChange}
                required={!formData.isAnonymous}
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className="form-input"
                value={formData.phone}
                onChange={handleChange}
                required={!formData.isAnonymous}
              />
            </div>
          </>
        )}
        <div className="form-group">
          <label htmlFor="image">Evidence Image</label>
          {(imagePreview || currentImage) && !removeCurrentImage && (
            <div className="current-image-preview" style={{marginTop: '10px'}}>
              <img src={imagePreview || currentImage} alt="Evidence preview" style={{ maxWidth: "200px", marginBottom: "10px" }} />
            </div>
          )}
          {currentImage && (
            <label className="form-checkbox-group" style={{fontSize: '0.9em', marginTop: '5px'}}>
                <input type="checkbox" checked={removeCurrentImage} onChange={handleRemoveImageToggle} />
                Remove current image
            </label>
          )}
          {!removeCurrentImage && (
            <input 
                type="file" 
                id="image" 
                name="image" 
                className="form-input file-input" 
                style={{marginTop: '5px'}}
                onChange={handleFileChange} 
                accept="image/*" 
            />
          )}
        </div>
        <button type="submit" className="form-button report-button" disabled={loading}>
          {loading ? "Updating..." : "Update Report"}
        </button>
      </form>
    </div>
  )
}

export default EditReport