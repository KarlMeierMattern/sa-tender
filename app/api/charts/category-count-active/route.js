import { getCategoryCountActive } from "../../index.js";

export async function GET() {
  return getCategoryCountActive();
}
