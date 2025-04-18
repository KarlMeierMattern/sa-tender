"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { differenceInDays } from "date-fns";
import TableSkeleton from "./ui/table-skeleton";
import { useAdvertisedTenders } from "../hooks/active/useActiveTendersTable";

export default function AdvertisedTendersCard() {
  // Hook for paginated data and all data
  const { allData } = useAdvertisedTenders();

  // Calculate metrics
  const calculateClosingSoon = (tenders) => {
    const now = new Date();
    return tenders.filter((tender) => {
      const closingDate = new Date(tender.closingDate);
      const daysUntilClosing = differenceInDays(closingDate, now);
      return daysUntilClosing >= 0 && daysUntilClosing <= 7;
    }).length;
  };

  const calculateRecentlyAdded = (tenders) => {
    const now = new Date();
    return tenders.filter((tender) => {
      const publishDate = new Date(tender.advertised);
      const daysAgo = differenceInDays(now, publishDate);
      return daysAgo >= 0 && daysAgo <= 7;
    }).length;
  };

  if (allData.isLoading) return <TableSkeleton />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      <Card>
        <CardHeader>
          <CardTitle>Total Tenders Advertised</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{allData?.data?.data.length}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Closing Soon</CardTitle>
          <CardDescription>In next 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">
            {calculateClosingSoon(allData?.data?.data || [])}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Recently Added</CardTitle>
          <CardDescription>In last 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">
            {calculateRecentlyAdded(allData?.data?.data || [])}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
