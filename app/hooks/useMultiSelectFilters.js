"use client";

import { useState, useMemo } from "react";

export default function useMultiSelectFilters(tenders) {
  const [filters, setFilters] = useState({
    category: [],
    department: [],
    province: [],
    advertisedDate: null,
    closingDate: null,
  });

  // Get unique options for each filter
  const options = useMemo(() => {
    const categories = new Set();
    const departments = new Set();
    const provinces = new Set();

    tenders.forEach((tender) => {
      if (tender.category) categories.add(tender.category);
      if (tender.department) departments.add(tender.department);
      if (tender.province) provinces.add(tender.province);
    });

    return {
      category: Array.from(categories).sort(),
      department: Array.from(departments).sort(),
      province: Array.from(provinces).sort(),
    };
  }, [tenders]);

  // Filter the tenders based on selected options and date ranges
  const filteredTenders = useMemo(() => {
    return tenders.filter((tender) => {
      // Check multi-select filters
      const matchesMultiSelect = Object.entries(filters).every(
        ([key, selected]) => {
          if (key === "advertisedDate" || key === "closingDate") return true;
          if (selected.length === 0) return true;
          return selected.includes(tender[key]);
        }
      );

      // Check date range filters
      const matchesDateRanges = Object.entries(filters).every(
        ([key, dateRange]) => {
          if (key !== "advertisedDate" && key !== "closingDate") return true;
          if (!dateRange) return true;

          const tenderDate = new Date(tender[key]);
          return tenderDate >= dateRange.from && tenderDate <= dateRange.to;
        }
      );

      return matchesMultiSelect && matchesDateRanges;
    });
  }, [tenders, filters]);

  const handleFilterChange = (field, selected) => {
    setFilters((prev) => ({
      ...prev,
      [field]: selected,
    }));
  };

  return {
    filters,
    options,
    filteredTenders,
    handleFilterChange,
  };
}
