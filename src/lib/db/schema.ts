import { OnboardingQuestions } from "@/types/userTypes";
import {
  pgTable,
  text,
  serial,
  timestamp,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  clerkId: text("clerk_id").notNull().unique(),
  email: text("email").notNull().unique(),
  userName: text("username"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  onboardingCompleted: boolean("onboarding_completed").default(false),
  onboardingQuestions: jsonb(
    "onboarding_questions",
  ).$type<OnboardingQuestions>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
