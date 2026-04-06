// src/pages/SponsorsPage.jsx
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import useSponsors from "../hooks/useSponsors";
import TierDialog from "../components/sponsors/TierDialog";
import SponsorDialog from "../components/sponsors/SponsorDialog";
import { getImageUrl } from "../utils/imageUtils";
import "./styles/SponsorsPage.css";

function SponsorsPage() {
  const { isAuthenticated, hasRole } = useAuth();
  const {
    getTiers,
    createTier,
    updateTier,
    deleteTier,
    addSponsor,
    updateSponsor,
    deleteSponsor,
    uploadSponsorLogo,
    loading,
  } = useSponsors();

  const [isAdmin, setIsAdmin] = useState(false);
  const [tiers, setTiers] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  const [isTierDialogOpen, setIsTierDialogOpen] = useState(false);
  const [isSponsorDialogOpen, setIsSponsorDialogOpen] = useState(false);
  const [currentTier, setCurrentTier] = useState(null);
  const [currentSponsor, setCurrentSponsor] = useState(null);
  const [currentTierForSponsor, setCurrentTierForSponsor] = useState(null);

  useEffect(() => {
    if (isAuthenticated && hasRole) {
      setIsAdmin(hasRole("admin"));
    }
  }, [isAuthenticated, hasRole]);

  const fetchTiers = useCallback(async () => {
    const response = await getTiers();
    if (response && response.data) {
      setTiers(response.data);
    }
  }, [getTiers]);

  useEffect(() => {
    fetchTiers();
  }, [fetchTiers]);

  // Tier dialog handlers
  const openAddTier = () => {
    setCurrentTier(null);
    setIsTierDialogOpen(true);
  };

  const openEditTier = (tier) => {
    setCurrentTier(tier);
    setIsTierDialogOpen(true);
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
      setIsTierDialogOpen(false);
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
      setIsTierDialogOpen(false);
    } catch (err) {
      console.error("Failed to delete tier:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Sponsor dialog handlers
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
        // Editing existing sponsor
        await updateSponsor(currentSponsor._id, formData);
        sponsorId = currentSponsor._id;
      } else {
        // Adding new sponsor
        const result = await addSponsor(currentTierForSponsor._id, formData);
        sponsorId = result.data._id;
      }

      // Upload logo if a file was selected
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

  return (
    <div className="sponsors-container">
      {/* Page header */}
      <div className="sponsors-header">
        <div>
          <h1>Our Sponsors</h1>
          <p>
            Thank you to all who support Country Fair Days and make our
            community celebration possible.
          </p>
        </div>
        {isAdmin && (
          <button className="sponsors-add-tier-btn" onClick={openAddTier}>
            + Add Tier
          </button>
        )}
      </div>

      {/* Tier sections */}
      {tiers.map((tier, index) => (
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
                Level {index + 1}
              </div>
              <div>
                <h2 className="tier-name">{tier.name}</h2>
                {tier.contributionRange && (
                  <span className="tier-range">{tier.contributionRange}</span>
                )}
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

          {tier.benefits && tier.benefits.length > 0 && (
            <ul className="tier-benefits">
              {tier.benefits.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          )}

          {tier.description && (
            <p className="tier-description">{tier.description}</p>
          )}

          {/* Sponsors grid */}
          <div className="tier-sponsors">
            {tier.sponsors &&
              tier.sponsors.map((sponsor) => (
                <div className="sponsor-card" key={sponsor._id}>
                  {isAdmin && (
                    <button
                      className="sponsor-edit-btn"
                      onClick={() => openEditSponsor(sponsor, tier)}
                      type="button"
                    >
                      Edit
                    </button>
                  )}
                  {sponsor.logoUrl ? (
                    <img
                      src={getImageUrl(sponsor.logoUrl)}
                      alt={sponsor.name}
                      className="sponsor-logo"
                    />
                  ) : (
                    <div className="sponsor-name-badge">{sponsor.name}</div>
                  )}
                  {sponsor.website && (
                    <a
                      href={sponsor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="sponsor-website"
                    >
                      Visit
                    </a>
                  )}
                </div>
              ))}

            {isAdmin && (
              <button
                className="add-sponsor-btn"
                onClick={() => openAddSponsor(tier)}
                type="button"
              >
                + Add Sponsor
              </button>
            )}

            {!isAdmin &&
              (!tier.sponsors || tier.sponsors.length === 0) && (
                <p className="no-sponsors">
                  Sponsor opportunities available. Contact us to learn more.
                </p>
              )}
          </div>
        </div>
      ))}

      {tiers.length === 0 && !loading && (
        <div className="no-tiers">Loading sponsor tiers...</div>
      )}

      {/* Dialogs */}
      <TierDialog
        isOpen={isTierDialogOpen}
        onClose={() => setIsTierDialogOpen(false)}
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
