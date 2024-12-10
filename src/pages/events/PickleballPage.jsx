// src/pages/events/PickleballPage.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useAPI } from "../../hooks/useAPI";
import {
   Container,
   Typography,
   Paper,
   Grid,
   TextField,
   Select,
   MenuItem,
   FormControl,
   InputLabel,
   Box,
   Button,
   IconButton,
   Dialog,
   DialogTitle,
   DialogContent,
   DialogActions,
   Table,
   TableBody,
   TableCell,
   TableContainer,
   TableHead,
   TableRow,
} from "@mui/material";
import {
   Edit as EditIcon,
   Delete as DeleteIcon,
   Add as AddIcon,
} from "@mui/icons-material";
import { format, parseISO } from "date-fns";

// Dialog component for editing event details
const EventEditDialog = ({ open, onClose, event, onSave }) => {
   const [editedEvent, setEditedEvent] = useState(event);

   useEffect(() => {
      setEditedEvent(event);
   }, [event]);

   const handleChange = (field, value) => {
      setEditedEvent((prev) => ({
         ...prev,
         [field]: value,
      }));
   };

   const handleSave = () => {
      onSave(editedEvent);
      onClose();
   };

   return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
         <DialogTitle>Edit Event Details</DialogTitle>
         <DialogContent>
            <Box
               sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}
            >
               <TextField
                  label="Title"
                  value={editedEvent?.title || ""}
                  onChange={(e) => handleChange("title", e.target.value)}
                  fullWidth
               />
               <TextField
                  label="Description"
                  value={editedEvent?.description || ""}
                  onChange={(e) => handleChange("description", e.target.value)}
                  multiline
                  rows={3}
                  fullWidth
               />
               <TextField
                  label="Location"
                  value={editedEvent?.location || ""}
                  onChange={(e) => handleChange("location", e.target.value)}
                  fullWidth
               />
            </Box>
         </DialogContent>
         <DialogActions>
            <Button onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave} variant="contained">
               Save Changes
            </Button>
         </DialogActions>
      </Dialog>
   );
};

// Dialog component for adding/editing segments
const SegmentEditDialog = ({ open, onClose, segment, onSave }) => {
   const [editedSegment, setEditedSegment] = useState(
      segment || {
         title: "",
         date: "",
         time: "",
         maxTeams: 16,
      }
   );

   useEffect(() => {
      setEditedSegment(
         segment || {
            title: "",
            date: "",
            time: "",
            maxTeams: 16,
         }
      );
   }, [segment]);

   const handleChange = (field, value) => {
      setEditedSegment((prev) => ({
         ...prev,
         [field]: value,
      }));
   };

   const handleSave = () => {
      onSave(editedSegment);
      onClose();
   };

   return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
         <DialogTitle>
            {segment ? "Edit Division" : "Add New Division"}
         </DialogTitle>
         <DialogContent>
            <Box
               sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}
            >
               <TextField
                  label="Division Title"
                  value={editedSegment.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  fullWidth
                  required
               />
               <TextField
                  label="Date"
                  type="date"
                  value={editedSegment.date}
                  onChange={(e) => handleChange("date", e.target.value)}
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
               />
               <TextField
                  label="Time"
                  type="time"
                  value={editedSegment.time}
                  onChange={(e) => handleChange("time", e.target.value)}
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
               />
               <TextField
                  label="Maximum Teams"
                  type="number"
                  value={editedSegment.maxTeams}
                  onChange={(e) =>
                     handleChange("maxTeams", parseInt(e.target.value))
                  }
                  fullWidth
                  required
               />
            </Box>
         </DialogContent>
         <DialogActions>
            <Button onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave} variant="contained">
               {segment ? "Save Changes" : "Add Division"}
            </Button>
         </DialogActions>
      </Dialog>
   );
};

