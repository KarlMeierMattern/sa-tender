import { unstable_noStore as noStore } from "next/cache";
import { headers } from "next/headers";
import TenderLayout from "./components/TenderLayout";
import {
  fetchAdvertisedTenders,
  fetchAwardedTenders,
  fetchAllAdvertisedTendersForCharts,
  fetchAllAwardedTendersForCharts,
} from "./lib/db.js";

export default async function TendersPage({ searchParams }) {
  const page = parseInt(searchParams.page) || 1;
  const limit = 10;

  const headersList = await headers();
  const shouldSkipCache =
    headersList.get("x-no-cache") === "true" ||
    headersList.get("cache-control") === "no-store";

  if (shouldSkipCache) {
    noStore();
    console.log("Cache bypassed due to headers");
  }

  // Fetch both paginated and complete data
  const [advertisedData, awardedData, allAdvertisedTenders, allAwardedTenders] =
    await Promise.all([
      fetchAdvertisedTenders(page, limit),
      fetchAwardedTenders(page, limit),
      fetchAllAdvertisedTendersForCharts(),
      fetchAllAwardedTendersForCharts(),
    ]);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold pl-2">SA Government Tenders Database</h1>
      <div className="mt-8">
        <TenderLayout
          initialTenders={advertisedData.tenders}
          awardedTenders={awardedData.tenders}
          advertisedPagination={advertisedData.pagination}
          awardedPagination={awardedData.pagination}
          metrics={advertisedData.metrics}
          allAdvertisedTenders={allAdvertisedTenders}
          allAwardedTenders={allAwardedTenders}
        />
      </div>
    </div>
  );
}
