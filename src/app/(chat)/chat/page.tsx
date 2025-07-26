import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { getUserByClerkId } from "@/lib/api/userApiClient";
import Onboarding from "@/components/chat/Onboarding";
import ChatDashboard from "@/components/chat/ChatDashboard";

import type { User } from "@/types/userTypes";

const ChatPage = async () => {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    redirect("/sign-in");
  }

  try {
    const user: User = await getUserByClerkId(clerkUser.id);

    if (user.onboardingCompleted) {
      return <ChatDashboard />;
    } else {
      return <Onboarding />;
    }
  } catch (err) {
    console.error("Failed to fetch user data:", err);
    redirect("/profile?error=user-not-found");
  }
};

export default ChatPage;
