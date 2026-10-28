"use client";

import { createContext, useContext, useState } from "react";
import { Collapsible } from "../ui/collapsible";

const CloseProfileEditContext = createContext<() => void>(() => {});

export function useCloseProfileEdit() {
	return useContext(CloseProfileEditContext);
}

export function ProfileEditCollapsible({ children }: { children: React.ReactNode }) {
	const [open, setOpen] = useState(false);

	return (
		<CloseProfileEditContext value={() => setOpen(false)}>
			<Collapsible open={open} onOpenChange={setOpen}>
				{children}
			</Collapsible>
		</CloseProfileEditContext>
	);
}
