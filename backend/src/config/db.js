import dotenv from "dotenv";
import { MongoClient } from "mongodb";

// 🔥 Load env vars BEFORE using them
dotenv.config();

let db;

export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("❌ MONGODB_URI is not defined in .env");
  }

  const client = new MongoClient(uri);
  await client.connect();

  db = client.db(process.env.DB_NAME);
  console.log("✅ MongoDB connected");
}

export function getDB() {
  if (!db) {
    throw new Error("❌ Database not initialized");
  }
  return db;
}
