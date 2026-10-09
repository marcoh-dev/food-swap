"use server";

import { redirect, unauthorized } from "next/navigation";
import { loginUser, registerUser } from "@/lib/auth.service";
import { deleteUser, getCurrentUser, updateUser } from "@/lib/users.service";
import { cookies } from "next/headers";
import { AUTH_COOKIE } from "@/lib/fetchAPI";
import { NewListing } from "@/lib/types/listing.types";
import {
  createListing,
  deleteListing,
  updateListing,
} from "@/lib/listings.service";
import { revalidatePath } from "next/cache";

export async function registerAction(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  const authData = await registerUser({ username, password });

  if (authData.statusCode) {
    throw new Error(authData.message);
  }
  redirect("/login");
}

export async function loginAction(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  const authData = await loginUser({ username, password });

  if (authData.statusCode === 401 || !authData.access_token) {
    throw new Error(authData.message);
  }

  const cookieStore = await cookies();

  cookieStore.set(AUTH_COOKIE, authData.access_token, {
    httpOnly: true,
    //secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60,
  });

  const user = await getCurrentUser();
  redirect(`/users/${user?.id}`);
}

export async function updateUserAction(formData: FormData) {
  const name = formData.get("name") as string;

  const currentUser = await getCurrentUser();
  if (!currentUser) unauthorized();

  await updateUser(currentUser.id, { name });

  redirect(`/users/${currentUser.id}`);
}

export async function deleteUserAction() {
  const currentUser = await getCurrentUser();
  if (!currentUser) unauthorized();

  await deleteUser(currentUser.id);

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

function readListing(formData: FormData): NewListing {
  return {
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    location: formData.get("location") as string,
    type: formData.get("type") as string,
  };
}

export async function createListingAction(formData: FormData) {
  const listing = await createListing(readListing(formData));
  revalidatePath("/listings");
  redirect(`/listings/${listing.id}`);
}

export async function updateListingAction(id: string, formData: FormData) {
  await updateListing(id, readListing(formData));
  revalidatePath("/listings");
  revalidatePath(`/listings/${id}`);
}

export async function deleteListingAction(id: string) {
  await deleteListing(id);
  revalidatePath("/listings");
  redirect("/listings");
}
