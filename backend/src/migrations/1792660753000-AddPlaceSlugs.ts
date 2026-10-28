import { MigrationInterface, QueryRunner } from "typeorm";

const BATCH_SIZE = 1000;

type PlaceRow = {
	id: string;
	postal_code: string | null;
	name: string;
	county: string;
	state: string;
	lat: number;
	lng: number;
};

function slugify(text: string): string {
	return text
		.toLowerCase()
		.replace(/ä/g, "ae")
		.replace(/ö/g, "oe")
		.replace(/ü/g, "ue")
		.replace(/ß/g, "ss")
		.normalize("NFKD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

function groupBy(slugs: Map<PlaceRow, string>): Map<string, PlaceRow[]> {
	const groups = new Map<string, PlaceRow[]>();
	for (const [place, slug] of slugs) {
		groups.set(slug, [...(groups.get(slug) ?? []), place]);
	}
	return groups;
}

function withSuffix(
	slugs: Map<PlaceRow, string>,
	suffix: (place: PlaceRow, index: number) => string,
) {
	for (const places of groupBy(slugs).values()) {
		if (places.length < 2) continue;
		places.forEach((place, index) => {
			slugs.set(place, `${slugs.get(place)}-${suffix(place, index)}`);
		});
	}
}

function placeSlugs(places: PlaceRow[]): Map<string, string> {
	const sorted = [...places].sort(
		(a, b) =>
			(a.postal_code ?? "").localeCompare(b.postal_code ?? "") ||
			a.name.localeCompare(b.name) ||
			a.state.localeCompare(b.state) ||
			a.county.localeCompare(b.county) ||
			a.lat - b.lat ||
			a.lng - b.lng,
	);

	const slugs = new Map<PlaceRow, string>(
		sorted.map((place) => [
			place,
			slugify(place.postal_code ? `${place.postal_code} ${place.name}` : place.name),
		]),
	);

	withSuffix(slugs, (place) => slugify(place.state));
	withSuffix(slugs, (place) => slugify(place.county));
	withSuffix(slugs, (_place, index) => String(index + 1));

	return new Map([...slugs].map(([place, slug]) => [place.id, slug]));
}

export class AddPlaceSlugs1792660753000 implements MigrationInterface {
	name = "AddPlaceSlugs1792660753000";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "places" ADD "slug" character varying`);

		const places = (await queryRunner.query(
			`SELECT "id", "postal_code", "name", "county", "state", ST_Y("location"::geometry) AS "lat", ST_X("location"::geometry) AS "lng" FROM "places"`,
		)) as PlaceRow[];

		const entries = [...placeSlugs(places)];
		for (let start = 0; start < entries.length; start += BATCH_SIZE) {
			const batch = entries.slice(start, start + BATCH_SIZE);
			const values = batch
				.map((_, index) => `($${index * 2 + 1}::uuid, $${index * 2 + 2})`)
				.join(", ");
			await queryRunner.query(
				`UPDATE "places" SET "slug" = "slugs"."slug" FROM (VALUES ${values}) AS "slugs"("id", "slug") WHERE "places"."id" = "slugs"."id"`,
				batch.flat(),
			);
		}

		await queryRunner.query(`ALTER TABLE "places" ALTER COLUMN "slug" SET NOT NULL`);
		await queryRunner.query(`CREATE UNIQUE INDEX "IDX_places_slug" ON "places" ("slug")`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP INDEX "public"."IDX_places_slug"`);
		await queryRunner.query(`ALTER TABLE "places" DROP COLUMN "slug"`);
	}
}
