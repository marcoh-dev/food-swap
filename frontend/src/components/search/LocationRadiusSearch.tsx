"use client";

import { useState } from "react";
import type { Place } from "@/lib/types/place.types";
import { RADIUS_OPTIONS_KM } from "@/lib/constants/listing.constants";
import PlaceCombobox from "../places/PlaceCombobox";
import { Slider } from "../ui/slider";

const RADIUS_STEPS = [undefined, ...RADIUS_OPTIONS_KM];

function radiusLabel(radius: number | undefined) {
	return radius ? `+${radius} km` : "Ganzes Gebiet";
}

export default function LocationRadiusSearch({
	defaultPlace = null,
	defaultRadius,
}: {
	defaultPlace?: Place | null;
	defaultRadius?: number;
}) {
	const [place, setPlace] = useState<Place | null>(defaultPlace);
	const [stepIndex, setStepIndex] = useState(Math.max(RADIUS_STEPS.indexOf(defaultRadius), 0));

	const radius = RADIUS_STEPS[stepIndex];

	return (
		<div className="flex w-full flex-col gap-2">
			<PlaceCombobox
				name="place"
				defaultPlace={defaultPlace}
				useFirstSuggestion
				onPlaceChange={setPlace}
			/>
			<input type="hidden" name="radius" value={place && radius ? radius : ""} />
			<div className="flex items-center gap-3">
				<Slider
					aria-label="Umkreis"
					min={0}
					max={RADIUS_STEPS.length - 1}
					step={1}
					value={[stepIndex]}
					onValueChange={([value]) => setStepIndex(value)}
					disabled={!place}
					className="flex-1"
				/>
				<span
					className="w-24 shrink-0 text-right text-xs text-muted-foreground"
					aria-live="polite"
				>
					{radiusLabel(radius)}
				</span>
			</div>
		</div>
	);
}
