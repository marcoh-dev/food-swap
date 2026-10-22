import { updateUserAction } from "@/app/actions";
import { FieldGroup, Field, FieldLabel, FieldDescription } from "../ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import PlaceCombobox from "../places/PlaceCombobox";
import type { Place } from "@/lib/types/place.types";

export function UserUpdate({
	currentName,
	currentPlace,
}: {
	currentName?: string;
	currentPlace?: Place | null;
}) {
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
					<Field>
						<FieldLabel htmlFor="placeId">Ort</FieldLabel>
						<FieldDescription>
							Wird beim Erstellen eines Angebots vorausgefüllt. Nur für dich sichtbar.
						</FieldDescription>
						<PlaceCombobox
							id="placeId"
							name="placeId"
							defaultPlace={currentPlace}
							placeholder="PLZ oder Ort"
							withPostalCode
							requireSelection
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
