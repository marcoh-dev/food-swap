"use server"

import { redirect, unauthorized } from "next/navigation";
import { loginUser, registerUser } from "@/lib/auth.service";
import { getCurrentUser, updateUser } from "@/lib/users.service";
import { cookies } from "next/headers";

const AUTH_COOKIE = "auth_token";

export async function registerAction(formData: FormData) {
    console.log("register: ", formData)
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    
     const authData = await registerUser({ username, password });

  if (authData.statusCode) {
    throw new Error(authData.message);
  }
    redirect("/login")
}

export async function loginAction(formData: FormData) {
    console.log("login: ", formData)
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

  const authData = await loginUser({ username, password });

  if (authData.statusCode === 401 || !authData.access_token) {
    unauthorized();
  }

    const cookieStore = await cookies();

  cookieStore.set(AUTH_COOKIE, authData.access_token, {
    httpOnly: true,
    //secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60,
  });

    redirect(`/users/${encodeURIComponent(username)}`);
}

export async function nameAction(formData: FormData) {

    console.log("name", Array.from(formData.entries()));
    
    const name = formData.get("name") as string;

    const currentUser = await getCurrentUser();
if (!currentUser) redirect("/login")
    await updateUser(currentUser.username, {name});
 
      redirect(`/users/${encodeURIComponent(currentUser.username)}`);
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