"use client";

import { Suspense } from "react";

import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ProfileView from "@/components/profile/ProfileView";

const ProfilePage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center">
          <LoadingSpinner />
        </div>
      }
    >
      <ProfileView />
    </Suspense>
  );
};

export default ProfilePage;
