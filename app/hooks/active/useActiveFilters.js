// Used to extract state logic into a reducer

"use client";

import { useReducer } from "react";

const initialState = {
  categories: [],
  departments: [],
  provinces: [],
  advertisedDate: null,
  closingDate: null,
};

const filtersReducer = (state, action) => {
  switch (action.type) {
    case "SET_CATEGORIES":
      return { ...state, categories: action.payload };
    case "SET_DEPARTMENTS":
      return { ...state, departments: action.payload };
    case "SET_PROVINCES":
      return { ...state, provinces: action.payload };
    case "SET_ADVERTISED_DATE":
      return { ...state, advertisedDate: action.payload };
    case "SET_CLOSING_DATE":
      return { ...state, closingDate: action.payload };
    case "RESET_FILTERS":
      return initialState;
    default:
      return state;
  }
};

export const useActiveFilters = () => {
  const [filters, dispatch] = useReducer(filtersReducer, initialState);

  const setCategories = (categories) => {
    dispatch({ type: "SET_CATEGORIES", payload: categories });
  };

  const setDepartments = (departments) => {
    dispatch({ type: "SET_DEPARTMENTS", payload: departments });
  };

  const setProvinces = (provinces) => {
    dispatch({ type: "SET_PROVINCES", payload: provinces });
  };

  const setAdvertisedDate = (date) => {
    dispatch({ type: "SET_ADVERTISED_DATE", payload: date });
  };

  const setClosingDate = (date) => {
    dispatch({ type: "SET_CLOSING_DATE", payload: date });
  };

  const resetFilters = () => {
    dispatch({ type: "RESET_FILTERS" });
  };

  return {
    filters,
    setCategories,
    setDepartments,
    setProvinces,
    setAdvertisedDate,
    setClosingDate,
    resetFilters,
  };
};
