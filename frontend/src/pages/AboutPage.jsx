// src/pages/AboutPage.jsx
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import useSiteSettings from "../hooks/useSiteSettings";
import EditAboutDialog from "../components/home/EditAboutDialog";
import "./styles/AboutPage.css";

function AboutPage() {
  const { isAuthenticated, hasRole } = useAuth();
  const { getAbout, updateAbout } = useSiteSettings();

  const [isAdmin, setIsAdmin] = useState(false);
  const [aboutContent, setAboutContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [isAboutDialogOpen, setIsAboutDialogOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated && hasRole) {
      setIsAdmin(hasRole("admin"));
    }
  }, [isAuthenticated, hasRole]);

  const fetchAbout = useCallback(async () => {
    setLoading(true);
    const response = await getAbout();
    if (response && response.data) {
      setAboutContent(response.data?.content || "");
    }
    setLoading(false);
  }, [getAbout]);

  useEffect(() => {
    fetchAbout();
  }, [fetchAbout]);

  const handleSaveAbout = async (content) => {
    setIsSaving(true);
    try {
      await updateAbout(content);
      setAboutContent(content);
      setIsAboutDialogOpen(false);
    } catch (err) {
      console.error("Failed to save about content:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Split content on blank lines to render paragraphs
  const paragraphs = aboutContent
    ? aboutContent
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean)
    : [];

  if (loading) {
    return (
      <div className="about-container">
        <div className="loading-message">Loading...</div>
      </div>
    );
  }

  return (
    <div className="about-container">
      {/* ── About Country Fair Days ── */}
      <section className="about-section">
        <div className="section-heading-row">
          <h1>About Country Fair Days</h1>
          {isAdmin && (
            <button
              className="about-edit-btn"
              onClick={() => setIsAboutDialogOpen(true)}
              type="button"
            >
              Edit
            </button>
          )}
        </div>

        {paragraphs.length > 0 ? (
          <div className="about-content">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        ) : (
          <div className="about-content">
            {isAdmin ? (
              <p className="empty-hint">
                No about text yet.{" "}
                <button
                  className="inline-link-btn"
                  onClick={() => setIsAboutDialogOpen(true)}
                  type="button"
                >
                  Add some text
                </button>{" "}
                to tell visitors about Country Fair Days.
              </p>
            ) : (
              <p>Information coming soon.</p>
            )}
          </div>
        )}
      </section>

      {/* ── Dialogs ── */}
      <EditAboutDialog
        isOpen={isAboutDialogOpen}
        onClose={() => setIsAboutDialogOpen(false)}
        content={aboutContent}
        onSave={handleSaveAbout}
        isSaving={isSaving}
      />
    </div>
  );
}

export default AboutPage;
