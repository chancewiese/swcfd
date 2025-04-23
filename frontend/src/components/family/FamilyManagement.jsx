// frontend/src/components/family/FamilyManagement.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import FamilyMemberCard from "./FamilyMemberCard";
import AddFamilyMemberForm from "./AddFamilyMemberForm";

const FamilyManagement = ({ auth }) => {
  const [familyData, setFamilyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);

  // Load family data on component mount
  useEffect(() => {
    const fetchFamilyData = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get("/api/families/my-family", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setFamilyData(res.data.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load family data. Please try again.");
        setLoading(false);
        console.error(err);
      }
    };

    fetchFamilyData();
  }, []);

  const updateFamily = async (formData) => {
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");

      const res = await axios.put("/api/families/my-family", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setFamilyData(res.data.data);
      setSuccess("Family information updated successfully!");
      return true;
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to update family information. Please try again."
      );
      return false;
    }
  };

  const addFamilyMember = async (memberData) => {
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "/api/families/my-family/members",
        memberData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update the family data with the new member
      setFamilyData((prevData) => ({
        ...prevData,
        members: [...prevData.members, res.data.data],
      }));

      setSuccess("Family member added successfully!");
      setShowAddMemberForm(false);
      return true;
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to add family member. Please try again."
      );
      return false;
    }
  };

  const updateFamilyMember = async (memberId, memberData) => {
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");

      const res = await axios.put(
        `/api/families/my-family/members/${memberId}`,
        memberData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update the member in the family data
      setFamilyData((prevData) => ({
        ...prevData,
        members: prevData.members.map((member) =>
          member._id === memberId ? res.data.data : member
        ),
      }));

      setSuccess("Family member updated successfully!");
      return true;
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to update family member. Please try again."
      );
      return false;
    }
  };

  const deleteFamilyMember = async (memberId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this family member? This action cannot be undone."
      )
    ) {
      return false;
    }

    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");

      await axios.delete(`/api/families/my-family/members/${memberId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Remove the member from the family data
      setFamilyData((prevData) => ({
        ...prevData,
        members: prevData.members.filter((member) => member._id !== memberId),
      }));

      setSuccess("Family member deleted successfully!");
      return true;
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to delete family member. Please try again."
      );
      return false;
    }
  };

  const inviteUserToFamily = async (email) => {
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "/api/families/invite",
        { email },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess(`Invitation sent to ${email}!`);

      // If in development mode, show the invitation URL
      if (res.data.inviteUrl) {
        console.log("Invitation URL:", res.data.inviteUrl);
      }

      return true;
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to send invitation. Please try again."
      );
      return false;
    }
  };

  const transferOwnership = async (userId) => {
    if (
      !window.confirm(
        "Are you sure you want to transfer family ownership? You will no longer be the family manager."
      )
    ) {
      return false;
    }

    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `/api/families/transfer-ownership/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Refresh family data
      const res = await axios.get("/api/families/my-family", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setFamilyData(res.data.data);
      setSuccess("Family ownership transferred successfully!");
      return true;
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to transfer ownership. Please try again."
      );
      return false;
    }
  };

  if (loading) {
    return <div className="loading">Loading family data...</div>;
  }

  if (!familyData) {
    return (
      <div className="no-family">
        <h2>No Family Found</h2>
        <p>You are not currently associated with a family.</p>
      </div>
    );
  }

  const isManager =
    auth?.user?.id === familyData.manager?._id ||
    familyData.manager === auth?.user?.id ||
    auth?.user?.roles?.includes("admin");

  return (
    <div className="family-management-container">
      <h2>Family Management</h2>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="family-info">
        <h3>Family Information</h3>
        <div className="info-row">
          <strong>Family Name:</strong> {familyData.name}
        </div>
        <div className="info-row">
          <strong>Family Manager:</strong>{" "}
          {familyData.manager && typeof familyData.manager === "object"
            ? `${familyData.manager.firstName} ${familyData.manager.lastName}`
            : "Not Available"}
        </div>
        {isManager && (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => {
              const newName = prompt("Enter new family name:", familyData.name);
              if (newName && newName !== familyData.name) {
                updateFamily({ name: newName });
              }
            }}
          >
            Edit Family Info
          </button>
        )}
      </div>

      <div className="family-members">
        <div className="section-header">
          <h3>Family Members</h3>
          {isManager && (
            <button
              className="btn btn-primary"
              onClick={() => setShowAddMemberForm(!showAddMemberForm)}
            >
              {showAddMemberForm ? "Cancel" : "Add Family Member"}
            </button>
          )}
        </div>

        {showAddMemberForm && (
          <AddFamilyMemberForm
            onSubmit={addFamilyMember}
            onCancel={() => setShowAddMemberForm(false)}
          />
        )}

        {familyData.members && familyData.members.length > 0 ? (
          <div className="members-list">
            {familyData.members.map((member) => (
              <FamilyMemberCard
                key={member._id}
                member={member}
                isManager={isManager}
                isSelf={member.user === auth?.user?.id}
                onUpdate={updateFamilyMember}
                onDelete={deleteFamilyMember}
              />
            ))}
          </div>
        ) : (
          <div className="no-members">
            <p>No family members found.</p>
          </div>
        )}
      </div>

      {isManager && (
        <div className="family-actions">
          <h3>Family Management Actions</h3>

          <div className="action-card">
            <h4>Invite User to Family</h4>
            <p>Send an invitation to another user to join your family.</p>
            <button
              className="btn btn-primary"
              onClick={() => {
                const email = prompt(
                  "Enter the email address of the user you want to invite:"
                );
                if (email) {
                  inviteUserToFamily(email);
                }
              }}
            >
              Send Invitation
            </button>
          </div>

          <div className="action-card">
            <h4>Transfer Family Ownership</h4>
            <p>
              Transfer ownership of this family to another user in your family.
            </p>
            <select
              className="form-control"
              onChange={(e) => {
                if (e.target.value) {
                  transferOwnership(e.target.value);
                }
              }}
              defaultValue=""
            >
              <option value="" disabled>
                Select a user
              </option>
              {familyData.members
                .filter(
                  (member) => member.user && member.user !== auth?.user?.id
                )
                .map((member) => (
                  <option
                    key={member._id}
                    value={member.user._id || member.user}
                  >
                    {member.firstName} {member.lastName}
                  </option>
                ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default FamilyManagement;
