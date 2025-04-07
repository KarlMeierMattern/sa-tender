// RSC

import TenderTable from "./components/TenderTable.js"; // client component
import { unstable_noStore as noStore } from "next/cache"; // prevents caching

export default async function TendersPage() {
  noStore(); // disable caching for fresh data on each request

  const res = await fetch("http://localhost:3000/api/tenders-detail", {
    cache: "no-store", // bypasses cache and fetches latest data
  });

  if (!res.ok) {
    throw new Error("Failed to fetch tenders");
  }

  const data = await res.json();
  const tenders = data?.data || [];

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold pl-2">Tenders</h1>
      <TenderTable tenders={tenders} />
    </div>
  );
}
