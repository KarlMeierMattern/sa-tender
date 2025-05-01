"use client";

import React from "react";
import MultiSelect from "../ui/multi-select";
import { Calendar } from "@/components/ui/calendar";
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
import Pagination from "../Pagination";
import TableSkeleton from "../ui/table-skeleton";
import { useActiveFiltersContext } from "@/app/context/ActiveFiltersContext";

export default function ActiveTenderTable({
  allTenders = [],
  currentPage,
  isLoading,
  totalItems,
  itemsPerPage = 10,
  allCategories = [],
  allDepartments = [],
  allProvinces = [],
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get filters from context
  const {
    filters,
    setCategories,
    setDepartments,
    setProvinces,
    setAdvertisedDate,
    setClosingDate,
  } = useActiveFiltersContext();

  if (isLoading) {
    return <TableSkeleton />;
  }

  // Apply filters to full dataset
  const filteredTenders = Array.isArray(allTenders)
    ? allTenders.filter((tender) => {
        const matchesCategory =
          filters.categories.length === 0 ||
          filters.categories.includes(tender.category);
        const matchesDepartment =
          filters.departments.length === 0 ||
          filters.departments.includes(tender.department);
        const matchesProvince =
          filters.provinces.length === 0 ||
          filters.provinces.includes(tender.province);

        const matchesAdvertisedDate =
          !filters.advertisedDate ||
          format(new Date(tender.advertised), "yyyy-MM-dd") ===
            format(filters.advertisedDate, "yyyy-MM-dd");

        const matchesClosingDate =
          !filters.closingDate ||
          format(new Date(tender.closingDate), "yyyy-MM-dd") ===
            format(filters.closingDate, "yyyy-MM-dd");

        return (
          matchesCategory &&
          matchesDepartment &&
          matchesProvince &&
          matchesAdvertisedDate &&
          matchesClosingDate
        );
      })
    : [];

  // Helper function to paginate filtered data
  const paginateData = (filteredData, currentPage, itemsPerPage) => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredData.slice(start, end);
  };

  // Get the current page of filtered data
  const currentPageData = paginateData
    ? paginateData(filteredTenders, currentPage, itemsPerPage)
    : allTenders;

  // Calculate total pages from total items
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Format helpers
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date)) return dateString;
    return date.toLocaleDateString("en-ZA");
  };

  const columns = [
    { key: "category", label: "Category" },
    { key: "department", label: "Department" },
    { key: "province", label: "Province" },
    { key: "description", label: "Description" },
    { key: "tenderNumber", label: "Tender Number" },
    { key: "advertised", label: "Advertised" },
    { key: "closingDate", label: "Closing Date" },
    { key: "tenderType", label: "Type" },
    { key: "placeServicesRequired", label: "Location" },
  ];

  return (
    <>
      <div className="flex flex-wrap gap-4 mb-6">
        <MultiSelect
          label="Category"
          options={allCategories}
          selected={filters.categories}
          onSelect={setCategories}
          placeholder="Select Category"
        />
        <MultiSelect
          label="Department"
          options={allDepartments}
          selected={filters.departments}
          onSelect={setDepartments}
          placeholder="Select Department"
        />
        <MultiSelect
          label="Province"
          options={allProvinces}
          selected={filters.provinces}
          onSelect={setProvinces}
          placeholder="Select Province"
        />

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[240px] justify-start text-left font-normal",
                !filters.advertisedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filters.advertisedDate
                ? format(filters.advertisedDate, "PPP")
                : "Advertised Date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={filters.advertisedDate}
              onSelect={setAdvertisedDate}
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
                !filters.closingDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filters.closingDate
                ? format(filters.closingDate, "PPP")
                : "Closing Date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={filters.closingDate}
              onSelect={setClosingDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="text-sm text-muted-foreground mb-4">
        Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
        {Math.min(currentPage * itemsPerPage, filteredTenders.length)} of{" "}
        {filteredTenders.length} results
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
            <TableRow key={tender._id || index}>
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  className="whitespace-normal break-words"
                >
                  {column.key === "advertised" || column.key === "closingDate"
                    ? formatDate(tender[column.key])
                    : tender[column.key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </>
  );
}
