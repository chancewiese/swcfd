// src/context/LayoutContext.jsx
import { createContext, useContext } from "react";

export const LayoutContext = createContext(null);

export function useLayout() {
  return useContext(LayoutContext);
}
