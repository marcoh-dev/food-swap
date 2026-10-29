"use client";

import { cn } from "cn";
import { LocateFixedIcon, MapPinIcon } from "lucide-react";
import { useEffect, useId, useImperativeHandle, useRef, useState } from "react";

import { findNearestPlaceAction, searchPlacesAction } from "@/app/actions";
import { InputGroup, InputGroupAddon, InputGroupButton } from "@/components/ui/input-group";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import { Spinner } from "@/components/ui/spinner";
import { MISSING_PLACE_MESSAGE } from "@/lib/constants/listing.constants";
import type { Place } from "@/lib/types/place.types";
import { formatPlace } from "@/utils/place";

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 150;
const COORDINATE_DECIMALS = 3;
const LOCATION_TIMEOUT_MS = 15000;
const LOCATION_ERROR = "Standort konnte nicht ermittelt werden. Bitte gib einen Ort ein.";

function roundCoordinate(value: number) {
	const factor = 10 ** COORDINATE_DECIMALS;
	return Math.round(value * factor) / factor;
}

type Props = {
	id?: string;
	name: string;
	label?: string;
	ref?: React.Ref<HTMLInputElement>;
	"aria-invalid"?: boolean;
	"aria-describedby"?: string;
	valueKey?: "id" | "slug";
	defaultPlace?: Place | null;
	placeholder?: string;
	withPostalCode?: boolean;
	useFirstSuggestion?: boolean;
	required?: boolean;
	requireSelection?: boolean;
	onPlaceChange?: (place: Place | null) => void;
	onQueryChange?: (query: string) => void;
};

function placeRegion(place: Place) {
	return place.county.startsWith(place.state) ? place.county : `${place.county}, ${place.state}`;
}

function optionId(listId: string, place: Place) {
	return `${listId}-${place.id}`;
}

function resultsMessage(count: number) {
	if (count === 0) return "Keinen Ort gefunden";
	return count === 1 ? "1 Ort gefunden" : `${count} Orte gefunden`;
}

