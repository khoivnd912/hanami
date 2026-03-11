import { CounterModel } from "@hanami/db";

/**
 * Generates a sequential order number like "HN-20260304-1001"
 * Uses MongoDB atomic $inc for sequencing.
 */
export async function generateOrderNumber(): Promise<string> {
  const dateKey = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const key = `order_seq:${dateKey}`;

  const counter = await CounterModel.findOneAndUpdate(
    { _id: key },
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  );

  const padded = String(counter!.seq).padStart(4, "0");
  return `HN-${dateKey}-${padded}`;
}
