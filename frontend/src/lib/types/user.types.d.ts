export type UserResponse = {
  id: string;
  username: string;
};

export type UserCredentials = {
  username: string;
  password: string;
};

type User = { id: string; username: string; name?: string; createdAt: string };

