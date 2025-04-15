"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import TableSkeleton from "./ui/table-skeleton";

// Lazy load the table component
const TenderTable = dynamic(() => import("./TenderTable"), { ssr: false });

export default function TenderTableView({ allTenders, page, isAwarded }) {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <TenderTable
        allTenders={allTenders}
        currentPage={page}
        isAwarded={isAwarded}
      />
    </Suspense>
  );
}
