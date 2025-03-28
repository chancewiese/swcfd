// src/pages/ProfilePage.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import "./ProfilePage.css";

const ProfilePage = () => {
  const { user, updateProfile, loading, error } = useAuth();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [editMode, setEditMode] = useState(false);

  // Initialize form data when user data is available
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSuccessMessage("");

    // Validate passwords if changing
    if (formData.newPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        setFormError("New passwords do not match");
        return;
      }

      if (formData.newPassword.length < 8) {
        setFormError("Password must be at least 8 characters long");
        return;
      }
    }

    // Prepare user data for update
    const userData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
    };

    // Add password fields if changing password
    if (formData.newPassword && formData.currentPassword) {
      userData.currentPassword = formData.currentPassword;
      userData.newPassword = formData.newPassword;
    }

    // Call update function from auth context
    const result = await updateProfile(userData);

    if (result && result.success) {
      setSuccessMessage("Profile updated successfully");
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
      setEditMode(false);
    } else if (result && result.error) {
      setFormError(result.error);
    }
  };

  return (
    <ProtectedRoute>
      <div className="profile-container">
        <h1>My Profile</h1>

        {(formError || error) && (
          <div className="alert alert-error">{formError || error}</div>
        )}

        {successMessage && (
          <div className="alert alert-success">{successMessage}</div>
        )}

        <div className="profile-content">
          <div className="profile-card">
            {!editMode ? (
              <div className="profile-view">
                <div className="profile-header">
                  <h2>Account Information</h2>
                  <button
                    className="edit-button"
                    onClick={() => setEditMode(true)}
                  >
                    Edit Profile
                  </button>
                </div>

                <div className="profile-info">
                  <div className="info-item">
                    <span className="info-label">First Name:</span>
                    <span className="info-value">{user?.firstName}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Last Name:</span>
                    <span className="info-value">{user?.lastName}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Email:</span>
                    <span className="info-value">{user?.email}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Phone:</span>
                    <span className="info-value">
                      {user?.phone || "Not provided"}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Member Since:</span>
                    <span className="info-value">
                      {user?.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="profile-form">
                <div className="profile-header">
                  <h2>Edit Profile</h2>
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={() => setEditMode(false)}
                  >
                    Cancel
                  </button>
                </div>

                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email (cannot be changed)</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="disabled-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className="password-section">
                  <h3>Change Password (Optional)</h3>

                  <div className="form-group">
                    <label htmlFor="currentPassword">Current Password</label>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="newPassword">New Password</label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      minLength="8"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="save-button"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default ProfilePage;
