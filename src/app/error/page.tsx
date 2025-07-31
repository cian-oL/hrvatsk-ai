"use client";

import { useAuth } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const errorCodeMap = {
  "user-fetch-failed": "Failed to fetch user data",
  "user-not-found": "User profile not found",
  "db-connection-error": "Database connection failed",
  unauthorized: "You don't have permission to access this resource",
} as const;

const ErrorPage = () => {
  const { isSignedIn } = useAuth();
  const searchParams = useSearchParams();

  const errorCode = searchParams.get("code");
  const message =
    searchParams.get("message") ||
    errorCodeMap[errorCode as keyof typeof errorCodeMap] ||
    "An unexpected error occurred";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg border p-6 text-center">
        <h1 className="mb-4 text-2xl font-bold text-red-600">Error</h1>
        <p className="mb-6 text-gray-700">{message}</p>
        <Link
          href={isSignedIn ? "/chat" : "/"}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default ErrorPage;
