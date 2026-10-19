import { registerAction } from "@/app/actions";
import Link from "next/link";
import { FieldGroup, Field, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import PinInput from "../PinInput";

export function UserRegistration() {
  return (
    <>
      <form className="mt-4" action={registerAction}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="username">Benutzername</FieldLabel>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="Pomodoro"
              required
              autoComplete="username"
              autoFocus
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="password">Passwort</FieldLabel>
            <PinInput
              id="password"
              name="password"
              autoComplete="new-password"
              placeholder="********"
            />
          </Field>
        </FieldGroup>

        <Button type="submit" className="mt-3">
          Registrieren
        </Button>
      </form>
      <div className="font-light text-[10px]">
        Du hast schon ein Konto? Hier geht's zum{" "}
        <Link href="/login" className="underline">
          Login
        </Link>
        .
      </div>
    </>
  );
}
