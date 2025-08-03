import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db/db";
import { users } from "@/lib/db/schema";

export const DELETE = async (
  req: Request,
  { params }: { params: Promise<{ userId: string }> },
) => {
  try {
    const { userId: clerkId } = await auth();
    const { userId } = await params;

    if (!clerkId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!userId) {
      return new NextResponse("User ID is required", { status: 400 });
    }

    // To ensure a user can only delete their own account,
    // we first fetch the user by the userId to check the clerkId
    const userQuery = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (userQuery.length === 0) {
      return new NextResponse("User not found", { status: 404 });
    }
    const userToDelete = userQuery[0];

    if (userToDelete.clerkId !== clerkId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    await db.delete(users).where(eq(users.id, userId));

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[USER_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
};