const PickleballPage = () => {
   const { user } = useAuth();
   const {
      getEventByRegistrationId,
      updateEvent,
      addEventSegment,
      deleteEventSegment,
      getRegistrations,
      createRegistration,
      deleteRegistration,
   } = useAPI();

   const [event, setEvent] = useState(null);
   const [registrations, setRegistrations] = useState([]);
   const [eventDialogOpen, setEventDialogOpen] = useState(false);
   const [segmentDialogOpen, setSegmentDialogOpen] = useState(false);
   const [selectedSegment, setSelectedSegment] = useState(null);
   const [registrationData, setRegistrationData] = useState({
      players: ["", ""],
      email: "",
      phone: "",
      segmentId: "",
   });

   useEffect(() => {
      fetchEventData();
      fetchRegistrations();
   }, []);

   const fetchEventData = async () => {
      try {
         const response = await getEventByRegistrationId("pickleball");
         setEvent(response.event);
      } catch (error) {
         console.error("Failed to fetch event data:", error);
      }
   };

   const fetchRegistrations = async () => {
      try {
         const response = await getRegistrations("pickleball");
         setRegistrations(response.registrants || []);
      } catch (error) {
         console.error("Failed to fetch registrations:", error);
      }
   };

   const handleEventUpdate = async (updatedEvent) => {
      try {
         await updateEvent(event.id, updatedEvent);
         setEvent(updatedEvent);
      } catch (error) {
         console.error("Failed to update event:", error);
      }
   };

   const handleSegmentAdd = async (newSegment) => {
      try {
         const response = await addEventSegment(event.id, newSegment);
         setEvent((prev) => ({
            ...prev,
            segments: [...prev.segments, response.segment],
         }));
      } catch (error) {
         console.error("Failed to add segment:", error);
      }
   };

   const handleSegmentUpdate = async (updatedSegment) => {
      try {
         const updatedEvent = {
            ...event,
            segments: event.segments.map((s) =>
               s.id === updatedSegment.id ? updatedSegment : s
            ),
         };
         await updateEvent(event.id, updatedEvent);
         setEvent(updatedEvent);
      } catch (error) {
         console.error("Failed to update segment:", error);
      }
   };

   const handleSegmentDelete = async (segmentId) => {
      try {
         await deleteEventSegment(event.id, segmentId);
         setEvent((prev) => ({
            ...prev,
            segments: prev.segments.filter((s) => s.id !== segmentId),
         }));
      } catch (error) {
         console.error("Failed to delete segment:", error);
      }
   };

   const handleInputChange = (e) => {
      const { name, value } = e.target;
      if (name.startsWith("player")) {
         const index = parseInt(name.slice(-1)) - 1;
         const newPlayers = [...registrationData.players];
         newPlayers[index] = value;
         setRegistrationData((prev) => ({
            ...prev,
            players: newPlayers,
         }));
      } else {
         setRegistrationData((prev) => ({
            ...prev,
            [name]: value,
         }));
      }
   };

   const handleRegistrationSubmit = async (e) => {
      e.preventDefault();
      try {
         await createRegistration("pickleball", registrationData);
         setRegistrationData({
            players: ["", ""],
            email: "",
            phone: "",
            segmentId: "",
         });
         fetchRegistrations();
      } catch (error) {
         console.error("Failed to submit registration:", error);
      }
   };

   const handleRegistrationDelete = async (registrationId) => {
      try {
         await deleteRegistration("pickleball", registrationId);
         fetchRegistrations();
      } catch (error) {
         console.error("Failed to delete registration:", error);
      }
   };

   if (!event) return <Typography>Loading...</Typography>;

   return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
         <Box
            sx={{
               display: "flex",
               justifyContent: "space-between",
               alignItems: "center",
               mb: 4,
            }}
         >
            <Typography variant="h3">{event.title}</Typography>
            {user?.isAdmin && (
               <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={() => setEventDialogOpen(true)}
               >
                  Edit Event
               </Button>
            )}
         </Box>

         <Grid container spacing={4}>
            {/* Event Information */}
            <Grid item xs={12} md={6}>
               <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h5" gutterBottom>
                     Event Details
                  </Typography>
                  <Typography variant="body1" paragraph>
                     {event.description}
                  </Typography>
                  <Typography variant="body1" paragraph>
                     Location: {event.location}
                  </Typography>

                  <Box
                     sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mt: 3,
                        mb: 2,
                     }}
                  >
                     <Typography variant="h6">Divisions</Typography>
                     {user?.isAdmin && (
                        <Button
                           startIcon={<AddIcon />}
                           onClick={() => {
                              setSelectedSegment(null);
                              setSegmentDialogOpen(true);
                           }}
                        >
                           Add Division
                        </Button>
                     )}
                  </Box>

                  {event.segments.map((segment) => (
                     <Box key={segment.id} sx={{ mb: 2 }}>
                        <Box
                           sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                           }}
                        >
                           <Box>
                              <Typography variant="subtitle1">
                                 {segment.title}
                              </Typography>
                              <Typography variant="body2">
                                 {format(
                                    parseISO(segment.date),
                                    "MMMM d, yyyy"
                                 )}{" "}
                                 at{" "}
                                 {format(
                                    parseISO(`2024-01-01T${segment.time}`),
                                    "h:mm a"
                                 )}
                              </Typography>
                              <Typography
                                 variant="body2"
                                 color="text.secondary"
                              >
                                 Maximum Teams: {segment.maxTeams}
                              </Typography>
                           </Box>
                           {user?.isAdmin && (
                              <Box>
                                 <IconButton
                                    onClick={() => {
                                       setSelectedSegment(segment);
                                       setSegmentDialogOpen(true);
                                    }}
                                 >
                                    <EditIcon />
                                 </IconButton>
                                 <IconButton
                                    color="error"
                                    onClick={() =>
                                       handleSegmentDelete(segment.id)
                                    }
                                 >
                                    <DeleteIcon />
                                 </IconButton>
                              </Box>
                           )}
                        </Box>
                     </Box>
                  ))}
               </Paper>
            </Grid>

            {/* Registration Form */}
            <Grid item xs={12} md={6}>
               <Paper
                  component="form"
                  onSubmit={handleRegistrationSubmit}
                  sx={{ p: 3 }}
               >
                  <Typography variant="h5" gutterBottom>
                     Team Registration
                  </Typography>

                  <Grid container spacing={2}>
                     <Grid item xs={12}>
                        <FormControl fullWidth required>
                           <InputLabel>Division</InputLabel>
                           <Select
                              name="segmentId"
                              value={registrationData.segmentId}
                              onChange={handleInputChange}
                           >
                              {event.segments.map((segment) => (
                                 <MenuItem key={segment.id} value={segment.id}>
                                    {segment.title} -{" "}
                                    {format(parseISO(segment.date), "MMM d")} at{" "}
                                    {format(
                                       parseISO(`2024-01-01T${segment.time}`),
                                       "h:mm a"
                                    )}
                                 </MenuItem>
                              ))}
                           </Select>
                        </FormControl>
                     </Grid>

                     <Grid item xs={12}>
                        <TextField
                           fullWidth
                           label="Player 1 Name"
                           name="player1"
                           value={registrationData.players[0]}
                           onChange={handleInputChange}
                           required
                        />
                     </Grid>

                     <Grid item xs={12}>
                        <TextField
                           fullWidth
                           label="Player 2 Name"
                           name="player2"
                           value={registrationData.players[1]}
                           onChange={handleInputChange}
                           required
                        />
                     </Grid>

                     <Grid item xs={12}>
                        <TextField
                           fullWidth
                           type="email"
                           label="Email"
                           name="email"
                           value={registrationData.email}
                           onChange={handleInputChange}
                           required
                        />
                     </Grid>

                     <Grid item xs={12}>
                        <TextField
                           fullWidth
                           label="Phone"
                           name="phone"
                           value={registrationData.phone}
                           onChange={handleInputChange}
                           required
                        />
                     </Grid>

                     <Grid item xs={12}>
                        <Button
                           type="submit"
                           variant="contained"
                           fullWidth
                           size="large"
                        >
                           Register Team
                        </Button>
                     </Grid>
                  </Grid>
               </Paper>
            </Grid>

            {/* Admin Section */}
            {user?.isAdmin && (
               <Grid item xs={12}>
                  <Paper sx={{ p: 3 }}>
                     <Typography variant="h5" gutterBottom>
                        Registered Teams
                     </Typography>
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
                                          event.segments.find(
                                             (s) =>
                                                s.id === registration.segmentId
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
                                          color="error"
                                          onClick={() =>
                                             handleRegistrationDelete(
                                                registration.id
                                             )
                                          }
                                       >
                                          <DeleteIcon />
                                       </IconButton>
                                    </TableCell>
                                 </TableRow>
                              ))}
                           </TableBody>
                        </Table>
                     </TableContainer>

                     {/* Registration Counts */}
                     <Box sx={{ mt: 4 }}>
                        <Typography variant="h6" gutterBottom>
                           Registration Summary
                        </Typography>
                        {event.segments.map((segment) => {
                           const count = registrations.filter(
                              (r) => r.segmentId === segment.id
                           ).length;
                           return (
                              <Typography key={segment.id} variant="body1">
                                 {segment.title}: {count} / {segment.maxTeams}{" "}
                                 teams registered
                              </Typography>
                           );
                        })}
                     </Box>
                  </Paper>
               </Grid>
            )}
         </Grid>

         {/* Dialogs */}
         <EventEditDialog
            open={eventDialogOpen}
            onClose={() => setEventDialogOpen(false)}
            event={event}
            onSave={handleEventUpdate}
         />

         <SegmentEditDialog
            open={segmentDialogOpen}
            onClose={() => {
               setSegmentDialogOpen(false);
               setSelectedSegment(null);
            }}
            segment={selectedSegment}
            onSave={(segmentData) => {
               if (selectedSegment) {
                  handleSegmentUpdate(segmentData);
               } else {
                  handleSegmentAdd(segmentData);
               }
            }}
         />
      </Container>
   );
};

export default PickleballPage;
