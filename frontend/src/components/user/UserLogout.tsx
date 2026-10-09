import * as SheetParts from "@/components/ui/sheet";
import { logoutAction } from "@/app/actions";

export function UserLogout() {
  return (
    <form action={logoutAction}>
        <SheetParts.SheetClose asChild>
        <button type="submit">Abmelden</button>
      </SheetParts.SheetClose>
    </form>
  );
}