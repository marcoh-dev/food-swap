"use server";

import { redirect, unauthorized } from "next/navigation";
import { loginUser, registerUser } from "@/lib/auth.service";
import { deleteUser, getCurrentUser, updateUser } from "@/lib/users.service";
import { cookies } from "next/headers";
import { AUTH_COOKIE } from "@/lib/fetchAPI";
import { ListingType, NewListing } from "@/lib/types/listing.types";
import { createListing, deleteListing, updateListing } from "@/lib/listings.service";
import { revalidatePath } from "next/cache";
import {
	ApiError,
	deleteChat,
	getChat,
	getChats,
	replyToChat,
	startChat,
} from "@/lib/chats.service";
import { ActionResult } from "@/lib/types/common.types";
import { ChatDetail, ChatListItem, ChatMessage } from "@/lib/types/chat.types";

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
		title: formData.get("title") as string,
		description: formData.get("description") as string,
		image: formData.get("image") as string,
		location: formData.get("location") as string,
		type: formData.get("type") as ListingType,
	};
}

export async function createListingAction(formData: FormData) {
	const listing = await createListing(readListing(formData));
	const currentUser = await getCurrentUser();
	if (!currentUser) unauthorized();

	revalidatePath("/listings");
	redirect(`/listings/${listing.id}`);
}

export async function updateListingAction(id: string, formData: FormData) {
	await updateListing(id, readListing(formData));
	const currentUser = await getCurrentUser();
	if (!currentUser) unauthorized();

	revalidatePath("/listings");
	revalidatePath(`/listings/${id}`);
}

export async function deleteListingAction(id: string) {
	const currentUser = await getCurrentUser();
	if (!currentUser) unauthorized();
	await deleteListing(id);
	revalidatePath("/listings");
	redirect("/listings");
}

function chatErrorMessage(error: unknown, fallback: string): string {
	if (error instanceof ApiError) {
		if (error.status === 401) {
			return "Your session has expired. Please log in again.";
		}

		if ([400, 403, 404].includes(error.status)) {
			return error.message;
		}
	}
	return fallback;
}

export async function getChatsAction(): Promise<ActionResult<ChatListItem[]>> {
	try {
		return { data: await getChats() };
	} catch (error) {
		return {
			error: chatErrorMessage(error, "Your chats could not be loaded. Please try again."),
		};
	}
}

export async function getChatAction(chatId: string): Promise<ActionResult<ChatDetail>> {
	try {
		return { data: await getChat(chatId) };
	} catch (error) {
		return {
			error: chatErrorMessage(error, "This chat could not be loaded. Please try again."),
		};
	}
}

export async function startChatAction(
	listingId: string,
	content: string,
): Promise<ActionResult<ChatMessage>> {
	try {
		return { data: await startChat(listingId, content) };
	} catch (error) {
		return {
			error: chatErrorMessage(error, "Message could not be sent. Please try again."),
		};
	}
}

export async function replyToChatAction(
	chatId: string,
	content: string,
): Promise<ActionResult<ChatMessage>> {
	try {
		return { data: await replyToChat(chatId, content) };
	} catch (error) {
		return {
			error: chatErrorMessage(error, "Message could not be sent. Please try again."),
		};
	}
}

export async function deleteChatAction(chatId: string): Promise<ActionResult<null>> {
	try {
		await deleteChat(chatId);
		return { data: null };
	} catch (error) {
		return {
			error: chatErrorMessage(error, "The chat could not be deleted. Please try again."),
		};
	}
}
