// State provided by useActiveFilters
// Context then provides for use throughout the app (we use it in ActiveTenderTable)

"use client";

import React, { createContext, useContext } from "react";
import { useActiveFilters } from "@/app/hooks/active/useActiveFilters";

const ActiveFiltersContext = createContext();

// Used in ActiveTenders
export const ActiveFiltersProvider = ({ children }) => {
  const filters = useActiveFilters();

  return (
    <ActiveFiltersContext.Provider value={filters}>
      {children}
    </ActiveFiltersContext.Provider>
  );
};

// Used in ActiveTenderTable
export const useActiveFiltersContext = () => {
  const context = useContext(ActiveFiltersContext);
  if (context === undefined) {
    throw new Error(
      "useActiveFiltersContext must be used within an ActiveFiltersProvider"
    );
  }
  return context;
};
