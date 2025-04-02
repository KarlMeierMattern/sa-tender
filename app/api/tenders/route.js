import { getTenders } from "@/app/api";

export async function GET() {
  return getTenders();
}
