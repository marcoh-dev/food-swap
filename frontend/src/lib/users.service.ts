import { fetchAPI } from "./fetchAPI";
import { User } from "./types/user.types";

export async function getUserById(id: string): Promise<User | null> {
  const response = await fetchAPI(
    process.env.NEXT_PUBLIC_FOODSWAP_API_URL + `/users/${id}`,
  );
  const userData = await response.json();
  return userData;
}

export async function getCurrentUser(): Promise<User | null> {
  const response = await fetchAPI(
    process.env.NEXT_PUBLIC_FOODSWAP_API_URL + `/auth/me`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) return null;

  return response.json();
}

export async function updateUser(
  id: string,
  data: { name: string },
): Promise<User | null> {
  const response = await fetchAPI(
    process.env.NEXT_PUBLIC_FOODSWAP_API_URL + `/users/${id}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
  );

  if (response.status === 404) return null;

  if (!response.ok) {
    throw new Error(`Failed to update user: ${response.status}`);
  }

  const updatedUser: User = await response.json();
  return updatedUser;
}

export async function deleteUser(id: string): Promise<boolean> {
  const response = await fetchAPI(
    process.env.NEXT_PUBLIC_FOODSWAP_API_URL + `/users/${id}`,
    { method: "DELETE" },
  );

  if (response.status === 404) return false;

  if (!response.ok) {
    throw new Error(`Failed to delete user: ${response.status}`);
  }

  return true;
}
