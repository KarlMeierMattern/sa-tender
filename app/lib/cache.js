import redis from "./redisClient";

const DEFAULT_CACHE_TIME = 3600; // 1 hour in seconds

export const cache = {
  async get(key) {
    try {
      const value = await redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error("Cache get error:", error);
      return null;
    }
  },

  async set(key, value, expireTime = DEFAULT_CACHE_TIME) {
    try {
      await redis.setex(key, expireTime, JSON.stringify(value));
    } catch (error) {
      console.error("Cache set error:", error);
    }
  },

  async invalidate(key) {
    try {
      await redis.del(key);
    } catch (error) {
      console.error("Cache invalidation error:", error);
    }
  },
};
