"use client";

import { toast } from "sonner";

import * as SheetParts from "@/components/ui/sheet";
import { logoutAction } from "@/app/actions";
import { PERMISSION_TOAST_ID } from "@/lib/notifications";

export function UserLogout() {
	return (
		// The toaster survives the logout redirect → close the permission toast
		<form action={logoutAction} onSubmit={() => toast.dismiss(PERMISSION_TOAST_ID)}>
			<SheetParts.SheetClose asChild>
				<button type="submit">Abmelden</button>
			</SheetParts.SheetClose>
		</form>
	);
}
