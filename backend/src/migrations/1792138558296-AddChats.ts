import { MigrationInterface, QueryRunner } from "typeorm";

export class AddChats1792138558296 implements MigrationInterface {
	name = "AddChats1792138558296";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE "messages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "chatId" uuid NOT NULL, "senderId" uuid, "content" character varying(2000) NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "CHK_messages_content_not_blank" CHECK ("content" ~ '\\S'), CONSTRAINT "PK_18325f38ae6de43878487eff986" PRIMARY KEY ("id"))`,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_500d64127ca9df75640c19af40" ON "messages"  ("chatId", "createdAt") `,
		);
		await queryRunner.query(
			`CREATE TABLE "chats" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "listingId" uuid, "ownerId" uuid, "userId" uuid, "deletedByOwner" boolean NOT NULL DEFAULT false, "deletedByUser" boolean NOT NULL DEFAULT false, "lastMessageAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_chats_listing_owner_user" UNIQUE ("listingId", "ownerId", "userId"), CONSTRAINT "CHK_chats_not_self" CHECK ("ownerId" <> "userId"), CONSTRAINT "PK_0117647b3c4a4e5ff198aeb6206" PRIMARY KEY ("id"))`,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_40d195fcbaada4020f429df8b4" ON "chats"  ("ownerId") `,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_ae8951c0a763a060593606b7e2" ON "chats"  ("userId") `,
		);
		await queryRunner.query(
			`ALTER TABLE "messages" ADD CONSTRAINT "FK_36bc604c820bb9adc4c75cd4115" FOREIGN KEY ("chatId") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE "messages" ADD CONSTRAINT "FK_2db9cf2b3ca111742793f6c37ce" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE "chats" ADD CONSTRAINT "FK_5ff3cf025913b22169c2cbcbc91" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE "chats" ADD CONSTRAINT "FK_40d195fcbaada4020f429df8b48" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE "chats" ADD CONSTRAINT "FK_ae8951c0a763a060593606b7e2d" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "chats" DROP CONSTRAINT "FK_ae8951c0a763a060593606b7e2d"`,
		);
		await queryRunner.query(
			`ALTER TABLE "chats" DROP CONSTRAINT "FK_40d195fcbaada4020f429df8b48"`,
		);
		await queryRunner.query(
			`ALTER TABLE "chats" DROP CONSTRAINT "FK_5ff3cf025913b22169c2cbcbc91"`,
		);
		await queryRunner.query(
			`ALTER TABLE "messages" DROP CONSTRAINT "FK_2db9cf2b3ca111742793f6c37ce"`,
		);
		await queryRunner.query(
			`ALTER TABLE "messages" DROP CONSTRAINT "FK_36bc604c820bb9adc4c75cd4115"`,
		);
		await queryRunner.query(`DROP INDEX "public"."IDX_ae8951c0a763a060593606b7e2"`);
		await queryRunner.query(`DROP INDEX "public"."IDX_40d195fcbaada4020f429df8b4"`);
		await queryRunner.query(`DROP TABLE "chats"`);
		await queryRunner.query(`DROP INDEX "public"."IDX_500d64127ca9df75640c19af40"`);
		await queryRunner.query(`DROP TABLE "messages"`);
	}
}
