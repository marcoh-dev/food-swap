"use server";

import { getBerlinDay } from "@food-swap/shared/dates";
import {
	LOGIN_FAILED_MESSAGE,
	LOGIN_RATE_LIMITED_MESSAGE,
	REGISTRATION_RATE_LIMITED_MESSAGE,
	USERNAME_UNAVAILABLE_MESSAGE,
} from "@food-swap/shared/messages";
import { createListingSchema, type ListingFormValues } from "@food-swap/shared/schemas/listing";
import {
	loginSchema,
	type LoginValues,
	profileSchema,
	type ProfileValues,
	registrationSchema,
	type RegistrationValues,
} from "@food-swap/shared/schemas/user";
import type { ListingResponse, ListingStatus, NewListing, Place } from "@food-swap/shared/types";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { notFound, redirect, unauthorized } from "next/navigation";
import { z } from "zod";

import { loginUser, logoutEverywhere, registerUser, revokeRefreshToken } from "@/lib/auth.service";
import { AUTH_COOKIE, deleteAuthCookies, REFRESH_COOKIE, setAuthCookies } from "@/lib/authCookies";
import {
	createListing,
	deleteListing,
	getListingById,
	updateListing,
	updateListingStatus,
} from "@/lib/listings.service";
import { findNearestPlace, searchPlaces } from "@/lib/places.service";
import {
	deletePushSubscription,
	savePushSubscription,
	type WebPushSubscription,
} from "@/lib/push.service";
import { getRedirectTarget } from "@/lib/redirectTarget";
import type { ActionResult, FormState } from "@/lib/types/common.types";
import { deleteUser, getCurrentUser, updateUser } from "@/lib/users.service";

function withToast(target: string, toast: string): string {
	const separator = target.includes("?") ? "&" : "?";
	return `${target}${separator}toast=${toast}`;
}

export async function registerAction(
	values: RegistrationValues,
	redirectTo?: string,
): Promise<FormState> {
	const result = registrationSchema.safeParse(values);
	if (!result.success) return { fieldErrors: z.flattenError(result.error).fieldErrors };

	const authData = await registerUser(result.data);

	if (authData.statusCode === 429) {
		return {
			error: REGISTRATION_RATE_LIMITED_MESSAGE,
		};
	}

	if (authData.statusCode === 409) {
		return { fieldErrors: { username: [USERNAME_UNAVAILABLE_MESSAGE] } };
	}

	if (!authData.access_token || !authData.refresh_token) {
		return { error: "Registrierung fehlgeschlagen. Bitte prüfe deine Eingaben." };
	}

	setAuthCookies(await cookies(), {
		access_token: authData.access_token,
		refresh_token: authData.refresh_token,
	});

	redirect(withToast(getRedirectTarget(redirectTo), "registered"));
}

export async function loginAction(values: LoginValues, redirectTo?: string): Promise<FormState> {
	const result = loginSchema.safeParse(values);
	if (!result.success) return { fieldErrors: z.flattenError(result.error).fieldErrors };

	const authData = await loginUser(result.data);

	if (authData.statusCode === 429) {
		return { error: LOGIN_RATE_LIMITED_MESSAGE };
	}

	if (!authData.access_token) {
		return { error: LOGIN_FAILED_MESSAGE };
	}

	setAuthCookies(await cookies(), authData);

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

	revalidatePath(`/users/${currentUser.id}`);
	return {};
}

export async function deleteUserAction() {
	const currentUser = await getCurrentUser();
	if (!currentUser) unauthorized();

	try {
		await deleteUser(currentUser.id);
	} catch {
		redirect(`/users/${currentUser.id}?toast=user-delete-error`);
	}

	// The backend deleted the refresh tokens together with the account
	deleteAuthCookies(await cookies());

	redirect("/");
}

