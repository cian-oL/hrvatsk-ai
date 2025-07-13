import { useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

import LoadingSpinner from "@/components/ui/loading-spinner";

const AuthRedirectPage = () => {
  const router = useRouter();
  const { user: clerkUser, isLoaded } = useUser();
  const hasCreatedUser = useRef(false);

  useEffect(() => {
    if (isLoaded && clerkUser && !hasCreatedUser.current) {
      hasCreatedUser.current = true;
      toast.success("Welcome!");
      router.push("/chat");
    }
  }, [isLoaded, clerkUser, router]);

  return <LoadingSpinner />;
};

export default AuthRedirectPage;
