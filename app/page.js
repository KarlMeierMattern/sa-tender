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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="pt-[var(--page-padding)] [--page-padding:theme(space.4)]">
      {" "}
      <h1 className="text-xl font-bold mb-4 px-[calc(var(--page-padding)/2)]">
        Tenders
      </h1>
      <p className="text-sm px-[calc(var(--page-padding)/2)]">Count: {count}</p>
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
