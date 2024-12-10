// src/pages/HomePage.jsx
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Stack,
  Paper,
} from "@mui/material";

const HomePage = () => {
  const upcomingEvents = [
    {
      title: "Community BBQ",
      date: "July 4th, 2024",
      description: "Annual community gathering",
    },
    {
      title: "Summer Festival",
      date: "August 15th, 2024",
      description: "Music and food celebration",
    },
    {
      title: "Fall Fair",
      date: "September 20th, 2024",
      description: "Family-friendly activities",
    },
  ];

  const features = [
    {
      title: "Community Events",
      description: "Join us for local gatherings and celebrations",
    },
    {
      title: "Recreation",
      description: "Explore outdoor activities and facilities",
    },
    {
      title: "Local News",
      description: "Stay updated with community announcements",
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Paper
        sx={{
          py: 8,
          mb: 4,
          bgcolor: "primary.main",
          color: "white",
          borderRadius: 0,
        }}
      >
        <Container maxWidth="md">
          <Stack spacing={3} alignItems="center" textAlign="center">
            <Typography variant="h2" component="h1">
              Welcome to South Weber
            </Typography>
            <Typography variant="h5">
              Your Gateway to Community Events and Recreation
            </Typography>
            <Button
              variant="contained"
              size="large"
              sx={{
                bgcolor: "white",
                color: "primary.main",
                "&:hover": {
                  bgcolor: "grey.100",
                },
              }}
            >
              Explore Events
            </Button>
          </Stack>
        </Container>
      </Paper>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Typography variant="h5" component="h2" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Upcoming Events Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Upcoming Events
        </Typography>
        <Grid container spacing={3}>
          {upcomingEvents.map((event, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {event.title}
                  </Typography>
                  <Typography color="text.secondary" gutterBottom>
                    {event.date}
                  </Typography>
                  <Typography variant="body2">{event.description}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Contact Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h4" component="h2" gutterBottom>
            Get Involved
          </Typography>
          <Typography gutterBottom>
            Join our community and stay updated with local events and
            activities.
          </Typography>
          <Button variant="contained" sx={{ mt: 2 }}>
            Contact Us
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default HomePage;
