// Next.js automatically runs this middleware at the route of your project

import { rateLimit } from "./middleware/rateLimit";

export async function middleware(request) {
  return rateLimit(request);
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    "/api/:path*", // Apply to all API routes
  ],
};
