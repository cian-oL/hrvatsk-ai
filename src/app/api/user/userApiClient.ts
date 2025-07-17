import type { User } from "@/types/userTypes";

const API_BASE_URL = "/api"; // Using relative URL for same-origin requests

const fetchWithAuth = async (
  url: string,
  options: RequestInit = {},
  token: string,
) => {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
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

export const createUser = (
  formData: Partial<User>,
  token: string,
): Promise<User> => {
  return fetchWithAuth(
    `${API_BASE_URL}/user`,
    {
      method: "POST",
      body: JSON.stringify(formData),
    },
    token,
  );
};
