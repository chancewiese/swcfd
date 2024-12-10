// src/pages/GalleryPage.jsx
import { Container, Typography, Grid, Card, CardMedia } from "@mui/material";

const GalleryPage = () => {
   const images = Array(6).fill("/api/placeholder/400/300"); // Placeholder images

   return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
         <Typography variant="h3" gutterBottom>
            Photo Gallery
         </Typography>
         <Grid container spacing={3}>
            {images.map((image, index) => (
               <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card>
                     <CardMedia
                        component="img"
                        height="200"
                        image={image}
                        alt={`Gallery image ${index + 1}`}
                     />
                  </Card>
               </Grid>
            ))}
         </Grid>
      </Container>
   );
};

export default GalleryPage;
