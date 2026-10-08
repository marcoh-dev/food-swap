import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dtos/createUser.dto';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dtos/updateUser.dto';

const SALT_ROUNDS = 12;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  private normalizeName(name: string | null): string | null {
    if (name === null) {
      return null;
    }

    const trimmed = name.trim();

    return trimmed === '' ? null : trimmed;
  }

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
      throw new NotFoundException(`User with ID ${id} not found.`);
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
      name: name !== undefined ? this.normalizeName(name) : null,
    });

    return this.users.save(user);
  }

  async updateUser(
    userId: string,
    userPayload: UpdateUserDto,
    currentUser: User,
  ) {
    const user = await this.users.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    if (user.id !== currentUser.id) {
      throw new ForbiddenException(
        `You are not allowed to modify this profile.`,
      );
    }

    const { password, name, ...updates } = userPayload;

    Object.assign(user, updates);

    if (name !== undefined) {
      user.name = this.normalizeName(name);
    }

    if (password) {
      user.passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    }

    return this.users.save(user);
  }

  async deleteUser(userId: string, currentUser: User) {
    const user = await this.users.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    if (user.id !== currentUser.id) {
      throw new ForbiddenException(
        `You are not allowed to modify this profile.`,
      );
    }

    const result = await this.users.delete(userId);

    if ((result.affected ?? 0) < 1) {
      throw new ConflictException(
        `User with ID ${userId} could not be deleted.`,
      );
    }

    return result;
  }
}
