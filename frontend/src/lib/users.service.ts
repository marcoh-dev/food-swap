import { mockUsers } from "./mock/seedData";
import { User } from "./types/user.types";
import { cookies } from "next/headers";

const useMockApi = process.env.USE_MOCK_API === "true";
const AUTH_COOKIE = "auth_token";

async function getAuthHeaders(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;

  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getUserById(id: string): Promise<User | null> {
  if (useMockApi) {
    const mockUser = mockUsers.find((user) => user.id === id);

    if (!mockUser) return null;

    return {
      id: mockUser.id,
      username: mockUser.username,
      name: mockUser.name,
      createdAt: mockUser.createdAt,
    };
  }

  const response = await fetch(`${process.env.API_URL}/users/${id}`);

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

  if (!token) return null;

  if (useMockApi) {
    const id = token.replace("mock-token-", "");
    return getUserById(id);
  }
  return null;
}

export async function updateUser(
  id: string,
  data: { name: string },
): Promise<User | null> {
  if (useMockApi) {
    const existingUser = mockUsers.find((user) => user.id === id);

    if (!existingUser) return null;

    existingUser.name = data.name;

    return {
      id: existingUser.id,
      username: existingUser.username,
      name: existingUser.name,
      createdAt: existingUser.createdAt,
    };
  }

  const response = await fetch(`${process.env.API_URL}/users/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(await getAuthHeaders()),
    },
    body: JSON.stringify(data),
  });

  if (response.status === 404) return null;

  if (!response.ok) {
    throw new Error(`Failed to update user: ${response.status}`);
  }

  const updatedUser: User = await response.json();
  return updatedUser;
}

export async function deleteUser(id: string): Promise<boolean> {
  if (useMockApi) {
    const index = mockUsers.findIndex((user) => user.id === id);

    if (index === -1) return false;

    mockUsers.splice(index, 1);
    return true;
  }
  const response = await fetch(`${process.env.API_URL}/users/${id}`, {
    method: "DELETE",
    headers: await getAuthHeaders(),
  });

  if (response.status === 404) return false;
  if (!response.ok) {
    throw new Error(`Failed to delete user: ${response.status}`);
  }
  return true;
}
