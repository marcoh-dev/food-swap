import { MigrationInterface, QueryRunner } from "typeorm";

export class MoveListingEndDatesToEndOfDay1793009477000 implements MigrationInterface {
	name = "MoveListingEndDatesToEndOfDay1793009477000";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`UPDATE "listings"
      SET "endDate" = (("endDate" AT TIME ZONE 'Europe/Berlin')::date + interval '1 day' - interval '1 millisecond') AT TIME ZONE 'Europe/Berlin'
      WHERE ("endDate" AT TIME ZONE 'Europe/Berlin')::time <> '23:59:59.999'`,
		);
	}

	public async down(): Promise<void> {}
}
