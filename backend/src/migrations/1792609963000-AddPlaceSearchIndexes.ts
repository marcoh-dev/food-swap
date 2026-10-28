import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPlaceSearchIndexes1792609963000 implements MigrationInterface {
	name = "AddPlaceSearchIndexes1792609963000";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE INDEX "IDX_places_name_trgm" ON "places" USING GIN ("name" gin_trgm_ops)`,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_places_alt_name_trgm" ON "places" USING GIN ((lower(replace(replace(replace(replace("name", 'ä', 'ae'), 'ö', 'oe'), 'ü', 'ue'), 'ß', 'ss'))) gin_trgm_ops)`,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_places_district_trgm" ON "places" USING GIN ((CASE WHEN "name" <> "city" THEN substr("name", length("city") + 2) END) gin_trgm_ops)`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP INDEX "public"."IDX_places_district_trgm"`);
		await queryRunner.query(`DROP INDEX "public"."IDX_places_alt_name_trgm"`);
		await queryRunner.query(`DROP INDEX "public"."IDX_places_name_trgm"`);
	}
}
