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
   const { getPublishedEvents, getRegistrations, loading, error } = useAPI();
   const [eventsByDay, setEventsByDay] = useState({});
   const [registrationsByEvent, setRegistrationsByEvent] = useState({});

   useEffect(() => {
      const fetchData = async () => {
         try {
            const data = await getPublishedEvents();

            // Fetch registrations for each event
            const registrationsData = {};
            for (const event of data.events) {
               if (event.registrationId) {
                  const registrations = await getRegistrations(
                     event.registrationId
                  );
                  registrationsData[event.registrationId] =
                     registrations.registrants || [];
               }
            }
            setRegistrationsByEvent(registrationsData);

            // Group events by day (existing logic)
            const grouped = data.events.reduce((acc, event) => {
               if (event.segments) {
                  event.segments.forEach((segment) => {
                     const dayKey = format(parseISO(segment.date), "MMM d");
                     if (!acc[dayKey]) {
                        acc[dayKey] = [];
                     }

                     const existingEvent = acc[dayKey].find(
                        (e) => e.id === event.id
                     );

                     if (!existingEvent) {
                        const daySegments = event.segments.filter(
                           (s) => format(parseISO(s.date), "MMM d") === dayKey
                        );

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
                  const dayKey = format(parseISO(event.date), "MMM d");
                  if (!acc[dayKey]) {
                     acc[dayKey] = [];
                  }
                  acc[dayKey].push(event);
               }
               return acc;
            }, {});

            // Sort days (existing logic)
            const sortedGrouped = Object.fromEntries(
               Object.entries(grouped).sort((a, b) => {
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
                     return new Date(0);
                  };

                  const dateA = getDateFromDay(a[0]);
                  const dateB = getDateFromDay(b[0]);
                  return dateA.getTime() - dateB.getTime();
               })
            );

            setEventsByDay(sortedGrouped);
         } catch (err) {
            console.error("Failed to fetch data:", err);
         }
      };

      fetchData();
   }, [getPublishedEvents, getRegistrations]);

   const getRegistrationCount = (event, segmentId = null) => {
      const registrations = registrationsByEvent[event.registrationId] || [];
      if (segmentId) {
         return registrations.filter((r) => r.segmentId === segmentId).length;
      }
      return registrations.length;
   };

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
                        {/* Modified team count display */}
                        {` | Teams: ${getRegistrationCount(event, segment.id)}`}
                        {segment.maxTeams && ` / ${segment.maxTeams}`}
                        {/* Modified participant count display */}
                        {segment.maxParticipants &&
                           ` | Participants: ${getRegistrationCount(
                              event,
                              segment.id
                           )} / ${segment.maxParticipants}`}
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
                  {/* Modified participant count display for non-segmented events */}
                  {` | Participants: ${getRegistrationCount(event)}`}
                  {event.maxParticipants && ` / ${event.maxParticipants}`}
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
            Country Fair Days 2025 Events
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
