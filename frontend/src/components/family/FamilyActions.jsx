// src/components/family/FamilyActions.jsx
import { useState } from "react";
import useFamily from "../../hooks/useFamily";

const FamilyActions = ({ familyId, familyMembers, currentUser }) => {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState(null);
  const [inviteError, setInviteError] = useState(null);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [transferSuccess, setTransferSuccess] = useState(null);
  const [transferError, setTransferError] = useState(null);
  const [transferLoading, setTransferLoading] = useState(false);

  const { inviteToFamily, transferOwnership } = useFamily();

  // Filter members who have user accounts and are not the current user
  const eligibleTransferMembers = familyMembers.filter(
    (member) => member.user && member.user !== currentUser?.id
  );

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviteError(null);
    setInviteSuccess(null);

    if (!inviteEmail.trim()) {
      setInviteError("Please enter an email address");
      return;
    }

    setInviteLoading(true);

    try {
      const result = await inviteToFamily(inviteEmail);

      if (result.success) {
        setInviteSuccess(`Invitation sent to ${inviteEmail}`);
        setInviteEmail(""); // Clear the input

        // If in development, show the invite URL
        if (result.inviteUrl) {
          console.log("Invitation URL:", result.inviteUrl);
        }
      }
    } catch (err) {
      setInviteError(err.message || "Failed to send invitation");
    } finally {
      setInviteLoading(false);
    }
  };

  const handleOwnershipTransfer = async (userId) => {
    if (!userId) return;

    // Get the member's name for confirmation
    const member = familyMembers.find((m) => m.user === userId);
    const memberName = member
      ? `${member.firstName} ${member.lastName}`
      : "this user";

    // Confirm with the user before proceeding
    if (
      !window.confirm(
        `Are you sure you want to transfer family management to ${memberName}? You will no longer be the family manager.`
      )
    ) {
      return;
    }

    setTransferError(null);
    setTransferSuccess(null);
    setTransferLoading(true);

    try {
      const result = await transferOwnership(userId);

      if (result.success) {
        setTransferSuccess(`Family management transferred to ${memberName}`);
      }
    } catch (err) {
      setTransferError(err.message || "Failed to transfer ownership");
    } finally {
      setTransferLoading(false);
    }
  };

  return (
    <div className="family-actions-container">
      <h2>Family Management Actions</h2>

      <div className="action-cards">
        {/* Invite User Card */}
        <div className="action-card">
          <h3>Invite User to Family</h3>
          <p>Send an invitation to another user to join your family.</p>

          {inviteError && <div className="form-error">{inviteError}</div>}
          {inviteSuccess && <div className="form-success">{inviteSuccess}</div>}

          <form onSubmit={handleInvite} className="invite-form">
            <div className="form-group">
              <label htmlFor="inviteEmail">Email Address</label>
              <input
                type="email"
                id="inviteEmail"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Enter email to invite"
                disabled={inviteLoading}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={inviteLoading}
            >
              {inviteLoading ? "Sending..." : "Send Invitation"}
            </button>
          </form>
        </div>

        {/* Transfer Ownership Card */}
        <div className="action-card">
          <h3>Transfer Family Ownership</h3>
          <p>Transfer management of this family to another member.</p>

          {transferError && <div className="form-error">{transferError}</div>}
          {transferSuccess && (
            <div className="form-success">{transferSuccess}</div>
          )}

          {eligibleTransferMembers.length > 0 ? (
            <div className="transfer-form">
              <div className="form-group">
                <label htmlFor="transferUser">Select New Manager</label>
                <select
                  id="transferUser"
                  onChange={(e) => handleOwnershipTransfer(e.target.value)}
                  disabled={transferLoading}
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select a family member
                  </option>
                  {eligibleTransferMembers.map((member) => (
                    <option key={member._id} value={member.user}>
                      {member.firstName} {member.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <p className="transfer-note">
                <strong>Note:</strong> The selected member must have a user
                account.
              </p>
            </div>
          ) : (
            <div className="no-eligible-members">
              <p>
                No eligible members found. To transfer ownership, you need at
                least one other family member with a user account.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FamilyActions;
