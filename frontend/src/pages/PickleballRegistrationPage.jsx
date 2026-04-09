// src/pages/PickleballRegistrationPage.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import useEvents from "../hooks/useEvents";
import useFamily from "../hooks/useFamily";
import useRegistration from "../hooks/useRegistration";
import "./styles/PickleballRegistrationPage.css";

const STEPS = [
  { id: 1, label: "Select Division" },
  { id: 2, label: "Team Info" },
  { id: 3, label: "Review" },
  { id: 4, label: "Confirmation" },
];

const PLAYERS_REQUIRED = 2; // Doubles pickleball

const PickleballRegistrationPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const { getEvent } = useEvents();
  const { getMyFamily, addFamilyMember, loading: familyLoading } = useFamily();
  const { createRegistration, loading: submitting } = useRegistration();

  const [currentStep, setCurrentStep] = useState(1);
  const [eventData, setEventData] = useState(null);
  const [familyData, setFamilyData] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");

  // Step 1: Selected section
  const [selectedSection, setSelectedSection] = useState(null);

  // Step 2: Team info
  const [teamName, setTeamName] = useState("");
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  // Step 2: Add new member form
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMember, setNewMember] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
  });
  const [addMemberError, setAddMemberError] = useState("");

  // Step 4: Confirmation data
  const [confirmedRegistration, setConfirmedRegistration] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    const load = async () => {
      setPageLoading(true);
      try {
        const [eventRes, familyRes] = await Promise.all([
          getEvent("pickleball-tournament"),
          getMyFamily(),
        ]);
        if (eventRes?.data) setEventData(eventRes.data);
        if (familyRes) setFamilyData(familyRes);
      } catch (err) {
        setError("Failed to load registration data.");
      } finally {
        setPageLoading(false);
      }
    };
    load();
  }, [isAuthenticated]);

  // Pre-select section from query param
  useEffect(() => {
    if (!eventData) return;
    const sectionId = searchParams.get("section");
    if (sectionId && eventData.sections) {
      const found = eventData.sections.find((s) => s._id === sectionId);
      if (found) setSelectedSection(found);
    }
  }, [eventData, searchParams]);

  // Pre-fill contact info from user
  useEffect(() => {
    if (user) {
      setContactEmail(user.email || "");
      setContactPhone(user.phone || "");
    }
  }, [user]);

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="reg-login-prompt">
        <div className="reg-login-card">
          <h2>Sign In Required</h2>
          <p>You must be logged in to register for the Pickleball Tournament.</p>
          <div className="reg-login-actions">
            <Link
              to="/login"
              state={{ from: { pathname: "/register/pickleball" } }}
              className="reg-btn reg-btn-primary"
            >
              Sign In
            </Link>
            <Link to="/register" className="reg-btn reg-btn-secondary">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (pageLoading) {
    return (
      <div className="reg-loading">
        <div className="reg-loading-spinner" />
        <p>Loading registration...</p>
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className="reg-error-state">
        <p>Tournament data not found.</p>
        <Link to="/events/pickleball" className="reg-btn reg-btn-secondary">
          Back to Tournament
        </Link>
      </div>
    );
  }

  const publishedSections = (eventData.sections || []).filter(
    (s) => s.isPublished !== false
  );

  // --- Helpers ---
  const formatDate = (dateStr) => {
    if (!dateStr) return "TBD";
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    const [h, m] = timeStr.split(":");
    const d = new Date();
    d.setHours(parseInt(h));
    d.setMinutes(parseInt(m));
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  };

  const getPrice = (section) => {
    if (section?.price) return `$${section.price}`;
    return eventData.pricePerTeam || "$25 per team";
  };

  const allFamilyMembers = familyData?.members || [];

  const isPlayerSelected = (memberId) =>
    selectedPlayers.some((p) => p._id === memberId);

  const togglePlayer = (member) => {
    if (isPlayerSelected(member._id)) {
      setSelectedPlayers(selectedPlayers.filter((p) => p._id !== member._id));
    } else {
      if (selectedPlayers.length >= PLAYERS_REQUIRED) {
        setError(`Select exactly ${PLAYERS_REQUIRED} players for doubles.`);
        return;
      }
      setSelectedPlayers([...selectedPlayers, member]);
      setError("");
    }
  };

  // --- Step navigation ---
  const goToStep = (step) => {
    setError("");
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStep1Next = () => {
    if (!selectedSection) {
      setError("Please select a division.");
      return;
    }
    goToStep(2);
  };

  const handleStep2Next = () => {
    if (!teamName.trim()) {
      setError("Please enter a team name.");
      return;
    }
    if (selectedPlayers.length !== PLAYERS_REQUIRED) {
      setError(`Please select exactly ${PLAYERS_REQUIRED} players.`);
      return;
    }
    if (!contactEmail.trim()) {
      setError("Contact email is required.");
      return;
    }
    goToStep(3);
  };

  const handleSubmit = async () => {
    setError("");
    try {
      const teamMembers = selectedPlayers.map((p) => ({
        registrantType: "familyMember",
        familyMember: p._id,
        firstName: p.firstName,
        lastName: p.lastName,
      }));

      const result = await createRegistration({
        eventSlug: eventData.titleSlug,
        eventSectionId: selectedSection._id,
        teamName: teamName.trim(),
        teamMembers,
        contactEmail: contactEmail.trim(),
        contactPhone: contactPhone.trim(),
      });

      setConfirmedRegistration(result.data);
      goToStep(4);
    } catch (err) {
      setError(err.message || "Failed to submit registration. Please try again.");
    }
  };

  // --- Add family member ---
  const handleAddMember = async (e) => {
    e.preventDefault();
    setAddMemberError("");

    if (!newMember.firstName.trim() || !newMember.lastName.trim()) {
      setAddMemberError("First and last name are required.");
      return;
    }

    try {
      const added = await addFamilyMember(newMember);
      // Refresh family data
      const refreshed = await getMyFamily();
      if (refreshed) setFamilyData(refreshed);
      setShowAddMember(false);
      setNewMember({ firstName: "", lastName: "", dateOfBirth: "", gender: "" });
    } catch (err) {
      setAddMemberError(err.message || "Failed to add family member.");
    }
  };

  // ============== RENDER STEPS ==============

  const renderStepIndicator = () => (
    <div className="reg-steps">
      {STEPS.map((step, idx) => (
        <div
          key={step.id}
          className={`reg-step ${
            currentStep === step.id
              ? "active"
              : currentStep > step.id
              ? "completed"
              : ""
          }`}
        >
          <div className="reg-step-circle">
            {currentStep > step.id ? (
              <span className="reg-step-check">✓</span>
            ) : (
              <span>{step.id}</span>
            )}
          </div>
          <span className="reg-step-label">{step.label}</span>
          {idx < STEPS.length - 1 && <div className="reg-step-line" />}
        </div>
      ))}
    </div>
  );

  // Step 1: Division Selection
  const renderStep1 = () => (
    <div className="reg-step-content">
      <h2>Select a Division</h2>
      <p className="reg-step-description">
        Choose the division you want to register for. Each division may have its
        own date, capacity, and entry fee.
      </p>

      {publishedSections.length === 0 ? (
        <div className="reg-empty-state">
          No divisions are available for registration yet. Check back soon!
        </div>
      ) : (
        <div className="reg-division-grid">
          {publishedSections.map((section) => (
            <button
              key={section._id}
              type="button"
              className={`reg-division-card ${
                selectedSection?._id === section._id ? "selected" : ""
              }`}
              onClick={() => {
                setSelectedSection(section);
                setError("");
              }}
            >
              <div className="reg-division-card-header">
                <h3>{section.title}</h3>
                {selectedSection?._id === section._id && (
                  <span className="reg-selected-badge">Selected</span>
                )}
              </div>

              {section.description && (
                <p className="reg-division-description">{section.description}</p>
              )}

              <div className="reg-division-details">
                <div className="reg-detail-row">
                  <span className="reg-detail-label">Date:</span>
                  <span>
                    {formatDate(section.tournamentDate)}
                    {section.tournamentTime &&
                      ` at ${formatTime(section.tournamentTime)}`}
                  </span>
                </div>

                <div className="reg-detail-row">
                  <span className="reg-detail-label">Entry Fee:</span>
                  <span>{getPrice(section)}</span>
                </div>

                {(section.capacity || section.maxTeams) && (
                  <div className="reg-detail-row">
                    <span className="reg-detail-label">Capacity:</span>
                    <span>{section.capacity || section.maxTeams} teams</span>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {error && <div className="reg-error">{error}</div>}

      <div className="reg-actions">
        <Link to="/events/pickleball" className="reg-btn reg-btn-secondary">
          ← Back to Tournament
        </Link>
        <button
          type="button"
          className="reg-btn reg-btn-primary"
          onClick={handleStep1Next}
          disabled={publishedSections.length === 0}
        >
          Continue →
        </button>
      </div>
    </div>
  );

  // Step 2: Team Info
  const renderStep2 = () => (
    <div className="reg-step-content">
      <h2>Team Information</h2>
      <p className="reg-step-description">
        Enter your team name and select {PLAYERS_REQUIRED} players from your
        family members.
      </p>

      <div className="reg-form-section">
        <h3>Team Name</h3>
        <input
          type="text"
          className="reg-input"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          placeholder="e.g., The Pickle Pros"
          maxLength={50}
        />
      </div>

      <div className="reg-form-section">
        <div className="reg-players-header">
          <h3>
            Players{" "}
            <span className="reg-players-count">
              {selectedPlayers.length}/{PLAYERS_REQUIRED} selected
            </span>
          </h3>
          <button
            type="button"
            className="reg-btn reg-btn-outline"
            onClick={() => {
              setShowAddMember(!showAddMember);
              setAddMemberError("");
            }}
          >
            {showAddMember ? "Cancel" : "+ Add Family Member"}
          </button>
        </div>

        {showAddMember && (
          <form className="reg-add-member-form" onSubmit={handleAddMember}>
            <h4>Add New Family Member</h4>
            {addMemberError && (
              <div className="reg-error">{addMemberError}</div>
            )}
            <div className="reg-form-row">
              <div className="reg-form-group">
                <label>First Name *</label>
                <input
                  type="text"
                  className="reg-input"
                  value={newMember.firstName}
                  onChange={(e) =>
                    setNewMember({ ...newMember, firstName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="reg-form-group">
                <label>Last Name *</label>
                <input
                  type="text"
                  className="reg-input"
                  value={newMember.lastName}
                  onChange={(e) =>
                    setNewMember({ ...newMember, lastName: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div className="reg-form-row">
              <div className="reg-form-group">
                <label>Date of Birth</label>
                <input
                  type="date"
                  className="reg-input"
                  value={newMember.dateOfBirth}
                  onChange={(e) =>
                    setNewMember({ ...newMember, dateOfBirth: e.target.value })
                  }
                />
              </div>
              <div className="reg-form-group">
                <label>Gender</label>
                <select
                  className="reg-input"
                  value={newMember.gender}
                  onChange={(e) =>
                    setNewMember({ ...newMember, gender: e.target.value })
                  }
                >
                  <option value="">Select...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>
            <div className="reg-add-member-actions">
              <button
                type="submit"
                className="reg-btn reg-btn-primary"
                disabled={familyLoading}
              >
                {familyLoading ? "Adding..." : "Add Member"}
              </button>
            </div>
          </form>
        )}

        {allFamilyMembers.length === 0 ? (
          <div className="reg-empty-state">
            No family members found. Add a family member above to continue.
          </div>
        ) : (
          <div className="reg-player-grid">
            {allFamilyMembers.map((member) => {
              const selected = isPlayerSelected(member._id);
              const disabled =
                !selected && selectedPlayers.length >= PLAYERS_REQUIRED;
              return (
                <button
                  key={member._id}
                  type="button"
                  className={`reg-player-card ${selected ? "selected" : ""} ${
                    disabled ? "disabled" : ""
                  }`}
                  onClick={() => !disabled && togglePlayer(member)}
                >
                  <div className="reg-player-avatar">
                    {member.firstName[0]}
                    {member.lastName[0]}
                  </div>
                  <div className="reg-player-info">
                    <span className="reg-player-name">
                      {member.firstName} {member.lastName}
                    </span>
                    {member.gender && (
                      <span className="reg-player-meta">
                        {member.gender.charAt(0).toUpperCase() +
                          member.gender.slice(1)}
                      </span>
                    )}
                  </div>
                  {selected && (
                    <div className="reg-player-check">✓</div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="reg-form-section">
        <h3>Contact Information</h3>
        <div className="reg-form-row">
          <div className="reg-form-group">
            <label>Email *</label>
            <input
              type="email"
              className="reg-input"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              required
            />
          </div>
          <div className="reg-form-group">
            <label>Phone</label>
            <input
              type="tel"
              className="reg-input"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="(555) 000-0000"
            />
          </div>
        </div>
      </div>

      {error && <div className="reg-error">{error}</div>}

      <div className="reg-actions">
        <button
          type="button"
          className="reg-btn reg-btn-secondary"
          onClick={() => goToStep(1)}
        >
          ← Back
        </button>
        <button
          type="button"
          className="reg-btn reg-btn-primary"
          onClick={handleStep2Next}
        >
          Review →
        </button>
      </div>
    </div>
  );

  // Step 3: Review
  const renderStep3 = () => (
    <div className="reg-step-content">
      <h2>Review Your Registration</h2>
      <p className="reg-step-description">
        Please review your registration details before submitting.
      </p>

      <div className="reg-review-card">
        <div className="reg-review-section">
          <h3>Tournament</h3>
          <div className="reg-review-row">
            <span className="reg-review-label">Event:</span>
            <span>{eventData.title}</span>
          </div>
          <div className="reg-review-row">
            <span className="reg-review-label">Date:</span>
            <span>
              {formatDate(eventData.startDate)}
              {eventData.startDate !== eventData.endDate &&
                ` — ${formatDate(eventData.endDate)}`}
            </span>
          </div>
          <div className="reg-review-row">
            <span className="reg-review-label">Location:</span>
            <span>{eventData.location || "TBD"}</span>
          </div>
        </div>

        <div className="reg-review-divider" />

        <div className="reg-review-section">
          <h3>Division</h3>
          <div className="reg-review-row">
            <span className="reg-review-label">Division:</span>
            <span>{selectedSection.title}</span>
          </div>
          <div className="reg-review-row">
            <span className="reg-review-label">Date:</span>
            <span>
              {formatDate(selectedSection.tournamentDate)}
              {selectedSection.tournamentTime &&
                ` at ${formatTime(selectedSection.tournamentTime)}`}
            </span>
          </div>
          <div className="reg-review-row">
            <span className="reg-review-label">Entry Fee:</span>
            <span className="reg-review-price">{getPrice(selectedSection)}</span>
          </div>
        </div>

        <div className="reg-review-divider" />

        <div className="reg-review-section">
          <h3>Team</h3>
          <div className="reg-review-row">
            <span className="reg-review-label">Team Name:</span>
            <span>{teamName}</span>
          </div>
          <div className="reg-review-row">
            <span className="reg-review-label">Players:</span>
            <div className="reg-review-players">
              {selectedPlayers.map((p) => (
                <span key={p._id} className="reg-review-player-tag">
                  {p.firstName} {p.lastName}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="reg-review-divider" />

        <div className="reg-review-section">
          <h3>Contact</h3>
          <div className="reg-review-row">
            <span className="reg-review-label">Email:</span>
            <span>{contactEmail}</span>
          </div>
          {contactPhone && (
            <div className="reg-review-row">
              <span className="reg-review-label">Phone:</span>
              <span>{contactPhone}</span>
            </div>
          )}
        </div>
      </div>

      <div className="reg-payment-notice">
        <div className="reg-payment-notice-icon">💳</div>
        <div>
          <strong>Payment Due: {getPrice(selectedSection)}</strong>
          <p>
            Payment instructions will be sent to{" "}
            <strong>{contactEmail}</strong> after registration is submitted.
            Your spot will be held for 48 hours pending payment.
          </p>
        </div>
      </div>

      {error && <div className="reg-error">{error}</div>}

      <div className="reg-actions">
        <button
          type="button"
          className="reg-btn reg-btn-secondary"
          onClick={() => goToStep(2)}
          disabled={submitting}
        >
          ← Back
        </button>
        <button
          type="button"
          className="reg-btn reg-btn-primary"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? "Submitting..." : "Submit Registration"}
        </button>
      </div>
    </div>
  );

  // Step 4: Confirmation
  const renderStep4 = () => (
    <div className="reg-step-content reg-confirmation">
      <div className="reg-confirmation-icon">🎉</div>
      <h2>Registration Submitted!</h2>
      <p className="reg-confirmation-sub">
        You're registered for the{" "}
        <strong>{confirmedRegistration?.eventSection?.title || selectedSection?.title}</strong>{" "}
        division.
      </p>

      <div className="reg-review-card">
        <div className="reg-review-section">
          <h3>Registration Details</h3>
          {confirmedRegistration?._id && (
            <div className="reg-review-row">
              <span className="reg-review-label">Confirmation #:</span>
              <span className="reg-confirmation-id">
                {confirmedRegistration._id.slice(-8).toUpperCase()}
              </span>
            </div>
          )}
          <div className="reg-review-row">
            <span className="reg-review-label">Team:</span>
            <span>{teamName}</span>
          </div>
          <div className="reg-review-row">
            <span className="reg-review-label">Division:</span>
            <span>{selectedSection?.title}</span>
          </div>
          <div className="reg-review-row">
            <span className="reg-review-label">Status:</span>
            <span className="reg-status-badge pending">Pending Payment</span>
          </div>
        </div>
      </div>

      <div className="reg-payment-instructions">
        <h3>Next Steps — Payment</h3>
        <ol>
          <li>
            Payment information has been sent to <strong>{contactEmail}</strong>.
          </li>
          <li>
            Entry fee of <strong>{getPrice(selectedSection)}</strong> is due
            within 48 hours to secure your spot.
          </li>
          <li>
            Once payment is received, your registration status will be updated
            to <strong>Confirmed</strong>.
          </li>
          <li>
            Questions? Contact us at the{" "}
            <Link to="/contact">Contact page</Link>.
          </li>
        </ol>
      </div>

      <div className="reg-actions reg-actions-centered">
        <Link to="/events/pickleball" className="reg-btn reg-btn-primary">
          Back to Tournament
        </Link>
        <Link to="/account" className="reg-btn reg-btn-secondary">
          View My Registrations
        </Link>
      </div>
    </div>
  );

  return (
    <div className="reg-container">
      <div className="reg-header">
        <h1>{eventData.title}</h1>
        <p>
          {eventData.location && <span>{eventData.location} · </span>}
          Registration
        </p>
      </div>

      {renderStepIndicator()}

      <div className="reg-card">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
      </div>
    </div>
  );
};

export default PickleballRegistrationPage;
