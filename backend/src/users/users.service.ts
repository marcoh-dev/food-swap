import {
	BadRequestException,
	ConflictException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { Repository } from "typeorm";

import { CreateUserDto } from "./dtos/createUser.dto";
import { UpdateUserDto } from "./dtos/updateUser.dto";
import { User } from "./entities/user.entity";
import { Chat } from "../chats/entities/chat.entity";
import { PlacesService } from "../places/places.service";

const SALT_ROUNDS = 12;

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User)
		private readonly users: Repository<User>,
		private readonly placesService: PlacesService,
	) {}

	async findById(id: string): Promise<User | null> {
		return this.users.findOne({
			where: { id },
		});
	}

	async findOne(id: string): Promise<User> {
		const user = await this.users.findOne({
			where: { id },
		});
		if (!user) {
			throw new NotFoundException(`User not found.`);
		}
		return user;
	}

	async findCurrent(id: string): Promise<User> {
		const user = await this.users.findOne({
			where: { id },
			relations: { place: true },
		});
		if (!user) {
			throw new NotFoundException(`User not found.`);
		}
		return user;
	}

	findByUsername(username: string): Promise<User | null> {
		return this.users.findOneBy({ username });
	}

	async createUser(userPayload: CreateUserDto): Promise<User> {
		const { name, username, password } = userPayload;
		const usernameExists = await this.findByUsername(username);
		if (usernameExists) {
			throw new ConflictException(`Username '${username}' is already taken.`);
		}

		const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
		const user = this.users.create({
			username,
			passwordHash,
			name: name ?? null,
		});

		return this.users.save(user);
	}

	async update(userId: string, userPayload: UpdateUserDto, currentUser: User) {
		const user = await this.users.findOne({
			where: { id: userId },
		});

		if (!user) {
			throw new NotFoundException(`User with ID ${userId} not found.`);
		}

		if (user.id !== currentUser.id) {
			throw new ForbiddenException(`You are not allowed to modify this profile.`);
		}

		if (
			userPayload.placeId &&
			!(await this.placesService.existsWithPostalCode(userPayload.placeId))
		) {
			throw new BadRequestException("Place does not exist or has no postal code.");
		}

		const { password, ...updates } = userPayload;

		Object.assign(user, updates);

		if (password) {
			user.passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
		}

		return this.users.save(user);
	}

	async remove(userId: string, currentUser: User) {
		const user = await this.users.findOne({
			where: { id: userId },
		});

		if (!user) {
			throw new NotFoundException(`User with ID ${userId} not found.`);
		}

		if (user.id !== currentUser.id) {
			throw new ForbiddenException(`You are not allowed to modify this profile.`);
		}

		const result = await this.users.manager.transaction(async (manager) => {
			const deleted = await manager.delete(User, userId);

			// The user's side of their chats is now NULL → delete chats nobody is left in
			await manager
				.createQueryBuilder()
				.delete()
				.from(Chat)
				.where('("ownerId" IS NULL OR "deletedByOwner")')
				.andWhere('("userId" IS NULL OR "deletedByUser")')
				.execute();

			return deleted;
		});

		if ((result.affected ?? 0) < 1) {
			throw new ConflictException(`User with ID ${userId} could not be deleted.`);
		}

		return result;
	}
}
