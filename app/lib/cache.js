// Handles caching
// Used in ../api for caching

import redis from "./redisClient.js";

const DEFAULT_CACHE_TIME = 3600; // 1 hour in seconds

export const cache = {
  // Used in api routes to get cached data
  async get(key) {
    try {
      const value = await redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error("Cache get error:", error);
      return null;
    }
  },

  // Used in api routes to set cached data
  async set(key, value, expireTime = DEFAULT_CACHE_TIME) {
    try {
      await redis.setex(key, expireTime, JSON.stringify(value));
    } catch (error) {
      console.error("Cache set error:", error);
    }
  },

  // Used in seed and update scripts to invalidate caches
  async invalidatePattern(pattern) {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error("Cache pattern invalidation error:", error);
    }
  },
};
