"use client";

import { useState, useMemo } from "react";

export default function useMultiSelectFilters(tenders) {
  // Ensure tenders is an array
  const safeTenders = Array.isArray(tenders) ? tenders : [];

  const [filters, setFilters] = useState({
    category: [],
    department: [],
    province: [],
    advertisedDate: null,
    closingDate: null,
    awarded: null,
  });

  // Extract unique options for each filter
  const options = useMemo(() => {
    const categories = new Set();
    const departments = new Set();
    const provinces = new Set();

    safeTenders.forEach((tender) => {
      if (tender.category) categories.add(tender.category);
      if (tender.department) departments.add(tender.department);
      if (tender.province) provinces.add(tender.province);
    });

    return {
      category: Array.from(categories).sort(),
      department: Array.from(departments).sort(),
      province: Array.from(provinces).sort(),
    };
  }, [safeTenders]);

  // Apply filters to tenders
  const filteredTenders = useMemo(() => {
    return safeTenders.filter((tender) => {
      const categoryMatch =
        filters.category.length === 0 ||
        filters.category.includes(tender.category);
      const departmentMatch =
        filters.department.length === 0 ||
        filters.department.includes(tender.department);
      const provinceMatch =
        filters.province.length === 0 ||
        filters.province.includes(tender.province);

      const advertisedDateMatch = !filters.advertisedDate
        ? true
        : new Date(tender.advertised).toDateString() ===
          filters.advertisedDate.toDateString();

      const closingDateMatch = !filters.closingDate
        ? true
        : new Date(tender.closingDate).toDateString() ===
          filters.closingDate.toDateString();

      const awardedDateMatch = !filters.awarded
        ? true
        : new Date(tender.awarded).toDateString() ===
          filters.awarded.toDateString();

      return (
        categoryMatch &&
        departmentMatch &&
        provinceMatch &&
        advertisedDateMatch &&
        (tender.awarded ? awardedDateMatch : closingDateMatch)
      );
    });
  }, [safeTenders, filters]);

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  return {
    filters,
    options,
    filteredTenders,
    handleFilterChange,
  };
}
