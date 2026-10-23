"use client";

import { useEffect, useImperativeHandle, useRef, useState } from "react";
import { Command as CommandPrimitive } from "cmdk";
import { LocateFixedIcon, MapPinIcon } from "lucide-react";
import { findNearestPlaceAction, searchPlacesAction } from "@/app/actions";
import type { Place } from "@/lib/types/place.types";
import { formatPlace } from "@/utils/place";
import { MISSING_PLACE_MESSAGE } from "@/lib/constants/listing.constants";
import { Command, CommandEmpty, CommandItem, CommandList } from "../ui/command";
import { InputGroup, InputGroupAddon, InputGroupButton } from "../ui/input-group";
import { Spinner } from "../ui/spinner";
import { Popover, PopoverAnchor, PopoverContent } from "../ui/popover";

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

	const trimmedQuery = query.trim();
	const canSearch = !selectedPlace && trimmedQuery.length >= MIN_QUERY_LENGTH;
	const isLoaded = result.query === trimmedQuery;
	const showList = isOpen && canSearch && (isLoaded || result.places.length > 0);
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
			if (isCurrent) setResult({ query: trimmedQuery, places: response.data ?? [] });
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
		if (event.key === "Enter" && (!showList || result.places.length === 0)) {
			event.currentTarget.form?.requestSubmit();
		}
		if (event.key === "Escape") {
			setIsOpen(false);
		}
	}

	return (
		<Command label={label} shouldFilter={false} className="overflow-visible bg-transparent">
			<input type="hidden" name={name} value={selectedPlace?.[valueKey] ?? ""} />
			<Popover open={showList}>
				<PopoverAnchor asChild>
					<div ref={anchorRef}>
						<InputGroup>
							<InputGroupAddon>
								<MapPinIcon />
							</InputGroupAddon>
							<CommandPrimitive.Input
								ref={inputRef}
								id={id}
								placeholder={placeholder}
								value={query}
								aria-invalid={ariaInvalid}
								aria-describedby={ariaDescribedBy}
								onValueChange={(value) => {
									changeQuery(value);
									setLocationError(null);
									if (isLocating) cancelLocating();
									if (selectedPlace) changePlace(null);
									setIsOpen(true);
								}}
								onFocus={() => setIsOpen(true)}
								onKeyDown={handleKeyDown}
								className="h-8 w-full min-w-0 flex-1 bg-transparent px-2.5 py-1 text-body-small outline-none placeholder:text-muted-foreground md:text-xs"
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
					<CommandList>
						<CommandEmpty>Keinen Ort gefunden</CommandEmpty>
						{result.places.map((place) => (
							<CommandItem
								key={place.id}
								value={place.id}
								onSelect={() => selectPlace(place)}
							>
								<div className="flex flex-col">
									<span>{formatPlace(place)}</span>
									<span className="text-muted-foreground">
										{placeRegion(place)}
									</span>
								</div>
							</CommandItem>
						))}
					</CommandList>
				</PopoverContent>
			</Popover>
			{locationError && (
				<p role="alert" className="mt-1 text-xs text-destructive">
					{locationError}
				</p>
			)}
		</Command>
	);
}
