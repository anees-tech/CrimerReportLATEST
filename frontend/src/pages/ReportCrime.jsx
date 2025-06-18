"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import "./ReportCrime.css"

const ReportCrime = ({ currentUser }) => {
  const [formData, setFormData] = useState({
    title: "",
    cnic:"",
    description: "",
    phone:"",
    location: "",
    isAnonymous: !currentUser,
    image: null,
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)

  const navigate = useNavigate()
  const isLoggedIn = !!currentUser

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target

    if (type === "file") {
      if (files[0]) {
        setFormData((prevState) => ({
          ...prevState,
          [name]: files[0],
        }))

        // Create image preview
        const reader = new FileReader()
        reader.onloadend = () => {
          setImagePreview(reader.result)
        }
        reader.readAsDataURL(files[0])
      }
    } else if (type === "checkbox") {
      setFormData((prevState) => ({
        ...prevState,
        [name]: checked,
      }))
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append("title", formData.title)
      formDataToSend.append("cnic", formData.cnic)
      formDataToSend.append("description", formData.description)
      formDataToSend.append("phone", formData.phone)
      formDataToSend.append("location", formData.location)
      formDataToSend.append("isAnonymous", formData.isAnonymous)

      if (!formData.isAnonymous && currentUser) {
        formDataToSend.append("userId", currentUser)
      }

      if (formData.image) {
        formDataToSend.append("image", formData.image)
      }

      await axios.post("http://localhost:5000/api/reports", formDataToSend)

      setSuccess("Report submitted successfully!")

      // Reset form
      setFormData({
        title: "",
        description: "",
        phone:"",
        location: "",
        isAnonymous: !currentUser,
        image: null,
      })
      setImagePreview(null)

      // Redirect after a delay if logged in
      if (isLoggedIn) {
        setTimeout(() => {
          navigate("/dashboard")
        }, 2000)
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit report. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="report-crime-container">
      <div className="report-form-container">
        <h2 className="report-title">Report a Crime</h2>

        {error && <div className="report-error">{error}</div>}
        {success && <div className="report-success">{success}</div>}

        <form className="report-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title" className="form-label">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              className="form-input"
              placeholder="Brief title of the incident"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          {/* cnic */}

          <div className="form-group">
            <label htmlFor="cnic" className="form-label">
              cnic
            </label>
            <input
              type="text"
              id="cnic" // Changed from "text"
              name="cnic"
              className="form-input"
              placeholder="Enter you cnic with Dashes"
              value={formData.cnic}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              className="form-textarea"
              placeholder="Provide detailed information about what happened"
              value={formData.description}
              onChange={handleChange}
              required
              rows="6"
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="phone" className="form-label">
             phone
            </label>
            <input
              type="text"
              id="phone" // Changed from "text"
              name="phone"
              className="form-input"
              
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="location" className="form-label">
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              className="form-input"
              placeholder="Address or description of where the incident occurred"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="image" className="form-label">
              Evidence Image (Optional)
            </label>
            <input
              type="file"
              id="image"
              name="image"
              className="form-input file-input"
              accept="image/*"
              onChange={handleChange}
            />
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview || "/placeholder.svg"} alt="Preview" />
              </div>
            )}
          </div>

          <div className="form-checkbox-group">
            <input
              type="checkbox"
              id="isAnonymous"
              name="isAnonymous"
              className="form-checkbox"
              checked={formData.isAnonymous}
              onChange={handleChange}
            />
            <label htmlFor="isAnonymous" className="checkbox-label">
              Submit this report anonymously
            </label>
          </div>

          {!isLoggedIn && !formData.isAnonymous && (
            <div className="report-warning">
              <p>You are not logged in. To track your report, please either:</p>
              <ul>
                <li>Check the anonymous option above, or</li>
                <li>
                  <a href="/login">Login</a> to your account first
                </li>
              </ul>
            </div>
          )}

          <button type="submit" className="report-button" disabled={loading || (!isLoggedIn && !formData.isAnonymous)}>
            {loading ? "Submitting..." : "Submit Report"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ReportCrime

