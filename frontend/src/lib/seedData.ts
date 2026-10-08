import { MockUser } from "./types/user.types";

export const mockUsers: MockUser[] = [
  {
    id: "1",
    username: "pomodoro",
    password: "test1234",
    createdAt: new Date().toISOString(),
  },
];