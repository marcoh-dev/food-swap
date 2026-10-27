import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Deletes chats nobody is left in: each side deleted the chat or the account.
 * Their messages are deleted with them (CASCADE). Cannot be undone.
 */
export class DeleteAbandonedChats1793111794000 implements MigrationInterface {
  name = 'DeleteAbandonedChats1793111794000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "chats"
      WHERE ("ownerId" IS NULL OR "deletedByOwner")
      AND ("userId" IS NULL OR "deletedByUser")`,
    );
  }

  public async down(): Promise<void> {}
}
