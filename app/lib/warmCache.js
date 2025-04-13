// app/lib/warmCache.js
import { fetchAdvertisedTenders, fetchAwardedTenders } from "./db";

export async function warmCache() {
  try {
    console.log("Starting cache warming...");

    // Fetch both types of tenders simultaneously
    await Promise.all([fetchAdvertisedTenders(), fetchAwardedTenders()]);

    console.log("Cache warming completed");
  } catch (error) {
    console.error("Cache warming failed:", error);
    throw error; // Rethrow to be handled by init.js
  }
}
