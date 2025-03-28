// src/components/events/RegistrationsTable.jsx
import { useState } from "react";
import { format, parseISO } from "date-fns";
import RegistrationDialog from "./RegistrationDialog";

const RegistrationsTable = ({
  registrations,
  segments,
  onUpdate,
  onDelete,
}) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState(null);

  const handleEditClick = (registration) => {
    setSelectedRegistration(registration);
    setEditDialogOpen(true);
  };

  const handleEditSubmit = (updatedData) => {
    onUpdate(selectedRegistration.id, updatedData);
  };

  return (
    <>
      <div className="registrations-table-container">
        <table className="table table-striped table-hover registrations-table">
          <thead>
            <tr>
              <th>Division</th>
              <th>Players</th>
              <th>Contact</th>
              <th>Registration Time</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {registrations.map((registration) => (
              <tr key={registration.id}>
                <td>
                  {segments.find((s) => s.id === registration.segmentId)?.title}
                </td>
                <td>{registration.players.join(" & ")}</td>
                <td>
                  <div>
                    <p className="mb-1">{registration.email}</p>
                    <p>{registration.phone}</p>
                  </div>
                </td>
                <td>
                  {registration.timestamp
                    ? format(parseISO(registration.timestamp), "MMM d, h:mm a")
                    : "N/A"}
                </td>
                <td>
                  <div className="registration-actions">
                    <button
                      className="btn btn-sm btn-primary btn-icon"
                      onClick={() => handleEditClick(registration)}
                    >
                      <span className="material-icons">edit</span>
                    </button>
                    <button
                      className="btn btn-sm btn-error btn-icon"
                      onClick={() => onDelete(registration.id)}
                    >
                      <span className="material-icons">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <RegistrationDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        onSubmit={handleEditSubmit}
        segments={segments}
        initialData={selectedRegistration}
        isEdit={true}
      />
    </>
  );
};

export default RegistrationsTable;
