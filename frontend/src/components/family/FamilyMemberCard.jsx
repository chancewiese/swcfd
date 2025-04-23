// src/components/family/FamilyMemberCard.jsx
import { useState } from "react";

const FamilyMemberCard = ({
  member,
  isCurrentUser,
  isManager,
  onUpdate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: member.firstName || "",
    lastName: member.lastName || "",
    dateOfBirth: member.dateOfBirth
      ? new Date(member.dateOfBirth).toISOString().split("T")[0]
      : "",
    gender: member.gender || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate age if date of birth is available
  const calculateAge = (dob) => {
    if (!dob) return null;

    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  const age = calculateAge(member.dateOfBirth);
  const hasUserAccount = !!member.user;

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const success = await onUpdate(member._id, formData);
      if (success) {
        setIsEditing(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        `Are you sure you want to remove ${member.firstName} ${member.lastName} from your family? This action cannot be undone.`
      )
    ) {
      return;
    }

    await onDelete(member._id);
  };

  return (
    <div
      className={`family-member-card ${isCurrentUser ? "current-user" : ""}`}
    >
      {isEditing ? (
        <form onSubmit={handleSubmit} className="member-edit-form">
          <h3>Edit Family Member</h3>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor={`firstName-${member._id}`}>First Name</label>
              <input
                type="text"
                id={`firstName-${member._id}`}
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor={`lastName-${member._id}`}>Last Name</label>
              <input
                type="text"
                id={`lastName-${member._id}`}
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor={`dateOfBirth-${member._id}`}>Date of Birth</label>
              <input
                type="date"
                id={`dateOfBirth-${member._id}`}
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor={`gender-${member._id}`}>Gender</label>
              <select
                id={`gender-${member._id}`}
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
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setFormData({
                  firstName: member.firstName || "",
                  lastName: member.lastName || "",
                  dateOfBirth: member.dateOfBirth
                    ? new Date(member.dateOfBirth).toISOString().split("T")[0]
                    : "",
                  gender: member.gender || "",
                });
                setIsEditing(false);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="member-header">
            <h3>
              {member.firstName} {member.lastName}
            </h3>

            <div className="member-badges">
              {isCurrentUser && <span className="badge badge-you">You</span>}

              {hasUserAccount && !isCurrentUser && (
                <span className="badge badge-account">Has Account</span>
              )}
            </div>
          </div>

          <div className="member-details">
            {age !== null && (
              <div className="member-detail">
                <span className="detail-label">Age:</span> {age}
              </div>
            )}

            {member.gender && (
              <div className="member-detail">
                <span className="detail-label">Gender:</span> {member.gender}
              </div>
            )}

            {member.dateOfBirth && (
              <div className="member-detail">
                <span className="detail-label">Birth Date:</span>{" "}
                {new Date(member.dateOfBirth).toLocaleDateString()}
              </div>
            )}
          </div>

          <div className="member-actions">
            {/* Current user can edit themselves, and family manager can edit anyone */}
            {(isCurrentUser || isManager) && (
              <button
                className="btn btn-sm btn-primary"
                onClick={() => setIsEditing(true)}
              >
                Edit
              </button>
            )}

            {/* Only family manager can delete, and cannot delete themselves */}
            {isManager && !isCurrentUser && (
              <button className="btn btn-sm btn-danger" onClick={handleDelete}>
                Remove
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default FamilyMemberCard;
