import { getTendersDetail } from "@/app/api";

export async function GET() {
  return getTendersDetail();
}
