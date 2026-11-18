import { z } from "zod";

export const loginSchema = z.object({
	username: z.string().trim().min(1, "Bitte gib einen Benutzernamen ein."),
	password: z.string().min(1, "Bitte gib ein Passwort ein."),
});

export type LoginValues = z.infer<typeof loginSchema>;
