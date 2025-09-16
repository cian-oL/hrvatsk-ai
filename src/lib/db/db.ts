import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { drizzle as drizzleNode } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import "dotenv/config";

const databaseUrl = process.env.DATABASE_URL;
let db;

if (!databaseUrl) {
  throw new Error("Database URL cannot be undefined");
}

if (process.env.NODE_ENV === "production") {
  console.log("Using Neon serverless driver");
  const sql = neon(databaseUrl);
  db = drizzle(sql);
} else {
  console.log("Using standard PostgreSQL driver");
  const pool = new Pool({
    connectionString: databaseUrl,
  });
  db = drizzleNode(pool);
}

export { db };
