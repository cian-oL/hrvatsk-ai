export type User = {
  id: string;
  clerkId: string;
  email: string;
  userName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  onboardingCompleted?: boolean | false;
  onboardingQuestions?: OnboardingQuestions;
  createdAt: string | null;
  updatedAt: string | null;
};

export type OnboardingQuestions = {
  goal?: string | null;
  languageLevel?: string | null;
  commitment?: string | null;
};

export type UserQueryResult =
  | { success: true; data: User }
  | { success: false; error: string };
