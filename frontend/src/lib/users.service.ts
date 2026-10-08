import { mockUsers } from "./seedData";
import { User } from "./types/user.types";
import { cookies } from "next/headers";

const useMockApi = process.env.USE_MOCK_API === "true";
const AUTH_COOKIE = "auth_token";

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

export async function getCurrentUser(): Promise<User | null> {
 const cookieStore = await cookies();
 const token = cookieStore.get(AUTH_COOKIE)?.value;
 console.log("token: ", token)

if (!token) return null;

if (useMockApi) {
  const username = token.replace("mock-token-", "");
  return getUserByUsername(username)
}
return null
}

export async function updateUser(
  username: string,
  data: { name: string },
): Promise<User | null> {
  if (useMockApi) {
    const existingUser = mockUsers.find((user) => user.username === username);

    if (!existingUser) return null;

    existingUser.name = data.name;

    return {
      username: existingUser.username,
      name: existingUser.name,
      createdAt: existingUser.createdAt,
    };
  }

  const response = await fetch(
    `${process.env.API_URL}/users/${encodeURIComponent(username)}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
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