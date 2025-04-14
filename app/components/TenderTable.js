"use client";

import React, { useState, useMemo } from "react";
import MultiSelect from "./ui/multi-select";
import { Calendar } from "@/components/ui/calendar";
import useMultiSelectFilters from "../hooks/useMultiSelectFilters";
import useTenderFilters from "../stores/useTenderFilters";
import {
  Table,
  TableCaption,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import Pagination from "./Pagination";

export default function TenderTable({
  initialTenders,
  allTenders, // Full dataset for filtering
  pagination,
  isAwarded = false,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentPage, setCurrentPage] = useState(pagination.currentPage);

  // Your existing filter hooks
  const {
    filters: multiSelectFilters,
    options,
    handleFilterChange,
  } = useMultiSelectFilters(allTenders); // Use full dataset for filters

  const { filters: textFilters, setFilter } = useTenderFilters();

  // Apply filters to full dataset
  const filteredTenders = useMemo(() => {
    return allTenders.filter((tender) => {
      // Apply multiselect filters
      const multiSelectMatch = Object.entries(multiSelectFilters).every(
        ([field, selected]) => {
          // Date field handling
          if (
            field === "advertised" ||
            field === "closingDate" ||
            field === "awarded"
          ) {
            if (!selected) return true;

            // Map the filter field names to tender field names
            const tenderFieldMap = {
              advertised: "advertised",
              closingDate: "closingDate",
              awarded: "awarded",
            };

            const tenderField = tenderFieldMap[field];
            const tenderDate = tender[tenderField];

            if (!tenderDate) return false;

            // Add debug logging
            console.log("Date comparison:", {
              field,
              tenderField,
              tenderDate,
              selectedDate: selected,
              tenderDateISO: new Date(tenderDate).toISOString().split("T")[0],
              selectedDateISO: selected.toISOString().split("T")[0],
            });

            return (
              new Date(tenderDate).toISOString().split("T")[0] ===
              selected.toISOString().split("T")[0]
            );
          }

          // Handle empty or undefined selections
          if (!selected || (Array.isArray(selected) && selected.length === 0)) {
            return true;
          }

          // Handle array of objects from MultiSelect
          if (Array.isArray(selected)) {
            const selectedValues = selected.map((item) =>
              typeof item === "object" && item !== null ? item.value : item
            );
            return selectedValues.includes(tender[field]);
          }

          return selected === tender[field];
        }
      );

      // Apply text filters
      const textMatch = Object.entries(textFilters).every(([field, value]) => {
        if (!value) return true;
        return String(tender[field] || "")
          .toLowerCase()
          .includes(value.toLowerCase());
      });

      return multiSelectMatch && textMatch;
    });
  }, [allTenders, multiSelectFilters, textFilters]);

  // Get current page data
  const currentPageData = useMemo(() => {
    const start = (currentPage - 1) * pagination.perPage;
    return filteredTenders.slice(start, start + pagination.perPage);
  }, [filteredTenders, currentPage, pagination.perPage]);

  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);

    // Create new URLSearchParams
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());

    // Update URL without full page reload
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleTextFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(name, value);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date)) return dateString;
    return date.toLocaleDateString("en-ZA");
  };

  const formatCurrency = (amount) => {
    if (!amount) return "";
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
    }).format(amount);
  };

  const advertizedColumns = [
    { key: "category", label: "Category" },
    { key: "department", label: "Department" },
    { key: "province", label: "Province" },
    { key: "description", label: "Description" },
    { key: "closing", label: "Closing" },
    { key: "advertised", label: "Advertised" },
    { key: "tenderNumber", label: "Tender Number" },
    { key: "closingDate", label: "Closing Date" },
    { key: "tenderType", label: "Type" },
    { key: "placeServicesRequired", label: "Location" },
  ];

  const awardedColumns = [
    { key: "category", label: "Category" },
    { key: "department", label: "Department" },
    { key: "province", label: "Province" },
    { key: "description", label: "Description" },
    { key: "tenderNumber", label: "Tender Number" },
    { key: "advertised", label: "Advertised" },
    { key: "awarded", label: "Awarded" },
    { key: "successfulBidderName", label: "Successful Bidder" },
    { key: "successfulBidderAmount", label: "Award Amount" },
  ];

  const columns = isAwarded ? awardedColumns : advertizedColumns;

  return (
    <>
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex flex-row justify-center-safe gap-4">
          <MultiSelect
            label="Category"
            options={options.category}
            selected={multiSelectFilters.category}
            onSelect={(selected) => handleFilterChange("category", selected)}
            placeholder="Filter by category"
          />
          <MultiSelect
            label="Department"
            options={options.department}
            selected={multiSelectFilters.department}
            onSelect={(selected) => handleFilterChange("department", selected)}
            placeholder="Filter by department"
          />
          <MultiSelect
            label="Province"
            options={options.province}
            selected={multiSelectFilters.province}
            onSelect={(selected) => handleFilterChange("province", selected)}
            placeholder="Filter by province"
          />
        </div>
        <div className="flex flex-row justify-center-safe gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !multiSelectFilters.advertised && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {multiSelectFilters.advertised ? (
                  format(multiSelectFilters.advertised, "PPP")
                ) : (
                  <span>Filter by advertised date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={multiSelectFilters.advertised}
                onSelect={(date) => handleFilterChange("advertised", date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !multiSelectFilters[isAwarded ? "awarded" : "closingDate"] &&
                    "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {multiSelectFilters[isAwarded ? "awarded" : "closingDate"] ? (
                  format(
                    multiSelectFilters[isAwarded ? "awarded" : "closingDate"],
                    "PPP"
                  )
                ) : (
                  <span>
                    Filter by {isAwarded ? "awarded" : "closing"} date
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={
                  multiSelectFilters[isAwarded ? "awarded" : "closingDate"]
                }
                onSelect={(date) =>
                  handleFilterChange(
                    isAwarded ? "awarded" : "closingDate",
                    date
                  )
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex flex-row justify-center-safe gap-4">
          {["category", "department", "province", "description"].map(
            (field) => (
              <div key={field} className="flex items-center gap-2">
                <p className="text-sm capitalize">Search {field}</p>
                <input
                  type="text"
                  name={field}
                  value={textFilters[field] ?? ""}
                  onChange={handleTextFilterChange}
                  className="w-32 h-6 text-sm border border-gray-300 rounded px-2"
                  placeholder="Search..."
                />
              </div>
            )
          )}
        </div>
      </div>

      <Table className="table-fixed w-full">
        <TableCaption>List of Available Tenders</TableCaption>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={column.key}
                className="whitespace-normal break-words font-bold"
              >
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentPageData.map((tender, index) => (
            <TableRow key={index}>
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  className="whitespace-normal break-words"
                >
                  {column.key === "successfulBidderAmount"
                    ? formatCurrency(tender[column.key])
                    : column.key === "advertised" ||
                      column.key === "awarded" ||
                      column.key === "closingDate"
                    ? formatDate(tender[column.key])
                    : tender[column.key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(filteredTenders.length / pagination.perPage)}
        onPageChange={(page) => {
          setCurrentPage(page);

          // Update URL
          const params = new URLSearchParams(searchParams);
          params.set("page", page.toString());
          router.push(`?${params.toString()}`, { scroll: false });
        }}
      />
    </>
  );
}
