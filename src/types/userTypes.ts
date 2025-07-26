export type User = {
  id: string;
  clerkId: string;
  email: string;
  userName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  onboardingCompleted?: boolean | false;
  createdAt: string | null;
  updatedAt: string | null;
};
