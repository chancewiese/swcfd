// src/pages/SponsorsPage.jsx
import { useState, useEffect, useCallback, Fragment } from "react";
import { useAuth } from "../context/AuthContext";
import { useDevMode } from "../context/DevModeContext";
import useSponsors from "../hooks/useSponsors";
import TierDialog from "../components/sponsors/TierDialog";
import SponsorDialog from "../components/sponsors/SponsorDialog";
import { getImageUrl } from "../utils/imageUtils";
import "./styles/SponsorsPage.css";

function SponsorsPage() {
  const { hasRole } = useAuth();
  const { devMode } = useDevMode();
  const {
    getTiers,
    createTier,
    updateTier,
    deleteTier,
    reorderTiers,
    addSponsor,
    updateSponsor,
    deleteSponsor,
    uploadSponsorLogo,
    loading,
  } = useSponsors();

  const isAdmin = hasRole("admin") && devMode;
  const [tiers, setTiers] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  // Admin tier/sponsor dialogs
  const [isTierDialogOpen, setIsTierDialogOpen] = useState(false);
  const [isSponsorDialogOpen, setIsSponsorDialogOpen] = useState(false);
  const [currentTier, setCurrentTier] = useState(null);
  const [currentSponsor, setCurrentSponsor] = useState(null);
  const [currentTierForSponsor, setCurrentTierForSponsor] = useState(null);

  // Edit Tiers manager modal
  const [isEditTiersOpen, setIsEditTiersOpen] = useState(false);
  const [localTiers, setLocalTiers] = useState([]);
  const [dragIdx, setDragIdx] = useState(null);
  const [orderChanged, setOrderChanged] = useState(false);
  // Tracks whether Edit Tiers should reopen after TierDialog closes
  const [reopenEditTiers, setReopenEditTiers] = useState(false);

  // Public modals
  const [isTierListModalOpen, setIsTierListModalOpen] = useState(false);
  const [isBecomeASponsorModalOpen, setIsBecomeASponsorModalOpen] =
    useState(false);

  const fetchTiers = useCallback(async () => {
    const response = await getTiers();
    if (response && response.data) {
      setTiers(response.data);
    }
  }, [getTiers]);

  useEffect(() => {
    fetchTiers();
  }, [fetchTiers]);

  // Keep localTiers in sync whenever the canonical tiers list changes
  useEffect(() => {
    setLocalTiers(tiers);
    setOrderChanged(false);
  }, [tiers]);

  // ── Tier dialog handlers ──────────────────────────────────────────────────

  // Open from the main page (no need to reopen Edit Tiers modal)
  const openEditTier = (tier) => {
    setCurrentTier(tier);
    setIsTierDialogOpen(true);
  };

  // Open from within the Edit Tiers manager modal
  const openTierDialogFromManager = (tier) => {
    setCurrentTier(tier);
    setIsEditTiersOpen(false);
    setReopenEditTiers(true);
    setIsTierDialogOpen(true);
  };

  const openAddTierFromManager = () => {
    setCurrentTier(null);
    setIsEditTiersOpen(false);
    setReopenEditTiers(true);
    setIsTierDialogOpen(true);
  };

  const handleTierDialogClose = () => {
    setIsTierDialogOpen(false);
    if (reopenEditTiers) {
      setReopenEditTiers(false);
      setIsEditTiersOpen(true);
    }
  };

  const handleSaveTier = async (formData) => {
    setIsSaving(true);
    try {
      if (currentTier) {
        await updateTier(currentTier._id, formData);
      } else {
        await createTier(formData);
      }
      await fetchTiers();
      handleTierDialogClose();
    } catch (err) {
      console.error("Failed to save tier:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTier = async (tierId) => {
    setIsSaving(true);
    try {
      await deleteTier(tierId);
      await fetchTiers();
      handleTierDialogClose();
    } catch (err) {
      console.error("Failed to delete tier:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // ── Sponsor dialog handlers ───────────────────────────────────────────────

  const openAddSponsor = (tier) => {
    setCurrentSponsor(null);
    setCurrentTierForSponsor(tier);
    setIsSponsorDialogOpen(true);
  };

  const openEditSponsor = (sponsor, tier) => {
    setCurrentSponsor(sponsor);
    setCurrentTierForSponsor(tier);
    setIsSponsorDialogOpen(true);
  };

  const handleSaveSponsor = async (formData, logoFile) => {
    setIsSaving(true);
    try {
      let sponsorId;
      if (currentSponsor) {
        await updateSponsor(currentSponsor._id, formData);
        sponsorId = currentSponsor._id;
      } else {
        const result = await addSponsor(currentTierForSponsor._id, formData);
        sponsorId = result.data._id;
      }
      if (logoFile && sponsorId) {
        const logoFormData = new FormData();
        logoFormData.append("logo", logoFile);
        await uploadSponsorLogo(sponsorId, logoFormData);
      }
      await fetchTiers();
      setIsSponsorDialogOpen(false);
    } catch (err) {
      console.error("Failed to save sponsor:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSponsor = async (sponsorId) => {
    setIsSaving(true);
    try {
      await deleteSponsor(sponsorId);
      await fetchTiers();
      setIsSponsorDialogOpen(false);
    } catch (err) {
      console.error("Failed to delete sponsor:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // ── Drag-and-drop reorder ─────────────────────────────────────────────────

  const handleDragStart = (e, idx) => {
    setDragIdx(idx);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, idx) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragIdx === null || dragIdx === idx) return;
    const updated = [...localTiers];
    const [moved] = updated.splice(dragIdx, 1);
    updated.splice(idx, 0, moved);
    setLocalTiers(updated);
    setDragIdx(idx);
    setOrderChanged(true);
  };

  const handleDragEnd = () => setDragIdx(null);

  const handleSaveOrder = async () => {
    setIsSaving(true);
    try {
      const orderData = localTiers.map((t, i) => ({ id: t._id, order: i + 1 }));
      await reorderTiers(orderData);
      await fetchTiers();
      setOrderChanged(false);
    } catch (err) {
      console.error("Failed to save order:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="sponsors-container">
      {/* ── Page header ── */}
      <div className="sponsors-header">
        <div className="sponsors-header-text">
          <h1>Our Sponsors</h1>
          <p>
            Country Fair Days wouldn&apos;t be possible without the generous
            support of our sponsors. Their contributions allow us to bring the
            community together year after year for events, activities, and
            celebrations that create lasting memories. We are deeply grateful
            for each and every sponsor who believes in what we do.
          </p>
        </div>

        <div className="sponsors-actions">
          <button
            className="sponsor-action-btn sponsor-action-btn--outline"
            onClick={() => setIsTierListModalOpen(true)}
            type="button"
          >
            Sponsor Tier List
          </button>
          <button
            className="sponsor-action-btn sponsor-action-btn--primary"
            onClick={() => setIsBecomeASponsorModalOpen(true)}
            type="button"
          >
            Become a Sponsor
          </button>
          {isAdmin && (
            <button
              className="sponsors-manage-btn"
              onClick={() => setIsEditTiersOpen(true)}
              type="button"
            >
              Edit Tiers
            </button>
          )}
        </div>
      </div>

      {/* ── Tier sections ── */}
      {tiers.map((tier) => (
        <div
          className="tier-section"
          key={tier._id}
          style={{ "--tier-color": tier.color }}
        >
          <div className="tier-header">
            <div className="tier-header-left">
              <div
                className="tier-badge"
                style={{ backgroundColor: tier.color }}
              >
                {tier.name}
              </div>
            </div>
            {isAdmin && (
              <button
                className="edit-btn"
                onClick={() => openEditTier(tier)}
                type="button"
              >
                Edit Tier
              </button>
            )}
          </div>

          {/* Sponsors grid */}
          <div className="tier-sponsors">
            {tier.sponsors &&
              tier.sponsors.map((sponsor, idx) => {
                const col = (idx % 4) + 1;
                const imageRow = Math.floor(idx / 4) * 2 + 1;
                return (
                  <Fragment key={sponsor._id}>
                    <div
                      className="sponsor-image-cell"
                      style={isAdmin ? { gridColumn: col, gridRow: imageRow } : undefined}
                    >
                      {sponsor.website ? (
                        <a
                          href={sponsor.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="sponsor-logo-link"
                        >
                          {sponsor.logoUrl ? (
                            <img
                              src={getImageUrl(sponsor.logoUrl)}
                              alt={sponsor.name}
                              className="sponsor-logo"
                            />
                          ) : (
                            <div className="sponsor-name-badge">
                              {sponsor.name}
                            </div>
                          )}
                        </a>
                      ) : sponsor.logoUrl ? (
                        <img
                          src={getImageUrl(sponsor.logoUrl)}
                          alt={sponsor.name}
                          className="sponsor-logo"
                        />
                      ) : (
                        <div className="sponsor-name-badge">{sponsor.name}</div>
                      )}
                    </div>
                    {isAdmin && (
                      <div
                        className="sponsor-edit-cell"
                        style={{ gridColumn: col, gridRow: imageRow + 1 }}
                      >
                        <button
                          className="sponsor-edit-btn"
                          onClick={() => openEditSponsor(sponsor, tier)}
                          type="button"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </Fragment>
                );
              })}

            {isAdmin && (
              <div
                style={{
                  gridColumn: ((tier.sponsors?.length ?? 0) % 4) + 1,
                  gridRow: Math.floor((tier.sponsors?.length ?? 0) / 4) * 2 + 1,
                }}
              >
                <button
                  className="add-sponsor-btn"
                  onClick={() => openAddSponsor(tier)}
                  type="button"
                >
                  + Add Sponsor
                </button>
              </div>
            )}

            {!isAdmin && (!tier.sponsors || tier.sponsors.length === 0) && (
              <p className="no-sponsors">
                Sponsor opportunities available — see our tier list to learn
                more.
              </p>
            )}
          </div>
        </div>
      ))}

      {tiers.length === 0 && !loading && (
        <div className="no-tiers">Loading sponsor tiers...</div>
      )}

      {/* ── Edit Tiers Manager Modal (admin) ── */}
      {isEditTiersOpen && (
        <div
          className="sp-modal-overlay"
          onClick={() => setIsEditTiersOpen(false)}
        >
          <div className="sp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sp-modal-header">
              <h2>Edit Tiers</h2>
              <button
                className="sp-modal-close"
                onClick={() => setIsEditTiersOpen(false)}
                aria-label="Close"
                type="button"
              >
                ×
              </button>
            </div>

            <div className="sp-modal-body">
              <p className="et-hint">
                Drag tiers to reorder how they appear on the page.
              </p>

              <ul className="et-list">
                {localTiers.map((tier, idx) => (
                  <li
                    key={tier._id}
                    className={`et-row${dragIdx === idx ? " et-row--dragging" : ""}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDragEnd={handleDragEnd}
                  >
                    <span className="et-drag-handle" aria-hidden="true">
                      ⠿
                    </span>
                    <span
                      className="et-badge"
                      style={{ backgroundColor: tier.color }}
                    >
                      {tier.name}
                    </span>
                    <button
                      className="et-edit-btn"
                      onClick={() => openTierDialogFromManager(tier)}
                      type="button"
                    >
                      Edit
                    </button>
                  </li>
                ))}
              </ul>

              <button
                className="et-add-btn"
                onClick={openAddTierFromManager}
                type="button"
              >
                + Add Tier
              </button>
            </div>

            <div className="sp-modal-footer">
              <button
                className="sp-footer-btn sp-footer-btn--cancel"
                onClick={() => setIsEditTiersOpen(false)}
                type="button"
              >
                Close
              </button>
              <button
                className={`sp-footer-btn sp-footer-btn--save${orderChanged ? "" : " sp-footer-btn--disabled"}`}
                onClick={handleSaveOrder}
                disabled={!orderChanged || isSaving}
                type="button"
              >
                {isSaving ? "Saving..." : "Save Order"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Sponsor Tier List Modal ── */}
      {isTierListModalOpen && (
        <div
          className="sp-modal-overlay"
          onClick={() => setIsTierListModalOpen(false)}
        >
          <div className="sp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sp-modal-header">
              <h2>Sponsor Tier Levels</h2>
              <button
                className="sp-modal-close"
                onClick={() => setIsTierListModalOpen(false)}
                aria-label="Close"
                type="button"
              >
                ×
              </button>
            </div>
            <div className="sp-modal-body">
              {tiers.length === 0 ? (
                <p className="sp-modal-empty">No tiers configured yet.</p>
              ) : (
                tiers.map((tier) => (
                  <div
                    key={tier._id}
                    className="sp-tier-row"
                    style={{ "--tier-color": tier.color }}
                  >
                    <div className="sp-tier-row-header">
                      <div
                        className="tier-badge"
                        style={{ backgroundColor: tier.color }}
                      >
                        {tier.name}
                      </div>
                      {tier.contributionRange && (
                        <span className="sp-tier-row-range">
                          {tier.contributionRange}
                        </span>
                      )}
                    </div>

                    {tier.description && (
                      <p className="sp-tier-row-desc">{tier.description}</p>
                    )}

                    {tier.benefits && tier.benefits.length > 0 && (
                      <ul className="sp-tier-row-benefits">
                        {tier.benefits.map((b, i) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Become a Sponsor Modal (placeholder) ── */}
      {isBecomeASponsorModalOpen && (
        <div
          className="sp-modal-overlay"
          onClick={() => setIsBecomeASponsorModalOpen(false)}
        >
          <div className="sp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sp-modal-header">
              <h2>Become a Sponsor</h2>
              <button
                className="sp-modal-close"
                onClick={() => setIsBecomeASponsorModalOpen(false)}
                aria-label="Close"
                type="button"
              >
                ×
              </button>
            </div>
            <div className="sp-modal-body sp-modal-todo">
              <div className="sp-todo-badge">TODO</div>
              <p>
                Create a form here that allows interested sponsors to submit a
                request to the organizers. The form should collect contact
                information, desired tier, and any questions, then send the
                submission to the event organizers.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Admin Dialogs ── */}
      <TierDialog
        isOpen={isTierDialogOpen}
        onClose={handleTierDialogClose}
        tier={currentTier}
        onSave={handleSaveTier}
        onDelete={handleDeleteTier}
        isSaving={isSaving}
      />

      <SponsorDialog
        isOpen={isSponsorDialogOpen}
        onClose={() => setIsSponsorDialogOpen(false)}
        sponsor={currentSponsor}
        tier={currentTierForSponsor}
        onSave={handleSaveSponsor}
        onDelete={handleDeleteSponsor}
        isSaving={isSaving}
      />
    </div>
  );
}

export default SponsorsPage;
