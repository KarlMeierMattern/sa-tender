// Hadles rate limiting
// Used in ./middleware.js for rate limiting

import { NextResponse } from "next/server";
import redis from "../lib/redisClient.js";

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60; // 1 minute window during which we count requests
const MAX_REQUESTS = 100; // Maximum requests per window

export async function rateLimit(request) {
  try {
    // Get client IP from headers or request
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = request.ip || forwardedFor || "unknown";

    // Create a unique key for this IP
    const key = `rate_limit:${ip}`;

    // Increment the request count
    const count = await redis.incr(key);

    // Set expiration on first request
    if (count === 1) {
      await redis.expire(key, RATE_LIMIT_WINDOW);
    }

    // Check if over limit
    if (count > MAX_REQUESTS) {
      return new NextResponse(
        JSON.stringify({
          error: "Too many requests",
          message: `Please try again in ${RATE_LIMIT_WINDOW} seconds`,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": RATE_LIMIT_WINDOW.toString(),
          },
        }
      );
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Rate limiting error:", error);
    // Fail open - allow the request through if rate limiting fails
    return NextResponse.next();
  }
}
