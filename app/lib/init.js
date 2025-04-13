// only warm cache in production

import { warmCache } from "./warmCache";

let isWarmed = false; // isWarmed flag ensures it only runs once, even if multiple requests come in

export async function init() {
  if (process.env.NODE_ENV === "production" && !isWarmed) {
    try {
      console.log("Initializing application and warming cache...");
      await warmCache();
      isWarmed = true;
      console.log("Cache warmed successfully");
    } catch (error) {
      console.error("Failed to warm cache:", error);
      // Continue even if cache warming fails
    }
  }
}
