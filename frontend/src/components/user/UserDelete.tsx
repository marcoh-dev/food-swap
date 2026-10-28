import { deleteUserAction } from "@/app/actions";

import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";

export function UserDelete() {
	return (
		<section className="my-2">
			<AlertDialog>
				<AlertDialogTrigger asChild>
					<Button variant="destructive">Konto löschen</Button>
				</AlertDialogTrigger>
				<AlertDialogContent>
					<form action={deleteUserAction}>
						<AlertDialogHeader>
							<AlertDialogTitle>Konto wirklich löschen?</AlertDialogTitle>
							<AlertDialogDescription>
								Dieser Schritt kann nicht rückgängig gemacht werden.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Abbrechen</AlertDialogCancel>
							<Button type="submit" variant="destructive">
								Endgültig löschen
							</Button>
						</AlertDialogFooter>
					</form>
				</AlertDialogContent>
			</AlertDialog>
		</section>
	);
}
