import { getRedis } from "./redis";

/**
 * Generates a sequential order number like "HN-20260304-1001"
 * Uses Redis INCR for atomic sequencing.
 */
export async function generateOrderNumber(): Promise<string> {
  const redis = getRedis();
  const dateKey = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const key = `order_seq:${dateKey}`;
  const seq = await redis.incr(key);
  if (seq === 1) await redis.expire(key, 60 * 60 * 24 * 2); // 2 days TTL
  const padded = String(seq).padStart(4, "0");
  return `HN-${dateKey}-${padded}`;
}
