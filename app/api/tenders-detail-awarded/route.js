import { getAwardedTenders } from "@/app/api";

export async function GET() {
  return getAwardedTenders();
}
