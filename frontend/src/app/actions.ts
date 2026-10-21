"use server";

import { notFound, redirect, unauthorized } from "next/navigation";
import { loginUser, registerUser } from "@/lib/auth.service";
import { deleteUser, getCurrentUser, updateUser } from "@/lib/users.service";
import { cookies } from "next/headers";
import { AUTH_COOKIE } from "@/lib/fetchAPI";
import type { FormState, ListingStatus, ListingType, NewListing } from "@/lib/types/listing.types";
import {
	createListing,
	deleteListing,
	getListingById,
	updateListing,
	updateListingStatus,
} from "@/lib/listings.service";
import { revalidatePath } from "next/cache";
import {
	ApiError,
	deleteChat,
	getChat,
	getChats,
	replyToChat,
	startChat,
} from "@/lib/chats.service";
import type { ActionResult } from "@/lib/types/common.types";
import { searchPlaces } from "@/lib/places.service";
import type { Place } from "@/lib/types/place.types";
import type { ChatDetail, ChatListItem, ChatMessage } from "@/lib/types/chat.types";
import { formatIsoDate, getDefaultEndDate, getEndOfDay, validateEndDate } from "@/utils/date";

function getRedirectTarget(formData: FormData): string {
	const target = formData.get("redirect");

	if (
		typeof target !== "string" ||
		!target.startsWith("/") ||
		target.startsWith("//") ||
		target.startsWith("/\\")
	) {
		return "/";
	}

	return target;
}

function authErrorPath(page: string, toastKey: string, redirectTo: string) {
	const searchParams = new URLSearchParams({ toast: toastKey });
	if (redirectTo !== "/") searchParams.set("redirect", redirectTo);

	return `${page}?${searchParams.toString()}`;
}

async function setAuthCookie(token: string) {
	const cookieStore = await cookies();

	cookieStore.set(AUTH_COOKIE, token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		path: "/",
		maxAge: 60 * 60,
	});
}

export async function registerAction(formData: FormData) {
	const username = formData.get("username") as string;
	const password = formData.get("password") as string;
	const redirectTo = getRedirectTarget(formData);

	const authData = await registerUser({ username, password });

	if (!authData.access_token) {
		redirect(authErrorPath("/registration", "register-error", redirectTo));
	}

	await setAuthCookie(authData.access_token);

	const separator = redirectTo.includes("?") ? "&" : "?";
	redirect(`${redirectTo}${separator}toast=registered`);
}

export async function loginAction(formData: FormData) {
	const username = formData.get("username") as string;
	const password = formData.get("password") as string;
	const redirectTo = getRedirectTarget(formData);

	const authData = await loginUser({ username, password });

	if (!authData.access_token) {
		redirect(authErrorPath("/login", "login-error", redirectTo));
	}

	await setAuthCookie(authData.access_token);

	redirect(redirectTo);
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

	try {
		await deleteUser(currentUser.id);
	} catch {
		redirect(`/users/${currentUser.id}?toast=user-delete-error`);
	}

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

export async function searchListingAction(formData: FormData) {
	const term = formData.get("term") as string;
	const location = formData.get("location") as string;
	const category = formData.get("category") as string;
	const tags = formData.get("tags") as string;

	const searchParams = new URLSearchParams();
	if (term) searchParams.set("term", term);
	if (location) searchParams.set("location", location);
	if (category) searchParams.set("category", category);
	if (tags) searchParams.set("tags", tags);

	redirect(`/listings?${searchParams.toString()}`);
}

export async function searchPlacesAction(query: string): Promise<ActionResult<Place[]>> {
	try {
		return { data: await searchPlaces(query) };
	} catch {
		return { error: "Orte konnten nicht geladen werden." };
	}
}

function readListing(formData: FormData, endDate?: Date): NewListing {
	return {
		title: formData.get("title") as string,
		description: formData.get("description") as string,
		image: formData.get("image") as string,
		location: formData.get("location") as string,
		type: formData.get("type") as ListingType,
		categoryId: (formData.get("categoryId") as string) || null,
		tagIds: formData.getAll("tagIds") as string[],
		endDate: endDate ? getEndOfDay(endDate).toISOString() : undefined,
	};
}

export async function createListingAction(
	_prevState: FormState,
	formData: FormData,
): Promise<FormState> {
	const currentUser = await getCurrentUser();
	if (!currentUser) unauthorized();

	const result = validateEndDate(formData.get("endDate"));
	if (!result.ok) return { error: result.error };

	const endDate = result.date ?? getDefaultEndDate();

	const listing = await createListing(readListing(formData, endDate));

	revalidatePath("/listings");
	redirect(`/listings/${listing.id}?toast=listing-created`);
}

export async function updateListingAction(id: string, formData: FormData) {
	const currentUser = await getCurrentUser();
	if (!currentUser) unauthorized();

	const existing = await getListingById(id);

	if (!existing) notFound();

	const submittedEndDate = formData.get("endDate");
	const isEndDateUnchanged = submittedEndDate === formatIsoDate(new Date(existing.endDate));

	let endDate: Date | undefined;

	if (!isEndDateUnchanged) {
		const result = validateEndDate(submittedEndDate);
		if (!result.ok) return { error: result.error };

		endDate = result.date;
	}

	try {
		await updateListing(id, readListing(formData, endDate));
	} catch (error) {
		console.log(error);
		return {
			error: "Das Angebot konnte nicht gespeichert werden. Bitte versuche es später noch mal.",
		};
	}

	revalidatePath("/listings");
	revalidatePath(`/listings/${id}`);

	return {};
}

export async function deleteListingAction(id: string) {
	const currentUser = await getCurrentUser();
	if (!currentUser) unauthorized();

	try {
		await deleteListing(id);
	} catch {
		redirect("/listings?toast=listing-delete-error");
	}
	revalidatePath("/listings");
	redirect("/listings?toast=listing-deleted");
}

function chatErrorMessage(error: unknown, fallback: string): string {
	if (error instanceof ApiError) {
		if (error.status === 401) {
			return "Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.";
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
			error: chatErrorMessage(
				error,
				"Deine Chats konnten nicht geladen werden. Versuche es nochmal.",
			),
		};
	}
}

export async function getChatAction(chatId: string): Promise<ActionResult<ChatDetail>> {
	try {
		return { data: await getChat(chatId) };
	} catch (error) {
		return {
			error: chatErrorMessage(
				error,
				"Dieser Chat konnte nicht geladen werden. Versuche es nochmal.",
			),
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
			error: chatErrorMessage(
				error,
				"Die Nachricht konnte nicht gesendet werden. Versuche es nochmal.",
			),
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
			error: chatErrorMessage(
				error,
				"Die Nachricht konnte nicht gesendet werden. Versuche es nochmal.",
			),
		};
	}
}

export async function deleteChatAction(chatId: string): Promise<ActionResult<null>> {
	try {
		await deleteChat(chatId);
		return { data: null };
	} catch (error) {
		return {
			error: chatErrorMessage(
				error,
				"Der Chat konnte nicht gelöscht werden. Versuche es nochmal.",
			),
		};
	}
}

export async function updateListingStatusAction(id: string, status: ListingStatus) {
	const currentUser = await getCurrentUser();
	if (!currentUser)
		return {
			error: "Du musst eingeloggt sein, um den Status ändern zu können.",
		};

	const result = await updateListingStatus(id, status);

	if (result.error) return { error: result.error };

	revalidatePath(`/listings/${id}`);
	revalidatePath("/listings");
	return {};
}
