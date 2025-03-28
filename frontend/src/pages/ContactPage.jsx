// src/pages/ContactPage.jsx
import { useState } from "react";
import "./ContactPage.css";

function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [submitStatus, setSubmitStatus] = useState({
    submitted: false,
    success: false,
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
      setSubmitStatus({
        submitted: true,
        success: true,
        message: "Thank you for your message! We will get back to you soon.",
      });
      setFormData({ name: "", email: "", message: "" });
    }, 500);
  };

  return (
    <div className="contact-container">
      <h1>Contact Us</h1>

      {submitStatus.submitted && (
        <div
          className={`status-message ${
            submitStatus.success ? "success" : "error"
          }`}
        >
          {submitStatus.message}
        </div>
      )}

      <div className="contact-content">
        <div className="contact-info">
          <h2>Get In Touch</h2>
          <p>
            We'd love to hear from you! Please feel free to reach out with any
            questions.
          </p>

          <div className="contact-details">
            <div className="contact-item">
              <strong>Email:</strong> info@countryfairdays.com
            </div>
            <div className="contact-item">
              <strong>Phone:</strong> (123) 456-7890
            </div>
            <div className="contact-item">
              <strong>Address:</strong> 123 Main Street, South Weber, UT 84405
            </div>
          </div>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              rows="5"
              value={formData.message}
              onChange={handleChange}
              required
            ></textarea>
          </div>

          <button type="submit" className="submit-button">
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}

export default ContactPage;
