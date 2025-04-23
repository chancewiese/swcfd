// src/components/family/FamilyMembersList.jsx
import { useState } from "react";
import FamilyMemberCard from "./FamilyMemberCard";

const FamilyMembersList = ({
  members,
  currentUser,
  isManager,
  onUpdateMember,
  onDeleteMember,
}) => {
  const [filter, setFilter] = useState("");

  // Filter members based on search input
  const filteredMembers = members.filter((member) => {
    const searchTerm = filter.toLowerCase();
    const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
    return fullName.includes(searchTerm);
  });

  // Sort members - put current user first, then alphabetically by first name
  const sortedMembers = [...filteredMembers].sort((a, b) => {
    // Check if member is the current user
    const aIsCurrentUser = a.user && a.user === currentUser?.id;
    const bIsCurrentUser = b.user && b.user === currentUser?.id;

    // Current user comes first
    if (aIsCurrentUser && !bIsCurrentUser) return -1;
    if (!aIsCurrentUser && bIsCurrentUser) return 1;

    // Then sort alphabetically
    return a.firstName.localeCompare(b.firstName);
  });

  if (members.length === 0) {
    return (
      <div className="no-members-message">
        <p>No family members found. Add family members to get started.</p>
      </div>
    );
  }

  return (
    <div className="family-members-list">
      <div className="member-filter">
        <input
          type="text"
          placeholder="Search family members..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="search-input"
        />
      </div>

      {filteredMembers.length === 0 ? (
        <div className="no-results-message">
          <p>No family members match your search.</p>
        </div>
      ) : (
        <div className="members-grid">
          {sortedMembers.map((member) => (
            <FamilyMemberCard
              key={member._id}
              member={member}
              isCurrentUser={member.user === currentUser?.id}
              isManager={isManager}
              onUpdate={onUpdateMember}
              onDelete={onDeleteMember}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FamilyMembersList;
