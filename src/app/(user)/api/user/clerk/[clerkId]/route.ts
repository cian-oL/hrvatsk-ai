import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ clerkId: string }> },
) => {
  try {
    const { userId: authId } = await auth();
    const { clerkId } = await params;

    if (!authId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!clerkId) {
      return new NextResponse("Clerk ID is required", { status: 400 });
    }

    const userQuery = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);

    if (userQuery.length === 0) {
      return new NextResponse("User not found", { status: 404 });
    }

    return NextResponse.json(userQuery[0]);
  } catch (error) {
    console.error("[USER_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
};
