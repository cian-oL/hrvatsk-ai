import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  clerkId: text("clerk_id").notNull().unique(),
  email: text("email").notNull().unique(),
  userName: text("user_name"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  onboardingCompleted: integer("onboarding_completed").default(0),
  onboardingQuestions: text("onboarding_questions"),
  createdAt: integer("created_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
});
