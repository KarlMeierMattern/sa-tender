import { Suspense } from "react";
import TenderLayout from "./components/TenderLayout";
import TableSkeleton from "./components/ui/table-skeleton";

export default function TendersPage() {
  return (
    <div>
      <h1 className="text-xl font-bold pl-2">SA Government Tenders Database</h1>
      <div className="mt-8">
        <Suspense fallback={<TableSkeleton />}>
          <TenderLayout />
        </Suspense>
      </div>
    </div>
  );
}
