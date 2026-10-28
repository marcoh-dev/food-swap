import {
	Check,
	Column,
	CreateDateColumn,
	Entity,
	Index,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
} from "typeorm";

import { Chat } from "./chat.entity";
import { User } from "../../users/entities/user.entity";

@Entity("messages")
@Index(["chatId", "createdAt"])
@Check("CHK_messages_content_not_blank", `"content" ~ '\\S'`)
export class Message {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@Column({ type: "uuid" })
	chatId!: string;

	@ManyToOne(() => Chat, (chat) => chat.messages, {
		onDelete: "CASCADE",
		nullable: false,
	})
	@JoinColumn({ name: "chatId" })
	chat!: Chat;

	@Column({ type: "uuid", nullable: true })
	senderId!: string | null;

	@ManyToOne(() => User, { onDelete: "SET NULL", nullable: true })
	@JoinColumn({ name: "senderId" })
	sender!: User | null;

	@Column({ type: "varchar", length: 2000 })
	content!: string;

	@CreateDateColumn({ type: "timestamptz" })
	createdAt!: Date;
}
