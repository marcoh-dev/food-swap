import { MigrationInterface, QueryRunner } from 'typeorm';

const categories = [
  ['obst', 'Obst'],
  ['gemuese', 'Gemüse'],
  ['kraeuter', 'Kräuter'],
  ['brot-backwaren', 'Brot & Backwaren'],
  ['vorraete', 'Vorräte'],
  ['selbstgemachtes', 'Selbstgemachtes'],
  ['getraenke', 'Getränke'],
  ['suesses-snacks', 'Süßes & Snacks'],
  ['sonstiges', 'Sonstiges'],
];

const tags = [
  ['vegan', 'Vegan'],
  ['vegetarisch', 'Vegetarisch'],
  ['bio', 'Bio'],
  ['selbst-angebaut', 'Selbst angebaut'],
  ['glutenfrei', 'Glutenfrei'],
  ['laktosefrei', 'Laktosefrei'],
  ['mhd-abgelaufen', 'MHD abgelaufen'],
];

export class SeedCategoriesAndTags1792049725638 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const [slug, name] of categories) {
      await queryRunner.query(
        `INSERT INTO "categories" ("slug", "name") VALUES ($1, $2) ON CONFLICT ("slug") DO NOTHING`,
        [slug, name],
      );
    }

    for (const [slug, name] of tags) {
      await queryRunner.query(
        `INSERT INTO "tags" ("slug", "name") VALUES ($1, $2) ON CONFLICT ("slug") DO NOTHING`,
        [slug, name],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "tags" WHERE "slug" = ANY($1)`, [
      tags.map(([slug]) => slug),
    ]);
    await queryRunner.query(`DELETE FROM "categories" WHERE "slug" = ANY($1)`, [
      categories.map(([slug]) => slug),
    ]);
  }
}
