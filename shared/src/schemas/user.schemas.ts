import { z } from "zod";

import {
	MISSING_PLACE_MESSAGE,
	NAME_UNAVAILABLE_MESSAGE,
	USERNAME_UNAVAILABLE_MESSAGE,
} from "../messages";
import { isReservedName } from "../reservedNames";

/**
 * Letters (incl. ä, ö, ü, ß), digits, "_", "." and "-": no lookalike letters from other scripts
 * (e.g. a Cyrillic "А" in "Аdmin"). The backend has a copy in createUser.dto.ts.
 */
export const USERNAME_PATTERN = /^[A-Za-z0-9äöüÄÖÜß_.-]+$/;

// Limits of a new account; the backend has a copy in createUser.dto.ts
export const USERNAME_MIN_LENGTH = 5;
export const USERNAME_MAX_LENGTH = 20;
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 64;

/** Shown below the username field when registering: the rules of `registrationSchema`. */
export const USERNAME_HINT = `${USERNAME_MIN_LENGTH} bis ${USERNAME_MAX_LENGTH} Zeichen. Erlaubt sind Buchstaben, Ziffern und _ . -`;

/**
 * Shown below the password field when registering: the rules of `registrationSchema`. The
 * maximum is left out, hardly anyone reaches it, and the error message names it.
 */
export const PASSWORD_HINT = `Mindestens ${PASSWORD_MIN_LENGTH} Zeichen mit Groß- und Kleinbuchstaben, einer Zahl und einem Sonderzeichen.`;

export const loginSchema = z.object({
	username: z.string().trim().min(1, "Bitte gib einen Benutzernamen ein."),
	password: z.string().min(1, "Bitte gib ein Passwort ein."),
});

export const registrationSchema = z.object({
	username: z
		.string()
		.trim()
		.min(1, { error: "Bitte gib einen Benutzernamen ein.", abort: true })
		.min(
			USERNAME_MIN_LENGTH,
			`Der Benutzername muss mindestens ${USERNAME_MIN_LENGTH} Zeichen lang sein.`,
		)
		.max(
			USERNAME_MAX_LENGTH,
			`Der Benutzername darf höchstens ${USERNAME_MAX_LENGTH} Zeichen lang sein.`,
		)
		.regex(
			USERNAME_PATTERN,
			"Der Benutzername darf nur Buchstaben, Ziffern und _ . - enthalten.",
		)
		.refine((username) => !isReservedName(username), USERNAME_UNAVAILABLE_MESSAGE),
	password: z
		.string()
		.min(
			PASSWORD_MIN_LENGTH,
			`Das Passwort muss mindestens ${PASSWORD_MIN_LENGTH} Zeichen lang sein.`,
		)
		.max(
			PASSWORD_MAX_LENGTH,
			`Das Passwort darf höchstens ${PASSWORD_MAX_LENGTH} Zeichen lang sein.`,
		)
		.regex(/[A-Z]/, "Das Passwort muss mindestens einen Großbuchstaben enthalten.")
		.regex(/[a-z]/, "Das Passwort muss mindestens einen Kleinbuchstaben enthalten.")
		.regex(/[0-9]/, "Das Passwort muss mindestens eine Zahl enthalten.")
		.regex(/[^A-Za-z0-9]/, "Das Passwort muss mindestens ein Sonderzeichen enthalten."),
});

export const profileSchema = z
	.object({
		name: z
			.string()
			.trim()
			.min(1, "Bitte gib einen Profilnamen ein.")
			.max(100, "Der Profilname darf höchstens 100 Zeichen lang sein.")
			.refine((name) => !isReservedName(name), NAME_UNAVAILABLE_MESSAGE),
		placeId: z.string(),
		placeQuery: z.string(),
	})
	.refine((values) => values.placeId !== "" || values.placeQuery.trim() === "", {
		error: MISSING_PLACE_MESSAGE,
		path: ["placeId"],
	});

export type LoginValues = z.infer<typeof loginSchema>;
export type RegistrationValues = z.infer<typeof registrationSchema>;
export type ProfileValues = z.infer<typeof profileSchema>;
