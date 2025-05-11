import { Suspense } from "react";
import TenderLayout from "./components/TenderLayout";

export default function TendersPage() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold pl-2">SA Government Tenders Database</h1>
      <div className="mt-8">
        <Suspense>
          <TenderLayout />
        </Suspense>
      </div>
    </div>
  );
}
