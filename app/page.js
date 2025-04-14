import { Suspense } from "react";
import TenderLayout from "./components/TenderLayout";
import TableSkeleton from "./components/ui/table-skeleton";

export default async function TendersPage({ searchParams }) {
  const params = await searchParams;
  const page = parseInt(params.page) || 1;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold pl-2">SA Government Tenders Database</h1>
      <div className="mt-8">
        <Suspense fallback={<TableSkeleton />}>
          <TenderLayout initialPage={page} />
        </Suspense>
      </div>
    </div>
  );
}
