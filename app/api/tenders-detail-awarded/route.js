// .route.js handles HTTP request parsing and response handling
// receives request from TenderLayout.js

import { getAwardedTenders } from "../index.js";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page")) || 1; // API params processing
  const limit = parseInt(searchParams.get("limit")) || 10; // API params processing
  const year = searchParams.get("year"); // API params processing

  return getAwardedTenders(page, limit, year);
}
