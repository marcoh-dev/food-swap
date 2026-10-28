import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCategoriesAndTags1791985379001 implements MigrationInterface {
	name = "AddCategoriesAndTags1791985379001";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE "categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "slug" character varying NOT NULL, "name" character varying NOT NULL, CONSTRAINT "UQ_420d9f679d41281f282f5bc7d09" UNIQUE ("slug"), CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`,
		);
		await queryRunner.query(
			`CREATE TABLE "tags" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "slug" character varying NOT NULL, "name" character varying NOT NULL, CONSTRAINT "UQ_b3aa10c29ea4e61a830362bd25a" UNIQUE ("slug"), CONSTRAINT "PK_e7dc17249a1148a1970748eda99" PRIMARY KEY ("id"))`,
		);
		await queryRunner.query(
			`CREATE TABLE "listing_tags" ("listing_id" uuid NOT NULL, "tag_id" uuid NOT NULL, CONSTRAINT "PK_106cd705e8b833be59c6a645cb9" PRIMARY KEY ("listing_id", "tag_id"))`,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_d545ceb30768fbbeb7649cae18" ON "listing_tags"  ("listing_id") `,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_758e1e7412359ad0cafb2f744c" ON "listing_tags"  ("tag_id") `,
		);
		await queryRunner.query(`ALTER TABLE "listings" ADD "category_id" uuid`);
		await queryRunner.query(
			`ALTER TABLE "listings" ADD CONSTRAINT "FK_9315deed3e8f6d9171c23131418" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE "listing_tags" ADD CONSTRAINT "FK_d545ceb30768fbbeb7649cae18f" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
		);
		await queryRunner.query(
			`ALTER TABLE "listing_tags" ADD CONSTRAINT "FK_758e1e7412359ad0cafb2f744c9" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "listing_tags" DROP CONSTRAINT "FK_758e1e7412359ad0cafb2f744c9"`,
		);
		await queryRunner.query(
			`ALTER TABLE "listing_tags" DROP CONSTRAINT "FK_d545ceb30768fbbeb7649cae18f"`,
		);
		await queryRunner.query(
			`ALTER TABLE "listings" DROP CONSTRAINT "FK_9315deed3e8f6d9171c23131418"`,
		);
		await queryRunner.query(`ALTER TABLE "listings" DROP COLUMN "category_id"`);
		await queryRunner.query(`DROP INDEX "public"."IDX_758e1e7412359ad0cafb2f744c"`);
		await queryRunner.query(`DROP INDEX "public"."IDX_d545ceb30768fbbeb7649cae18"`);
		await queryRunner.query(`DROP TABLE "listing_tags"`);
		await queryRunner.query(`DROP TABLE "tags"`);
		await queryRunner.query(`DROP TABLE "categories"`);
	}
}
