import mongoose from 'mongoose';
import { env } from './env';

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };
    cached.promise = mongoose.connect(env.MONGO_URI, opts).then((mongoose) => mongoose);
  }

  try {
    cached.conn = await cached.promise;
    console.log(`✅ MongoDB Connected`);
  } catch (error: any) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    throw error;
  }

  return cached.conn;
};
