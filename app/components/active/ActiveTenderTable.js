"use client";

import React, { useCallback } from "react";
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
import DataStateMessage from "../DataStateMessage";
import { useActiveFiltersContext } from "@/app/context/ActiveFiltersContext";

export default function ActiveTenderTable({
  allTenders = [],
  currentPage,
  isLoading,
  isError,
  onRetry,
  allCategories = [],
  allDepartments = [],
  allProvinces = [],
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const itemsPerPage = 10;

  const {
    filters,
    setCategories,
    setDepartments,
    setProvinces,
    setAdvertisedDate,
    setClosingDate,
    resetFilters,
  } = useActiveFiltersContext();

  const resetPage = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    router.push(`?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  const withPageReset = useCallback(
    (setter) => (value) => {
      setter(value);
      resetPage();
    },
    [resetPage]
  );

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.departments.length > 0 ||
    filters.provinces.length > 0 ||
    filters.advertisedDate ||
    filters.closingDate;

  if (isLoading) {
    return <TableSkeleton />;
  }

  if (isError) {
    return (
      <DataStateMessage
        variant="error"
        message="Could not load tender table data."
        onRetry={onRetry}
      />
    );
  }

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

  const paginateData = (filteredData, page, perPage) => {
    const start = (page - 1) * perPage;
    return filteredData.slice(start, start + perPage);
  };

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTenders.length / itemsPerPage)
  );
  const safePage = Math.min(currentPage, totalPages);
  const currentPageData = paginateData(filteredTenders, safePage, itemsPerPage);

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleClearFilters = () => {
    resetFilters();
    resetPage();
  };

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
      <div className="mb-6 flex flex-wrap items-end gap-4">
        <MultiSelect
          label="Category"
          options={allCategories}
          selected={filters.categories}
          onSelect={withPageReset(setCategories)}
          placeholder="Select Category"
        />
        <MultiSelect
          label="Department"
          options={allDepartments}
          selected={filters.departments}
          onSelect={withPageReset(setDepartments)}
          placeholder="Select Department"
        />
        <MultiSelect
          label="Province"
          options={allProvinces}
          selected={filters.provinces}
          onSelect={withPageReset(setProvinces)}
          placeholder="Select Province"
        />

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full sm:w-[240px] justify-start text-left font-normal",
                !filters.advertisedDate && "text-muted-foreground"
              )}
              aria-label="Filter by advertised date"
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
              onSelect={withPageReset(setAdvertisedDate)}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full sm:w-[240px] justify-start text-left font-normal",
                !filters.closingDate && "text-muted-foreground"
              )}
              aria-label="Filter by closing date"
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
              onSelect={withPageReset(setClosingDate)}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={handleClearFilters}>
            Clear filters
          </Button>
        )}
      </div>

      <div className="mb-4 text-sm text-muted-foreground">
        Showing{" "}
        {filteredTenders.length === 0
          ? 0
          : (safePage - 1) * itemsPerPage + 1}{" "}
        to {Math.min(safePage * itemsPerPage, filteredTenders.length)} of{" "}
        {filteredTenders.length} results
      </div>

      {filteredTenders.length === 0 ? (
        <DataStateMessage
          message={
            hasActiveFilters
              ? "No tenders match your filters. Try adjusting or clearing them."
              : "No tenders available."
          }
        />
      ) : (
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
              <TableRow key={tender._id || index} className="hover:bg-muted/50">
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
      )}

      {totalPages > 1 && (
        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </>
  );
}
