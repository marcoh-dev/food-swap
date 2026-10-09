import { Request } from 'express';
import { User } from '../users/entities/user.entity';

type Payload = {
  sub: string;
};

export type AuthenticatedRequest = Request & {
  user: User;
};
