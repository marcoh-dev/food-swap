import { mockUsers } from "./seedData";
import { User } from "./types/user.types";

const useMockApi = process.env.USE_MOCK_API === "true";

export async function getUserByUsername(username: string): Promise<User | null> {
  if (useMockApi) {
    const mockUser = mockUsers.find((user) => user.username === username);

    if (!mockUser) return null;

    return {
      username: mockUser.username,
      name: mockUser.name,
      createdAt: mockUser.createdAt,
    };
  }

   const response = await fetch(
    `${process.env.API_URL}/users/${encodeURIComponent(username)}`,
  );

   if (response.status === 404) return null;

  if (!response.ok) {
    throw new Error(`Failed to fetch user: ${response.status}`);
  }
  const user: User = await response.json();
  return user;
}

export async function updateUser({
  username,
  name,
}: {
  username: string;
  name: string;
}): Promise<User | null> {
  if (useMockApi) {
    const existingUser = mockUsers.find((user) => user.username === username);

    if (!existingUser) return null;

    existingUser.name = name;
    return existingUser;
  }

  const response = await fetch(
    `${process.env.API_URL}/users/${encodeURIComponent(username)}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    },
  );

  if (response.status === 404) return null;

  if (!response.ok) {
    throw new Error(`Failed to update user: ${response.status}`);
  }

  const updatedUser: User = await response.json();
  return updatedUser;
}