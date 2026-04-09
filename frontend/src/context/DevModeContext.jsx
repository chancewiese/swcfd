// src/context/DevModeContext.jsx
import { createContext, useContext, useState } from "react";

const DevModeContext = createContext();

export const useDevMode = () => useContext(DevModeContext);

export const DevModeProvider = ({ children }) => {
  const [devMode, setDevMode] = useState(() => {
    return localStorage.getItem("devMode") === "true";
  });

  const toggleDevMode = () => {
    setDevMode((prev) => {
      const next = !prev;
      localStorage.setItem("devMode", String(next));
      return next;
    });
  };

  return (
    <DevModeContext.Provider value={{ devMode, toggleDevMode }}>
      {children}
    </DevModeContext.Provider>
  );
};
