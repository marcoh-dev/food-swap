import { AuthResponse, RegistrationResponse } from "./types/auth.types";
import { UserCredentials } from "./types/user.types";
import { fetchAPI } from "./fetchAPI";

export async function loginUser({
  username,
  password,
}: UserCredentials): Promise<AuthResponse> {
  const response = await fetch(
    process.env.NEXT_PUBLIC_FOODSWAP_API_URL + `/auth/login`,
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
  const response = await fetchAPI(
    process.env.NEXT_PUBLIC_FOODSWAP_API_URL + `/auth/register`,
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
