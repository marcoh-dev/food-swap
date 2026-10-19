import { loginAction } from "@/app/actions";
import Link from "next/link";
import { FieldGroup, Field, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import PinInput from "../PinInput";

export function UserLogin({ redirectTo }: { redirectTo?: string }) {
  const registrationHref = redirectTo
    ? `/registration?redirect=${encodeURIComponent(redirectTo)}`
    : "/registration";

  return (
    <>
      <form className="mt-4" action={loginAction}>
        <input type="hidden" name="redirect" value={redirectTo ?? ""} />
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
              autoComplete="current-password"
              placeholder="********"
            />
          </Field>
        </FieldGroup>

        <Button type="submit" className="mt-3">
          Anmelden
        </Button>
      </form>
      <div className="font-light text-[10px]">
        Neu bei FoodSwap? Hier geht's zur{" "}
        <Link href={registrationHref} className="underline">
          Registrierung
        </Link>
        .
      </div>
    </>
  );
}
