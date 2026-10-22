"use server";

import { notFound, redirect, unauthorized } from "next/navigation";
import { loginUser, registerUser } from "@/lib/auth.service";
import { deleteUser, getCurrentUser, updateUser } from "@/lib/users.service";
import { cookies } from "next/headers";
import { AUTH_COOKIE } from "@/lib/fetchAPI";
import type { ListingResponse, ListingStatus, NewListing } from "@/lib/types/listing.types";
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
import type { ActionResult, FormState } from "@/lib/types/common.types";
import { findNearestPlace, searchPlaces } from "@/lib/places.service";
import type { Place } from "@/lib/types/place.types";
import type { ChatDetail, ChatListItem, ChatMessage } from "@/lib/types/chat.types";
import { formatIsoDate, getDefaultEndDate, getEndOfDay, parseEndDate } from "@/utils/date";
import { z } from "zod";
import {
	loginSchema,
	profileSchema,
	registrationSchema,
	type LoginValues,
	type ProfileValues,
	type RegistrationValues,
} from "@/lib/schemas/user.schemas";
import { createListingSchema, type ListingFormValues } from "@/lib/schemas/listing.schemas";

function getRedirectTarget(target: unknown): string {
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

export async function registerAction(
	values: RegistrationValues,
	redirectTo?: string,
): Promise<FormState> {
	const result = registrationSchema.safeParse(values);
	if (!result.success) return { fieldErrors: z.flattenError(result.error).fieldErrors };

	const authData = await registerUser(result.data);

	if (authData.statusCode === 409) {
		return { fieldErrors: { username: ["Dieser Benutzername ist bereits vergeben."] } };
	}

	if (!authData.access_token) {
		return { error: "Registrierung fehlgeschlagen. Bitte prüfe deine Eingaben." };
	}

	await setAuthCookie(authData.access_token);

	const target = getRedirectTarget(redirectTo);
	const separator = target.includes("?") ? "&" : "?";
	redirect(`${target}${separator}toast=registered`);
}

export async function loginAction(values: LoginValues, redirectTo?: string): Promise<FormState> {
	const result = loginSchema.safeParse(values);
	if (!result.success) return { fieldErrors: z.flattenError(result.error).fieldErrors };

	const authData = await loginUser(result.data);

	if (!authData.access_token) {
		return { error: "Anmeldung fehlgeschlagen. Benutzername oder Passwort ist falsch." };
	}

	await setAuthCookie(authData.access_token);

	redirect(getRedirectTarget(redirectTo));
}

export async function updateUserAction(values: ProfileValues): Promise<FormState> {
	const result = profileSchema.safeParse(values);
	if (!result.success) return { fieldErrors: z.flattenError(result.error).fieldErrors };

	const { name, placeId } = result.data;

	const currentUser = await getCurrentUser();
	if (!currentUser) unauthorized();

	try {
		await updateUser(currentUser.id, { name, placeId: placeId || null });
	} catch (error) {
		console.error(error);
		return {
			error: "Dein Profil konnte nicht gespeichert werden. Bitte versuche es später noch mal.",
		};
	}

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
	const place = formData.get("place") as string;
	const radius = formData.get("radius") as string;
	const category = formData.get("category") as string;
	const tags = formData.get("tags") as string;

	const searchParams = new URLSearchParams();
	if (term) searchParams.set("term", term);
	if (place) searchParams.set("place", place);
	if (place && radius) searchParams.set("radius", radius);
	if (category) searchParams.set("category", category);
	if (tags) searchParams.set("tags", tags);

	redirect(`/listings?${searchParams.toString()}`);
}

export async function searchPlacesAction(
	query: string,
	withPostalCode = false,
): Promise<ActionResult<Place[]>> {
	try {
		return { data: await searchPlaces(query, withPostalCode) };
	} catch {
		return { error: "Orte konnten nicht geladen werden." };
	}
}

export async function findNearestPlaceAction(
	lat: number,
	lng: number,
): Promise<ActionResult<Place>> {
	try {
		return { data: await findNearestPlace(lat, lng) };
	} catch {
		return { error: "Standort konnte nicht ermittelt werden." };
	}
}

function toEndDate(value: string): Date | undefined {
	const parsed = parseEndDate(value);
	return parsed.status === "valid" ? parsed.date : undefined;
}

function toNewListing(values: ListingFormValues, endDate?: Date): NewListing {
	return {
		title: values.title,
		description: values.description,
		image: values.image,
		placeId: values.placeId,
		type: values.type,
		categoryId: values.categoryId || null,
		tagIds: values.tagIds,
		endDate: endDate ? getEndOfDay(endDate).toISOString() : undefined,
	};
}

export async function createListingAction(values: ListingFormValues): Promise<FormState> {
	const currentUser = await getCurrentUser();
	if (!currentUser) unauthorized();

	const result = createListingSchema().safeParse(values);
	if (!result.success) return { fieldErrors: z.flattenError(result.error).fieldErrors };

	const endDate = toEndDate(result.data.endDate) ?? getDefaultEndDate();

	let listing: ListingResponse;

	try {
		listing = await createListing(toNewListing(result.data, endDate));
	} catch (error) {
		console.error(error);
		return {
			error: "Das Angebot konnte nicht erstellt werden. Bitte versuche es später noch mal.",
		};
	}

	revalidatePath("/listings");
	redirect(`/listings/${listing.id}?toast=listing-created`);
}

export async function updateListingAction(
	id: string,
	values: ListingFormValues,
): Promise<FormState> {
	const currentUser = await getCurrentUser();
	if (!currentUser) unauthorized();

	const existing = await getListingById(id);

	if (!existing) notFound();

	const originalEndDate = formatIsoDate(new Date(existing.endDate));

	const result = createListingSchema(originalEndDate).safeParse(values);
	if (!result.success) return { fieldErrors: z.flattenError(result.error).fieldErrors };

	const isEndDateUnchanged = result.data.endDate === originalEndDate;
	const endDate = isEndDateUnchanged ? undefined : toEndDate(result.data.endDate);

	try {
		await updateListing(id, toNewListing(result.data, endDate));
	} catch (error) {
		console.error(error);
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
