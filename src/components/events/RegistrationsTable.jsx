// src/components/events/RegistrationsTable.jsx
import { useState } from "react";
import {
   Typography,
   Box,
   Table,
   TableBody,
   TableCell,
   TableContainer,
   TableHead,
   TableRow,
   IconButton,
   Paper,
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
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
         <TableContainer>
            <Table>
               <TableHead>
                  <TableRow>
                     <TableCell>Division</TableCell>
                     <TableCell>Players</TableCell>
                     <TableCell>Contact</TableCell>
                     <TableCell>Registration Time</TableCell>
                     <TableCell>Actions</TableCell>
                  </TableRow>
               </TableHead>
               <TableBody>
                  {registrations.map((registration) => (
                     <TableRow key={registration.id}>
                        <TableCell>
                           {
                              segments.find(
                                 (s) => s.id === registration.segmentId
                              )?.title
                           }
                        </TableCell>
                        <TableCell>
                           {registration.players.join(" & ")}
                        </TableCell>
                        <TableCell>
                           <Typography variant="body2">
                              {registration.email}
                           </Typography>
                           <Typography variant="body2">
                              {registration.phone}
                           </Typography>
                        </TableCell>
                        <TableCell>
                           {format(
                              parseISO(registration.timestamp),
                              "MMM d, h:mm a"
                           )}
                        </TableCell>
                        <TableCell>
                           <IconButton
                              color="primary"
                              onClick={() => handleEditClick(registration)}
                           >
                              <EditIcon />
                           </IconButton>
                           <IconButton
                              color="error"
                              onClick={() => onDelete(registration.id)}
                           >
                              <DeleteIcon />
                           </IconButton>
                        </TableCell>
                     </TableRow>
                  ))}
               </TableBody>
            </Table>
         </TableContainer>

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
