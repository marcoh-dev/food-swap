import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Adds refresh tokens, so users stay logged in after the short-lived access token expires.
 * Only a hash of each token is stored; tokens are deleted together with their user.
 */
export class AddRefreshTokens1795218148014 implements MigrationInterface {
	name = "AddRefreshTokens1795218148014";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE "refresh_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "tokenHash" character varying(64) NOT NULL, "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY ("id"))`,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_610102b60fea1455310ccd299d" ON "refresh_tokens"  ("userId") `,
		);
		await queryRunner.query(
			`CREATE UNIQUE INDEX "IDX_c25bc63d248ca90e8dcc1d92d0" ON "refresh_tokens"  ("tokenHash") `,
		);
		await queryRunner.query(
			`ALTER TABLE "refresh_tokens" ADD CONSTRAINT "FK_610102b60fea1455310ccd299de" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_610102b60fea1455310ccd299de"`,
		);
		await queryRunner.query(`DROP INDEX "public"."IDX_c25bc63d248ca90e8dcc1d92d0"`);
		await queryRunner.query(`DROP INDEX "public"."IDX_610102b60fea1455310ccd299d"`);
		await queryRunner.query(`DROP TABLE "refresh_tokens"`);
	}
}
