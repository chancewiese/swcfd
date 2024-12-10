// src/pages/EventsPage.jsx
import { useState, useEffect } from "react";
import {
   Container,
   Typography,
   Paper,
   Grid,
   Card,
   CardContent,
   Button,
   Accordion,
   AccordionSummary,
   AccordionDetails,
   Box,
} from "@mui/material";
import { ExpandMore as ExpandMoreIcon } from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import { useAPI } from "../hooks/useAPI";

const EventsPage = () => {
   const { getPublishedEvents, loading, error } = useAPI();
   const [events, setEvents] = useState([]);

   useEffect(() => {
      const fetchEvents = async () => {
         try {
            const data = await getPublishedEvents();
            setEvents(data.events);
         } catch (err) {
            console.error("Failed to fetch events:", err);
         }
      };

      fetchEvents();
   }, [getPublishedEvents]);

   const renderEventCard = (event) => (
      <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
         <CardContent sx={{ flexGrow: 1 }}>
            <Typography variant="h6" gutterBottom>
               {event.title}
            </Typography>
            {!event.segments && (
               <Typography color="text.secondary" gutterBottom>
                  {event.date} at {event.time}
               </Typography>
            )}
            <Typography color="text.secondary" gutterBottom>
               {event.location}
            </Typography>
            <Typography variant="body2">{event.description}</Typography>

            {event.segments && (
               <Box sx={{ mt: 2 }}>
                  <Accordion>
                     <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>View Schedule</Typography>
                     </AccordionSummary>
                     <AccordionDetails>
                        {event.segments.map((segment) => (
                           <Box key={segment.id} sx={{ mb: 1 }}>
                              <Typography variant="subtitle2">
                                 {segment.title}
                              </Typography>
                              <Typography
                                 variant="body2"
                                 color="text.secondary"
                              >
                                 {segment.date} at {segment.time}
                              </Typography>
                           </Box>
                        ))}
                     </AccordionDetails>
                  </Accordion>
               </Box>
            )}

            <Button
               component={RouterLink}
               to={`/events/${event.registrationid}`}
               sx={{ mt: 2 }}
               variant="contained"
            >
               Event Details & Registration
            </Button>
         </CardContent>
      </Card>
   );

   if (loading) {
      return <div>Loading...</div>;
   }

   if (error) {
      return <div>Error: {error}</div>;
   }

   return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
         <Typography variant="h3" gutterBottom>
            Country Fair Days 2024 Events
         </Typography>

         <Grid container spacing={3}>
            {events.map((event) => (
               <Grid item xs={12} md={6} key={event.id}>
                  {renderEventCard(event)}
               </Grid>
            ))}
         </Grid>
      </Container>
   );
};

export default EventsPage;
