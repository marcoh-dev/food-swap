import { AuthResponse, RegistrationResponse } from "./types/auth.types";
import { UserCredentials } from "./types/user.types";
import { mockUsers } from "./mock/seedData";

const useMockApi = process.env.USE_MOCK_API === "true";

export async function loginUser({
  username,
  password,
}: UserCredentials): Promise<AuthResponse> {
  if (useMockApi) {
    const matchingUser = mockUsers.find(
      (user) => user.username === username && user.password === password,
    );

    if (!matchingUser) {
      return {
        access_token: "",
        statusCode: 401,
        message: "Invalid credentials",
      };
    }

    return { access_token: `mock-token-${matchingUser.id}` };
  }

  const response = await fetch(
    `${process.env.API_URL}/users/${encodeURIComponent(username)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    },
  );
  const authData = await response.json();

  return authData;
}

export async function registerUser({
  username,
  password,
}: UserCredentials): Promise<RegistrationResponse> {
  if (useMockApi) {
    const matchingUser = mockUsers.find((user) => user.username === username);

    if (matchingUser) {
      return {
        username,
        id: "",
        statusCode: 409,
        message: "Username already exists",
      };
    }

    const id = crypto.randomUUID();
    mockUsers.push({
      id,
      username,
      password,
      createdAt: new Date().toISOString(),
    });

    return { username, id };
  }

  const response = await fetch(
    `${process.env.API_URL}/users/${encodeURIComponent(username)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    },
  );
  const registrationData = await response.json();

  return registrationData;
}
