"use client";

export default function BlockSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm animate-pulse w-full">
      {/* Title skeleton */}
      <div className="mx-auto mb-2 w-48 h-5 bg-gray-200 rounded" />
      {/* Subtitle skeleton */}
      <div className="mx-auto mb-6 w-72 h-4 bg-gray-100 rounded" />
      {/* Bar skeletons */}
      <div className="space-y-4 mt-4">
        <div className="h-5 w-11/12 bg-indigo-100 rounded" />
        <div className="h-5 w-8/12 bg-indigo-100 rounded" />
        <div className="h-5 w-7/12 bg-indigo-100 rounded" />
        <div className="h-5 w-5/12 bg-indigo-100 rounded" />
        <div className="h-5 w-4/12 bg-indigo-100 rounded" />
        <div className="h-5 w-3/12 bg-indigo-100 rounded" />
        <div className="h-5 w-2/12 bg-indigo-100 rounded" />
      </div>
    </div>
  );
}
