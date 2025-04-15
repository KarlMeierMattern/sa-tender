// .route.js handles HTTP request parsing and response handling

import { getTendersDetail } from "../index.js";

export async function GET(request) {
  const { searchParams } = new URL(request.url); // get the search params from the url
  const page = parseInt(searchParams.get("page")) || 1; // get the page from the search params
  const limit = parseInt(searchParams.get("limit")) || 10; // get the limit from the search params
  return getTendersDetail(page, limit); // get the tenders detail from the api
}
