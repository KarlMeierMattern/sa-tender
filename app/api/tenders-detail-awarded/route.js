import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { scrapeAwardedTenders } from "@/app/lib/scrapers/tenders-awarded";

export async function GET() {
  try {
    // For testing, let's scrape just 2 pages
    const tenders = await scrapeAwardedTenders({ maxPages: 1 });
    return NextResponse.json({ success: true, data: tenders });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}
