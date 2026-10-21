import { readFileSync } from 'fs';
import path from 'path';
import { MigrationInterface, QueryRunner } from 'typeorm';

const PLACES_FILE = path.join(__dirname, '..', '..', 'data', 'places-de.tsv');
const BATCH_SIZE = 1000;
const COLUMNS_PER_ROW = 9;

export class AddPlaces1792575738000 implements MigrationInterface {
  name = 'AddPlaces1792575738000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pg_trgm"`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "postgis"`);
    await queryRunner.query(
      `CREATE TABLE "places" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "country_code" character(2) NOT NULL, "postal_code" character varying(10), "name" character varying NOT NULL, "city" character varying NOT NULL, "county" character varying NOT NULL, "state" character varying NOT NULL, "location" geography(Point,4326) NOT NULL, "size" integer NOT NULL, CONSTRAINT "PK_places_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_places_postal_code" ON "places" ("postal_code" varchar_pattern_ops)`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_places_location" ON "places" USING GIST ("location")`,
    );

    const rows = readFileSync(PLACES_FILE, 'utf8')
      .trim()
      .split('\n')
      .slice(1)
      .map((line) => line.split('\t'));

    for (let start = 0; start < rows.length; start += BATCH_SIZE) {
      const batch = rows.slice(start, start + BATCH_SIZE);
      const placeholders = batch.map((_, index) => {
        const offset = index * COLUMNS_PER_ROW;
        return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, ST_SetSRID(ST_MakePoint($${offset + 8}::double precision, $${offset + 7}::double precision), 4326)::geography, $${offset + 9})`;
      });
      const parameters = batch.flatMap(
        ([
          countryCode,
          postalCode,
          name,
          city,
          county,
          state,
          lat,
          lng,
          size,
        ]) => [
          countryCode,
          postalCode || null,
          name,
          city,
          county,
          state,
          lat,
          lng,
          Number(size),
        ],
      );

      await queryRunner.query(
        `INSERT INTO "places" ("country_code", "postal_code", "name", "city", "county", "state", "location", "size") VALUES ${placeholders.join(', ')}`,
        parameters,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_places_location"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_places_postal_code"`);
    await queryRunner.query(`DROP TABLE "places"`);
  }
}
