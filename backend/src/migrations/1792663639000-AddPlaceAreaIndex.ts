import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPlaceAreaIndex1792663639000 implements MigrationInterface {
  name = 'AddPlaceAreaIndex1792663639000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_places_area" ON "places" ("country_code", "city", "county")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_places_area"`);
  }
}
