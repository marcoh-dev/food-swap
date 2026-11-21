import type { ToastType } from "@/lib/types/toast.types";

export const toastMessages: Record<string, { type: ToastType; message: string }> = {
	registered: {
		type: "success",
		message: "Registrierung erfolgreich! Willkommen bei FoodSwap.",
	},
	"logged-out-everywhere": {
		type: "success",
		message: "Du wurdest auf allen Geräten abgemeldet.",
	},
	"logout-everywhere-error": {
		type: "error",
		message: "Abmelden auf allen Geräten hat nicht geklappt. Bitte versuche es nochmal.",
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
