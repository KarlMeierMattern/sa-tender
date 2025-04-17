import { getDepartmentCountActive } from "../../index.js";

export async function GET() {
  return getDepartmentCountActive();
}
