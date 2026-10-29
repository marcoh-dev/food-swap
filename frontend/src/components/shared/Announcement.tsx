"use client";

import { useEffect, useRef } from "react";

// Screen readers skip live regions that are inserted with their text already in them,
// so the text is set right after mounting.
export function Announcement({ message }: { message: string }) {
	const ref = useRef<HTMLParagraphElement>(null);

	useEffect(() => {
		if (ref.current) ref.current.textContent = message;
	}, [message]);

	return <p ref={ref} role="status" className="sr-only" />;
}