export default function PlaceCombobox({
	id,
	name,
	label,
	ref,
	"aria-invalid": ariaInvalid,
	"aria-describedby": ariaDescribedBy,
	valueKey = "id",
	defaultPlace = null,
	placeholder = "Ort oder PLZ",
	withPostalCode = false,
	useFirstSuggestion = false,
	required = false,
	requireSelection = false,
	onPlaceChange,
	onQueryChange,
}: Props) {
	const inputId = useId();
	const listId = useId();
	const hintId = useId();
	const anchorRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);
	const locationRequestRef = useRef<{ watchId: number; timeoutId: number } | null>(null);
	const locationAttemptRef = useRef(0);
	const [query, setQuery] = useState(defaultPlace ? formatPlace(defaultPlace) : "");
	const [selectedPlace, setSelectedPlace] = useState<Place | null>(defaultPlace);
	const [isOpen, setIsOpen] = useState(false);
	const [isLocating, setIsLocating] = useState(false);
	const [locationError, setLocationError] = useState<string | null>(null);
	const [result, setResult] = useState<{ query: string; places: Place[] }>({
		query: "",
		places: [],
	});
	const [activeIndex, setActiveIndex] = useState(0);

	const trimmedQuery = query.trim();
	const canSearch = !selectedPlace && trimmedQuery.length >= MIN_QUERY_LENGTH;
	const isLoaded = result.query === trimmedQuery;
	const showList = isOpen && canSearch && (isLoaded || result.places.length > 0);
	const hasOptions = showList && result.places.length > 0;
	const activePlace = hasOptions ? result.places[activeIndex] : undefined;
	const firstSuggestion = useFirstSuggestion && isLoaded ? result.places[0] : undefined;
	const isMissingSelection =
		!selectedPlace && (required || (requireSelection && trimmedQuery !== ""));

	useEffect(() => {
		inputRef.current?.setCustomValidity(isMissingSelection ? MISSING_PLACE_MESSAGE : "");
	}, [isMissingSelection]);

	useEffect(() => {
		if (!isOpen || !canSearch) return;

		let isCurrent = true;
		const timeout = setTimeout(async () => {
			const response = await searchPlacesAction(trimmedQuery, withPostalCode);
			if (!isCurrent) return;
			setResult({ query: trimmedQuery, places: response.data ?? [] });
			setActiveIndex(0);
		}, DEBOUNCE_MS);

		return () => {
			isCurrent = false;
			clearTimeout(timeout);
		};
	}, [isOpen, canSearch, trimmedQuery, withPostalCode]);

	useEffect(() => {
		const form = inputRef.current?.form;
		if (!form || !firstSuggestion) return;

		const suggestedValue = firstSuggestion[valueKey];
		function applyFirstSuggestion(event: FormDataEvent) {
			event.formData.set(name, suggestedValue);
		}

		form.addEventListener("formdata", applyFirstSuggestion);
		return () => form.removeEventListener("formdata", applyFirstSuggestion);
	}, [firstSuggestion, name, valueKey]);

	useEffect(() => clearLocationRequest, []);

	useEffect(() => {
		if (activePlace)
			document
				.getElementById(optionId(listId, activePlace))
				?.scrollIntoView({ block: "nearest" });
	}, [activePlace, listId]);

	function changeQuery(value: string) {
		setQuery(value);
		onQueryChange?.(value);
	}

	function changePlace(place: Place | null) {
		setSelectedPlace(place);
		onPlaceChange?.(place);
	}

	function selectPlace(place: Place) {
		changeQuery(formatPlace(place));
		changePlace(place);
		setLocationError(null);
		setIsOpen(false);
	}

	function clearLocationRequest() {
		const request = locationRequestRef.current;
		if (!request) return;
		navigator.geolocation.clearWatch(request.watchId);
		window.clearTimeout(request.timeoutId);
		locationRequestRef.current = null;
	}

	function cancelLocating() {
		clearLocationRequest();
		locationAttemptRef.current += 1;
		setIsLocating(false);
	}

	function failLocating() {
		cancelLocating();
		setLocationError(LOCATION_ERROR);
	}

	function locateUser() {
		if (isLocating) return;
		if (!navigator.geolocation) {
			setLocationError(LOCATION_ERROR);
			return;
		}

		const attempt = locationAttemptRef.current + 1;
		locationAttemptRef.current = attempt;
		setIsLocating(true);
		setLocationError(null);

		const watchId = navigator.geolocation.watchPosition(
			async (position) => {
				if (locationAttemptRef.current !== attempt) return;
				clearLocationRequest();
				const response = await findNearestPlaceAction(
					roundCoordinate(position.coords.latitude),
					roundCoordinate(position.coords.longitude),
				);
				if (locationAttemptRef.current !== attempt) return;
				setIsLocating(false);
				if (response.data) selectPlace(response.data);
				else setLocationError(LOCATION_ERROR);
			},
			() => {
				if (locationAttemptRef.current === attempt) failLocating();
			},
			{ timeout: 10000, maximumAge: 300000 },
		);
		const timeoutId = window.setTimeout(() => {
			if (locationAttemptRef.current === attempt) failLocating();
		}, LOCATION_TIMEOUT_MS);
		locationRequestRef.current = { watchId, timeoutId };
	}

	function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
		const count = result.places.length;
		if (event.key === "ArrowDown" && hasOptions) {
			event.preventDefault();
			setActiveIndex((activeIndex + 1) % count);
		}
		if (event.key === "ArrowUp" && hasOptions) {
			event.preventDefault();
			setActiveIndex((activeIndex - 1 + count) % count);
		}
		if (event.key === "Enter" && activePlace) {
			event.preventDefault();
			selectPlace(activePlace);
		}
		if (event.key === "Escape") {
			setIsOpen(false);
		}
	}

	return (
		<div>
			<input type="hidden" name={name} value={selectedPlace?.[valueKey] ?? ""} />
			<Popover open={showList}>
				<PopoverAnchor asChild>
					<div ref={anchorRef}>
						<InputGroup>
							<InputGroupAddon>
								<MapPinIcon aria-hidden="true" />
							</InputGroupAddon>
							<input
								ref={inputRef}
								data-slot="input-group-control"
								id={id ?? inputId}
								role="combobox"
								aria-label={label}
								aria-expanded={hasOptions}
								aria-controls={hasOptions ? listId : undefined}
								aria-autocomplete="list"
								aria-activedescendant={
									activePlace ? optionId(listId, activePlace) : undefined
								}
								aria-invalid={ariaInvalid}
								aria-describedby={
									ariaDescribedBy ? `${hintId} ${ariaDescribedBy}` : hintId
								}
								autoComplete="off"
								placeholder={placeholder}
								value={query}
								onChange={(event) => {
									changeQuery(event.target.value);
									setLocationError(null);
									if (isLocating) cancelLocating();
									if (selectedPlace) changePlace(null);
									setIsOpen(true);
								}}
								onFocus={() => setIsOpen(true)}
								onKeyDown={handleKeyDown}
								className="h-8 w-full min-w-0 flex-1 bg-transparent px-2.5 py-1 text-body-small outline-none placeholder:text-muted-foreground md:text-xs dark:placeholder:text-foreground/80"
							/>
							<InputGroupAddon align="inline-end">
								<InputGroupButton
									type="button"
									size="icon-xs"
									onClick={locateUser}
									aria-busy={isLocating}
									aria-label="Aktuellen Standort verwenden"
									title="Aktuellen Standort verwenden"
								>
									{isLocating ? <Spinner /> : <LocateFixedIcon />}
								</InputGroupButton>
							</InputGroupAddon>
						</InputGroup>
					</div>
				</PopoverAnchor>
				<PopoverContent
					align="start"
					className="w-(--radix-popover-trigger-width) p-0"
					onOpenAutoFocus={(event) => event.preventDefault()}
					onInteractOutside={(event) => {
						if (anchorRef.current?.contains(event.target as Node)) {
							event.preventDefault();
							return;
						}
						setIsOpen(false);
					}}
				>
					{result.places.length === 0 ? (
						<p className="py-6 text-center text-xs">Keinen Ort gefunden</p>
					) : (
						<ul
							id={listId}
							role="listbox"
							aria-label={label ?? "Orte"}
							className="no-scrollbar max-h-72 overflow-y-auto"
						>
							{result.places.map((place, index) => (
								<li
									key={place.id}
									id={optionId(listId, place)}
									role="option"
									aria-selected={index === activeIndex}
									onMouseDown={(event) => event.preventDefault()}
									onMouseMove={() => setActiveIndex(index)}
									onClick={() => selectPlace(place)}
									className={cn(
										"flex cursor-default flex-col px-2 py-2 text-xs select-none",
										index === activeIndex && "bg-muted text-foreground",
									)}
								>
									<span>{formatPlace(place)}</span>
									<span className="text-muted-foreground">
										{placeRegion(place)}
									</span>
								</li>
							))}
						</ul>
					)}
				</PopoverContent>
			</Popover>
			<span id={hintId} className="sr-only">
				Mindestens {MIN_QUERY_LENGTH} Zeichen eingeben, dann einen Ort aus der Liste wählen.
			</span>
			<span role="status" className="sr-only">
				{canSearch && isLoaded ? resultsMessage(result.places.length) : ""}
			</span>
			{locationError && (
				<p role="alert" className="mt-1 text-xs text-destructive">
					{locationError}
				</p>
			)}
		</div>
	);
}
