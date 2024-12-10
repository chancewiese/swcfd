// src/pages/CalendarPage.jsx
import { Container, Typography, Paper, Grid } from "@mui/material";

const CalendarPage = () => {
   return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
         <Typography variant="h3" gutterBottom>
            Event Calendar
         </Typography>
         <Paper sx={{ p: 3 }}>
            <Typography variant="body1">
               Calendar component will be implemented here
            </Typography>
         </Paper>
      </Container>
   );
};

export default CalendarPage;
