// src/pages/AccountPage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import useFamily from "../hooks/useFamily";
import FamilyMemberDialog from "../components/family/FamilyMemberDialog";
import ProfileDialog from "../components/profile/ProfileDialog";
import "./account/Account.css";
import "../components/family/Dialog.css";

const AccountPage = () => {
  // User profile state
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
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);

  // Family management state
  const [familyData, setFamilyData] = useState(null);
  const [editingFamilyName, setEditingFamilyName] = useState(false);
  const [familyName, setFamilyName] = useState("");

  // Family member dialog state
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [currentMember, setCurrentMember] = useState(null);
  const [isAddingMember, setIsAddingMember] = useState(false);

  // General state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const navigate = useNavigate();
  const { user, logout, updateProfile } = useAuth();
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

  // Load user profile and family data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Set profile data from user context
        if (user) {
          setProfileData({
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            email: user.email || "",
            phoneNumber: user.phoneNumber || "",
            dateOfBirth: user.dateOfBirth
              ? new Date(user.dateOfBirth).toISOString().split("T")[0]
              : "",
            gender: user.gender || "",
            address: {
              street: user.address?.street || "",
              city: user.address?.city || "",
              state: user.address?.state || "",
              zipCode: user.address?.zipCode || "",
            },
          });
        }

        // Get family data
        try {
          const family = await getMyFamily();
          setFamilyData(family);
          setFamilyName(family?.name || "");
        } catch (familyErr) {
          console.error("Failed to load family data:", familyErr);
          // Don't set error here, as the user might not have a family yet
        }

        setIsLoading(false);
      } catch (err) {
        setError("Failed to load account data. Please try again.");
        setIsLoading(false);
      }
    };

    loadData();
  }, [user, getMyFamily]);

  // Handle opening the profile dialog
  const handleOpenProfileDialog = () => {
    setProfileDialogOpen(true);
  };

  // Handle profile update
  const handleProfileUpdate = async (updatedProfile) => {
    setError(null);
    setSuccess(null);

    try {
      await updateProfile(updatedProfile);
      setProfileData(updatedProfile);
      setSuccess("Profile updated successfully");
      return true;
    } catch (err) {
      setError("Failed to update profile: " + (err.message || "Unknown error"));
      return false;
    }
  };

  // Handle family name update
  const handleFamilyNameUpdate = async () => {
    if (!familyName.trim()) {
      setError("Family name cannot be empty");
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      await updateFamily({ name: familyName });
      // Only update the name field in familyData
      if (familyData) {
        setFamilyData({
          ...familyData,
          name: familyName,
        });
      }
      setSuccess("Family name updated successfully");
      setEditingFamilyName(false);
    } catch (err) {
      setError(
        "Failed to update family name: " + (err.message || "Unknown error")
      );
    }
  };

  const handleInviteUser = async (memberId, email) => {
    if (!email) {
      setError("Email address is required to invite a user");
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      // This is where you would call your API to send an invitation
      // For example: await inviteUserToFamily(email);

      // For now, we'll just show a success message
      setSuccess(`Invitation sent to ${email}`);

      // You could update the UI to reflect this, for example:
      // setFamilyData(prevData => ({
      //   ...prevData,
      //   members: prevData.members.map(m =>
      //     m._id === memberId ? { ...m, invitePending: true } : m
      //   )
      // }));

      return true;
    } catch (err) {
      setError(
        "Failed to send invitation: " + (err.message || "Unknown error")
      );
      return false;
    }
  };

  // Handle opening the member dialog for adding or editing
  const handleOpenMemberDialog = (member = null) => {
    setCurrentMember(member);
    setIsAddingMember(member === null);
    setMemberDialogOpen(true);
  };

  // Handle adding a family member
  const handleAddFamilyMember = async (memberData) => {
    setError(null);
    setSuccess(null);

    try {
      const newMember = await addFamilyMember(memberData);

      // Only update the members array if it exists
      setFamilyData((prevData) => {
        if (!prevData) return prevData;

        return {
          ...prevData,
          members: [...(prevData.members || []), newMember],
        };
      });

      setSuccess("Family member added successfully");
      return true;
    } catch (err) {
      setError(
        "Failed to add family member: " + (err.message || "Unknown error")
      );
      return false;
    }
  };

  // Handle updating a family member
  const handleUpdateFamilyMember = async (memberId, memberData) => {
    setError(null);
    setSuccess(null);

    try {
      const updatedMember = await updateFamilyMember(memberId, memberData);

      // Update the family data
      setFamilyData((prevData) => {
        if (!prevData || !prevData.members) return prevData;

        return {
          ...prevData,
          members: prevData.members.map((member) =>
            member._id === memberId ? updatedMember : member
          ),
        };
      });

      setSuccess("Family member updated successfully");
      return true;
    } catch (err) {
      setError(
        "Failed to update family member: " + (err.message || "Unknown error")
      );
      return false;
    }
  };

  // Handle deleting a family member
  const handleDeleteFamilyMember = async (memberId) => {
    if (
      !window.confirm("Are you sure you want to remove this family member?")
    ) {
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      await deleteFamilyMember(memberId);

      // Update the family data
      setFamilyData((prevData) => {
        if (!prevData || !prevData.members) return prevData;

        return {
          ...prevData,
          members: prevData.members.filter((member) => member._id !== memberId),
        };
      });

      setSuccess("Family member deleted successfully");
      return true;
    } catch (err) {
      setError(
        "Failed to delete family member: " + (err.message || "Unknown error")
      );
      return false;
    }
  };

  // Handle user logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      setError("Failed to logout: " + (err.message || "Unknown error"));
    }
  };

  if (isLoading) {
    return <div className="loading-spinner">Loading account data...</div>;
  }

  return (
    <div className="account-page">
      <div className="account-page-header">
        <h1>My Account</h1>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="account-sections">
        {/* Profile Section */}
        <div className="account-section">
          <div className="section-header">
            <h2>Profile Information</h2>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleOpenProfileDialog}
            >
              Edit Profile
            </button>
          </div>

          <div className="profile-info">
            <div className="info-item">
              <strong>Name:</strong> {profileData.firstName}{" "}
              {profileData.lastName}
            </div>
            <div className="info-item">
              <strong>Email:</strong> {profileData.email}
            </div>
            <div className="info-item">
              <strong>Phone:</strong>{" "}
              {profileData.phoneNumber || (
                <>
                  <span className="no-data">Not provided</span>
                  <span
                    className="add-info-prompt"
                    onClick={handleOpenProfileDialog}
                  >
                    Add phone number
                  </span>
                </>
              )}
            </div>
            <div className="info-item">
              <strong>Date of Birth:</strong>{" "}
              {profileData.dateOfBirth ? (
                new Date(profileData.dateOfBirth).toLocaleDateString()
              ) : (
                <span className="no-data">Not provided</span>
              )}
            </div>
            <div className="info-item">
              <strong>Gender:</strong>{" "}
              {profileData.gender || (
                <span className="no-data">Not provided</span>
              )}
            </div>

            <div className="address-info">
              <strong>Address:</strong>
              {profileData.address?.street ? (
                <>
                  <div>{profileData.address.street}</div>
                  <div>
                    {profileData.address.city &&
                      `${profileData.address.city}, `}
                    {profileData.address.state &&
                      `${profileData.address.state} `}
                    {profileData.address.zipCode && profileData.address.zipCode}
                  </div>
                </>
              ) : (
                <div>
                  <span className="no-data">Not provided</span>
                  <span
                    className="add-info-prompt"
                    onClick={handleOpenProfileDialog}
                  >
                    Add address
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Family Management Section */}
        <div className="account-section">
          <div className="section-header">
            <h2>Family Management</h2>
          </div>

          {familyData ? (
            <>
              <div className="family-header">
                {editingFamilyName ? (
                  <div className="edit-family-name">
                    <input
                      type="text"
                      value={familyName}
                      onChange={(e) => setFamilyName(e.target.value)}
                      className="family-name-input"
                      autoFocus
                    />
                    <div className="name-edit-actions">
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          setFamilyName(familyData.name);
                          setEditingFamilyName(false);
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={handleFamilyNameUpdate}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3>{familyData.name || "My Family"}</h3>
                    {isManager && (
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => setEditingFamilyName(true)}
                      >
                        <span>✎</span> Edit Name
                      </button>
                    )}
                  </>
                )}
              </div>

              <div className="family-members">
                <div className="members-header">
                  <h4>Family Members</h4>
                  {isManager && (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleOpenMemberDialog()}
                    >
                      Add Member
                    </button>
                  )}
                </div>

                <div className="members-list">
                  {familyData.members && familyData.members.length > 0 ? (
                    <div className="members-grid">
                      {familyData.members.map((member) => (
                        <div className="member-card" key={member._id}>
                          <div className="member-header">
                            <h5>
                              {member.firstName} {member.lastName}
                            </h5>
                            <div className="member-badges">
                              {member.user === user?.id && (
                                <span className="badge badge-you">You</span>
                              )}
                              {member.user && member.user !== user?.id && (
                                <span className="badge badge-user">User</span>
                              )}
                            </div>
                          </div>

                          <div className="member-details">
                            {member.email && (
                              <div className="member-info">
                                <strong>Email:</strong> {member.email}
                              </div>
                            )}
                            {member.dateOfBirth && (
                              <div className="member-info">
                                <strong>Birth Date:</strong>{" "}
                                {new Date(
                                  member.dateOfBirth
                                ).toLocaleDateString()}
                              </div>
                            )}
                            {member.gender && (
                              <div className="member-info">
                                <strong>Gender:</strong> {member.gender}
                              </div>
                            )}
                            {member.phoneNumber && (
                              <div className="member-info">
                                <strong>Phone:</strong> {member.phoneNumber}
                              </div>
                            )}
                            {member.address?.street && (
                              <div className="member-info address-info">
                                <strong>Address:</strong>
                                <div>{member.address.street}</div>
                                <div>
                                  {member.address.city &&
                                    `${member.address.city}, `}
                                  {member.address.state &&
                                    `${member.address.state} `}
                                  {member.address.zipCode &&
                                    member.address.zipCode}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="member-actions">
                            {(member.user === user?.id || isManager) && (
                              <button
                                className="btn btn-sm btn-outline"
                                onClick={() => handleOpenMemberDialog(member)}
                              >
                                Edit
                              </button>
                            )}
                            {isManager && member.user !== user?.id && (
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() =>
                                  handleDeleteFamilyMember(member._id)
                                }
                              >
                                Remove
                              </button>
                            )}
                            {isManager && !member.user && member.email && (
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() =>
                                  handleInviteUser(member._id, member.email)
                                }
                              >
                                Invite
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-members-message">
                      <p>
                        No family members found. Add family members to get
                        started.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="no-family-message">
              <p>You are not currently associated with a family.</p>
            </div>
          )}
        </div>

        {/* Account Actions Section */}
        <div className="account-section">
          <div className="section-header">
            <h2>Account Actions</h2>
          </div>

          <div className="account-actions">
            <button className="btn btn-danger" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Family Member Dialog for Add/Edit */}
      <FamilyMemberDialog
        isOpen={memberDialogOpen}
        onClose={() => setMemberDialogOpen(false)}
        member={currentMember}
        onSave={
          isAddingMember ? handleAddFamilyMember : handleUpdateFamilyMember
        }
        isLoading={familyActionLoading}
        isNewMember={isAddingMember}
        defaultPhone={profileData.phoneNumber || ""}
        defaultAddress={profileData.address || {}}
      />

      {/* Profile Dialog */}
      <ProfileDialog
        isOpen={profileDialogOpen}
        onClose={() => setProfileDialogOpen(false)}
        profileData={profileData}
        onSave={handleProfileUpdate}
        isLoading={false}
      />
    </div>
  );
};

export default AccountPage;
