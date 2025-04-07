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

export default function TendersPage({ filteredTenders }) {
  return (
    <Table className="table-fixed w-full">
      <TableCaption>List of Available Tenders</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-52 whitespace-normal break-words font-bold">
            Category
          </TableHead>
          <TableHead className="w-32 whitespace-normal break-words font-bold">
            Closing
          </TableHead>
          <TableHead className="w-52 whitespace-normal break-words font-bold">
            Department
          </TableHead>
          <TableHead className="w-32 whitespace-normal break-words font-bold">
            Province
          </TableHead>
          <TableHead className="w-52 whitespace-normal break-words font-bold">
            Advertised
          </TableHead>
          <TableHead className="w-52 whitespace-normal break-words font-bold">
            Tender Number
          </TableHead>
          <TableHead className="w-52 whitespace-normal break-words font-bold">
            Tender Type
          </TableHead>
          <TableHead className="w-96 whitespace-normal break-words font-bold">
            Description
          </TableHead>
          <TableHead className="w-96 whitespace-normal break-words font-bold">
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
  );
}
