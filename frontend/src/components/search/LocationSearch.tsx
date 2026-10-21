"use client";

import { useEffect, useRef, useState } from "react";
import { Command as CommandPrimitive } from "cmdk";
import { MapPinIcon } from "lucide-react";
import { searchPlacesAction } from "@/app/actions";
import type { Place } from "@/lib/types/place.types";
import { Command, CommandEmpty, CommandItem, CommandList } from "../ui/command";
import { InputGroup, InputGroupAddon } from "../ui/input-group";
import { Popover, PopoverAnchor, PopoverContent } from "../ui/popover";

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 250;

function placeLabel(place: Place) {
	return place.postalCode ? `${place.postalCode} ${place.name}` : place.name;
}

function placeRegion(place: Place) {
	return place.county.startsWith(place.state) ? place.county : `${place.county}, ${place.state}`;
}

export default function LocationSearch({ defaultValue = "" }: { defaultValue?: string }) {
	const anchorRef = useRef<HTMLDivElement>(null);
	const [query, setQuery] = useState(defaultValue);
	const [isOpen, setIsOpen] = useState(false);
	const [result, setResult] = useState<{ query: string; places: Place[] }>({
		query: "",
		places: [],
	});

	const trimmedQuery = query.trim();
	const canSearch = trimmedQuery.length >= MIN_QUERY_LENGTH;
	const isLoaded = result.query === trimmedQuery;
	const showList = isOpen && canSearch && (isLoaded || result.places.length > 0);

	useEffect(() => {
		if (!isOpen || !canSearch) return;

		let isCurrent = true;
		const timeout = setTimeout(async () => {
			const response = await searchPlacesAction(trimmedQuery);
			if (isCurrent) setResult({ query: trimmedQuery, places: response.data ?? [] });
		}, DEBOUNCE_MS);

		return () => {
			isCurrent = false;
			clearTimeout(timeout);
		};
	}, [isOpen, canSearch, trimmedQuery]);

	function selectPlace(place: Place) {
		setQuery(place.name);
		setIsOpen(false);
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
		<Command shouldFilter={false} className="overflow-visible bg-transparent">
			<Popover open={showList}>
				<PopoverAnchor asChild>
					<div ref={anchorRef}>
						<InputGroup>
							<InputGroupAddon>
								<MapPinIcon />
							</InputGroupAddon>
							<CommandPrimitive.Input
								name="location"
								placeholder="Ort oder PLZ"
								value={query}
								onValueChange={(value) => {
									setQuery(value);
									setIsOpen(true);
								}}
								onFocus={() => setIsOpen(true)}
								onKeyDown={handleKeyDown}
								className="h-8 w-full min-w-0 flex-1 bg-transparent px-2.5 py-1 text-body-small outline-none placeholder:text-muted-foreground md:text-xs"
							/>
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
						<CommandEmpty>Kein Ort gefunden</CommandEmpty>
						{result.places.map((place) => (
							<CommandItem
								key={place.id}
								value={place.id}
								onSelect={() => selectPlace(place)}
							>
								<div className="flex flex-col">
									<span>{placeLabel(place)}</span>
									<span className="text-muted-foreground">
										{placeRegion(place)}
									</span>
								</div>
							</CommandItem>
						))}
					</CommandList>
				</PopoverContent>
			</Popover>
		</Command>
	);
}
