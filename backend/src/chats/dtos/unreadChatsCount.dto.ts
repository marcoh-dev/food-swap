import { Expose } from "class-transformer";

export class UnreadChatsCountDto {
	@Expose()
	count!: number;
}
