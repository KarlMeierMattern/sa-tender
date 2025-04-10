import { getAwardedTenders } from "../index.js";

export async function GET() {
  return getAwardedTenders();
}
