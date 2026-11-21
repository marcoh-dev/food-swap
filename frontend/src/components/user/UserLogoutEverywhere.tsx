"use client";

import { toast } from "sonner";

import { logoutEverywhereAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { PERMISSION_TOAST_ID } from "@/lib/notifications";

export function UserLogoutEverywhere() {
	return (
		// The toaster survives the logout redirect → close the permission toast
		<form action={logoutEverywhereAction} onSubmit={() => toast.dismiss(PERMISSION_TOAST_ID)}>
			<Button type="submit" variant="outline">
				Überall abmelden
			</Button>
		</form>
	);
}
