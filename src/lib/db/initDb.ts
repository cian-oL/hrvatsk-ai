import { migrate } from "drizzle-orm/libsql/migrator";

import { db } from "./db";

// Initialize the database with required tables
export const initializeDatabase = async (): Promise<void> => {
  try {
    console.log("Running DB migrations...");
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("Database schema is up to date");
  } catch (err: any) {
    if (err?.message?.includes("already exists")) {
      console.log("Tables already exist, skipping migrations");
    } else {
      console.error("Failed to run migrations:", err);

      if (process.env.NODE_ENV !== "production") {
        throw err;
      } else {
        console.warn("Continuing despite DB error (production mode)");
      }
    }
  }
};

// This allows the script to be run directly with `npx tsx src/lib/db/initDb.ts`
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log("Database setup complete.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Failed to initialize database:", err);
      process.exit(1);
    });
}
