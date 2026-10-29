import { type PointerEvent, useRef, useState } from "react";

export function useSelectLikeMenu() {
	const [open, setOpen] = useState(false);
	const pressRef = useRef<{ wasOpen: boolean } | null>(null);

	const triggerProps = {
		onPointerDown: (event: PointerEvent) => {
			if (event.pointerType === "mouse") return;
			event.preventDefault();
			pressRef.current = { wasOpen: open };
		},
		onClick: () => {
			const press = pressRef.current;
			pressRef.current = null;
			if (press) setOpen(!press.wasOpen);
		},
	};

	const contentProps = {
		onOpenAutoFocus: (event: Event) => {
			event.preventDefault();
			const content = event.currentTarget as HTMLElement;
			const checkedItem = content.querySelector<HTMLElement>('[data-state="checked"]');
			(checkedItem ?? content).focus({ preventScroll: true });
		},
	};

	return { open, onOpenChange: setOpen, triggerProps, contentProps };
}
