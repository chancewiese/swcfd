// src/pages/EventPage.jsx
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { format } from "date-fns";
import useEvents from "../hooks/useEvents";
import { getImageUrl, handleImageError } from "../utils/imageUtils";
import "./styles/EventPage.css";

// Material UI imports
import {
  Typography,
  Button,
  Container,
  Box,
  Paper,
  Grid,
  Chip,
  Divider,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import EventIcon from "@mui/icons-material/Event";

function EventPage() {
  const { slug } = useParams();
  const [event, setEvent] = useState(null);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const { getEvent, loading, error } = useEvents();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await getEvent(slug);
        setEvent(response.data);
      } catch (err) {
        console.error("Failed to fetch event:", err);
      }
    };

    if (slug) {
      fetchEvent();
    }
  }, [slug, getEvent]);

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

  // Format registration date
  const formatRegistrationDate = (date) => {
    if (!date) return "Registration date not set";
    return format(new Date(date), "MMMM d, yyyy");
  };

  // Change main image
  const handleThumbnailClick = (index) => {
    setMainImageIndex(index);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "center", my: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ my: 4 }}>
          Error loading event: {error}
        </Alert>
      </Container>
    );
  }

  if (!event) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning" sx={{ my: 4 }}>
          Event not found. The event may have been removed or the URL is
          incorrect.
        </Alert>
        <Button
          component={Link}
          to="/events"
          startIcon={<ArrowBackIcon />}
          variant="contained"
          sx={{ mt: 2 }}
        >
          Back to Events
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Navigation breadcrumb */}
      <Box sx={{ mb: 3, display: "flex", alignItems: "center" }}>
        <Button
          component={Link}
          to="/events"
          startIcon={<ArrowBackIcon />}
          variant="outlined"
          size="small"
        >
          Back to Events
        </Button>

        {event.isPublished ? (
          <Chip label="Published" color="success" size="small" sx={{ ml: 2 }} />
        ) : (
          <Chip
            label="Unpublished"
            color="warning"
            size="small"
            sx={{ ml: 2 }}
          />
        )}
      </Box>

      {/* Event Header */}
      <Typography
        variant="h3"
        component="h1"
        gutterBottom
        sx={{
          color: "primary.main",
          fontWeight: 600,
          mb: 3,
        }}
      >
        {event.title}
      </Typography>

      {/* Event Meta Information */}
      <Box sx={{ mb: 4, display: "flex", flexWrap: "wrap", gap: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <CalendarTodayIcon sx={{ mr: 1, color: "primary.main" }} />
          <Typography variant="h6">
            {formatEventDate(event.startDate, event.endDate)}
          </Typography>
        </Box>

        {event.location && (
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <LocationOnIcon sx={{ mr: 1, color: "primary.main" }} />
            <Typography variant="h6">{event.location}</Typography>
          </Box>
        )}
      </Box>

      {/* Main Content Grid */}
      <Grid container spacing={4}>
        {/* Left Column - Images and Description */}
        <Grid item xs={12} md={7}>
          {/* Main Image */}
          {event.imageGallery && event.imageGallery.length > 0 ? (
            <Box sx={{ mb: 3 }}>
              <Paper
                elevation={2}
                sx={{
                  borderRadius: 2,
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <Box
                  component="img"
                  src={getImageUrl(event.imageGallery[mainImageIndex].imageUrl)}
                  alt={event.imageGallery[mainImageIndex].name}
                  sx={{
                    width: "100%",
                    height: 400,
                    objectFit: "cover",
                    display: "block",
                  }}
                  onError={handleImageError}
                />

                {/* Image Attribution */}
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    width: "100%",
                    bgcolor: "rgba(0,0,0,0.6)",
                    color: "white",
                    p: 1,
                    px: 2,
                  }}
                >
                  <Typography variant="caption">
                    {event.imageGallery[mainImageIndex].name}
                  </Typography>
                </Box>
              </Paper>

              {/* Thumbnails */}
              {event.imageGallery.length > 1 && (
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    mt: 2,
                    overflowX: "auto",
                    pb: 1,
                  }}
                >
                  {event.imageGallery.map((image, index) => (
                    <Box
                      key={image._id || index}
                      component="img"
                      src={getImageUrl(image.imageUrl)}
                      alt={image.name}
                      onClick={() => handleThumbnailClick(index)}
                      sx={{
                        width: 80,
                        height: 60,
                        objectFit: "cover",
                        borderRadius: 1,
                        cursor: "pointer",
                        border:
                          index === mainImageIndex
                            ? "2px solid #1976d2"
                            : "2px solid transparent",
                        opacity: index === mainImageIndex ? 1 : 0.7,
                        transition: "all 0.2s",
                        "&:hover": {
                          opacity: 1,
                        },
                      }}
                      onError={handleImageError}
                    />
                  ))}
                </Box>
              )}
            </Box>
          ) : (
            <Paper
              elevation={1}
              sx={{
                height: 300,
                mb: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "grey.100",
              }}
            >
              <Typography variant="body1" color="text.secondary">
                No images available for this event
              </Typography>
            </Paper>
          )}

          {/* Description Section */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              gutterBottom
              sx={{
                fontWeight: 500,
                pb: 1,
                borderBottom: "2px solid #f0f0f0",
              }}
            >
              About This Event
            </Typography>

            <Typography
              variant="body1"
              sx={{
                lineHeight: 1.8,
                my: 2,
                color: "text.primary",
              }}
            >
              {event.description || "No description provided for this event."}
            </Typography>
          </Box>
        </Grid>

        {/* Right Column - Sections and Actions */}
        <Grid item xs={12} md={5}>
          {/* Admin Actions */}
          <Paper
            elevation={2}
            sx={{
              p: 3,
              mb: 4,
              borderRadius: 2,
              bgcolor: "primary.light",
              color: "white",
            }}
          >
            <Typography variant="h6" gutterBottom>
              Event Actions
            </Typography>

            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <Button
                component={Link}
                to={`/events/edit/${event.titleSlug}`}
                variant="contained"
                color="secondary"
                fullWidth
                startIcon={<EditIcon />}
                sx={{ bgcolor: "white", color: "primary.main" }}
              >
                Edit Event
              </Button>
            </Box>
          </Paper>

          {/* Event Sections */}
          {event.sections && event.sections.length > 0 ? (
            <Box>
              <Typography
                variant="h5"
                gutterBottom
                sx={{
                  fontWeight: 500,
                  pb: 1,
                  borderBottom: "2px solid #f0f0f0",
                }}
              >
                Event Sections
              </Typography>

              {event.sections.map((section) => (
                <Card
                  key={section._id}
                  elevation={2}
                  sx={{
                    mb: 3,
                    borderRadius: 2,
                    overflow: "visible",
                    border: "1px solid #f0f0f0",
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" color="primary.main" gutterBottom>
                      {section.title}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      {section.description}
                    </Typography>

                    <Divider sx={{ my: 2 }} />

                    <Grid container spacing={2}>
                      {section.capacity && (
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            Capacity
                          </Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {section.capacity} participants
                          </Typography>
                        </Grid>
                      )}

                      {section.registrationOpenDate && (
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            Registration Opens
                          </Typography>
                          <Typography
                            variant="body2"
                            fontWeight={500}
                            color="primary.main"
                          >
                            {formatRegistrationDate(
                              section.registrationOpenDate
                            )}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>

                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      startIcon={<HowToRegIcon />}
                      sx={{ mt: 3 }}
                    >
                      Register Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : (
            <Paper
              elevation={1}
              sx={{
                p: 3,
                borderRadius: 2,
                bgcolor: "grey.50",
              }}
            >
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ fontStyle: "italic" }}
              >
                No sections have been defined for this event.
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}

export default EventPage;
