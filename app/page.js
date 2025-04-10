// react server component

import TenderLayout from "./components/TenderLayout";
import { unstable_noStore as noStore } from "next/cache"; // prevents caching
import { headers } from "next/headers";

async function getBaseUrl() {
  const headersList = headers();
  const host = headersList.get("host");
  const proto = process.env.NODE_ENV === "development" ? "http" : "https";
  return `${proto}://${host}`;
}

export default async function TendersPage() {
  noStore(); // disable caching for fresh data on each request
  const baseUrl = await getBaseUrl();

  // Fetch advertised tenders
  const advertisedRes = await fetch(
    new URL("/api/tenders-detail", baseUrl).toString(),
    {
      cache: "no-store", // bypasses cache and fetches latest data
    }
  );

  // Fetch awarded tenders
  const awardedRes = await fetch(
    new URL("/api/tenders-detail-awarded", baseUrl).toString(),
    {
      cache: "no-store",
    }
  );

  if (!advertisedRes.ok) {
    throw new Error("Failed to fetch advertised tenders");
  }

  if (!awardedRes.ok) {
    throw new Error("Failed to fetch awarded tenders");
  }

  const advertisedData = await advertisedRes.json();
  const awardedData = await awardedRes.json();

  const advertisedTenders = advertisedData?.data || [];
  const awardedTenders = awardedData?.data || [];

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold pl-2">Tenders</h1>
      <div className="mt-8">
        <TenderLayout
          initialTenders={advertisedTenders}
          awardedTenders={awardedTenders}
        />
      </div>
    </div>
  );
}
