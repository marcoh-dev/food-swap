import { z } from "zod";
import { MISSING_PLACE_MESSAGE } from "@/lib/constants/listing.constants";

export const loginSchema = z.object({
	username: z.string().trim().min(1, "Bitte gib einen Benutzernamen ein."),
	password: z.string().min(1, "Bitte gib ein Passwort ein."),
});

export const registrationSchema = z.object({
	username: z
		.string()
		.trim()
		.min(1, { error: "Bitte gib einen Benutzernamen ein.", abort: true })
		.min(5, "Der Benutzername muss mindestens 5 Zeichen lang sein.")
		.max(20, "Der Benutzername darf höchstens 20 Zeichen lang sein."),
	password: z
		.string()
		.min(8, "Das Passwort muss mindestens 8 Zeichen lang sein.")
		.max(64, "Das Passwort darf höchstens 64 Zeichen lang sein.")
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
			.max(100, "Der Profilname darf höchstens 100 Zeichen lang sein."),
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
