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

import type { OnboardingQuestions } from "@/types/userTypes";

const Onboarding = () => {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Partial<OnboardingQuestions>>({});
  const { mutateAsync: updateUser, isPending } = useUpdateUser();

  const questions = [
    {
      question: "What do you want to achieve with Hrvatsk-AI?",
      key: "goal",
      options: [
        "Learn something new",
        "Improve my conversational skills",
        "Improve my grammar",
        "A bit of fun",
      ],
    },
    {
      question: "What is your language level?",
      key: "language-level",
      options: [
        "I am new to Croatian",
        "I know some words and phrases",
        "I can have simple conversations",
        "I am intermediate",
        "I am an expert or native speaker",
        "I know other Balkan languages",
      ],
    },
    {
      question: "How often do you want to practise?",
      key: "commitment",
      options: [
        "5 minutes per day",
        "15 minutes per day",
        "30 minutes per day",
        "1 hour per day",
        "More than 1 hour per day",
      ],
    },
  ];

  const currentQuestion = questions[step];

  const handleSelect = (option: string) => {
    setData({ ...data, [currentQuestion.key]: option });
    if (step < questions.length - 1) {
      setStep(step + 1);
    }
  };

  const handleCompleteOnboarding = () => {
    updateUser(
      { ...data, onboardingCompleted: true },
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
          <CardTitle>{currentQuestion.question}</CardTitle>
          <CardDescription>
            Step {step + 1} of {questions.length}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {currentQuestion.options.map((option) => (
            <Button
              key={option}
              variant={
                data[
                  currentQuestion.key as keyof OnboardingQuestions
                ]?.includes(option)
                  ? "default"
                  : "outline"
              }
              onClick={() => handleSelect(option)}
              className="w-full justify-start"
            >
              {option}
            </Button>
          ))}
        </CardContent>
        <CardFooter className="flex justify-end">
          {step < questions.length - 1 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!data[currentQuestion.key as keyof OnboardingQuestions]}
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleCompleteOnboarding}
              disabled={
                isPending || !data.commitment || data.commitment.length === 0
              }
            >
              {isPending ? <LoadingSpinner /> : "Finish Onboarding"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default Onboarding;
