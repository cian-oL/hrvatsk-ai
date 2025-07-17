import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { db } from "@/lib/db";

const ensureUsersTableExists = async () => {
  try {
    await db.execute(
      `CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            clerkId TEXT NOT NULL UNIQUE,
            email TEXT NOT NULL,
            userName TEXT,
            firstName TEXT,
            lastName TEXT,
            createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`,
    );
  } catch (err) {
    console.error("Error ensuring users table exists", err);
    throw new Error("Database schema setup failed");
  }
};

export const POST = async (req: Request) => {
  try {
    const { userId: clerkId } = auth();
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
      sql: "SELECT * FROM users WHERE clerkId = ?",
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
      sql: "INSERT INTO users (id, clerkId, email, userName, firstName, lastName) VALUES (?, ?, ?, ?, ?, ?)",
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
      sql: "SELECT * FROM users WHERE clerkId = ?",
      args: [clerkId],
    });

    return NextResponse.json(createdUserQuery.rows[0]);
  } catch (error) {
    console.error("[USER_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
};
