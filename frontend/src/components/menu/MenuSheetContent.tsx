"use client";

import { useRef } from "react";

import { SheetContent } from "@/components/ui/sheet";

export function MenuSheetContent(props: React.ComponentProps<typeof SheetContent>) {
	const linkClicked = useRef(false);

	return (
		<SheetContent
			{...props}
			onClickCapture={(event) => {
				linkClicked.current =
					event.target instanceof Element && !!event.target.closest("a");
			}}
			onCloseAutoFocus={(event) => {
				// after a menu link the next Tab starts at the top of the new page, not at the menu button
				if (linkClicked.current) event.preventDefault();
				linkClicked.current = false;
			}}
		/>
	);
}
