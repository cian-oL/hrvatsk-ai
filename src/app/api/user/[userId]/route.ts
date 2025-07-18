import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { db } from "@/lib/db/db";

export const DELETE = async (
  req: Request,
  { params }: { params: { userId: string } },
) => {
  try {
    const { userId: clerkId } = await auth();
    const { userId } = params;

    if (!clerkId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!userId) {
      return new NextResponse("User ID is required", { status: 400 });
    }

    // To ensure a user can only delete their own account,
    // we first fetch the user by the table ID to get the clerkId
    const userQuery = await db.execute({
      sql: "SELECT clerkId FROM users WHERE id = ?",
      args: [userId],
    });

    if (userQuery.rows.length === 0) {
      return new NextResponse("User not found", { status: 404 });
    }

    const userToDelete = userQuery.rows[0];

    if (userToDelete.clerkId !== clerkId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    await db.execute({
      sql: "DELETE FROM users WHERE id = ?",
      args: [userId],
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[USER_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
};
