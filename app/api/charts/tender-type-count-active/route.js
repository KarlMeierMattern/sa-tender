import { getTenderTypeCountActive } from "../../index.js";

export async function GET() {
  return getTenderTypeCountActive();
}
