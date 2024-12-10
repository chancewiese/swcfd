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
   IconButton,
   InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [showPassword, setShowPassword] = useState(false);
   const [error, setError] = useState("");
   const navigate = useNavigate();
   const { login } = useAuth();

   const handleSubmit = async (e) => {
      e.preventDefault();
      setError("");
      try {
         const result = await login(email, password);
         if (result.success) {
            navigate("/");
         } else {
            setError(result.error);
         }
      } catch (err) {
         setError("Failed to login. Please try again.");
      }
   };

   const handleTogglePassword = () => {
      setShowPassword(!showPassword);
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
                     type="email"
                     autoComplete="email"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     sx={{ mb: 2 }}
                  />
                  <TextField
                     fullWidth
                     label="Password"
                     name="password"
                     type={showPassword ? "text" : "password"}
                     autoComplete="current-password"
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     sx={{ mb: 3 }}
                     InputProps={{
                        endAdornment: (
                           <InputAdornment position="end">
                              <IconButton
                                 onClick={handleTogglePassword}
                                 edge="end"
                              >
                                 {showPassword ? (
                                    <VisibilityOff />
                                 ) : (
                                    <Visibility />
                                 )}
                              </IconButton>
                           </InputAdornment>
                        ),
                     }}
                  />
                  <Button
                     type="submit"
                     fullWidth
                     variant="contained"
                     size="large"
                  >
                     Sign In
                  </Button>
               </Box>
            </Paper>
         </Box>
      </Container>
   );
};

export default LoginPage;
