import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";

import {
  createUser,
  deleteUser,
  getUser,
  updateUser,
} from "@/lib/api/userApiClient";

import type { User } from "@/types/userTypes";

export const USER_QUERY_KEY = ["user"];

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: Partial<User>) => createUser(formData),
    onError: (error) => console.error("Error creating user:", error),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEY }),
  });
};

export const useGetUser = () => {
  const { isSignedIn } = useAuth();

  return useQuery({
    queryKey: USER_QUERY_KEY,
    queryFn: () => getUser(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    enabled: isSignedIn,
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: Partial<User>) => updateUser(userData),
    // Optimistic update
    onMutate: async (updatedData: Partial<User>) => {
      await queryClient.cancelQueries({ queryKey: USER_QUERY_KEY });
      const previousData = queryClient.getQueryData<User>(USER_QUERY_KEY);

      queryClient.setQueryData(USER_QUERY_KEY, (old: User | undefined) =>
        old ? { ...old, ...updatedData } : undefined,
      );

      return { previousData };
    },
    onError: (error, _variables, context) => {
      console.error("Error updating user:", error);
      if (context?.previousData) {
        queryClient.setQueryData(USER_QUERY_KEY, context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEY });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => deleteUser(userId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: USER_QUERY_KEY });
      const previousData = queryClient.getQueryData<User>(USER_QUERY_KEY);
      queryClient.setQueryData(USER_QUERY_KEY, null);
      return { previousData };
    },
    onError: (error, _variables, context) => {
      console.error("Error deleting user:", error);
      if (context?.previousData) {
        queryClient.setQueryData(USER_QUERY_KEY, context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEY });
    },
  });
};
