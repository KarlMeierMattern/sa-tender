import { scrapeAwardedTendersCopy } from "@/app/lib/scrapers/tenders-awarded-copy";
import { NextResponse } from "next/server";

export async function GET() {
  const response = await scrapeAwardedTendersCopy();
  return NextResponse.json({ data: response });
}
