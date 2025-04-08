"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import MultiSelect from "./ui/multi-select";
import { DateRangePicker } from "./ui/date-range-picker";
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

async function fetchTenders() {
  const res = await fetch("http://localhost:3000/api/tenders-detail", {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch tenders");
  return res.json();
}

export default function TenderTable({ initialTenders }) {
  const { data, isLoading } = useQuery({
    queryKey: ["tenders"],
    queryFn: fetchTenders,
    initialData: { data: initialTenders },
  });

  const {
    filters: multiSelectFilters,
    options,
    filteredTenders: multiSelectFiltered,
    handleFilterChange,
  } = useMultiSelectFilters(data.data);
  const { filters: textFilters, setFilter } = useTenderFilters();

  // Combine both filters
  const filteredTenders = React.useMemo(() => {
    return multiSelectFiltered.filter((tender) =>
      Object.entries(textFilters).every(
        ([key, value]) =>
          !value || tender[key]?.toLowerCase().includes(value.toLowerCase())
      )
    );
  }, [multiSelectFiltered, textFilters]);

  const handleTextFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(name, value);
  };

  if (isLoading) return <div>Loading...</div>;

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
          <DateRangePicker
            dateRange={multiSelectFilters.advertisedDate}
            onDateRangeChange={(range) =>
              handleFilterChange("advertisedDate", range)
            }
            placeholder="Filter by advertised date"
          />
          <DateRangePicker
            dateRange={multiSelectFilters.closingDate}
            onDateRangeChange={(range) =>
              handleFilterChange("closingDate", range)
            }
            placeholder="Filter by closing date"
          />
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
        <p className="text-sm text-center">Count: {filteredTenders.length}</p>
      </div>

      <Table className="table-fixed w-full">
        <TableCaption>List of Available Tenders</TableCaption>
        <TableHeader>
          <TableRow>
            {[
              "Category",
              "Closing",
              "Department",
              "Province",
              "Advertised",
              "Tender Number",
              "Tender Type",
              "Description",
              "Place Services Required",
            ].map((header, i) => (
              <TableHead
                key={i}
                className="whitespace-normal break-words font-bold"
              >
                {header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTenders.map((tender, index) => (
            <TableRow key={index}>
              {[
                "category",
                "closing",
                "department",
                "province",
                "advertised",
                "tendernumber",
                "tendertype",
                "description",
                "placeServicesRequired",
              ].map((key, i) => (
                <TableCell key={i} className="whitespace-normal break-words">
                  {tender[key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
