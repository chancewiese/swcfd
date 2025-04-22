// src/pages/EventsPage.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import useEvents from "../hooks/useEvents";
import AddEventDialog from "../components/AddEventDialog";

// Material UI imports
import {
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Grid,
  Container,
  Box,
  Chip,
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import VisibilityIcon from "@mui/icons-material/Visibility";

function EventsPage() {
  const [events, setEvents] = useState([]);
  const { getEvents, loading, error } = useEvents();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await getEvents();
        setEvents(response.data || []);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      }
    };

    fetchEvents();
  }, [getEvents]);

  // Format date for display
  const formatEventDate = (startDate, endDate) => {
    if (!startDate || !endDate) return "Date not set";

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start.toDateString() === end.toDateString()) {
      return format(start, "MMMM d, yyyy");
    }

    if (
      start.getMonth() === end.getMonth() &&
      start.getFullYear() === end.getFullYear()
    ) {
      return `${format(start, "MMMM d")}-${format(end, "d, yyyy")}`;
    }

    return `${format(start, "MMMM d, yyyy")} - ${format(end, "MMMM d, yyyy")}`;
  };

  // Separate published and unpublished events
  const publishedEvents = events.filter((event) => event.isPublished);
  const unpublishedEvents = events.filter((event) => !event.isPublished);

  // Event card component for DRY code
  const EventCard = ({ event }) => (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        border: event.isPublished ? "none" : "1px dashed #ccc",
        opacity: event.isPublished ? 1 : 0.85,
        transition: "transform 0.3s, box-shadow 0.3s",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
        },
      }}
    >
      <CardMedia
        component="img"
        height="200"
        image={
          event.imageGallery && event.imageGallery.length > 0
            ? event.imageGallery[0].imageUrl
            : "/api/placeholder/300/200"
        }
        alt={
          event.imageGallery && event.imageGallery.length > 0
            ? event.imageGallery[0].name
            : event.title
        }
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          {event.title}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <CalendarTodayIcon
            fontSize="small"
            sx={{ mr: 1, color: "text.secondary" }}
          />
          <Typography variant="body2" color="text.secondary">
            {formatEventDate(event.startDate, event.endDate)}
          </Typography>
        </Box>

        {event.location && (
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <LocationOnIcon
              fontSize="small"
              sx={{ mr: 1, color: "text.secondary" }}
            />
            <Typography variant="body2" color="text.secondary">
              {event.location}
            </Typography>
          </Box>
        )}

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          {event.description && event.description.length > 150
            ? `${event.description.substring(0, 150)}...`
            : event.description}
        </Typography>
      </CardContent>

      <CardActions sx={{ p: 2 }}>
        <Button
          component={Link}
          to={`/events/${event.titleSlug}`}
          variant="contained"
          size="small"
          startIcon={<VisibilityIcon />}
        >
          View
        </Button>
        <Button
          component={Link}
          to={`/events/edit/${event.titleSlug}`}
          variant="outlined"
          color="success"
          size="small"
          startIcon={<EditIcon />}
          sx={{ ml: 1 }}
        >
          Edit
        </Button>
      </CardActions>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography variant="h4" component="h1">
          Events
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setIsDialogOpen(true)}
        >
          Add New Event
        </Button>
      </Box>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ my: 2 }}>
          Error loading events: {error}
        </Alert>
      )}

      {!loading && !error && events.length === 0 && (
        <Alert severity="info" sx={{ my: 2 }}>
          No events found.
        </Alert>
      )}

      {/* Published Events Section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Published Events
        </Typography>
        <Divider sx={{ mb: 3 }} />

        {publishedEvents.length === 0 ? (
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ fontStyle: "italic" }}
          >
            No published events at this time.
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {publishedEvents.map((event) => (
              <Grid item xs={12} sm={6} md={4} key={event.titleSlug}>
                <EventCard event={event} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Unpublished Events Section */}
      <Box>
        <Typography variant="h5" component="h2" gutterBottom>
          Unpublished Events
        </Typography>
        <Divider sx={{ mb: 3 }} />

        {unpublishedEvents.length === 0 ? (
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ fontStyle: "italic" }}
          >
            No unpublished events at this time.
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {unpublishedEvents.map((event) => (
              <Grid item xs={12} sm={6} md={4} key={event.titleSlug}>
                <EventCard event={event} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      <AddEventDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </Container>
  );
}

export default EventsPage;
