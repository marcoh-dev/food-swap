"use server"

import { redirect, unauthorized } from "next/navigation";
import { loginUser, registerUser } from "@/lib/auth.service";
import { cookies } from "next/headers";

const AUTH_COOKIE = "foodswap-backend_token";

export async function registerAction(formData: FormData) {
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    
     const authData = await registerUser({ username, password });

  if (authData.statusCode) {
    throw new Error(authData.message);
  }
    redirect("/login")
}

export async function loginAction(formData: FormData) {
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

  const authData = await loginUser({ username, password });

  if (authData.statusCode === 401 || !authData.access_token) {
    unauthorized();
  }

    const cookieStore = await cookies();

  cookieStore.set(AUTH_COOKIE, authData.access_token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60,
  });

    redirect(`/users/${encodeURIComponent(username)}`);
}

export async function logoutAction() {
      const cookieStore = await cookies();

  cookieStore.delete(AUTH_COOKIE);
    redirect("/")
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();

  const token = cookieStore.get(AUTH_COOKIE)?.value;

  return token ? true : false;
}