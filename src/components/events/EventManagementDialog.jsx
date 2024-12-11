// src/components/events/EventManagementDialog.jsx
import { useState, useEffect } from "react";
import {
   Typography,
   Grid,
   TextField,
   Box,
   Button,
   Dialog,
   DialogTitle,
   DialogContent,
   DialogContentText,
   DialogActions,
   List,
   ListItem,
} from "@mui/material";
import {
   Delete as DeleteIcon,
   Add as AddIcon,
   ClearAll as ClearAllIcon,
} from "@mui/icons-material";

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

   return (
      <>
         <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle>Manage Event</DialogTitle>
            <DialogContent>
               <Box
                  sx={{
                     display: "flex",
                     flexDirection: "column",
                     gap: 3,
                     mt: 2,
                  }}
               >
                  {/* Event Details */}
                  <Typography variant="h6">Event Details</Typography>
                  <TextField
                     label="Title"
                     value={editedEvent?.title || ""}
                     onChange={(e) =>
                        handleEventChange("title", e.target.value)
                     }
                     fullWidth
                     required
                  />
                  <TextField
                     label="Description"
                     value={editedEvent?.description || ""}
                     onChange={(e) =>
                        handleEventChange("description", e.target.value)
                     }
                     multiline
                     rows={3}
                     fullWidth
                     required
                  />
                  <TextField
                     label="Location"
                     value={editedEvent?.location || ""}
                     onChange={(e) =>
                        handleEventChange("location", e.target.value)
                     }
                     fullWidth
                     required
                  />

                  {/* Segments Management */}
                  <Typography variant="h6" sx={{ mt: 3 }}>
                     Divisions
                  </Typography>
                  <List>
                     {editedEvent?.segments.map((segment) => (
                        <ListItem key={segment.id} divider sx={{ mb: 2 }}>
                           <Box sx={{ width: "100%" }}>
                              <Grid container spacing={2}>
                                 <Grid item xs={12} sm={6}>
                                    <TextField
                                       label="Division Title"
                                       value={segment.title}
                                       onChange={(e) =>
                                          handleSegmentChange(
                                             segment.id,
                                             "title",
                                             e.target.value
                                          )
                                       }
                                       fullWidth
                                       required
                                    />
                                 </Grid>
                                 <Grid item xs={12} sm={6}>
                                    <TextField
                                       label="Maximum Teams"
                                       type="number"
                                       value={segment.maxTeams}
                                       onChange={(e) =>
                                          handleSegmentChange(
                                             segment.id,
                                             "maxTeams",
                                             parseInt(e.target.value)
                                          )
                                       }
                                       fullWidth
                                    />
                                 </Grid>
                                 <Grid item xs={12} sm={6}>
                                    <TextField
                                       label="Date"
                                       type="date"
                                       value={segment.date}
                                       onChange={(e) =>
                                          handleSegmentChange(
                                             segment.id,
                                             "date",
                                             e.target.value
                                          )
                                       }
                                       fullWidth
                                       InputLabelProps={{ shrink: true }}
                                       required
                                    />
                                 </Grid>
                                 <Grid item xs={12} sm={6}>
                                    <TextField
                                       label="Time"
                                       type="time"
                                       value={segment.time}
                                       onChange={(e) =>
                                          handleSegmentChange(
                                             segment.id,
                                             "time",
                                             e.target.value
                                          )
                                       }
                                       fullWidth
                                       InputLabelProps={{ shrink: true }}
                                       required
                                    />
                                 </Grid>
                              </Grid>
                              <Box
                                 sx={{
                                    mt: 1,
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    gap: 1,
                                 }}
                              >
                                 <Button
                                    startIcon={<ClearAllIcon />}
                                    onClick={() =>
                                       handleClearConfirmation(segment)
                                    }
                                    color="warning"
                                 >
                                    Clear Registrants
                                 </Button>
                                 <Button
                                    startIcon={<DeleteIcon />}
                                    onClick={() =>
                                       handleDeleteConfirmation(segment)
                                    }
                                    color="error"
                                 >
                                    Delete Division
                                 </Button>
                              </Box>
                           </Box>
                        </ListItem>
                     ))}
                  </List>

                  {/* Add New Segment */}
                  <Typography variant="h6">Add New Division</Typography>
                  <Grid container spacing={2}>
                     <Grid item xs={12} sm={6}>
                        <TextField
                           label="Division Title"
                           value={newSegment.title}
                           onChange={(e) =>
                              setNewSegment((prev) => ({
                                 ...prev,
                                 title: e.target.value,
                              }))
                           }
                           fullWidth
                           required
                        />
                     </Grid>
                     <Grid item xs={12} sm={6}>
                        <TextField
                           label="Maximum Teams"
                           type="number"
                           value={newSegment.maxTeams}
                           onChange={(e) =>
                              setNewSegment((prev) => ({
                                 ...prev,
                                 maxTeams: parseInt(e.target.value),
                              }))
                           }
                           fullWidth
                        />
                     </Grid>
                     <Grid item xs={12} sm={6}>
                        <TextField
                           label="Date"
                           type="date"
                           value={newSegment.date}
                           onChange={(e) =>
                              setNewSegment((prev) => ({
                                 ...prev,
                                 date: e.target.value,
                              }))
                           }
                           fullWidth
                           InputLabelProps={{ shrink: true }}
                           required
                        />
                     </Grid>
                     <Grid item xs={12} sm={6}>
                        <TextField
                           label="Time"
                           type="time"
                           value={newSegment.time}
                           onChange={(e) =>
                              setNewSegment((prev) => ({
                                 ...prev,
                                 time: e.target.value,
                              }))
                           }
                           fullWidth
                           InputLabelProps={{ shrink: true }}
                           required
                        />
                     </Grid>
                     <Grid item xs={12}>
                        <Button
                           variant="outlined"
                           startIcon={<AddIcon />}
                           onClick={handleAddSegment}
                           fullWidth
                        >
                           Add Division
                        </Button>
                     </Grid>
                  </Grid>
               </Box>
            </DialogContent>
            <DialogActions>
               <Button onClick={handleClose}>Cancel</Button>
               <Button onClick={handleSave} variant="contained">
                  Save All Changes
               </Button>
            </DialogActions>
         </Dialog>

         {/* Delete Confirmation Dialog */}
         <Dialog
            open={showDeleteConfirm}
            onClose={() => setShowDeleteConfirm(false)}
         >
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogContent>
               <DialogContentText>
                  Are you sure you want to delete the {selectedSegment?.title}{" "}
                  division? This will also remove all registrations for this
                  division.
               </DialogContentText>
            </DialogContent>
            <DialogActions>
               <Button onClick={() => setShowDeleteConfirm(false)}>
                  Cancel
               </Button>
               <Button
                  onClick={() => {
                     onDeleteSegment(selectedSegment.id);
                     setShowDeleteConfirm(false);
                  }}
                  color="error"
                  variant="contained"
               >
                  Delete
               </Button>
            </DialogActions>
         </Dialog>

         {/* Clear Registrants Confirmation Dialog */}
         <Dialog
            open={showClearConfirm}
            onClose={() => setShowClearConfirm(false)}
         >
            <DialogTitle>Confirm Clear Registrants</DialogTitle>
            <DialogContent>
               <DialogContentText>
                  Are you sure you want to clear all registrants from the{" "}
                  {selectedSegment?.title} division? This action cannot be
                  undone.
               </DialogContentText>
            </DialogContent>
            <DialogActions>
               <Button onClick={() => setShowClearConfirm(false)}>
                  Cancel
               </Button>
               <Button
                  onClick={() => {
                     onClearRegistrants(selectedSegment.id);
                     setShowClearConfirm(false);
                  }}
                  color="warning"
                  variant="contained"
               >
                  Clear Registrants
               </Button>
            </DialogActions>
         </Dialog>
      </>
   );
};

export default EventManagementDialog;
