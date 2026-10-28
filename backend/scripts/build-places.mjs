import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const [, , inputPath] = process.argv;

if (!inputPath) {
	console.error("Usage: npm run places:build -w backend -- <path-to-DE.txt>");
	process.exit(1);
}

const outputPath = join(dirname(fileURLToPath(import.meta.url)), "..", "data", "places-de.tsv");

const rows = readFileSync(inputPath, "utf8")
	.split("\n")
	.map((line) => line.replace(/\r$/, "").split("\t"))
	.filter((columns) => columns.length >= 12 && columns[11] !== "")
	.map(([countryCode, postalCode, name, state, , , , county, , lat, lng]) => ({
		countryCode,
		postalCode,
		name,
		state,
		county,
		lat,
		lng,
	}));

const countyKey = (row) => `${row.countryCode}\t${row.county}`;

const namesByCounty = new Map();
for (const row of rows) {
	const key = countyKey(row);
	if (!namesByCounty.has(key)) namesByCounty.set(key, new Set());
	namesByCounty.get(key).add(row.name);
}

function cityOf(row) {
	const names = namesByCounty.get(countyKey(row));
	const parts = row.name.split(" ");
	for (let length = parts.length - 1; length > 0; length--) {
		const prefix = parts.slice(0, length).join(" ");
		if (names.has(prefix)) return prefix;
	}
	return row.name;
}

const BIG_CITY_SIZE = 10;

const localRows = rows.map((row) => ({ ...row, city: cityOf(row) }));

const citySizes = new Map();
for (const row of localRows) {
	const key = `${countyKey(row)}\t${row.city}`;
	const entry = citySizes.get(key) ?? { ...row, count: 0 };
	entry.count += 1;
	citySizes.set(key, entry);
}

const bigCities = new Map();
for (const entry of citySizes.values()) {
	const key = `${entry.countryCode}\t${entry.city}`;
	if (entry.count >= BIG_CITY_SIZE && entry.count > (bigCities.get(key)?.count ?? 0)) {
		bigCities.set(key, entry);
	}
}

function withBorderCity(row) {
	if (row.city !== row.name) return row;
	const parts = row.name.split(" ");
	for (let length = parts.length - 1; length > 0; length--) {
		const bigCity = bigCities.get(`${row.countryCode}\t${parts.slice(0, length).join(" ")}`);
		if (bigCity && !parts[length].startsWith("(")) {
			return {
				...row,
				city: bigCity.city,
				county: bigCity.county,
				state: bigCity.state,
			};
		}
	}
	return row;
}

const cities = new Map();
const rowsWithCity = localRows.map(withBorderCity).map((row) => {
	const city = row.city;
	const key = `${countyKey(row)}\t${city}`;
	const entry = cities.get(key) ?? {
		countryCode: row.countryCode,
		city,
		county: row.county,
		state: row.state,
		lat: 0,
		lng: 0,
		count: 0,
	};
	entry.lat += Number(row.lat);
	entry.lng += Number(row.lng);
	entry.count += 1;
	cities.set(key, entry);
	return { ...row, city, cityEntry: entry };
});

const postalRows = rowsWithCity.map((row) => [
	row.countryCode,
	row.postalCode,
	row.name,
	row.city,
	row.county,
	row.state,
	row.lat,
	row.lng,
	row.cityEntry.count,
]);

const cityRows = [...cities.values()].map(
	({ countryCode, city, county, state, lat, lng, count }) => [
		countryCode,
		"",
		city,
		city,
		county,
		state,
		(lat / count).toFixed(4),
		(lng / count).toFixed(4),
		count,
	],
);

const byColumns = (a, b) => a.join("\t").localeCompare(b.join("\t"), "de");

const lines = [
	["country_code", "postal_code", "name", "city", "county", "state", "lat", "lng", "size"],
	...cityRows.sort(byColumns),
	...postalRows.sort(byColumns),
].map((columns) => columns.join("\t"));

writeFileSync(outputPath, `${lines.join("\n")}\n`);

console.log(
	`${cityRows.length} cities and ${postalRows.length} postal codes written to ${outputPath}`,
);
