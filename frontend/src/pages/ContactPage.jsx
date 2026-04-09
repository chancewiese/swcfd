// src/pages/ContactPage.jsx
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useDevMode } from "../context/DevModeContext";
import useSiteSettings from "../hooks/useSiteSettings";
import OrganizerDialog from "../components/home/OrganizerDialog";
import "./styles/ContactPage.css";

function ContactPage() {
  const { hasRole } = useAuth();
  const { devMode } = useDevMode();
  const { getContact, addOrganizer, updateOrganizer, deleteOrganizer } =
    useSiteSettings();

  const isAdmin = hasRole("admin") && devMode;
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [isOrganizerDialogOpen, setIsOrganizerDialogOpen] = useState(false);
  const [currentOrganizer, setCurrentOrganizer] = useState(null);

  const fetchContact = useCallback(async () => {
    setLoading(true);
    const response = await getContact();
    if (response && response.data) {
      setOrganizers(response.data || []);
    }
    setLoading(false);
  }, [getContact]);

  useEffect(() => {
    fetchContact();
  }, [fetchContact]);

  const handleOpenAddOrganizer = () => {
    setCurrentOrganizer(null);
    setIsOrganizerDialogOpen(true);
  };

  const handleOpenEditOrganizer = (organizer) => {
    setCurrentOrganizer(organizer);
    setIsOrganizerDialogOpen(true);
  };

  const handleSaveOrganizer = async (formData) => {
    setIsSaving(true);
    try {
      if (currentOrganizer) {
        await updateOrganizer(currentOrganizer._id, formData);
      } else {
        await addOrganizer(formData);
      }
      await fetchContact();
      setIsOrganizerDialogOpen(false);
    } catch (err) {
      console.error("Failed to save organizer:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteOrganizer = async (organizerId) => {
    setIsSaving(true);
    try {
      await deleteOrganizer(organizerId);
      await fetchContact();
      setIsOrganizerDialogOpen(false);
    } catch (err) {
      console.error("Failed to delete organizer:", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="contact-page-container">
        <div className="loading-message">Loading...</div>
      </div>
    );
  }

  return (
    <div className="contact-page-container">
      <section className="contact-page-section">
        <div className="contact-heading-row">
          <h1>Contact Us</h1>
          {isAdmin && (
            <button
              className="contact-edit-btn"
              onClick={handleOpenAddOrganizer}
              type="button"
            >
              + Add Organizer
            </button>
          )}
        </div>

        {organizers.length === 0 ? (
          <div className="no-organizers">
            {isAdmin ? (
              <p className="empty-hint">
                No organizers listed yet.{" "}
                <button
                  className="inline-link-btn"
                  onClick={handleOpenAddOrganizer}
                  type="button"
                >
                  Add the first one
                </button>
                .
              </p>
            ) : (
              <p>Contact information coming soon.</p>
            )}
          </div>
        ) : (
          <div className="organizers-grid">
            {organizers.map((org) => (
              <div className="organizer-card" key={org._id}>
                {isAdmin && (
                  <button
                    className="organizer-edit-btn"
                    onClick={() => handleOpenEditOrganizer(org)}
                    type="button"
                    title="Edit organizer"
                  >
                    Edit
                  </button>
                )}
                <div className="organizer-avatar">
                  {org.name.charAt(0).toUpperCase()}
                </div>
                <h3 className="organizer-name">{org.name}</h3>
                {org.role && <p className="organizer-role">{org.role}</p>}
                <div className="organizer-contact">
                  {org.phone && (
                    <a
                      href={`tel:${org.phone.replace(/\D/g, "")}`}
                      className="organizer-contact-item"
                    >
                      <span className="contact-icon">📞</span>
                      {org.phone}
                    </a>
                  )}
                  {org.email && (
                    <a
                      href={`mailto:${org.email}`}
                      className="organizer-contact-item"
                    >
                      <span className="contact-icon">✉</span>
                      {org.email}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <OrganizerDialog
        isOpen={isOrganizerDialogOpen}
        onClose={() => setIsOrganizerDialogOpen(false)}
        organizer={currentOrganizer}
        onSave={handleSaveOrganizer}
        onDelete={handleDeleteOrganizer}
        isSaving={isSaving}
      />
    </div>
  );
}

export default ContactPage;
