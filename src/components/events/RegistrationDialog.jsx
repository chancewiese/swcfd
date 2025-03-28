// src/components/events/RegistrationDialog.jsx
import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";

const defaultFormData = {
  players: ["", ""],
  email: "",
  phone: "",
  segmentId: "",
};

const RegistrationDialog = ({
  open,
  onClose,
  onSubmit,
  segments,
  initialData = null,
  isEdit = false,
}) => {
  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    if (open) {
      setFormData(initialData || defaultFormData);
    }
  }, [initialData, open]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("player")) {
      const index = parseInt(name.slice(-1)) - 1;
      const newPlayers = [...formData.players];
      newPlayers[index] = value;
      setFormData((prev) => ({
        ...prev,
        players: newPlayers,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="modal-backdrop visible">
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">
            {isEdit ? "Edit Registration" : "Team Registration"}
          </h3>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="grid">
              <div className="col-12 mb-3">
                <div className="form-group">
                  <label htmlFor="segmentId" className="form-label">
                    Division
                  </label>
                  <select
                    id="segmentId"
                    name="segmentId"
                    className="form-select"
                    value={formData?.segmentId || ""}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select a division</option>
                    {segments.map((segment) => (
                      <option key={segment.id} value={segment.id}>
                        {segment.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="col-12 mb-3">
                <div className="form-group">
                  <label htmlFor="player1" className="form-label">
                    Player 1 Name
                  </label>
                  <input
                    type="text"
                    id="player1"
                    name="player1"
                    className="form-control"
                    value={formData?.players?.[0] || ""}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="col-12 mb-3">
                <div className="form-group">
                  <label htmlFor="player2" className="form-label">
                    Player 2 Name
                  </label>
                  <input
                    type="text"
                    id="player2"
                    name="player2"
                    className="form-control"
                    value={formData?.players?.[1] || ""}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="col-12 mb-3">
                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-control"
                    value={formData?.email || ""}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="col-12 mb-3">
                <div className="form-group">
                  <label htmlFor="phone" className="form-label">
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="form-control"
                    value={formData?.phone || ""}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {isEdit ? "Save Changes" : "Register Team"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistrationDialog;
