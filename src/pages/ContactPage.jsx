// src/pages/ContactPage.jsx
import {
   Container,
   Typography,
   Paper,
   Grid,
   TextField,
   Button,
} from "@mui/material";

const ContactPage = () => {
   return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
         <Typography variant="h3" gutterBottom>
            Contact Us
         </Typography>
         <Paper sx={{ p: 3 }}>
            <Grid container spacing={3}>
               <Grid item xs={12}>
                  <TextField fullWidth label="Name" />
               </Grid>
               <Grid item xs={12}>
                  <TextField fullWidth label="Email" />
               </Grid>
               <Grid item xs={12}>
                  <TextField fullWidth label="Message" multiline rows={4} />
               </Grid>
               <Grid item xs={12}>
                  <Button variant="contained">Send Message</Button>
               </Grid>
            </Grid>
         </Paper>
      </Container>
   );
};

export default ContactPage;
