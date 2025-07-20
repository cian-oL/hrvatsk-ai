"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

import { transformClerkData } from "@/lib/utils/utils";
import { useCreateUser } from "@/hooks/useUserData";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const AuthRedirectPage = () => {
  const router = useRouter();
  const { user: clerkUser, isLoaded } = useUser();
  const { mutateAsync: createUser } = useCreateUser();
  const hasCreatedUser = useRef(false);

  useEffect(() => {
    if (isLoaded && clerkUser && !hasCreatedUser.current) {
      hasCreatedUser.current = true;
      const initialData = transformClerkData(clerkUser);
      createUser(initialData)
        .then(() => {
          toast.success("Welcome!");
          router.push("/chat");
        })
        .catch(() => {
          router.push("/profile?fromAuthRedirect=true");
          toast.error(
            "We couldn't create your profile automatically. Please complete your profile details.",
          );
        });
    }
  }, [isLoaded, clerkUser, createUser, router]);

  return (
    <div className="flex items-center justify-center">
      <LoadingSpinner />
    </div>
  );
};

export default AuthRedirectPage;
