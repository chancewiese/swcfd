// src/pages/FamilyPage.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import useFamily from "../hooks/useFamily";
import "./family/Family.css";

// Components
import FamilyMembersList from "../components/family/FamilyMembersList";
import AddFamilyMemberForm from "../components/family/AddFamilyMemberForm";
import FamilyActions from "../components/family/FamilyActions";

const FamilyPage = () => {
  const [familyData, setFamilyData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);

  const { user } = useAuth();
  const {
    getMyFamily,
    updateFamily,
    addFamilyMember,
    updateFamilyMember,
    deleteFamilyMember,
    loading: familyActionLoading,
  } = useFamily();

  // Check if the current user is the family manager
  const isManager =
    user?.id === familyData?.manager || user?.roles?.includes("admin");

  // Load family data on component mount
  useEffect(() => {
    const loadFamilyData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await getMyFamily();
        setFamilyData(data);
      } catch (err) {
        setError("Failed to load family data. " + (err.message || ""));
      } finally {
        setIsLoading(false);
      }
    };

    loadFamilyData();
  }, [getMyFamily]);

  // Handle family name update
  const handleFamilyNameUpdate = async (newName) => {
    setError(null);
    setSuccess(null);

    try {
      const updatedFamily = await updateFamily({ name: newName });
      setFamilyData(updatedFamily);
      setSuccess("Family name updated successfully.");
    } catch (err) {
      setError("Failed to update family name. " + (err.message || ""));
    }
  };

  // Handle adding a new family member
  const handleAddMember = async (memberData) => {
    setError(null);
    setSuccess(null);

    try {
      const newMember = await addFamilyMember(memberData);

      // Update the family data with new member
      setFamilyData((prevData) => ({
        ...prevData,
        members: [...(prevData.members || []), newMember],
      }));

      setSuccess("Family member added successfully.");
      setShowAddMemberForm(false);
      return true;
    } catch (err) {
      setError("Failed to add family member. " + (err.message || ""));
      return false;
    }
  };

  // Handle updating a family member
  const handleUpdateMember = async (memberId, memberData) => {
    setError(null);
    setSuccess(null);

    try {
      const updatedMember = await updateFamilyMember(memberId, memberData);

      // Update the family data with updated member
      setFamilyData((prevData) => ({
        ...prevData,
        members: prevData.members.map((member) =>
          member._id === memberId ? updatedMember : member
        ),
      }));

      setSuccess("Family member updated successfully.");
      return true;
    } catch (err) {
      setError("Failed to update family member. " + (err.message || ""));
      return false;
    }
  };

  // Handle deleting a family member
  const handleDeleteMember = async (memberId) => {
    setError(null);
    setSuccess(null);

    try {
      await deleteFamilyMember(memberId);

      // Update the family data by removing the deleted member
      setFamilyData((prevData) => ({
        ...prevData,
        members: prevData.members.filter((member) => member._id !== memberId),
      }));

      setSuccess("Family member deleted successfully.");
      return true;
    } catch (err) {
      setError("Failed to delete family member. " + (err.message || ""));
      return false;
    }
  };

  if (isLoading) {
    return <div className="loading-spinner">Loading family data...</div>;
  }

  if (!familyData && !error) {
    return (
      <div className="no-family-message">
        <h2>No Family Found</h2>
        <p>You are not currently associated with a family.</p>
      </div>
    );
  }

  return (
    <div className="family-page">
      <h1>Family Management</h1>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="family-info-card">
        <div className="family-header">
          <h2>{familyData?.name || "My Family"}</h2>

          {isManager && (
            <button
              className="edit-family-name-btn"
              onClick={() => {
                const newName = prompt(
                  "Enter new family name:",
                  familyData?.name
                );
                if (newName && newName !== familyData?.name) {
                  handleFamilyNameUpdate(newName);
                }
              }}
            >
              <i className="fas fa-edit"></i> Edit
            </button>
          )}
        </div>

        <div className="family-meta">
          <div className="family-manager">
            <strong>Family Manager:</strong>{" "}
            {familyData?.manager?.firstName && familyData?.manager?.lastName
              ? `${familyData.manager.firstName} ${familyData.manager.lastName}`
              : user?.firstName && user?.lastName
              ? `${user.firstName} ${user.lastName}`
              : "Not available"}
          </div>
          <div className="family-members-count">
            <strong>Members:</strong> {familyData?.members?.length || 0}
          </div>
        </div>
      </div>

      <div className="family-members-section">
        <div className="section-header">
          <h2>Family Members</h2>

          {isManager && (
            <button
              className="btn btn-primary"
              onClick={() => setShowAddMemberForm(!showAddMemberForm)}
              disabled={familyActionLoading}
            >
              {showAddMemberForm ? "Cancel" : "Add Family Member"}
            </button>
          )}
        </div>

        {showAddMemberForm && (
          <AddFamilyMemberForm
            onSubmit={handleAddMember}
            onCancel={() => setShowAddMemberForm(false)}
            isLoading={familyActionLoading}
          />
        )}

        <FamilyMembersList
          members={familyData?.members || []}
          currentUser={user}
          isManager={isManager}
          onUpdateMember={handleUpdateMember}
          onDeleteMember={handleDeleteMember}
        />
      </div>

      {isManager && (
        <FamilyActions
          familyId={familyData?._id}
          familyMembers={familyData?.members || []}
          currentUser={user}
        />
      )}
    </div>
  );
};

export default FamilyPage;
