// src/pages/SponsorsPage.jsx
import {
   Container,
   Typography,
   Grid,
   Card,
   CardContent,
   Button,
} from "@mui/material";

const SponsorsPage = () => {
   const sponsors = [
      {
         name: "Local Business 1",
         level: "Gold",
         description: "Community supporter",
      },
      {
         name: "Local Business 2",
         level: "Silver",
         description: "Event sponsor",
      },
      {
         name: "Local Business 3",
         level: "Bronze",
         description: "Activity sponsor",
      },
   ];

   return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
         <Typography variant="h3" gutterBottom>
            Our Sponsors
         </Typography>
         <Grid container spacing={3}>
            {sponsors.map((sponsor, index) => (
               <Grid item xs={12} md={4} key={index}>
                  <Card>
                     <CardContent>
                        <Typography variant="h6">{sponsor.name}</Typography>
                        <Typography color="text.secondary">
                           {sponsor.level}
                        </Typography>
                        <Typography variant="body2">
                           {sponsor.description}
                        </Typography>
                     </CardContent>
                  </Card>
               </Grid>
            ))}
         </Grid>
      </Container>
   );
};

export default SponsorsPage;
