// src/components/family/FamilyMemberDialog.jsx
import { useState, useEffect } from "react";
import "./Dialog.css";

const FamilyMemberDialog = ({
  isOpen,
  onClose,
  member,
  onSave,
  isLoading,
  isNewMember = false,
  defaultPhone = "",
  defaultAddress = {},
}) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    dateOfBirth: "",
    gender: "",
    phoneNumber: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
    },
  });
  const [error, setError] = useState("");

  // Initialize form data when member changes or for new member
  useEffect(() => {
    if (member) {
      // Edit existing member
      setFormData({
        firstName: member.firstName || "",
        lastName: member.lastName || "",
        email: member.email || "",
        dateOfBirth: member.dateOfBirth
          ? new Date(member.dateOfBirth).toISOString().split("T")[0]
          : "",
        gender: member.gender || "",
        phoneNumber: member.phoneNumber || "",
        address: {
          street: member.address?.street || "",
          city: member.address?.city || "",
          state: member.address?.state || "",
          zipCode: member.address?.zipCode || "",
        },
      });
    } else if (isNewMember) {
      // New member - use default values from family manager if available
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        dateOfBirth: "",
        gender: "",
        phoneNumber: defaultPhone || "",
        address: {
          street: defaultAddress?.street || "",
          city: defaultAddress?.city || "",
          state: defaultAddress?.state || "",
          zipCode: defaultAddress?.zipCode || "",
        },
      });
    }
  }, [member, isNewMember, defaultPhone, defaultAddress]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate form
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError("First name and last name are required");
      return;
    }

    try {
      if (isNewMember) {
        // Add new member
        await onSave(formData);
      } else {
        // Update existing member
        await onSave(member._id, formData);
      }
      onClose();
    } catch (err) {
      setError(
        err.message ||
          `Failed to ${isNewMember ? "add" : "update"} family member`
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
        <h2>{isNewMember ? "Add Family Member" : "Edit Family Member"}</h2>

        {error && <div className="dialog-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="dialog-form-section">
            <h3>User Information</h3>

            <div className="dialog-form-row">
              <div className="dialog-form-group">
                <label htmlFor="firstName">First Name*</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter first name"
                  disabled={isLoading}
                />
              </div>

              <div className="dialog-form-group">
                <label htmlFor="lastName">Last Name*</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter last name"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="dialog-form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email address"
                disabled={isLoading}
              />
              <small className="field-note">
                Adding an email allows this person to be invited as a user
              </small>
            </div>

            <div className="dialog-form-row">
              <div className="dialog-form-group">
                <label htmlFor="dateOfBirth">Date of Birth</label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>

              <div className="dialog-form-group">
                <label htmlFor="gender">Gender</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  disabled={isLoading}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer not to say">Prefer Not to Say</option>
                </select>
              </div>
            </div>
          </div>

          <div className="dialog-form-section">
            <h3>Contact Information</h3>

            <div className="dialog-form-group">
              <label htmlFor="phoneNumber">Phone Number</label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="Enter phone number"
                disabled={isLoading}
              />
            </div>

            <div className="dialog-form-group">
              <label htmlFor="address.street">Street Address</label>
              <input
                type="text"
                id="address.street"
                name="address.street"
                value={formData.address.street}
                onChange={handleInputChange}
                placeholder="Enter street address"
                disabled={isLoading}
              />
            </div>

            <div className="dialog-form-row">
              <div className="dialog-form-group">
                <label htmlFor="address.city">City</label>
                <input
                  type="text"
                  id="address.city"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleInputChange}
                  placeholder="Enter city"
                  disabled={isLoading}
                />
              </div>

              <div className="dialog-form-group">
                <label htmlFor="address.state">State</label>
                <input
                  type="text"
                  id="address.state"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleInputChange}
                  placeholder="Enter state"
                  disabled={isLoading}
                />
              </div>

              <div className="dialog-form-group">
                <label htmlFor="address.zipCode">Zip Code</label>
                <input
                  type="text"
                  id="address.zipCode"
                  name="address.zipCode"
                  value={formData.address.zipCode}
                  onChange={handleInputChange}
                  placeholder="Enter zip code"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          <div className="dialog-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading
                ? "Saving..."
                : isNewMember
                ? "Add Member"
                : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FamilyMemberDialog;
