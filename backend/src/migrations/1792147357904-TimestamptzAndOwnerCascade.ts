import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Changes the users/listings timestamps to timestamptz and makes the listing
 * owner required, with listings deleted together with their owner.
 *
 * Hand-written: TypeORM generates DROP + ADD COLUMN for a type change, which
 * would lose the stored dates. The existing values are UTC (database TimeZone
 * is UTC), so `AT TIME ZONE 'UTC'` keeps the same moments.
 */
export class TimestamptzAndOwnerCascade1792147357904 implements MigrationInterface {
  name = 'TimestamptzAndOwnerCascade1792147357904';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ---------- Timestamps: timestamp → timestamptz, values kept ----------
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "createdAt" TYPE TIMESTAMP WITH TIME ZONE USING "createdAt" AT TIME ZONE 'UTC'`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "updatedAt" TYPE TIMESTAMP WITH TIME ZONE USING "updatedAt" AT TIME ZONE 'UTC'`,
    );
    await queryRunner.query(
      `ALTER TABLE "listings" ALTER COLUMN "createdAt" TYPE TIMESTAMP WITH TIME ZONE USING "createdAt" AT TIME ZONE 'UTC'`,
    );
    await queryRunner.query(
      `ALTER TABLE "listings" ALTER COLUMN "endDate" TYPE TIMESTAMP WITH TIME ZONE USING "endDate" AT TIME ZONE 'UTC'`,
    );
    await queryRunner.query(
      `ALTER TABLE "listings" ALTER COLUMN "updatedAt" TYPE TIMESTAMP WITH TIME ZONE USING "updatedAt" AT TIME ZONE 'UTC'`,
    );

    // ---------- Listing owner: required, CASCADE on user delete ----------
    await queryRunner.query(
      `ALTER TABLE "listings" ALTER COLUMN "ownerId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "listings" DROP CONSTRAINT "FK_c3dc0ba6b57c545899ab3187ea9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listings" ADD CONSTRAINT "FK_c3dc0ba6b57c545899ab3187ea9" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "listings" DROP CONSTRAINT "FK_c3dc0ba6b57c545899ab3187ea9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listings" ADD CONSTRAINT "FK_c3dc0ba6b57c545899ab3187ea9" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "listings" ALTER COLUMN "ownerId" DROP NOT NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "listings" ALTER COLUMN "updatedAt" TYPE TIMESTAMP USING "updatedAt" AT TIME ZONE 'UTC'`,
    );
    await queryRunner.query(
      `ALTER TABLE "listings" ALTER COLUMN "endDate" TYPE TIMESTAMP USING "endDate" AT TIME ZONE 'UTC'`,
    );
    await queryRunner.query(
      `ALTER TABLE "listings" ALTER COLUMN "createdAt" TYPE TIMESTAMP USING "createdAt" AT TIME ZONE 'UTC'`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "updatedAt" TYPE TIMESTAMP USING "updatedAt" AT TIME ZONE 'UTC'`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "createdAt" TYPE TIMESTAMP USING "createdAt" AT TIME ZONE 'UTC'`,
    );
  }
}
