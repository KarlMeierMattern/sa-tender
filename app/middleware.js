// redis-middleware.js
import { NextResponse } from "next/server";
import redis from "./lib/redisClient.js";

const RATE_LIMIT_WINDOW = 60; // seconds
const MAX_REQUESTS = 100;

export async function middleware(request) {
  try {
    const forwardedFor = await request.headers.get("x-forwarded-for");
    const ip = request.ip || forwardedFor || "unknown";
    const key = `rate_limit:${ip}`;

    // Step 1: Increment the count
    const count = await redis.incr(key);

    // Step 2: If first request, set expiration
    if (count === 1) {
      await redis.expire(key, RATE_LIMIT_WINDOW);
    }

    // Step 3: Check if over limit
    if (count > MAX_REQUESTS) {
      return new NextResponse(JSON.stringify({ error: "Too many requests" }), {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": RATE_LIMIT_WINDOW.toString(),
        },
      });
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Redis middleware error:", error);
    return NextResponse.next(); // Fail open
  }
}

export const config = {
  matcher: [
    "/api/:path*", // All API routes
    "/", // Root route where your main page is rendered
  ],
};
