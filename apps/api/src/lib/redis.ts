import Redis from "ioredis";

let client: Redis | null = null;

export function getRedis(): Redis {
  if (!client) {
    client = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: true,
    });

    client.on("error", (err: Error) => {
      console.error("[Redis] connection error:", err.message);
    });

    client.on("connect", () => {
      console.log("[Redis] connected");
    });
  }
  return client;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Store a key with TTL in seconds */
export async function redisSet(key: string, value: string, ttlSeconds: number) {
  return getRedis().set(key, value, "EX", ttlSeconds);
}

export async function redisGet(key: string) {
  return getRedis().get(key);
}

export async function redisDel(key: string) {
  return getRedis().del(key);
}

/** Increment a counter (for rate limiting) */
export async function redisIncr(key: string, ttlSeconds: number) {
  const redis = getRedis();
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, ttlSeconds);
  return count;
}
