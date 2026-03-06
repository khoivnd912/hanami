import mongoose from "mongoose";

// ─── Connection state cache (important for serverless / hot-reload) ───────────

declare global {
  // eslint-disable-next-line no-var
  var _mongooseState: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  } | undefined;
}

const state = global._mongooseState ?? { conn: null, promise: null };
global._mongooseState = state;

export async function connectDB(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI environment variable is not set");

  if (state.conn) return state.conn;

  if (!state.promise) {
    state.promise = mongoose.connect(uri, {
      dbName:         process.env.MONGODB_DB ?? "hanami",
      bufferCommands: false,
    });
  }

  state.conn = await state.promise;
  return state.conn;
}

export async function disconnectDB(): Promise<void> {
  if (state.conn) {
    await mongoose.disconnect();
    state.conn    = null;
    state.promise = null;
  }
}

export { mongoose };
