import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db/db";
import { users } from "@/lib/db/schema";

import type { User } from "@/types/userTypes";

export const POST = async (req: NextRequest) => {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body: Partial<User> = await req.json();
    const { email, userName, firstName, lastName } = body;

    if (!email) {
      return new NextResponse("Email is required", { status: 400 });
    }

    const existingUserQuery = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);

    if (existingUserQuery.length > 0) {
      return NextResponse.json(existingUserQuery[0]);
    }

    const newUser = {
      clerkId,
      email,
      userName: userName || null,
      firstName: firstName || null,
      lastName: lastName || null,
    };

    await db.insert(users).values(newUser);

    const createdUserQuery = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);

    return NextResponse.json(createdUserQuery[0]);
  } catch (err) {
    console.error("[USER_POST]", err);
    return new NextResponse("Internal Error", { status: 500 });
  }
};

export const GET = async () => {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return new NextResponse("Unauthorized", { status: 401 });
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
  } catch (err) {
    console.error("[USER_GET]", err);
    return new NextResponse("Internal Error", { status: 500 });
  }
};

export const PATCH = async (req: NextRequest) => {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const existingUserQuery = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);

    if (existingUserQuery.length === 0) {
      return new NextResponse("User not found", { status: 404 });
    }

    //  Dynamically build the update query -- allow for correct falsy values
    const allowedUpdateFields = [
      "userName",
      "firstName",
      "lastName",
      "onboardingCompleted",
      "onboardingQuestions",
    ];

    const body = await req.json();
    const updates: any = {};

    for (const field of allowedUpdateFields) {
      if (field in body && body[field] !== undefined) {
        if (field === "onboardingQuestions") {
          updates[field] = body[field];
        } else if (field === "onboardingCompleted") {
          updates[field] = !!body[field];
        } else {
          updates[field] = body[field];
        }
      }
    }

    if (Object.keys(updates).length === 0) {
      return new NextResponse("No valid fields to update", { status: 400 });
    }
    updates.updatedAt = new Date();

    await db.update(users).set(updates).where(eq(users.clerkId, clerkId));

    const updatedUserQuery = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);

    return NextResponse.json(updatedUserQuery[0]);
  } catch (err) {
    console.error("[USER_PATCH]", err);
    return new NextResponse("Internal Error", { status: 500 });
  }
};
