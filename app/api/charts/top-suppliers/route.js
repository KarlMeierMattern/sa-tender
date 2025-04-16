import { getTopSuppliers } from "../../index.js";

export async function GET(request) {
  const url = new URL(request.url);
  const year = url.searchParams.get("year") || "all";
  return getTopSuppliers(year);
}
