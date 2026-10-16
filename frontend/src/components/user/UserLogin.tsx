import { loginAction } from "@/app/actions";
import Link from "next/link";
import { FieldGroup, Field, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

export function UserLogin() {
  return (
    <>
      <form className="mt-4" action={loginAction}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="username">Benutzername</FieldLabel>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="Pomodoro"
              required
              autoFocus
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="password">Passwort</FieldLabel>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="********"
              required
            />
          </Field>
        </FieldGroup>

        <Button type="submit" className="mt-3">
          Anmelden
        </Button>
      </form>
      <div className="font-light text-[10px]">
        Neu bei FoodSwap? Hier geht's zur{" "}
        <Link href="/registration" className="underline">
          Registrierung
        </Link>
        .
      </div>
    </>
  );
}
