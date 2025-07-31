import type { User } from "@/types/userTypes";

const API_BASE_URL = "/api"; // Using relative URL for same-origin requests

const fetchWithOptions = async (url: string, options: RequestInit = {}) => {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("API request failed:", errorBody);
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
};

export const createUser = (formData: Partial<User>): Promise<User> => {
  return fetchWithOptions(`${API_BASE_URL}/user`, {
    method: "POST",
    body: JSON.stringify(formData),
  });
};

export const getUser = (): Promise<User> => {
  return fetchWithOptions(`${API_BASE_URL}/user`, {
    method: "GET",
  });
};

export const updateUser = (formData: Partial<User>): Promise<User> => {
  const allowedFields = [
    "userName",
    "firstName",
    "lastName",
    "onboardingCompleted",
    "onboardingQuestions",
  ];

  const filteredData = Object.fromEntries(
    Object.entries(formData).filter(([key]) => allowedFields.includes(key)),
  );

  return fetchWithOptions(`${API_BASE_URL}/user`, {
    method: "PATCH",
    body: JSON.stringify(filteredData),
  });
};

export const deleteUser = (userId: string): Promise<void> => {
  return fetchWithOptions(`${API_BASE_URL}/user/${userId}`, {
    method: "DELETE",
  });
};
