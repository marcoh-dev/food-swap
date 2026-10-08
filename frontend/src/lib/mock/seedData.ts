import { MockUser } from "../types/user.types";
import { getCurrentIsoDate } from "../../utils/date";

const globalForMock = globalThis as unknown as { mockUsers?: MockUser[] };

export const mockUsers: MockUser[] = (globalForMock.mockUsers ??= [
  {
    id: "1",
    username: "pomodoro",
    password: "test1234",
    createdAt: getCurrentIsoDate(),
  },
]);
