import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  SerializeOptions,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dtos/createUser.dto';
import { UserResponseDto } from '../users/dtos/userResponse.dto';
import { Public } from '../common/decorators/public.decorator';
import { AuthGuard } from '@nestjs/passport';
import { LoginDto } from './dtos/login.dto';
import type { AuthenticatedRequest } from './login.type';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Public()
  @Post('register')
  @SerializeOptions({ type: UserResponseDto })
  register(@Body() userPayload: CreateUserDto) {
    return this.usersService.createUser(userPayload);
  }

  @Public()
  @UseGuards(AuthGuard('local'))
  @Post('login')
  login(@Request() req: AuthenticatedRequest, @Body() _loginDto: LoginDto) {
    return this.authService.login(req.user);
  }

  @Get('me')
  getMe(@Request() req: AuthenticatedRequest) {
    return req.user;
  }
}
