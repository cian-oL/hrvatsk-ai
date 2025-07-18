import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import type { UserResource } from "@clerk/types";
import type { User } from "@/types/userTypes";

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const transformClerkData = (clerkUser: UserResource): Partial<User> => {
  return {
    clerkId: clerkUser.id,
    email: clerkUser.primaryEmailAddress?.emailAddress || "",
    firstName: clerkUser.firstName || "",
    lastName: clerkUser.lastName || "",
    userName: clerkUser.username || "",
  };
};
