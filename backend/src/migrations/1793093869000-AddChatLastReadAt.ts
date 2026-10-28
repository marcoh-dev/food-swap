import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds when each participant last read a chat. NULL means never read.
 * Existing chats are marked as read, so nobody starts with every chat unread.
 */
export class AddChatLastReadAt1793093869000 implements MigrationInterface {
  name = 'AddChatLastReadAt1793093869000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "chats" ADD "ownerLastReadAt" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "chats" ADD "userLastReadAt" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `UPDATE "chats" SET "ownerLastReadAt" = "lastMessageAt", "userLastReadAt" = "lastMessageAt"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "chats" DROP COLUMN "userLastReadAt"`);
    await queryRunner.query(
      `ALTER TABLE "chats" DROP COLUMN "ownerLastReadAt"`,
    );
  }
}
