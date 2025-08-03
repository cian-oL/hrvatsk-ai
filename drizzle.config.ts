import { defineConfig } from "drizzle-kit";
import "dotenv/config";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  throw new Error("Turso database URL cannot be undefined");
}

export default defineConfig({
  out: "./drizzle",
  schema: "./src/lib/db/schema.ts",
  dialect: "turso",
  dbCredentials: {
    url: url,
    authToken: authToken !== "none" ? authToken : undefined,
  },
});
