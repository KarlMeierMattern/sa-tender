"use client";

import React, { createContext, useContext } from "react";
import { useActiveFilters } from "@/app/hooks/active/useActiveFilters";

const ActiveFiltersContext = createContext();

export const ActiveFiltersProvider = ({ children }) => {
  const filters = useActiveFilters();

  return (
    <ActiveFiltersContext.Provider value={filters}>
      {children}
    </ActiveFiltersContext.Provider>
  );
};

export const useActiveFiltersContext = () => {
  const context = useContext(ActiveFiltersContext);
  if (context === undefined) {
    throw new Error(
      "useActiveFiltersContext must be used within an ActiveFiltersProvider"
    );
  }
  return context;
};
