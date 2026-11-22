import { MigrationInterface, QueryRunner } from "typeorm";

// Copies of the rules from #225 on purpose: a migration has to keep doing what it did when it ran,
// even if the lists in the code change later.
const DISALLOWED_CHARACTERS = /[^A-Za-z0-9äöüÄÖÜß_.-]/g;
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

function isReservedName(name: string) {
	const normalized = name
		.toLowerCase()
		.replace(/[01345]/g, (digit) => DIGIT_LETTERS[digit] ?? digit)
		.replace(/[^a-z0-9äöüß]/g, "");
	return RESERVED_NAMES.includes(normalized) || normalized.includes("foodswap");
}

type UserRow = { id: string; username: string; name: string | null };

/**
 * Makes usernames unique regardless of case (#225). First adjusts existing accounts that break the
 * new rules, oldest first: of names that only differ in case the oldest keeps its name and the
 * others get a number (`maria` → `maria_2`); reserved names become `nutzer_2` …, disallowed
 * characters become `_`. Reserved profile names are removed, so the username is shown instead.
 * Every change is logged. `down` only drops the index; changed accounts keep their new names.
 */
export class UniqueUsernamesRegardlessOfCase1795307050316 implements MigrationInterface {
	name = "UniqueUsernamesRegardlessOfCase1795307050316";

	public async up(queryRunner: QueryRunner): Promise<void> {
		const users = (await queryRunner.query(
			`SELECT "id", "username", "name" FROM "users" ORDER BY "createdAt", "id"`,
		)) as UserRow[];
		// All names in use, so a new name never collides with another account, also a later one
		const used = new Set(users.map((user) => user.username.toLowerCase()));
		const kept = new Set<string>();

		for (const user of users) {
			const reserved = isReservedName(user.username);
			const base = reserved ? "nutzer" : user.username.replace(DISALLOWED_CHARACTERS, "_");
			let username = base;

			const changed = username !== user.username;
			if (
				reserved ||
				kept.has(username.toLowerCase()) ||
				(changed && used.has(username.toLowerCase()))
			) {
				for (let number = 2; ; number++) {
					const suffix = `_${number}`;
					username = base.slice(0, 20 - suffix.length) + suffix;
					if (!used.has(username.toLowerCase())) break;
				}
			}

			if (username !== user.username) {
				used.add(username.toLowerCase());
				await queryRunner.query(`UPDATE "users" SET "username" = $1 WHERE "id" = $2`, [
					username,
					user.id,
				]);
				console.log(`Username of user ${user.id} changed: ${user.username} → ${username}`);
			}
			kept.add(username.toLowerCase());

			if (user.name && isReservedName(user.name)) {
				await queryRunner.query(`UPDATE "users" SET "name" = NULL WHERE "id" = $1`, [
					user.id,
				]);
				console.log(`Profile name of user ${user.id} removed: ${user.name}`);
			}
		}

		await queryRunner.query(
			`CREATE UNIQUE INDEX "IDX_users_username_lower" ON "users" (lower("username"))`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP INDEX "public"."IDX_users_username_lower"`);
	}
}
