// Stored normalized (see normalizeName). The backend has a copy in
// backend/src/users/reservedNames.ts; a backend test checks that both lists match.
const RESERVED_NAMES = [
	"admin",
	"administrator",
	"administration",
	"moderator",
	"moderation",
	"mod",
	"staff",
	"team",
	"support",
	"helpdesk",
	"help",
	"service",
	"owner",
	"official",
	"system",
	"root",
	"bot",
	"hilfe",
	"kontakt",
	"betreiber",
	"verwaltung",
	"mitarbeiter",
	"offiziell",
	"kundenservice",
	"kundendienst",
	"impressum",
	"security",
	"sicherheit",
	"privacy",
	"datenschutz",
	"legal",
	"abuse",
	"contact",
	"info",
	"feedback",
	"noreply",
	"postmaster",
	"webmaster",
	"gelöschteskonto",
	"geloeschteskonto",
	"geloschteskonto",
	"deleted",
	"anonymous",
	"anonym",
	"unknown",
	"unbekannt",
	"null",
	"undefined",
];

const DIGIT_LETTERS: Record<string, string> = { "0": "o", "1": "i", "3": "e", "4": "a", "5": "s" };

/** Lowercase, common digit replacements and only letters and digits, so "4dm1n" and "Food_Swap" match. */
export function normalizeName(name: string): string {
	return name
		.toLowerCase()
		.replace(/[01345]/g, (digit) => DIGIT_LETTERS[digit] ?? digit)
		.replace(/[^a-z0-9äöüß]/g, "");
}

/**
 * Whether a username or profile name is reserved for the FoodSwap team or could be mistaken for
 * something the app shows (e.g. "Gelöschtes Konto"). The whole name is compared, so
 * "badminton_fan" is allowed; only the brand counts anywhere in the name.
 */
export function isReservedName(name: string): boolean {
	const normalized = normalizeName(name);
	return RESERVED_NAMES.includes(normalized) || normalized.includes("foodswap");
}
