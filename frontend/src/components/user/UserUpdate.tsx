import { updateUserAction } from "@/app/actions";
import { FieldGroup, Field, FieldLabel, FieldDescription } from "../ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

export function UserUpdate({ currentName }: { currentName?: string }) {
	return (
		<section className="mt-8">
			<form className="my-4" action={updateUserAction}>
				<FieldGroup>
					<Field>
						<FieldLabel htmlFor="name">Profilname</FieldLabel>
						<FieldDescription>Für andere User sichtbar.</FieldDescription>
						<Input
							id="name"
							name="name"
							type="text"
							placeholder="z. B. Tomato "
							defaultValue={currentName}
							required
						/>
					</Field>
				</FieldGroup>
				<Button type="submit" className="mt-3">
					Speichern
				</Button>
			</form>
		</section>
	);
}
