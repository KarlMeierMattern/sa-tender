"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableCaption,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

export default function TendersPage() {
  const [tenders, setTenders] = useState([]);
  const [filteredTenders, setFilteredTenders] = useState([]);
  const [filters, setFilters] = useState({
    category: "",
    department: "",
    province: "",
  });
  const [count, setCount] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTenders = async () => {
      try {
        const response = await fetch("/api/tenders-detail");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        if (data.success) {
          setTenders(data.data);
          setFilteredTenders(data.data); // Initialize filtered data
          setCount(data.data.length);
        }
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };
    fetchTenders();
  }, []);

  // Handle filter input changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    setFilters((prev) => {
      const updatedFilters = { ...prev, [name]: value };

      // Apply all active filters
      const newFilteredTenders = tenders.filter((tender) =>
        Object.entries(updatedFilters).every(
          ([key, filterValue]) =>
            !filterValue ||
            tender[key]?.toLowerCase().includes(filterValue.toLowerCase())
        )
      );

      setFilteredTenders(newFilteredTenders);
      setCount(newFilteredTenders.length);
      return updatedFilters;
    });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold pl-2">Tenders</h1>
      <div className="flex flex-row justify-center-safe gap-4">
        <div className="flex items-center gap-2">
          <p className="text-sm">Filter by category</p>
          <input
            type="text"
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            className="w-32 h-6 text-sm border border-gray-300 rounded px-2"
            placeholder="Filter..."
          />
        </div>
        <div className="flex items-center gap-2">
          <p className="text-sm">Filter by department</p>
          <input
            type="text"
            name="department"
            value={filters.department}
            onChange={handleFilterChange}
            className="w-32 h-6 text-sm border border-gray-300 rounded px-2"
            placeholder="Filter..."
          />
        </div>
        <div className="flex items-center gap-2">
          <p className="text-sm">Filter by province</p>
          <input
            type="text"
            name="province"
            value={filters.province}
            onChange={handleFilterChange}
            className="w-32 h-6 text-sm border border-gray-300 rounded px-2"
            placeholder="Filter..."
          />
        </div>
        <p className="text-sm">Count: {count}</p>
      </div>
      <Table className="table-fixed w-full">
        <TableCaption>List of Available Tenders</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-52 whitespace-normal break-words">
              Category
            </TableHead>
            <TableHead className="w-32 whitespace-normal break-words">
              Closing
            </TableHead>
            <TableHead className="w-52 whitespace-normal break-words">
              Department
            </TableHead>
            <TableHead className="w-32 whitespace-normal break-words">
              Province
            </TableHead>
            <TableHead className="w-52 whitespace-normal break-words">
              Advertised
            </TableHead>
            <TableHead className="w-52 whitespace-normal break-words">
              Tender Number
            </TableHead>
            <TableHead className="w-52 whitespace-normal break-words">
              Tender Type
            </TableHead>
            <TableHead className="w-96 whitespace-normal break-words">
              Description
            </TableHead>
            <TableHead className="w-96 whitespace-normal break-words">
              Place Services Required
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTenders.map((tender, index) => (
            <TableRow key={index}>
              <TableCell className="w-52 whitespace-normal break-words ">
                {tender.category}
              </TableCell>
              <TableCell className="w-32 whitespace-normal break-words">
                {tender.closing}
              </TableCell>
              <TableCell className="w-52 whitespace-normal break-words">
                {tender.department}
              </TableCell>
              <TableCell className="w-32 whitespace-normal break-words">
                {tender.province}
              </TableCell>
              <TableCell className="w-52 whitespace-normal break-words">
                {tender.advertised}
              </TableCell>
              <TableCell className="w-52 whitespace-normal break-words">
                {tender.tendernumber}
              </TableCell>
              <TableCell className="w-52 whitespace-normal break-words">
                {tender.tendertype}
              </TableCell>
              <TableCell className="w-96 whitespace-normal break-words">
                {tender.description}
              </TableCell>
              <TableCell className="w-96 whitespace-normal break-words">
                {tender.placeServicesRequired}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
