import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { getUserByClerkId } from "@/lib/db/userQueries";
import Onboarding from "@/components/chat/Onboarding";

import type { User, UserQueryResult } from "@/types/userTypes";

const OnboardingPage = async () => {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    redirect("/sign-in");
  }

  const userResult: UserQueryResult = await getUserByClerkId(clerkUser.id);

  if (!userResult.success) {
    console.error(userResult.error);

    if (userResult.error === "User not found") {
      redirect("/profile?error=user-not-found");
    }
    redirect("/error?code=user-fetch-failed");
  }

  const user: User = userResult.data;

  if (user.onboardingCompleted) {
    redirect("/chat");
  } else {
    return <Onboarding />;
  }
};

export default OnboardingPage;
