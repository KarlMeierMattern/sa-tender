"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default function CardSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader>
        <CardTitle>
          <div className="h-4 w-32 bg-gray-200 rounded mb-1" />
        </CardTitle>
        <CardDescription>
          <div className="h-3 w-24 bg-gray-100 rounded" />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-8 w-20 bg-gray-300 rounded mt-2" />
      </CardContent>
    </Card>
  );
}
