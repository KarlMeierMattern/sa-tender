import TenderLayout from "./components/TenderLayout";
import { unstable_noStore as noStore } from "next/cache";

export default async function TendersPage() {
  noStore(); // Ensure fresh data every request

  const isProd = process.env.NODE_ENV === "production";

  const baseUrl = isProd
    ? `https://${process.env.VERCEL_URL}` // ✅ Vercel automatically sets this
    : "http://localhost:3000"; // ✅ Local dev

  // Fetch advertised tenders
  const advertisedRes = await fetch(`${baseUrl}/api/tenders-detail`, {
    cache: "force-cache", // This will use Vercel’s edge caching mechanism to store the response at the edge, reducing latency for repeated requests.
  });

  // Fetch awarded tenders
  const awardedRes = await fetch(`${baseUrl}/api/tenders-detail-awarded`, {
    cache: "force-cache",
  });

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
