import mongoose from "mongoose";
// connecting to MongoDB
let cached = global.mongoose || { conn: null, promise: null };

export default async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGODB_URI)
      .then((mongoose) => mongoose);
  }
  try {
    cached.conn = await cached.promise;
  } catch (error) {
    console.error("Error connectiing to MongoDB:", error);
    throw error; //re-throw for awareness upstream
  }
  return cached.conn;
}
