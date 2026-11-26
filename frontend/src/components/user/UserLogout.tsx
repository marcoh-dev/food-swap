"use client";

import { toast } from "sonner";

import { logoutAction } from "@/app/actions";
import * as SheetParts from "@/components/ui/sheet";
import { PERMISSION_TOAST_ID } from "@/lib/notifications";
import { unsubscribeFromPush } from "@/lib/webPush";

// This browser's push subscription ends first, while the backend still knows who is logged in
async function logout() {
	await unsubscribeFromPush();
	await logoutAction();
}

export function UserLogout() {
	return (
		// The toaster survives the logout redirect → close the permission toast
		<form action={logout} onSubmit={() => toast.dismiss(PERMISSION_TOAST_ID)}>
			<SheetParts.SheetClose asChild>
				<button type="submit">Abmelden</button>
			</SheetParts.SheetClose>
		</form>
	);
}
