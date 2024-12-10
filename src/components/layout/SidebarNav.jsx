// src/components/layout/SidebarNav.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
   Drawer,
   List,
   ListItem,
   ListItemIcon,
   ListItemText,
   ListItemButton,
   Divider,
   Box,
   IconButton,
   Typography,
   Button,
} from "@mui/material";
import {
   Menu,
   Event,
   CalendarMonth,
   Info,
   PhotoLibrary,
   ContactSupport,
   Store,
   Login,
   Logout,
   Group,
   Home,
} from "@mui/icons-material";
import { useAuth } from "../../context/AuthContext";

const SidebarNav = () => {
   const navigate = useNavigate();
   const { user, logout } = useAuth();
   const [isOpen, setIsOpen] = useState(false);

   const navigationItems = [
      { text: "Home", icon: <Home />, path: "/" },
      { text: "Events", icon: <Event />, path: "/events" },
      { text: "Calendar", icon: <CalendarMonth />, path: "/calendar" },
      { text: "About CFD", icon: <Info />, path: "/about" },
      { text: "Gallery", icon: <PhotoLibrary />, path: "/gallery" },
      { text: "Sponsors", icon: <Group />, path: "/sponsors" },
      { text: "Contact", icon: <ContactSupport />, path: "/contact" },
   ];

   const handleNavigation = (path) => {
      navigate(path);
      setIsOpen(false);
   };

   const handleLogout = () => {
      logout();
      setIsOpen(false);
      navigate("/");
   };

   return (
      <>
         <IconButton color="inherit" onClick={() => setIsOpen(true)}>
            <Menu />
         </IconButton>

         <Drawer anchor="left" open={isOpen} onClose={() => setIsOpen(false)}>
            <Box
               sx={{
                  width: 250,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
               }}
            >
               {/* Title */}
               <Box
                  sx={{ p: 2, display: "flex", alignItems: "center", gap: 2 }}
               >
                  <Store />
                  <Typography variant="h6">South Weber CFD</Typography>
               </Box>

               <Divider />

               {/* Navigation List */}
               <List sx={{ flexGrow: 1 }}>
                  {navigationItems.map((item) => (
                     <ListItem key={item.text} disablePadding>
                        <ListItemButton
                           onClick={() => handleNavigation(item.path)}
                        >
                           <ListItemIcon>{item.icon}</ListItemIcon>
                           <ListItemText primary={item.text} />
                        </ListItemButton>
                     </ListItem>
                  ))}
               </List>

               <Divider />

               {/* Login Button */}
               <Button
                  startIcon={user ? <Logout /> : <Login />}
                  onClick={
                     user ? handleLogout : () => handleNavigation("/login")
                  }
                  sx={{ justifyContent: "flex-start", color: "inherit" }}
               >
                  {user ? "Logout" : "Admin Login"}
               </Button>
            </Box>
         </Drawer>
      </>
   );
};

export default SidebarNav;
