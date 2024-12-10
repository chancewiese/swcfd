// src/pages/LoginPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
   Container,
   Paper,
   TextField,
   Button,
   Typography,
   Alert,
   Box,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [error, setError] = useState("");
   const navigate = useNavigate();
   const { login } = useAuth();

   const handleSubmit = async (e) => {
      e.preventDefault();
      const result = await login(email, password);
      if (result.success) {
         navigate("/");
      } else {
         setError(result.error);
      }
   };

   return (
      <Container maxWidth="sm">
         <Box sx={{ mt: 8, mb: 4 }}>
            <Paper sx={{ p: 4 }}>
               <Typography variant="h5" align="center" sx={{ mb: 2 }}>
                  Admin Login
               </Typography>

               {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                     {error}
                  </Alert>
               )}

               <Box component="form" onSubmit={handleSubmit}>
                  <TextField
                     fullWidth
                     label="Email"
                     name="email"
                     autoComplete="email"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     sx={{ mb: 2 }}
                  />
                  <TextField
                     fullWidth
                     label="Password"
                     name="password"
                     type="password"
                     autoComplete="current-password"
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     sx={{ mb: 2 }}
                  />
                  <Button type="submit" fullWidth variant="contained">
                     Sign In
                  </Button>
               </Box>
            </Paper>
         </Box>
      </Container>
   );
};

export default LoginPage;
