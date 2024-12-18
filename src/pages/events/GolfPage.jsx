// src/pages/events/GolfPage.jsx
import { useState, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useAPI } from "../../hooks/useAPI";
import EventManagementDialog from "../../components/events/EventManagementDialog";
import RegistrationDialog from "../../components/events/RegistrationDialog";
import RegistrationsTable from "../../components/events/RegistrationsTable";
import EventGallery from "../../components/events/EventGallery";
import { Container, Typography, Paper, Grid, Box, Button } from "@mui/material";
import { Edit as EditIcon } from "@mui/icons-material";
import { format, parseISO } from "date-fns";

const GolfPage = () => {
   const { user } = useAuth();
   const {
      getEventByRegistrationId,
      updateEvent,
      deleteEventSegment,
      getRegistrations,
      createRegistration,
      deleteRegistration,
      updateRegistration,
      getEventImages,
      uploadEventImage,
      deleteEventImage,
      reorderEventImages,
   } = useAPI();

   const [event, setEvent] = useState(null);
   const [registrations, setRegistrations] = useState([]);
   const [images, setImages] = useState([]);
   const [selectedSegment, setSelectedSegment] = useState(null);
   const [managementDialogOpen, setManagementDialogOpen] = useState(false);
   const [registrationDialogOpen, setRegistrationDialogOpen] = useState(false);

   useEffect(() => {
      fetchEventData();
      fetchRegistrations();
   }, []);

   useEffect(() => {
      if (event?.id) {
         fetchImages();
      }
   }, [event?.id]);

   const fetchEventData = async () => {
      try {
         const response = await getEventByRegistrationId("golf");
         setEvent(response.event);
      } catch (error) {
         console.error("Failed to fetch event data:", error);
      }
   };

   const fetchRegistrations = async () => {
      try {
         const response = await getRegistrations("golf");
         setRegistrations(response.registrants || []);
      } catch (error) {
         console.error("Failed to fetch registrations:", error);
      }
   };

   const fetchImages = async () => {
      try {
         const eventImages = await getEventImages(event.id);
         setImages(eventImages || []);
      } catch (error) {
         console.error("Failed to fetch images:", error);
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

   const handleClearRegistrants = async (segmentId) => {
      try {
         const segmentRegistrations = registrations.filter(
            (reg) => reg.segmentId === segmentId
         );

         for (const registration of segmentRegistrations) {
            await deleteRegistration("golf", registration.id);
         }

         fetchRegistrations();
      } catch (error) {
         console.error("Failed to clear registrants:", error);
      }
   };

   const handleRegistrationSubmit = async (registrationData) => {
      try {
         await createRegistration("golf", registrationData);
         fetchRegistrations();
      } catch (error) {
         console.error("Failed to submit registration:", error);
      }
   };

   const handleRegistrationUpdate = async (id, updatedData) => {
      try {
         await updateRegistration("golf", id, updatedData);
         fetchRegistrations();
      } catch (error) {
         console.error("Failed to update registration:", error);
      }
   };

   const handleRegistrationDelete = async (registrationId) => {
      try {
         await deleteRegistration("golf", registrationId);
         setRegistrations((prev) =>
            prev.filter((registration) => registration.id !== registrationId)
         );
      } catch (error) {
         console.error("Failed to delete registration:", error);
      }
   };

   const handleImageUpload = async (formData) => {
      try {
         const response = await uploadEventImage(event.id, formData);
         setImages((prev) => [...prev, response.image]);
      } catch (error) {
         console.error("Failed to upload image:", error);
         throw error;
      }
   };

   const handleImageDelete = async (imageId) => {
      try {
         await deleteEventImage(event.id, imageId);
         setImages((prev) => prev.filter((img) => img.id !== imageId));
      } catch (error) {
         console.error("Failed to delete image:", error);
      }
   };

   const handleReorderImages = async (imageIds) => {
      try {
         const updatedImages = await reorderEventImages(event.id, imageIds);
         setImages(updatedImages);
      } catch (error) {
         console.error("Failed to reorder images:", error);
      }
   };

   if (!event) return <Typography>Loading...</Typography>;

   const sortedSegments = [...event.segments].sort((a, b) => {
      const dateA = parseISO(`${a.date}T${a.time}`);
      const dateB = parseISO(`${b.date}T${b.time}`);
      return dateA.getTime() - dateB.getTime();
   });

   return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
         {/* Header Section */}
         <Box sx={{ mb: 6 }}>
            <Button
               component={RouterLink}
               to="/events"
               variant="outlined"
               sx={{ mb: 2 }}
            >
               ← Back to Events
            </Button>
            <Box
               sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
               }}
            >
               <Typography variant="h3">{event.title}</Typography>
               <Box sx={{ display: "flex", gap: 2 }}>
                  {user?.isAdmin && (
                     <Button
                        variant="contained"
                        startIcon={<EditIcon />}
                        onClick={() => setManagementDialogOpen(true)}
                     >
                        Manage Event
                     </Button>
                  )}
                  <Button
                     variant="contained"
                     color="primary"
                     onClick={() => setRegistrationDialogOpen(true)}
                  >
                     Register Now
                  </Button>
               </Box>
            </Box>
         </Box>

         <Grid container spacing={4}>
            {/* Event Information */}
            <Grid item xs={12}>
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

                  <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                     Divisions
                  </Typography>
                  <Grid container spacing={2}>
                     {sortedSegments.map((segment) => (
                        <Grid item xs={12} sm={6} lg={4} key={segment.id}>
                           <Box
                              sx={{
                                 height: "100%",
                                 display: "flex",
                                 flexDirection: "column",
                                 justifyContent: "space-between",
                                 p: 2,
                                 border: "1px solid",
                                 borderColor: "divider",
                                 borderRadius: 1,
                              }}
                           >
                              <Box>
                                 <Typography variant="subtitle1" gutterBottom>
                                    {segment.title}
                                 </Typography>
                                 <Typography variant="body2" gutterBottom>
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
                                    gutterBottom
                                 >
                                    Registered Teams:{" "}
                                    {
                                       registrations.filter(
                                          (r) => r.segmentId === segment.id
                                       ).length
                                    }{" "}
                                    {segment.maxTeams
                                       ? `/ ${segment.maxTeams}`
                                       : ""}
                                 </Typography>
                              </Box>
                              <Box sx={{ mt: 2 }}>
                                 <Button
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    onClick={() => {
                                       setSelectedSegment(segment);
                                       setRegistrationDialogOpen(true);
                                    }}
                                    disabled={
                                       segment.maxTeams &&
                                       registrations.filter(
                                          (r) => r.segmentId === segment.id
                                       ).length >= segment.maxTeams
                                    }
                                 >
                                    {segment.maxTeams &&
                                    registrations.filter(
                                       (r) => r.segmentId === segment.id
                                    ).length >= segment.maxTeams
                                       ? "Division Full"
                                       : "Register for this Division"}
                                 </Button>
                              </Box>
                           </Box>
                        </Grid>
                     ))}
                  </Grid>
               </Paper>
            </Grid>

            {/* Photo Gallery Section */}
            <Grid item xs={12}>
               <Paper sx={{ p: 3 }}>
                  <Typography variant="h5" gutterBottom>
                     Photo Gallery
                  </Typography>
                  <EventGallery
                     eventId={event.id}
                     images={images}
                     onUpload={handleImageUpload}
                     onDelete={handleImageDelete}
                     onReorder={handleReorderImages}
                  />
               </Paper>
            </Grid>

            {/* Admin Section */}
            {user?.isAdmin && (
               <Grid item xs={12}>
                  <Paper sx={{ p: 3 }}>
                     <Typography variant="h5" gutterBottom>
                        Registered Teams
                     </Typography>
                     <RegistrationsTable
                        registrations={registrations}
                        segments={event.segments}
                        onUpdate={handleRegistrationUpdate}
                        onDelete={handleRegistrationDelete}
                     />

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
                                 {segment.title}: {count}{" "}
                                 {segment.maxTeams
                                    ? `/ ${segment.maxTeams}`
                                    : ""}
                              </Typography>
                           );
                        })}
                     </Box>
                  </Paper>
               </Grid>
            )}
         </Grid>

         {/* Dialogs */}
         <RegistrationDialog
            open={registrationDialogOpen}
            onClose={() => {
               setRegistrationDialogOpen(false);
               setSelectedSegment(null);
            }}
            onSubmit={handleRegistrationSubmit}
            segments={event.segments}
            initialData={{
               players: ["", ""],
               email: "",
               phone: "",
               segmentId: selectedSegment?.id || "",
            }}
         />

         {event && (
            <EventManagementDialog
               open={managementDialogOpen}
               onClose={() => setManagementDialogOpen(false)}
               event={event}
               onSave={handleEventUpdate}
               onDeleteSegment={handleSegmentDelete}
               onClearRegistrants={handleClearRegistrants}
            />
         )}
      </Container>
   );
};

export default GolfPage;
