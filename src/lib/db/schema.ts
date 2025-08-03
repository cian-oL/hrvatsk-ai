import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  clerkId: text("clerk_id").notNull().unique(),
  email: text("email").notNull().unique(),
  userName: text("username"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  onboardingCompleted: integer("onboarding_completed").default(0),
  onboardingQuestions: text("onboarding_questions"),
  createdAt: integer("created_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: integer("updated_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
});

export const chats = sqliteTable("chats", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  createdAt: integer("created_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
});
