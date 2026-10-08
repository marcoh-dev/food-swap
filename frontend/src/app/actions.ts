"use server";

import { redirect, unauthorized } from "next/navigation";
import { loginUser, registerUser } from "@/lib/auth.service";
import { deleteUser, getCurrentUser, updateUser } from "@/lib/users.service";
import { cookies } from "next/headers";

const AUTH_COOKIE = "auth_token";

export async function registerAction(formData: FormData) {
  console.log("register: ", formData);
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  const authData = await registerUser({ username, password });

  if (authData.statusCode === 409) {
    redirect("/registration?error=username-taken");
  }
  redirect("/login");
}

export async function loginAction(formData: FormData) {
  console.log("login: ", formData);
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  const authData = await loginUser({ username, password });

  console.log("login attempt:", {
    username,
    statusCode: authData.statusCode,
    hasToken: Boolean(authData.access_token),
  });

  if (authData.statusCode === 401 || !authData.access_token) {
    redirect("/login?error=invalid-credentials");
  }

  const cookieStore = await cookies();

  cookieStore.set(AUTH_COOKIE, authData.access_token, {
    httpOnly: true,
    //secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60,
  });

  redirect(`/users/${encodeURIComponent(username.toLowerCase())}`);
}

export async function setProfileNameAction(formData: FormData) {
  console.log("name", Array.from(formData.entries()));

  const name = formData.get("name") as string;

  const currentUser = await getCurrentUser();
  if (!currentUser) unauthorized();
  await updateUser(currentUser.username, { name });

  redirect(`/users/${encodeURIComponent(currentUser.username)}`);
}

export async function deleteUserAction() {
  const currentUser = await getCurrentUser();
  if (!currentUser) unauthorized();

  await deleteUser(currentUser.username);
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE);

  redirect("/");
}

export async function logoutAction() {
  const cookieStore = await cookies();

  cookieStore.delete(AUTH_COOKIE);

  redirect("/");
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();

  const token = cookieStore.get(AUTH_COOKIE)?.value;

  return token ? true : false;
}
