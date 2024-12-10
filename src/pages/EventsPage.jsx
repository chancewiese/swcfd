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
   Box,
   Divider,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useAPI } from "../hooks/useAPI";
import { format, parseISO } from "date-fns";

const EventsPage = () => {
   const { getPublishedEvents, loading, error } = useAPI();
   const [eventsByDay, setEventsByDay] = useState({});

   useEffect(() => {
      const fetchEvents = async () => {
         try {
            const data = await getPublishedEvents();

            // Group events by day
            const grouped = data.events.reduce((acc, event) => {
               if (event.segments) {
                  // For events with segments, add to each day they occur on
                  event.segments.forEach((segment) => {
                     const dayKey = format(parseISO(segment.date), "MMM d");
                     if (!acc[dayKey]) {
                        acc[dayKey] = [];
                     }

                     // Check if event already exists for this day
                     const existingEvent = acc[dayKey].find(
                        (e) => e.id === event.id
                     );

                     if (!existingEvent) {
                        // Get all segments for this day
                        const daySegments = event.segments.filter(
                           (s) => format(parseISO(s.date), "MMM d") === dayKey
                        );

                        // Get unique days excluding current day
                        const otherDays = [
                           ...new Set(
                              event.segments
                                 .filter(
                                    (s) =>
                                       format(parseISO(s.date), "MMM d") !==
                                       dayKey
                                 )
                                 .map((s) => format(parseISO(s.date), "MMM d"))
                           ),
                        ];

                        acc[dayKey].push({
                           ...event,
                           daySegments,
                           otherDays,
                        });
                     }
                  });
               } else {
                  // Single-day event
                  const dayKey = format(parseISO(event.date), "MMM d");
                  if (!acc[dayKey]) {
                     acc[dayKey] = [];
                  }
                  acc[dayKey].push(event);
               }
               return acc;
            }, {});

            // Sort days by date
            const sortedGrouped = Object.fromEntries(
               Object.entries(grouped).sort((a, b) => {
                  // Find an event for each day to get the date
                  const getDateFromDay = (dayKey) => {
                     const event = data.events.find((e) => {
                        if (e.segments) {
                           return e.segments.some(
                              (s) =>
                                 format(parseISO(s.date), "MMM d") === dayKey
                           );
                        }
                        return format(parseISO(e.date), "MMM d") === dayKey;
                     });

                     if (event) {
                        if (event.segments) {
                           return parseISO(event.segments[0].date);
                        }
                        return parseISO(event.date);
                     }
                     return new Date(0); // fallback date if not found
                  };

                  const dateA = getDateFromDay(a[0]);
                  const dateB = getDateFromDay(b[0]);
                  return dateA.getTime() - dateB.getTime();
               })
            );

            setEventsByDay(sortedGrouped);
         } catch (err) {
            console.error("Failed to fetch events:", err);
         }
      };

      fetchEvents();
   }, [getPublishedEvents]);

   const renderEventCard = (event, currentDay) => (
      <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
         <CardContent sx={{ flexGrow: 1 }}>
            <Typography variant="h6" gutterBottom>
               {event.title}
            </Typography>

            <Typography color="text.secondary" gutterBottom>
               {event.location}
            </Typography>

            <Typography variant="body2" sx={{ mb: 2 }}>
               {event.description}
            </Typography>

            {event.daySegments ? (
               <Box>
                  {event.daySegments.map((segment) => (
                     <Typography
                        key={segment.id}
                        variant="body2"
                        sx={{ mb: 1 }}
                     >
                        {segment.title} |{" "}
                        {format(
                           parseISO(`2024-01-01T${segment.time}`),
                           "h:mm a"
                        )}
                        {segment.maxTeams &&
                           ` | Max Teams: ${segment.maxTeams}`}
                        {segment.maxParticipants &&
                           ` | Max Participants: ${segment.maxParticipants}`}
                     </Typography>
                  ))}

                  {event.otherDays && event.otherDays.length > 0 && (
                     <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 1 }}
                     >
                        Also on: {event.otherDays.join(", ")}
                     </Typography>
                  )}
               </Box>
            ) : (
               <Typography variant="body2">
                  {format(parseISO(`2024-01-01T${event.time}`), "h:mm a")}
                  {event.maxParticipants &&
                     ` | Max Participants: ${event.maxParticipants}`}
               </Typography>
            )}

            <Button
               component={RouterLink}
               to={`/events/${event.registrationId}`}
               variant="contained"
               fullWidth
               sx={{ mt: 2 }}
            >
               Event Details & Registration
            </Button>
         </CardContent>
      </Card>
   );

   if (loading) {
      return (
         <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Typography>Loading...</Typography>
         </Container>
      );
   }

   if (error) {
      return (
         <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Typography color="error">Error: {error}</Typography>
         </Container>
      );
   }

   return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
         <Typography variant="h3" gutterBottom>
            Country Fair Days 2024 Events
         </Typography>

         {Object.entries(eventsByDay).map(([day, events]) => (
            <Paper key={day} sx={{ mb: 4, p: 3 }}>
               <Typography variant="h4" gutterBottom>
                  {day}
               </Typography>
               <Divider sx={{ mb: 3 }} />

               <Grid container spacing={3}>
                  {events.map((event) => (
                     <Grid item xs={12} md={6} key={event.id}>
                        {renderEventCard(event, day)}
                     </Grid>
                  ))}
               </Grid>
            </Paper>
         ))}
      </Container>
   );
};

export default EventsPage;
