"use client";

import { cn } from "cn";
import { useState } from "react";

import PlaceCombobox from "@/components/places/PlaceCombobox";
import { Slider } from "@/components/ui/slider";
import { RADIUS_OPTIONS_KM } from "@/lib/constants/listing.constants";
import type { Place } from "@/lib/types/place.types";

import { useSearchPlace } from "./SearchPlaceContext";

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
	const searchPlace = useSearchPlace();
	const [stepIndex, setStepIndex] = useState(Math.max(RADIUS_STEPS.indexOf(defaultRadius), 0));

	const radius = RADIUS_STEPS[stepIndex];

	return (
		<div className="flex w-full flex-col gap-2">
			<PlaceCombobox
				name="place"
				valueKey="slug"
				label="Ort"
				defaultPlace={defaultPlace}
				useFirstSuggestion
				onPlaceChange={(newPlace) => {
					setPlace(newPlace);
					searchPlace?.setPlace(newPlace);
				}}
			/>
			<input type="hidden" name="radius" value={place && radius ? radius : ""} />
			<div className="flex items-center gap-3">
				<div className="flex flex-1 flex-col gap-1">
					<Slider
						thumbProps={{
							"aria-label": "Umkreis",
							"aria-valuetext": radiusLabel(radius),
						}}
						min={0}
						max={RADIUS_STEPS.length - 1}
						step={1}
						value={[stepIndex]}
						onValueChange={([value]) => setStepIndex(value)}
						disabled={!place}
						className="py-3"
					/>
					<div
						aria-hidden="true"
						className={cn("relative mx-1.5 -mt-3 h-1.5", !place && "opacity-50")}
					>
						{RADIUS_STEPS.map((step, index) => (
							<span
								key={step ?? "area"}
								className="absolute top-0 h-full w-px -translate-x-1/2 bg-muted-foreground"
								style={{ left: `${(index / (RADIUS_STEPS.length - 1)) * 100}%` }}
							/>
						))}
					</div>
				</div>
				<span
					className="w-24 shrink-0 text-right text-xs text-muted-foreground"
					aria-hidden="true"
				>
					{radiusLabel(radius)}
				</span>
			</div>
		</div>
	);
}
