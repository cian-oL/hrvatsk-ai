import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  throw new Error("Turso database URL cannot be undefined");
}

if (!authToken) {
  throw new Error("Turso auth cannot be undefined");
}

export const db = createClient({
  url,
  authToken,
});
