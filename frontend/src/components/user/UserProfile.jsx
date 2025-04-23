// frontend/src/components/user/UserProfile.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const UserProfile = ({ auth, setAuth }) => {
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
    },
  });

  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editing, setEditing] = useState(false);

  const navigate = useNavigate();

  // Load user profile data on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const userData = res.data.data;

        setProfileData({
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          email: userData.email || "",
          phoneNumber: userData.phoneNumber || "",
          dateOfBirth: userData.dateOfBirth
            ? new Date(userData.dateOfBirth).toISOString().split("T")[0]
            : "",
          gender: userData.gender || "",
          address: {
            street: userData.address?.street || "",
            city: userData.address?.city || "",
            state: userData.address?.state || "",
            zipCode: userData.address?.zipCode || "",
          },
        });

        setFormData({
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          email: userData.email || "",
          phoneNumber: userData.phoneNumber || "",
          dateOfBirth: userData.dateOfBirth
            ? new Date(userData.dateOfBirth).toISOString().split("T")[0]
            : "",
          gender: userData.gender || "",
          address: {
            street: userData.address?.street || "",
            city: userData.address?.city || "",
            state: userData.address?.state || "",
            zipCode: userData.address?.zipCode || "",
          },
        });

        setLoading(false);
      } catch (err) {
        setError("Failed to load profile data. Please try again.");
        setLoading(false);
        console.error(err);
      }
    };

    fetchUserProfile();
  }, []);

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

  const startEditing = () => {
    setFormData({ ...profileData });
    setEditing(true);
    setError("");
    setSuccess("");
  };

  const cancelEditing = () => {
    setEditing(false);
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");

      const res = await axios.put("/api/users/profile", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProfileData(formData);
      setSuccess("Profile updated successfully!");
      setEditing(false);
      setSaving(false);

      // Update auth context if name changed
      if (
        auth?.user &&
        (auth.user.firstName !== formData.firstName ||
          auth.user.lastName !== formData.lastName)
      ) {
        setAuth({
          ...auth,
          user: {
            ...auth.user,
            firstName: formData.firstName,
            lastName: formData.lastName,
          },
        });
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to update profile. Please try again."
      );
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading profile data...</div>;
  }

  return (
    <div className="profile-container">
      <h2>My Profile</h2>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {editing ? (
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
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
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              disabled // Email is typically not editable
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number</label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="dateOfBirth">Date of Birth</label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="gender">Gender</label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer not to say">Prefer Not to Say</option>
            </select>
          </div>

          <h3>Address Information</h3>

          <div className="form-group">
            <label htmlFor="address.street">Street</label>
            <input
              type="text"
              id="address.street"
              name="address.street"
              value={formData.address.street}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="address.city">City</label>
              <input
                type="text"
                id="address.city"
                name="address.city"
                value={formData.address.city}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="address.state">State</label>
              <input
                type="text"
                id="address.state"
                name="address.state"
                value={formData.address.state}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="address.zipCode">Zip Code</label>
              <input
                type="text"
                id="address.zipCode"
                name="address.zipCode"
                value={formData.address.zipCode}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="button-group">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={cancelEditing}
              disabled={saving}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      ) : (
        <div className="profile-info">
          <div className="info-group">
            <h3>Personal Information</h3>
            <div className="info-row">
              <strong>Name:</strong> {profileData.firstName}{" "}
              {profileData.lastName}
            </div>
            <div className="info-row">
              <strong>Email:</strong> {profileData.email}
            </div>
            <div className="info-row">
              <strong>Phone:</strong>{" "}
              {profileData.phoneNumber || "Not provided"}
            </div>
            <div className="info-row">
              <strong>Date of Birth:</strong>{" "}
              {profileData.dateOfBirth
                ? new Date(profileData.dateOfBirth).toLocaleDateString()
                : "Not provided"}
            </div>
            <div className="info-row">
              <strong>Gender:</strong> {profileData.gender || "Not provided"}
            </div>
          </div>

          <div className="info-group">
            <h3>Address</h3>
            {profileData.address.street ? (
              <>
                <div className="info-row">{profileData.address.street}</div>
                <div className="info-row">
                  {profileData.address.city}, {profileData.address.state}{" "}
                  {profileData.address.zipCode}
                </div>
              </>
            ) : (
              <div className="info-row">No address provided</div>
            )}
          </div>

          <button className="btn btn-primary" onClick={startEditing}>
            Edit Profile
          </button>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
