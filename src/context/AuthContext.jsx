// src/context/AuthContext.jsx
import { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
   const [user, setUser] = useState(() => {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
   });

   const login = async (email, password) => {
      try {
         const response = await axios.get("http://localhost:3000/admin");
         const { admin } = response.data;

         if (email === admin.username && password === admin.password) {
            const userData = {
               email,
               isAdmin: true,
               timestamp: new Date().toISOString(),
            };
            setUser(userData);
            localStorage.setItem("user", JSON.stringify(userData));
            return { success: true };
         }
         return { success: false, error: "Invalid credentials" };
      } catch (error) {
         console.error("Login error:", error);
         return {
            success: false,
            error: "Failed to authenticate. Please try again.",
         };
      }
   };

   const logout = () => {
      setUser(null);
      localStorage.removeItem("user");
   };

   // Check session validity on mount and after inactivity
   useEffect(() => {
      const checkSession = () => {
         const userData = localStorage.getItem("user");
         if (userData) {
            const parsedUser = JSON.parse(userData);
            const loginTime = new Date(parsedUser.timestamp).getTime();
            const currentTime = new Date().getTime();
            const hoursPassed = (currentTime - loginTime) / (1000 * 60 * 60);

            // Log out if session is older than 24 hours
            if (hoursPassed > 24) {
               logout();
            }
         }
      };

      checkSession();
      const interval = setInterval(checkSession, 1000 * 60 * 5); // Check every 5 minutes

      return () => clearInterval(interval);
   }, []);

   return (
      <AuthContext.Provider value={{ user, login, logout }}>
         {children}
      </AuthContext.Provider>
   );
};

export const useAuth = () => {
   const context = useContext(AuthContext);
   if (context === undefined) {
      throw new Error("useAuth must be used within an AuthProvider");
   }
   return context;
};

export default AuthContext;
