import { getCategorizedTenders } from "@/app/api";

export async function GET() {
  return getCategorizedTenders();
}
