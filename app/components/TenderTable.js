"use client";

import React, { useState } from "react";
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

export default function TenderTable({ initialTenders, isAwarded = false }) {
  // Ensure initialTenders is always an array
  const tenders = Array.isArray(initialTenders) ? initialTenders : [];

  const {
    filters: multiSelectFilters,
    options,
    filteredTenders: multiSelectFiltered,
    handleFilterChange,
  } = useMultiSelectFilters(tenders);

  const { filters: textFilters, setFilter } = useTenderFilters();

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

  // Apply text filters to the multiselect filtered results
  const finalFilteredTenders = multiSelectFiltered.filter((tender) => {
    return Object.entries(textFilters).every(([field, value]) => {
      if (!value) return true; // Skip empty filters
      const fieldValue = String(tender[field] || "").toLowerCase();
      return fieldValue.includes(value.toLowerCase());
    });
  });

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
                  !multiSelectFilters.advertisedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {multiSelectFilters.advertisedDate ? (
                  format(multiSelectFilters.advertisedDate, "PPP")
                ) : (
                  <span>Filter by advertised date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={multiSelectFilters.advertisedDate}
                onSelect={(date) => handleFilterChange("advertisedDate", date)}
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
          {finalFilteredTenders.map((tender, index) => (
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
    </>
  );
}
