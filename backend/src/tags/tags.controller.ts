import { Controller, Get, SerializeOptions } from "@nestjs/common";

import { TagResponseDto } from "./dtos/tagResponse.dto";
import { TagsService } from "./tags.service";
import { Public } from "../common/decorators/public.decorator";

@Controller("tags")
export class TagsController {
	constructor(private readonly tagsService: TagsService) {}

	@Public()
	@Get()
	@SerializeOptions({ type: TagResponseDto })
	findAll() {
		return this.tagsService.findAll();
	}
}
