"use client";

import React, { Suspense } from "react";
import MultiSelect from "./ui/multi-select";
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
import Pagination from "./Pagination";
import TableSkeleton from "./ui/table-skeleton";

export default function TenderTable({
  allTenders = [],
  currentPage,
  isAwarded,
  isLoading,
  totalItems,
  itemsPerPage = 10,
  paginateData,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedAdvertisedDate, setSelectedAdvertisedDate] = React.useState();
  const [selectedSecondDate, setSelectedSecondDate] = React.useState();
  const [selectedCategories, setSelectedCategories] = React.useState([]);
  const [selectedDepartments, setSelectedDepartments] = React.useState([]);
  const [selectedProvinces, setSelectedProvinces] = React.useState([]);

  if (isLoading) {
    return <TableSkeleton />;
  }

  // Get unique values for filters
  const categories = [
    ...new Set(allTenders.map((tender) => tender.category)),
  ].filter(Boolean);
  const departments = [
    ...new Set(allTenders.map((tender) => tender.department)),
  ].filter(Boolean);
  const provinces = [
    ...new Set(allTenders.map((tender) => tender.province)),
  ].filter(Boolean);

  // Apply filters to full dataset
  const filteredTenders = allTenders.filter((tender) => {
    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(tender.category);
    const matchesDepartment =
      selectedDepartments.length === 0 ||
      selectedDepartments.includes(tender.department);
    const matchesProvince =
      selectedProvinces.length === 0 ||
      selectedProvinces.includes(tender.province);

    // First date filter always checks 'advertised' field
    const matchesAdvertisedDate =
      !selectedAdvertisedDate ||
      format(new Date(tender.advertised), "yyyy-MM-dd") ===
        format(selectedAdvertisedDate, "yyyy-MM-dd");

    // Second date filter checks either 'closingDate' or 'awarded' based on isAwarded
    const matchesSecondDate =
      !selectedSecondDate ||
      format(
        new Date(isAwarded ? tender.awarded : tender.closingDate),
        "yyyy-MM-dd"
      ) === format(selectedSecondDate, "yyyy-MM-dd");

    return (
      matchesCategory &&
      matchesDepartment &&
      matchesProvince &&
      matchesAdvertisedDate &&
      matchesSecondDate
    );
  });

  // Get the current page of filtered data
  const currentPageData = paginateData
    ? paginateData(filteredTenders, currentPage, itemsPerPage)
    : filteredTenders;

  // Calculate total pages from filtered items
  const totalPages = Math.ceil(filteredTenders.length / itemsPerPage);

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

  const formatCurrency = (amount) => {
    if (!amount) return "";
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
    }).format(amount);
  };

  const columns = isAwarded
    ? [
        { key: "category", label: "Category" },
        { key: "department", label: "Department" },
        { key: "province", label: "Province" },
        { key: "description", label: "Description" },
        { key: "tenderNumber", label: "Tender Number" },
        { key: "advertised", label: "Advertised" },
        { key: "awarded", label: "Awarded" },
        { key: "successfulBidderName", label: "Successful Bidder" },
        { key: "successfulBidderAmount", label: "Award Amount" },
      ]
    : [
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
          options={categories}
          selected={selectedCategories}
          onSelect={setSelectedCategories}
          placeholder="Select Category"
        />
        <MultiSelect
          label="Department"
          options={departments}
          selected={selectedDepartments}
          onSelect={setSelectedDepartments}
          placeholder="Select Department"
        />
        <MultiSelect
          label="Province"
          options={provinces}
          selected={selectedProvinces}
          onSelect={setSelectedProvinces}
          placeholder="Select Province"
        />

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[240px] justify-start text-left font-normal",
                !selectedAdvertisedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedAdvertisedDate
                ? format(selectedAdvertisedDate, "PPP")
                : "Filter by Advertised Date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedAdvertisedDate}
              onSelect={setSelectedAdvertisedDate}
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
                !selectedSecondDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedSecondDate
                ? format(selectedSecondDate, "PPP")
                : isAwarded
                ? "Filter by Award Date"
                : "Filter by Closing Date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedSecondDate}
              onSelect={setSelectedSecondDate}
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
        <TableCaption>
          {isAwarded ? "List of Awarded Tenders" : "List of Available Tenders"}
        </TableCaption>
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
