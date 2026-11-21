import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Stores when a user last logged out everywhere; access tokens issued before that are rejected.
 */
export class AddUserLoggedOutEverywhereAt1795230747988 implements MigrationInterface {
	name = "AddUserLoggedOutEverywhereAt1795230747988";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "users" ADD "loggedOutEverywhereAt" TIMESTAMP WITH TIME ZONE`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "loggedOutEverywhereAt"`);
	}
}
