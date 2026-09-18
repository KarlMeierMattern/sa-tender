"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { differenceInDays } from "date-fns";
import { useMemo } from "react";
import CardSkeleton from "../ui/card-skeleton";
import DataStateMessage from "../DataStateMessage";

export default function ActiveTendersCard({ allData }) {
  const tenders = allData?.data?.data;

  const calculateClosingSoon = useMemo(() => {
    const now = new Date();
    return (
      tenders?.filter((tender) => {
        const closingDate = new Date(tender.closingDate);
        const daysUntilClosing = differenceInDays(closingDate, now);
        return daysUntilClosing >= 0 && daysUntilClosing <= 7;
      }).length || 0
    );
  }, [tenders]);

  const calculateRecentlyAdded = useMemo(() => {
    const now = new Date();
    return (
      tenders?.filter((tender) => {
        const publishDate = new Date(tender.advertised);
        const daysAgo = differenceInDays(now, publishDate);
        return daysAgo >= 0 && daysAgo <= 7;
      }).length || 0
    );
  }, [tenders]);

  if (allData.isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (allData.isError) {
    return (
      <div className="mb-8">
        <DataStateMessage
          variant="error"
          message="Could not load tender summary."
          onRetry={() => allData.refetch()}
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      <Card>
        <CardHeader>
          <CardTitle>Total Tenders Advertised</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl md:text-3xl font-bold tabular-nums">
            {tenders?.length ?? 0}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Closing Soon</CardTitle>
          <CardDescription>In next 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl md:text-3xl font-bold tabular-nums">
            {calculateClosingSoon}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Recently Added</CardTitle>
          <CardDescription>In last 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl md:text-3xl font-bold tabular-nums">
            {calculateRecentlyAdded}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
