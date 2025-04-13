// app/tenders/page.tsx
import { unstable_noStore as noStore } from "next/cache";
import TenderLayout from "./components/TenderLayout";
import { fetchAdvertisedTenders, fetchAwardedTenders } from "./lib/db.js";
import { cleanDocs } from "./lib/cleanDocs.js";

export default async function TendersPage() {
  noStore();

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
