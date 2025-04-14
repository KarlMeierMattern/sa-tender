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

  try {
    // Fetch both paginated and complete data
    const [
      advertisedData,
      awardedData,
      allAdvertisedTenders,
      allAwardedTenders,
    ] = await Promise.all([
      fetchAdvertisedTenders(page, limit),
      fetchAwardedTenders(page, limit),
      fetchAllAdvertisedTendersForCharts(),
      fetchAllAwardedTendersForCharts(),
    ]);

    // Add validation
    if (!advertisedData?.tenders || !awardedData?.tenders) {
      console.error("Missing tender data:", { advertisedData, awardedData });
      throw new Error("Failed to load tender data");
    }

    // Log the data being passed to verify it's correct
    console.log("Page Data:", {
      advertisedCount: advertisedData.tenders.length,
      awardedCount: awardedData.tenders.length,
      allAdvertisedCount: allAdvertisedTenders.length,
      allAwardedCount: allAwardedTenders.length,
    });

    return (
      <div className="p-4">
        <h1 className="text-xl font-bold pl-2">
          SA Government Tenders Database
        </h1>
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
  } catch (error) {
    console.error("Error loading tenders:", error);
    return (
      <div className="p-4">
        <h1 className="text-xl font-bold text-red-600">
          Error loading tenders. Please try again.
        </h1>
      </div>
    );
  }
}
