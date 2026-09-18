import { Suspense } from "react";
import TenderLayout from "./components/TenderLayout";
import BlockSkeleton from "./components/ui/block-skeleton";

export default function TendersPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-8">
      <header className="pt-4">
        <h1 className="text-xl font-bold">SA Government Tenders</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Interactive charts for advertised and awarded government tenders
        </p>
      </header>
      <main className="mt-8">
        <Suspense
          fallback={
            <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8">
              <BlockSkeleton />
              <BlockSkeleton />
            </div>
          }
        >
          <TenderLayout />
        </Suspense>
      </main>
    </div>
  );
}
