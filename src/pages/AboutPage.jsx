// src/pages/AboutPage.jsx
import { Container, Typography, Paper, Grid, Box } from "@mui/material";

const AboutPage = () => {
   return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
         <Typography variant="h3" gutterBottom>
            About Country Fair Days
         </Typography>
         <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
               <Paper sx={{ p: 3 }}>
                  <Typography variant="h5" gutterBottom>
                     Our History
                  </Typography>
                  <Typography variant="body1">
                     Placeholder text about the history of Country Fair Days...
                  </Typography>
               </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
               <Paper sx={{ p: 3 }}>
                  <Typography variant="h5" gutterBottom>
                     Our Mission
                  </Typography>
                  <Typography variant="body1">
                     Placeholder text about the mission and values...
                  </Typography>
               </Paper>
            </Grid>
         </Grid>
      </Container>
   );
};

export default AboutPage;
