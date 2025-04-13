import { unstable_noStore as noStore } from "next/cache";
import { headers } from "next/headers";
import TenderLayout from "./components/TenderLayout";
import { fetchAdvertisedTenders, fetchAwardedTenders } from "./lib/db.js";
import { cleanDocs } from "./lib/cleanDocs.js";

export default async function TendersPage() {
  const headersList = await headers();

  // Check various cache control scenarios
  const shouldSkipCache =
    headersList.get("x-no-cache") === "true" || // Custom header
    headersList.get("cache-control") === "no-store"; // Standard cache control

  if (shouldSkipCache) {
    noStore();
    console.log("Cache bypassed due to headers");
  }

  const [advertisedRaw, awardedRaw] = await Promise.all([
    fetchAdvertisedTenders(),
    fetchAwardedTenders(),
  ]);

  const advertisedTenders = cleanDocs(advertisedRaw);
  const awardedTenders = cleanDocs(awardedRaw);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold pl-2">SA Government Tenders Database</h1>
      <div className="mt-8">
        <TenderLayout
          initialTenders={advertisedTenders}
          awardedTenders={awardedTenders}
        />
      </div>
    </div>
  );
}
