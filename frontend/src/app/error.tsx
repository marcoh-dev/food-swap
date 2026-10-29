"use client";

import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

function DrainingCircle({ onDrained }: { onDrained: () => void }) {
	return (
		<svg viewBox="0 0 24 24" className="size-5 -rotate-90" aria-hidden="true">
			<circle cx="12" cy="12" r="10" className="fill-muted" />
			<circle
				cx="12"
				cy="12"
				r="5"
				fill="none"
				strokeWidth="10"
				pathLength="1"
				strokeDasharray="1 1"
				className="animate-[drain_10s_linear_forwards] stroke-primary"
				onAnimationEnd={onDrained}
			/>
		</svg>
	);
}

export default function ErrorPage({ retry }: { retry: () => void }) {
	const [isRetrying, startTransition] = useTransition();

	return (
		<div>
			<h2 className="text-h2">Da ist etwas schiefgelaufen.</h2>
			<p>
				Es gibt gerade vorübergehende Probleme. Die Seite sollte in Kürze wieder verfügbar
				sein.
			</p>
			{isRetrying ? (
				<p className="mt-4 flex items-center gap-2">
					Wird geladen
					<Spinner />
				</p>
			) : (
				<p className="mt-4 flex items-center gap-2">
					Wir versuchen es automatisch erneut.
					<DrainingCircle onDrained={() => startTransition(retry)} />
				</p>
			)}
			<Button
				variant="secondary"
				className="mt-3"
				onClick={() => startTransition(retry)}
				disabled={isRetrying}
			>
				Erneut versuchen
			</Button>
		</div>
	);
}
