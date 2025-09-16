import { migrate } from "drizzle-orm/neon-http/migrator";

import { db } from "./db";

// Initialize the database with required tables
export const initializeDatabase = async (): Promise<void> => {
  try {
    console.log("Running DB migrations...");
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("Database schema is up to date");
  } catch (error: unknown) {
    const err = error as { message?: string };

    if (
      typeof err.message === "string" &&
      (err?.message?.includes("already exists") ||
        err?.message?.includes("relation already exists"))
    ) {
      console.log("Tables already exist, skipping migrations");
    } else {
      console.error("Failed to run migrations:", error);

      if (process.env.NODE_ENV !== "production") {
        throw error;
      } else {
        console.warn("Continuing despite database error (production mode)");
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
