import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { db } from "@/lib/db/db";

const ensureUsersTableExists = async () => {
  try {
    await db.execute(
      `CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            clerk_id TEXT NOT NULL UNIQUE,
            email TEXT NOT NULL,
            user_name TEXT,
            first_name TEXT,
            last_name TEXT,
            onboarding_completed BOOLEAN DEFAULT FALSE,
            onboarding_questions TEXT,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`,
    );
  } catch (err) {
    console.error("Error ensuring users table exists", err);
    throw new Error("Database schema setup failed");
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { email, userName, firstName, lastName } = body;

    if (!email) {
      return new NextResponse("Email is required", { status: 400 });
    }

    // User table check
    await ensureUsersTableExists();

    // Check if user already exists
    const existingUserQuery = await db.execute({
      sql: "SELECT * FROM users WHERE clerk_id = ?",
      args: [clerkId],
    });

    if (existingUserQuery.rows.length > 0) {
      return NextResponse.json(existingUserQuery.rows[0]);
    }

    const newUser = {
      id: crypto.randomUUID(),
      clerkId,
      email,
      userName: userName || null,
      firstName: firstName || null,
      lastName: lastName || null,
    };

    await db.execute({
      sql: "INSERT INTO users (id, clerk_d, email, user_ame, first_name, last_name) VALUES (?, ?, ?, ?, ?, ?)",
      args: [
        newUser.id,
        newUser.clerkId,
        newUser.email,
        newUser.userName,
        newUser.firstName,
        newUser.lastName,
      ],
    });

    const createdUserQuery = await db.execute({
      sql: "SELECT * FROM users WHERE clerk_id = ?",
      args: [clerkId],
    });

    return NextResponse.json(createdUserQuery.rows[0]);
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

    await ensureUsersTableExists();

    const userQuery = await db.execute({
      sql: "SELECT * FROM users WHERE clerk_id = ?",
      args: [clerkId],
    });

    if (userQuery.rows.length === 0) {
      return new NextResponse("User not found", { status: 404 });
    }

    return NextResponse.json(userQuery.rows[0]);
  } catch (err) {
    console.error("[USER_GET]", err);
    return new NextResponse("Internal Error", { status: 500 });
  }
};

export const PUT = async (req: NextRequest) => {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { userName, firstName, lastName } = body;

    await ensureUsersTableExists();

    const userQuery = await db.execute({
      sql: "SELECT * FROM users WHERE clerk_id = ?",
      args: [clerkId],
    });

    if (userQuery.rows.length === 0) {
      return new NextResponse("User not found", { status: 404 });
    }

    const existingUser = userQuery.rows[0];

    const updatedUser = {
      ...existingUser,
      userName: userName || existingUser.userName,
      firstName: firstName || existingUser.firstName,
      lastName: lastName || existingUser.lastName,
      updatedAt: new Date().toISOString(),
    };

    await db.execute({
      sql: "UPDATE users SET user_name = ?, first_name = ?, last_name = ?, updated_at = ? WHERE clerk_id = ?",
      args: [
        updatedUser.userName,
        updatedUser.firstName,
        updatedUser.lastName,
        updatedUser.updatedAt,
        clerkId,
      ],
    });

    return NextResponse.json(updatedUser);
  } catch (err) {
    console.error("[USER_PUT]", err);
    return new NextResponse("Internal Error", { status: 500 });
  }
};
