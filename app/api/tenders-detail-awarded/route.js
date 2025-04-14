import { getAwardedTenders } from "../index.js";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page")) || 1;
  const limit = parseInt(searchParams.get("limit")) || 10;
  const year = searchParams.get("year");

  return getAwardedTenders(page, limit, year);
}
