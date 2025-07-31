import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import "dotenv/config";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  throw new Error("Turso database URL cannot be undefined");
}

const client = createClient({
  url,
  authToken: authToken !== "none" ? authToken : undefined,
});

export const db = drizzle(client);
