import { db } from "@/lib/db/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

import type { User, UserQueryResult } from "@/types/userTypes";

export const getUserByClerkId = async (
  clerkId: string,
): Promise<UserQueryResult> => {
  try {
    if (!clerkId) {
      return {
        success: false,
        error: "User server fetch: Clerk Id is required",
      };
    }

    const userQuery = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);

    if (userQuery.length === 0) {
      return { success: false, error: "User server fetch: User not found" };
    }

    return { success: true, data: userQuery[0] as unknown as User };
  } catch (error) {
    console.error("User server fetch: Failed fetch from DB:", error);
    return { success: false, error: "User server fetch: Internal error" };
  }
};
