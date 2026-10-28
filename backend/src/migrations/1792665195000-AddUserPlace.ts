import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserPlace1792665195000 implements MigrationInterface {
	name = "AddUserPlace1792665195000";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "location"`);
		await queryRunner.query(`ALTER TABLE "users" ADD "place_id" uuid`);
		await queryRunner.query(
			`ALTER TABLE "users" ADD CONSTRAINT "FK_users_place_id" FOREIGN KEY ("place_id") REFERENCES "places"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_users_place_id"`);
		await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "place_id"`);
		await queryRunner.query(`ALTER TABLE "users" ADD "location" character varying(200)`);
	}
}
