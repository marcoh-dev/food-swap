import { logoutAction } from "@/app/actions";

export function UserLogout() {
  return (
    <form action={logoutAction}>
      <button type="submit">Logout</button>
    </form>
  );
}