import { MigrationInterface, QueryRunner } from "typeorm";

const CITY_FOR_LOCATION = `
  SELECT "city", "county", "country_code"
  FROM "places"
  WHERE "postal_code" IS NULL
    AND ("name" ILIKE $1 || '%' OR "name" % $1)
  ORDER BY lower("name") = lower($1) DESC, "name" ILIKE $1 || '%' DESC, similarity("name", $1) DESC, "size" DESC
  LIMIT 1`;

const RANDOM_POSTAL_PLACE_IN_CITY = `
  SELECT "id" FROM "places"
  WHERE "postal_code" IS NOT NULL AND "city" = $1 AND "county" = $2 AND "country_code" = $3
  ORDER BY random()
  LIMIT 1`;

const RANDOM_POSTAL_PLACE = `
  SELECT "id" FROM "places"
  WHERE "postal_code" IS NOT NULL
  ORDER BY random()
  LIMIT 1`;

type ListingRow = { id: string; location: string };
type CityRow = { city: string; county: string; country_code: string };
type IdRow = { id: string };

export class AddListingPlace1792616633000 implements MigrationInterface {
	name = "AddListingPlace1792616633000";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "listings" ADD "place_id" uuid`);

		const listings = (await queryRunner.query(
			`SELECT "id", "location" FROM "listings"`,
		)) as ListingRow[];

		for (const listing of listings) {
			const [city] = (await queryRunner.query(CITY_FOR_LOCATION, [
				listing.location.trim(),
			])) as CityRow[];
			const [place] = (
				city
					? await queryRunner.query(RANDOM_POSTAL_PLACE_IN_CITY, [
							city.city,
							city.county,
							city.country_code,
						])
					: await queryRunner.query(RANDOM_POSTAL_PLACE)
			) as IdRow[];

			await queryRunner.query(`UPDATE "listings" SET "place_id" = $1 WHERE "id" = $2`, [
				place.id,
				listing.id,
			]);
		}

		await queryRunner.query(`ALTER TABLE "listings" ALTER COLUMN "place_id" SET NOT NULL`);
		await queryRunner.query(
			`ALTER TABLE "listings" ADD CONSTRAINT "FK_listings_place_id" FOREIGN KEY ("place_id") REFERENCES "places"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
		);
		await queryRunner.query(`CREATE INDEX "IDX_listings_place_id" ON "listings" ("place_id")`);
		await queryRunner.query(`ALTER TABLE "listings" DROP COLUMN "location"`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "listings" ADD "location" character varying`);
		await queryRunner.query(
			`UPDATE "listings" SET "location" = "places"."name" FROM "places" WHERE "places"."id" = "listings"."place_id"`,
		);
		await queryRunner.query(`ALTER TABLE "listings" ALTER COLUMN "location" SET NOT NULL`);
		await queryRunner.query(`DROP INDEX "public"."IDX_listings_place_id"`);
		await queryRunner.query(`ALTER TABLE "listings" DROP CONSTRAINT "FK_listings_place_id"`);
		await queryRunner.query(`ALTER TABLE "listings" DROP COLUMN "place_id"`);
	}
}
