"use client";

import { useState, useMemo } from "react";

export default function useMultiSelectFilters(tenders) {
  const safeTenders = useMemo(
    () => (Array.isArray(tenders) ? tenders : []),
    [tenders]
  );

  const [filters, setFilters] = useState({
    category: [],
    department: [],
    province: [],
    advertised: null,
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

      // Simplified date comparison functions
      const compareDates = (tenderDate, filterDate) => {
        if (!tenderDate || !filterDate) return false;
        try {
          // Create dates using UTC to avoid timezone offset issues
          const tender = new Date(
            Date.UTC(
              new Date(tenderDate).getUTCFullYear(),
              new Date(tenderDate).getUTCMonth(),
              new Date(tenderDate).getUTCDate()
            )
          );

          const filter = new Date(
            Date.UTC(
              new Date(filterDate).getUTCFullYear(),
              new Date(filterDate).getUTCMonth(),
              new Date(filterDate).getUTCDate()
            )
          );

          console.log("Date comparison:", {
            tenderDate: tender.toISOString(),
            filterDate: filter.toISOString(),
            matches: tender.getTime() === filter.getTime(),
          });

          return tender.getTime() === filter.getTime();
        } catch (error) {
          console.error("Date comparison error:", error);
          return false;
        }
      };

      // Simplified date matching
      const advertisedMatch =
        !filters.advertised ||
        compareDates(tender.advertised, filters.advertised);
      const closingDateMatch =
        !filters.closingDate ||
        compareDates(tender.closingDate, filters.closingDate);
      const awardedMatch =
        !filters.awarded || compareDates(tender.awarded, filters.awarded);

      // Debug logging
      console.log("Tender:", {
        id: tender._id,
        advertised: tender.advertised,
        closingDate: tender.closingDate,
        awarded: tender.awarded,
        filterDates: {
          advertised: filters.advertised,
          closingDate: filters.closingDate,
          awarded: filters.awarded,
        },
        matches: {
          advertisedMatch,
          closingDateMatch,
          awardedMatch,
        },
      });

      return (
        categoryMatch &&
        departmentMatch &&
        provinceMatch &&
        advertisedMatch &&
        (tender.awarded !== undefined ? awardedMatch : closingDateMatch)
      );
    });
  }, [safeTenders, filters]);

  const handleFilterChange = (field, selected) => {
    if (
      field === "advertised" ||
      field === "closingDate" ||
      field === "awarded"
    ) {
      try {
        if (!selected) {
          console.log(`Clearing ${field} filter`);
          setFilters((prev) => ({ ...prev, [field]: null }));
          return;
        }

        // Create UTC date from selected date
        const dateValue = new Date(
          Date.UTC(
            selected.getFullYear(),
            selected.getMonth(),
            selected.getDate()
          )
        );

        console.log(`Setting ${field} filter to:`, dateValue.toISOString());
        setFilters((prev) => ({ ...prev, [field]: dateValue }));
      } catch (error) {
        console.error(`Error setting ${field} filter:`, error);
      }
      return;
    }

    // Handle MultiSelect values
    const selectedValues = Array.isArray(selected)
      ? selected.map((item) =>
          typeof item === "object" && item !== null ? item.value : item
        )
      : [];

    setFilters((prev) => ({ ...prev, [field]: selectedValues }));
  };

  return {
    filters,
    options,
    filteredTenders,
    handleFilterChange,
  };
}
