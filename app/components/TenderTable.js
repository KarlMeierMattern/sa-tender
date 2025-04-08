"use client";

import React, { useEffect, useState } from "react";
import useTenderFilters from "../stores/useTenderFilters.js";
import {
  Table,
  TableCaption,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

export default function TenderTable({ tenders }) {
  const { filters, setFilter } = useTenderFilters();
  const [filteredTenders, setFilteredTenders] = useState(tenders);

  useEffect(() => {
    const newFiltered = tenders.filter((tender) =>
      Object.entries(filters).every(
        ([key, value]) =>
          !value || tender[key]?.toLowerCase().includes(value.toLowerCase())
      )
    );
    setFilteredTenders(newFiltered);
  }, [filters, tenders]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(name, value);
  };

  return (
    <>
      <div className="flex flex-row justify-center-safe gap-4 mb-4">
        {["category", "department", "province", "description"].map((field) => (
          <div key={field} className="flex items-center gap-2">
            <p className="text-sm capitalize">Filter by {field}</p>
            <input
              type="text"
              name={field}
              value={filters[field] ?? ""}
              onChange={handleFilterChange}
              className="w-32 h-6 text-sm border border-gray-300 rounded px-2"
              placeholder="Filter..."
            />
          </div>
        ))}
        <p className="text-sm">Count: {filteredTenders.length}</p>
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
