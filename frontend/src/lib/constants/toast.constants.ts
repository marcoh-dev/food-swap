import type { ToastType } from "../types/toast.types";

export const toastMessages: Record<string, { type: ToastType; message: string }> = {
	registered: {
		type: "success",
		message: "Registrierung erfolgreich! Willkommen bei FoodSwap.",
	},
	"register-error": {
		type: "error",
		message: "Registrierung fehlgeschlagen. Bitte prüfe deine Eingaben.",
	},
	"login-error": {
		type: "error",
		message: "Anmeldung fehlgeschlagen. Benutzername oder Passwort ist falsch.",
	},
	"user-delete-error": {
		type: "error",
		message: "Dein Account konnte nicht gelöscht werden.",
	},
	"listing-created": {
		type: "success",
		message: "Anzeige erfolgreich erstellt!",
	},
	"listing-deleted": {
		type: "info",
		message: "Anzeige gelöscht.",
	},
	"listing-delete-error": {
		type: "error",
		message: "Anzeige konnte nicht gelöscht werden.",
	},
};
