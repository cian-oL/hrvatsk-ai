import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { db } from "@/lib/db/db";

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
    // we first fetch the user by the table ID to get the clerkId
    const userQuery = await db.execute({
      sql: "SELECT clerk_id FROM users WHERE id = ?",
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

export const PATCH = async (
  req: Request,
  { params }: { params: Promise<{ userId: string }> },
) => {
  try {
    const { userId: clerkId } = await auth();
    const { userId } = await params;

    if (!clerkId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();

    const userQuery = await db.execute({
      sql: "SELECT clerk_id FROM users WHERE id = ?",
      args: [userId],
    });

    if (userQuery.rows.length === 0) {
      return new NextResponse("User not found", { status: 404 });
    }

    if (userQuery.rows[0].clerk_id !== clerkId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    if (body.onboardingQuestions) {
      body.onboardingQuestions = JSON.stringify(body.onboardingQuestions);
    }

    // Dynamically build the update query
    const fields = Object.keys(body);
    const values = Object.values(body);
    const setClauses = fields.map((field) => `${field} = ?`).join(", ");

    if (fields.length === 0) {
      return new NextResponse("No fields to update", { status: 400 });
    }

    const sql = `UPDATE users SET ${setClauses}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    const args = [...values, userId];

    await db.execute({ sql, args });

    const updatedUserQuery = await db.execute({
      sql: "SELECT * FROM users WHERE id = ?",
      args: [userId],
    });

    // Note: The returned onboardingQuestions will be a string here.
    // The client-side code will need to parse it.
    return NextResponse.json(updatedUserQuery.rows[0]);
  } catch (error) {
    console.error("[USER_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
};
