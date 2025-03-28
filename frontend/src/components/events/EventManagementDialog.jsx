// src/components/events/EventManagementDialog.jsx
import { useState, useEffect } from "react";

const EventManagementDialog = ({
  open,
  onClose,
  event,
  onSave,
  onDeleteSegment,
  onClearRegistrants,
}) => {
  const [editedEvent, setEditedEvent] = useState(event);
  const [newSegment, setNewSegment] = useState({
    title: "",
    date: "",
    time: "",
    maxTeams: null,
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState(null);

  useEffect(() => {
    if (open) {
      setEditedEvent(event);
      setNewSegment({
        title: "",
        date: "",
        time: "",
        maxTeams: null,
      });
    }
  }, [open, event]);

  const handleClose = () => {
    setShowDeleteConfirm(false);
    setShowClearConfirm(false);
    setSelectedSegment(null);
    onClose();
  };

  const handleEventChange = (field, value) => {
    setEditedEvent((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSegmentChange = (segmentId, field, value) => {
    setEditedEvent((prev) => ({
      ...prev,
      segments: prev.segments.map((segment) =>
        segment.id === segmentId ? { ...segment, [field]: value } : segment
      ),
    }));
  };

  const handleAddSegment = () => {
    if (newSegment.title && newSegment.date && newSegment.time) {
      setEditedEvent((prev) => ({
        ...prev,
        segments: [
          ...prev.segments,
          { ...newSegment, id: `temp-${Date.now()}` },
        ],
      }));
      setNewSegment({
        title: "",
        date: "",
        time: "",
        maxTeams: null,
      });
    }
  };

  const handleDeleteConfirmation = (segment) => {
    setSelectedSegment(segment);
    setShowDeleteConfirm(true);
  };

  const handleClearConfirmation = (segment) => {
    setSelectedSegment(segment);
    setShowClearConfirm(true);
  };

  const handleSave = () => {
    onSave(editedEvent);
    onClose();
  };

  if (!open) return null;

  return (
    <>
      <div className="modal-backdrop visible">
        <div className="modal" style={{ maxWidth: "800px" }}>
          <div className="modal-header">
            <h3 className="modal-title">Manage Event</h3>
            <button className="modal-close" onClick={handleClose}>
              ×
            </button>
          </div>
          <div className="modal-body">
            <div className="flex flex-col gap-3 mt-2">
              {/* Event Details */}
              <h3>Event Details</h3>
              <div className="form-group">
                <label htmlFor="title" className="form-label">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  className="form-control"
                  value={editedEvent?.title || ""}
                  onChange={(e) => handleEventChange("title", e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="description" className="form-label">
                  Description
                </label>
                <textarea
                  id="description"
                  className="form-control"
                  value={editedEvent?.description || ""}
                  onChange={(e) =>
                    handleEventChange("description", e.target.value)
                  }
                  rows="3"
                  required
                ></textarea>
              </div>
              <div className="form-group">
                <label htmlFor="location" className="form-label">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  className="form-control"
                  value={editedEvent?.location || ""}
                  onChange={(e) =>
                    handleEventChange("location", e.target.value)
                  }
                  required
                />
              </div>

              {/* Segments Management */}
              <h3 className="mt-3">Divisions</h3>
              <ul className="list-unstyled">
                {editedEvent?.segments.map((segment) => (
                  <li key={segment.id} className="mb-4 p-3 border-bottom">
                    <div className="grid">
                      <div className="col-12 col-sm-6 mb-3">
                        <div className="form-group">
                          <label
                            htmlFor={`segment-title-${segment.id}`}
                            className="form-label"
                          >
                            Division Title
                          </label>
                          <input
                            type="text"
                            id={`segment-title-${segment.id}`}
                            className="form-control"
                            value={segment.title}
                            onChange={(e) =>
                              handleSegmentChange(
                                segment.id,
                                "title",
                                e.target.value
                              )
                            }
                            required
                          />
                        </div>
                      </div>
                      <div className="col-12 col-sm-6 mb-3">
                        <div className="form-group">
                          <label
                            htmlFor={`segment-maxTeams-${segment.id}`}
                            className="form-label"
                          >
                            Maximum Teams
                          </label>
                          <input
                            type="number"
                            id={`segment-maxTeams-${segment.id}`}
                            className="form-control"
                            value={segment.maxTeams || ""}
                            onChange={(e) =>
                              handleSegmentChange(
                                segment.id,
                                "maxTeams",
                                parseInt(e.target.value)
                              )
                            }
                          />
                        </div>
                      </div>
                      <div className="col-12 col-sm-6 mb-3">
                        <div className="form-group">
                          <label
                            htmlFor={`segment-date-${segment.id}`}
                            className="form-label"
                          >
                            Date
                          </label>
                          <input
                            type="date"
                            id={`segment-date-${segment.id}`}
                            className="form-control"
                            value={segment.date}
                            onChange={(e) =>
                              handleSegmentChange(
                                segment.id,
                                "date",
                                e.target.value
                              )
                            }
                            required
                          />
                        </div>
                      </div>
                      <div className="col-12 col-sm-6 mb-3">
                        <div className="form-group">
                          <label
                            htmlFor={`segment-time-${segment.id}`}
                            className="form-label"
                          >
                            Time
                          </label>
                          <input
                            type="time"
                            id={`segment-time-${segment.id}`}
                            className="form-control"
                            value={segment.time}
                            onChange={(e) =>
                              handleSegmentChange(
                                segment.id,
                                "time",
                                e.target.value
                              )
                            }
                            required
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-2">
                      <button
                        className="btn btn-warning btn-icon"
                        onClick={() => handleClearConfirmation(segment)}
                      >
                        <span className="icon-clear">🧹</span>
                        Clear Registrants
                      </button>
                      <button
                        className="btn btn-error btn-icon"
                        onClick={() => handleDeleteConfirmation(segment)}
                      >
                        <span className="icon-delete">🗑️</span>
                        Delete Division
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Add New Segment */}
              <h3>Add New Division</h3>
              <div className="grid">
                <div className="col-12 col-sm-6 mb-3">
                  <div className="form-group">
                    <label htmlFor="new-segment-title" className="form-label">
                      Division Title
                    </label>
                    <input
                      type="text"
                      id="new-segment-title"
                      className="form-control"
                      value={newSegment.title}
                      onChange={(e) =>
                        setNewSegment((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                </div>
                <div className="col-12 col-sm-6 mb-3">
                  <div className="form-group">
                    <label
                      htmlFor="new-segment-maxTeams"
                      className="form-label"
                    >
                      Maximum Teams
                    </label>
                    <input
                      type="number"
                      id="new-segment-maxTeams"
                      className="form-control"
                      value={newSegment.maxTeams || ""}
                      onChange={(e) =>
                        setNewSegment((prev) => ({
                          ...prev,
                          maxTeams: parseInt(e.target.value),
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="col-12 col-sm-6 mb-3">
                  <div className="form-group">
                    <label htmlFor="new-segment-date" className="form-label">
                      Date
                    </label>
                    <input
                      type="date"
                      id="new-segment-date"
                      className="form-control"
                      value={newSegment.date}
                      onChange={(e) =>
                        setNewSegment((prev) => ({
                          ...prev,
                          date: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                </div>
                <div className="col-12 col-sm-6 mb-3">
                  <div className="form-group">
                    <label htmlFor="new-segment-time" className="form-label">
                      Time
                    </label>
                    <input
                      type="time"
                      id="new-segment-time"
                      className="form-control"
                      value={newSegment.time}
                      onChange={(e) =>
                        setNewSegment((prev) => ({
                          ...prev,
                          time: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                </div>
                <div className="col-12">
                  <button
                    className="btn btn-outlined-primary btn-icon btn-full"
                    onClick={handleAddSegment}
                  >
                    <span className="icon-add">➕</span>
                    Add Division
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn" onClick={handleClose}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSave}>
              Save All Changes
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="modal-backdrop visible">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Confirm Delete</h3>
              <button
                className="modal-close"
                onClick={() => setShowDeleteConfirm(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to delete the {selectedSegment?.title}{" "}
                division? This will also remove all registrations for this
                division.
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-error"
                onClick={() => {
                  onDeleteSegment(selectedSegment.id);
                  setShowDeleteConfirm(false);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Registrants Confirmation Dialog */}
      {showClearConfirm && (
        <div className="modal-backdrop visible">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Confirm Clear Registrants</h3>
              <button
                className="modal-close"
                onClick={() => setShowClearConfirm(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to clear all registrants from the{" "}
                {selectedSegment?.title} division? This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn"
                onClick={() => setShowClearConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-warning"
                onClick={() => {
                  onClearRegistrants(selectedSegment.id);
                  setShowClearConfirm(false);
                }}
              >
                Clear Registrants
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EventManagementDialog;