// What a browser's PushSubscription.toJSON() contains; checked because it comes from the browser
const pushSubscriptionSchema = z.object({
	endpoint: z.url(),
	keys: z.object({ p256dh: z.string().min(1), auth: z.string().min(1) }),
});

/** Saves (or renews) this browser's push subscription for the logged-in user. */
export async function savePushSubscriptionAction(
	subscription: WebPushSubscription,
): Promise<ActionResult<null>> {
	const result = pushSubscriptionSchema.safeParse(subscription);
	if (!result.success) return { error: "Ungültige Push-Anmeldung." };

	try {
		await savePushSubscription(result.data);
		return { data: null };
	} catch {
		return { error: "Push-Benachrichtigungen konnten nicht eingerichtet werden." };
	}
}

/** Deletes this browser's push subscription, e.g. when notifications are turned off. */
export async function deletePushSubscriptionAction(endpoint: string): Promise<ActionResult<null>> {
	try {
		await deletePushSubscription(endpoint);
		return { data: null };
	} catch {
		return { error: "Push-Benachrichtigungen konnten nicht abgemeldet werden." };
	}
}

export async function logoutAction() {
	const cookieStore = await cookies();

	const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;
	if (refreshToken) await revokeRefreshToken(refreshToken);
	deleteAuthCookies(cookieStore);

	redirect("/");
}

export async function logoutEverywhereAction() {
	const currentUser = await getCurrentUser();
	if (!currentUser) unauthorized();

	try {
		await logoutEverywhere();
	} catch {
		redirect(withToast(`/users/${currentUser.id}`, "logout-everywhere-error"));
	}

	// The backend already deleted the refresh tokens of all devices
	deleteAuthCookies(await cookies());

	redirect(withToast("/", "logged-out-everywhere"));
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
	const sort = formData.get("sort") as string;
	const view = formData.get("view") as string;

	const searchParams = new URLSearchParams();
	if (term) searchParams.set("term", term);
	if (place) searchParams.set("place", place);
	if (place && radius) searchParams.set("radius", radius);
	if (category) searchParams.set("category", category);
	if (tags) searchParams.set("tags", tags);
	if (sort && sort !== "newest" && (sort !== "nearest" || place)) {
		searchParams.set("sort", sort);
	}
	if (view === "list") searchParams.set("view", view);

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

// The backend ends the listing at 23:59 Berlin time on that day and uses its
// default duration when no day is sent.
function toNewListing(values: ListingFormValues, endDate?: string): NewListing {
	return {
		title: values.title,
		description: values.description,
		image: values.image,
		placeId: values.placeId,
		type: values.type,
		categoryId: values.categoryId || null,
		tagIds: values.tagIds,
		endDate: endDate || undefined,
	};
}

export async function createListingAction(values: ListingFormValues): Promise<FormState> {
	const currentUser = await getCurrentUser();
	if (!currentUser) unauthorized();

	const result = createListingSchema().safeParse(values);
	if (!result.success) return { fieldErrors: z.flattenError(result.error).fieldErrors };

	let listing: ListingResponse;

	try {
		listing = await createListing(toNewListing(result.data, result.data.endDate));
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

	const originalEndDate = getBerlinDay(new Date(existing.endDate));

	const result = createListingSchema(originalEndDate).safeParse(values);
	if (!result.success) return { fieldErrors: z.flattenError(result.error).fieldErrors };

	const isEndDateUnchanged = result.data.endDate === originalEndDate;
	const endDate = isEndDateUnchanged ? undefined : result.data.endDate;

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

export async function deleteListingAction(id: string, redirectTo?: string) {
	const currentUser = await getCurrentUser();
	if (!currentUser) unauthorized();

	const target = redirectTo ? getRedirectTarget(redirectTo) : "/listings";

	try {
		await deleteListing(id);
	} catch {
		redirect(withToast(target, "listing-delete-error"));
	}
	revalidatePath("/listings");
	redirect(withToast(target, "listing-deleted"));
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
