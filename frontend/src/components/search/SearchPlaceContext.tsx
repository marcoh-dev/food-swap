"use client";

import { createContext, useContext, useState } from "react";

import type { Place } from "@/lib/types/place.types";

type SearchPlaceState = {
	place: Place | null;
	setPlace: (place: Place | null) => void;
};

const SearchPlaceContext = createContext<SearchPlaceState | null>(null);

export function SearchPlaceProvider({
	initialPlace,
	children,
}: {
	initialPlace: Place | null;
	children: React.ReactNode;
}) {
	const [place, setPlace] = useState(initialPlace);

	return <SearchPlaceContext value={{ place, setPlace }}>{children}</SearchPlaceContext>;
}

export function useSearchPlace() {
	return useContext(SearchPlaceContext);
}
