"use client";

export default function TableSkeleton() {
  return (
    <div className="mt-8 space-y-4 animate-pulse">
      {/* Filter section skeleton */}
      <div className="flex flex-row justify-center-safe gap-4 mb-8">
        <div className="h-10 w-48 bg-gray-200 rounded-md" />
        <div className="h-10 w-48 bg-gray-200 rounded-md" />
        <div className="h-10 w-48 bg-gray-200 rounded-md" />
      </div>

      {/* Table skeleton */}
      <div className="w-full">
        {/* Header */}
        <div className="flex gap-4 pb-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-8 bg-gray-200 rounded flex-1" />
          ))}
        </div>

        {/* Rows */}
        {[...Array(5)].map((_, rowIndex) => (
          <div key={rowIndex} className="flex gap-4 py-4 border-t">
            {[...Array(6)].map((_, cellIndex) => (
              <div key={cellIndex} className="h-6 bg-gray-100 rounded flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
