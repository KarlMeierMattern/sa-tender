// Provides a Redis client for the application
// Used in ../middleware.js for rate limiting
// Used in ../api/index.js for caching

import Redis from "ioredis";

const redis = new Redis(process.env.UPSTASH_REDIS_URL, {
  tls: {
    rejectUnauthorized: false,
  },
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
});

redis.on("error", (error) => {
  console.error("Redis connection error:", error);
});

redis.on("connect", () => {
  console.log("Successfully connected to Redis");
});

export default redis;
