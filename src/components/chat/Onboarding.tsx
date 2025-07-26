"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useUpdateUser } from "@/hooks/useUserData";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const Onboarding = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const { mutate: updateUser, isPending } = useUpdateUser();

  const handleCompleteOnboarding = () => {
    updateUser(
      { onboardingCompleted: true },
      {
        onSuccess: () => {
          toast.success("Welcome aboard!");
          router.refresh();
        },
        onError: () => {
          toast.error("Something went wrong. Please try again.");
        },
      },
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome to the App!</CardTitle>
          <CardDescription>
            Let&#39;s get your account set up in just a couple of steps.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <div>
              <h3 className="font-semibold">Step 1: Introduction</h3>
              <p className="mt-2 text-sm text-gray-600">
                This is where you would ask the user for their name, role, or
                any other initial information you need to personalize their
                experience.
              </p>
            </div>
          )}
          {step === 2 && (
            <div>
              <h3 className="font-semibold">Step 2: Confirmation</h3>
              <p className="mt-2 text-sm text-gray-600">
                YouLet&#39;sre all set! Click the button below to start
                chatting.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end">
          {step === 1 && <Button onClick={() => setStep(2)}>Next</Button>}
          {step === 2 && (
            <Button onClick={handleCompleteOnboarding} disabled={isPending}>
              {isPending ? <LoadingSpinner /> : "Finish Onboarding"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default Onboarding;
