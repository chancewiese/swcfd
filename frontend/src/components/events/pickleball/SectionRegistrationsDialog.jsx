// src/components/events/pickleball/SectionRegistrationsDialog.jsx
import { useState, useEffect } from "react";
import useRegistration from "../../../hooks/useRegistration";
import "./PickleballDialog.css";
import "./SectionRegistrationsDialog.css";

const STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
};

const PAYMENT_LABELS = {
  unpaid: "Unpaid",
  paid: "Paid",
  refunded: "Refunded",
};

const SectionRegistrationsDialog = ({ isOpen, onClose, section }) => {
  const { getRegistrationsBySection, updateRegistration, cancelRegistration, loading } =
    useRegistration();

  const [registrations, setRegistrations] = useState([]);
  const [fetchError, setFetchError] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    if (isOpen && section?._id) {
      fetchRegistrations();
    }
  }, [isOpen, section?._id]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen && !actionLoading) onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, actionLoading, onClose]);

  const fetchRegistrations = async () => {
    setFetchError("");
    try {
      const res = await getRegistrationsBySection(section._id);
      setRegistrations(res?.data || []);
    } catch (err) {
      setFetchError("Failed to load registrations.");
    }
  };

  const handleUpdateStatus = async (regId, updates) => {
    setActionLoading(true);
    setActionError("");
    try {
      await updateRegistration(regId, updates);
      await fetchRegistrations();
      setEditingId(null);
    } catch (err) {
      setActionError(err.message || "Failed to update registration.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async (regId) => {
    if (!window.confirm("Cancel this registration?")) return;
    setActionLoading(true);
    setActionError("");
    try {
      await cancelRegistration(regId);
      await fetchRegistrations();
    } catch (err) {
      setActionError(err.message || "Failed to cancel registration.");
    } finally {
      setActionLoading(false);
    }
  };

  const startEdit = (reg) => {
    setEditingId(reg._id);
    setEditValues({
      status: reg.status,
      paymentStatus: reg.paymentStatus,
      notes: reg.notes || "",
    });
  };

  const filtered =
    statusFilter === "all"
      ? registrations
      : registrations.filter((r) => r.status === statusFilter);

  const counts = {
    all: registrations.length,
    pending: registrations.filter((r) => r.status === "pending").length,
    confirmed: registrations.filter((r) => r.status === "confirmed").length,
    cancelled: registrations.filter((r) => r.status === "cancelled").length,
  };

  const activeCount = registrations.filter((r) => r.status !== "cancelled").length;
  const capacity = section?.capacity || section?.maxTeams;

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="pickleball-dialog-overlay" onClick={onClose}>
      <div
        className="pickleball-dialog-content reg-manage-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="reg-manage-header">
          <div>
            <h2>Registrations — {section?.title}</h2>
            <p className="reg-manage-subtitle">
              {activeCount} registered
              {capacity ? ` / ${capacity} capacity` : ""}
            </p>
          </div>
          <button
            type="button"
            className="reg-manage-close"
            onClick={onClose}
            disabled={actionLoading}
          >
            ✕
          </button>
        </div>

        {fetchError && <div className="dialog-error">{fetchError}</div>}
        {actionError && <div className="dialog-error">{actionError}</div>}

        {/* Capacity bar */}
        {capacity && (
          <div className="reg-capacity-bar">
            <div
              className="reg-capacity-fill"
              style={{
                width: `${Math.min(100, (activeCount / capacity) * 100)}%`,
                backgroundColor: activeCount >= capacity ? "#d32f2f" : "var(--primary-color)",
              }}
            />
            <span className="reg-capacity-label">
              {activeCount}/{capacity} spots filled
            </span>
          </div>
        )}

        {/* Filter tabs */}
        <div className="reg-filter-tabs">
          {["all", "pending", "confirmed", "cancelled"].map((f) => (
            <button
              key={f}
              type="button"
              className={`reg-filter-tab ${statusFilter === f ? "active" : ""} ${f}`}
              onClick={() => setStatusFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}{" "}
              <span className="reg-filter-count">{counts[f]}</span>
            </button>
          ))}
        </div>

        {/* Registration list */}
        <div className="reg-list">
          {loading && (
            <div className="reg-list-loading">Loading registrations...</div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="reg-list-empty">
              {statusFilter === "all"
                ? "No registrations yet."
                : `No ${statusFilter} registrations.`}
            </div>
          )}

          {filtered.map((reg) => {
            const isExpanded = expandedId === reg._id;
            const isEditing = editingId === reg._id;

            return (
              <div key={reg._id} className={`reg-item ${reg.status}`}>
                <div
                  className="reg-item-header"
                  onClick={() =>
                    setExpandedId(isExpanded ? null : reg._id)
                  }
                >
                  <div className="reg-item-main">
                    <span className="reg-item-team">
                      {reg.teamName || "Unnamed Team"}
                    </span>
                    <span className="reg-item-family">
                      {reg.family?.name || reg.registeredBy?.lastName + " Family"}
                    </span>
                  </div>
                  <div className="reg-item-badges">
                    <span className={`reg-badge reg-badge-${reg.status}`}>
                      {STATUS_LABELS[reg.status]}
                    </span>
                    <span
                      className={`reg-badge reg-badge-payment-${reg.paymentStatus}`}
                    >
                      {PAYMENT_LABELS[reg.paymentStatus]}
                    </span>
                    <span className="reg-item-date">
                      {formatDate(reg.createdAt)}
                    </span>
                    <span className="reg-expand-icon">{isExpanded ? "▲" : "▼"}</span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="reg-item-body">
                    {isEditing ? (
                      <div className="reg-edit-form">
                        <div className="reg-edit-row">
                          <div className="reg-edit-group">
                            <label>Status</label>
                            <select
                              className="reg-edit-select"
                              value={editValues.status}
                              onChange={(e) =>
                                setEditValues({ ...editValues, status: e.target.value })
                              }
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                          <div className="reg-edit-group">
                            <label>Payment</label>
                            <select
                              className="reg-edit-select"
                              value={editValues.paymentStatus}
                              onChange={(e) =>
                                setEditValues({
                                  ...editValues,
                                  paymentStatus: e.target.value,
                                })
                              }
                            >
                              <option value="unpaid">Unpaid</option>
                              <option value="paid">Paid</option>
                              <option value="refunded">Refunded</option>
                            </select>
                          </div>
                        </div>
                        <div className="reg-edit-group">
                          <label>Notes</label>
                          <textarea
                            className="reg-edit-textarea"
                            value={editValues.notes}
                            onChange={(e) =>
                              setEditValues({ ...editValues, notes: e.target.value })
                            }
                            rows={2}
                            placeholder="Admin notes..."
                          />
                        </div>
                        <div className="reg-edit-actions">
                          <button
                            type="button"
                            className="reg-action-btn save"
                            onClick={() => handleUpdateStatus(reg._id, editValues)}
                            disabled={actionLoading}
                          >
                            {actionLoading ? "Saving..." : "Save"}
                          </button>
                          <button
                            type="button"
                            className="reg-action-btn cancel-edit"
                            onClick={() => setEditingId(null)}
                            disabled={actionLoading}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="reg-detail-grid">
                          <div className="reg-detail-item">
                            <span className="reg-detail-label">Registered by</span>
                            <span>
                              {reg.registeredBy?.firstName}{" "}
                              {reg.registeredBy?.lastName}
                            </span>
                          </div>
                          <div className="reg-detail-item">
                            <span className="reg-detail-label">Email</span>
                            <a href={`mailto:${reg.contactEmail}`}>
                              {reg.contactEmail}
                            </a>
                          </div>
                          {reg.contactPhone && (
                            <div className="reg-detail-item">
                              <span className="reg-detail-label">Phone</span>
                              <span>{reg.contactPhone}</span>
                            </div>
                          )}
                          <div className="reg-detail-item">
                            <span className="reg-detail-label">Submitted</span>
                            <span>{new Date(reg.createdAt).toLocaleString()}</span>
                          </div>
                        </div>

                        {reg.teamMembers?.length > 0 && (
                          <div className="reg-players-section">
                            <span className="reg-detail-label">Players</span>
                            <div className="reg-players-list">
                              {reg.teamMembers.map((tm, i) => (
                                <div key={i} className="reg-player-chip">
                                  {tm.familyMember
                                    ? `${tm.familyMember.firstName} ${tm.familyMember.lastName}`
                                    : `${tm.firstName} ${tm.lastName}`}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {reg.notes && (
                          <div className="reg-notes">
                            <span className="reg-detail-label">Notes: </span>
                            {reg.notes}
                          </div>
                        )}

                        <div className="reg-item-actions">
                          <button
                            type="button"
                            className="reg-action-btn confirm"
                            onClick={() =>
                              handleUpdateStatus(reg._id, {
                                status: "confirmed",
                                paymentStatus: "paid",
                              })
                            }
                            disabled={
                              actionLoading || reg.status === "confirmed"
                            }
                          >
                            ✓ Confirm & Mark Paid
                          </button>
                          <button
                            type="button"
                            className="reg-action-btn edit"
                            onClick={() => startEdit(reg)}
                            disabled={actionLoading}
                          >
                            Edit
                          </button>
                          {reg.status !== "cancelled" && (
                            <button
                              type="button"
                              className="reg-action-btn cancel"
                              onClick={() => handleCancel(reg._id)}
                              disabled={actionLoading}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="dialog-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={onClose}
            disabled={actionLoading}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SectionRegistrationsDialog;
