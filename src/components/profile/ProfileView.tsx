"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useEffect } from "react";

import ProfileForm from "@/components/profile/ProfileForm";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useCreateUser, useGetUser, useUpdateUser } from "@/hooks/useUserData";
import { transformClerkData } from "@/lib/utils/utils";

import type { User } from "@/types/userTypes";
import type { UserResource } from "@clerk/types";

const ProfileView = () => {
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
  const { data: user, isLoading } = useGetUser();
  const { mutateAsync: createUser } = useCreateUser();
  const { mutateAsync: updateUser } = useUpdateUser();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = async (formData: Partial<User>) => {
    try {
      if (user) {
        await updateUser(formData);
        toast.success("Profile updated");
      } else if (clerkUser) {
        await createUser(formData);
        toast.success("Profile created. Welcome!");
        router.push("/chat");
      }
    } catch (err) {
      console.error("Error submitting Profile form:", err);
      toast.error("Failed to save profile. Please try again");
    }
  };

  const getFormData = (
    user?: User,
    clerkUser?: UserResource | null,
  ): Partial<User> => {
    if (user) return { ...user };

    if (clerkUser) {
      return transformClerkData(clerkUser);
    }

    // Default empty form
    return {
      clerkId: "",
      email: "",
      firstName: "",
      lastName: "",
      userName: "",
    };
  };

  const fromAuthRedirect = searchParams.get("fromAuthRedirect") === "true";
  const mode = fromAuthRedirect && !user ? "create" : "edit";
  const formData = getFormData(user, clerkUser);

  // Clear the URL parameter after processing
  useEffect(() => {
    if (fromAuthRedirect && window.history.replaceState) {
      const url = new URL(window.location.href);
      url.searchParams.delete("fromAuthRedirect");
      window.history.replaceState({}, "", url);
    }
  }, [fromAuthRedirect]);

  if (isLoading || !isClerkLoaded) {
    return (
      <div className="flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <ProfileForm
      mode={mode}
      formData={formData}
      onSubmit={handleSubmit}
      isSubmitting={false}
    />
  );
};

export default ProfileView;
