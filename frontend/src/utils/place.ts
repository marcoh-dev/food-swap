export function formatDistance(km: number) {
	return km < 1 ? "< 1\u00a0km entfernt" : `≈ ${Math.round(km)}\u00a0km entfernt`;
}
