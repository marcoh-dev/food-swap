import { deleteUserAction } from "@/app/actions";
import {
	AlertDialog,
	AlertDialogTrigger,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogCancel,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";

export function UserDelete() {
	return (
		<section className="mt-10 border-t pt-6">
			<h2 className="mb-4 text-lg">Konto verwalten</h2>
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
