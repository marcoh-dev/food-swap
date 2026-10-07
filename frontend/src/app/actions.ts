"use server"

import { redirect } from "next/navigation";

export async function registerAction(formData: FormData) {
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    
    redirect("/login")
}

export async function loginAction(formData: FormData) {
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    console.log("loginUser", username)

    redirect(`/users/${encodeURIComponent(username)}`);
}

export async function logoutAction() {
    redirect("/")
}