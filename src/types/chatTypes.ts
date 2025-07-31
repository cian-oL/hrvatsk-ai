export type Chat = {
  id: string;
  title: string | null;
  userId: string | null;
  visibility: { enum: ["public", "private"] } | null;
  createdAt: string;
};
