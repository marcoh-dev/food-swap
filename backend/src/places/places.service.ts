import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { Place } from './entities/place.entity';

const SUGGESTION_LIMIT = 10;
const MIN_TYPO_LENGTH = 4;
const MAX_TYPO_LENGTH = 8;
const ANY_CHARACTER = '\u0000';

const RESPONSE_COLUMNS = `"id", "country_code" AS "countryCode", "postal_code" AS "postalCode", "name", "slug", "city", "county", "state"`;

const POSTAL_CODE_QUERY = `
  SELECT ${RESPONSE_COLUMNS}
  FROM "places"
  WHERE "postal_code" LIKE $1 || '%'
  ORDER BY "postal_code", ("name" <> "city") DESC, "name"
  LIMIT $2`;

const ALT_NAME = `lower(replace(replace(replace(replace("name", 'ä', 'ae'), 'ö', 'oe'), 'ü', 'ue'), 'ß', 'ss'))`;
const DISTRICT = `(CASE WHEN "name" <> "city" THEN substr("name", length("city") + 2) END)`;

const NEAREST_QUERY = `
  SELECT ${RESPONSE_COLUMNS}
  FROM "places"
  WHERE "postal_code" IS NOT NULL
  ORDER BY "location" <-> ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography
  LIMIT 1`;

const NAME_QUERY = `
  WITH "matches" AS (
    SELECT *, ${ALT_NAME} AS "altName", ${DISTRICT} AS "district"
    FROM "places"
    WHERE (CASE WHEN $4::boolean THEN "postal_code" IS NOT NULL ELSE ("postal_code" IS NULL OR "name" <> "city") END)
      AND (
        "name" ILIKE $1 || '%' OR ${ALT_NAME} LIKE lower($1) || '%' OR ${DISTRICT} ILIKE $1 || '%'
        OR ($3::text IS NOT NULL AND ("name" ~* $3 OR ${ALT_NAME} ~ $3 OR ${DISTRICT} ~* $3))
        OR "name" % $1 OR ${ALT_NAME} % lower($1) OR ${DISTRICT} % $1
      )
  ),
  "scored" AS (
    SELECT *,
      ("name" ILIKE $1 || '%' OR "altName" LIKE lower($1) || '%' OR coalesce("district" ILIKE $1 || '%', false)) AS "isPrefix",
      ($3::text IS NOT NULL AND ("name" ~* $3 OR "altName" ~ $3 OR coalesce("district" ~* $3, false))) AS "isTypoPrefix",
      greatest(similarity("name", $1), similarity("altName", lower($1)), coalesce(similarity("district", $1), 0)) AS "score"
    FROM "matches"
  )
  SELECT ${RESPONSE_COLUMNS}
  FROM "scored"
  ORDER BY "isPrefix" DESC, "isTypoPrefix" DESC,
    CASE WHEN "isPrefix" OR "isTypoPrefix" THEN ("postal_code" IS NULL OR "name" = "city") END DESC NULLS LAST,
    CASE WHEN "isPrefix" OR "isTypoPrefix" THEN "size" END DESC NULLS LAST,
    "score" DESC, "size" DESC, "postal_code" NULLS FIRST, "name"
  LIMIT $2`;

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function typoPrefixPattern(query: string): string | null {
  const lower = query.toLowerCase();
  if (lower.length < MIN_TYPO_LENGTH || lower.length > MAX_TYPO_LENGTH) {
    return null;
  }

  const variants = new Set<string>();
  for (let index = 0; index < lower.length; index++) {
    const before = lower.slice(0, index);
    const after = lower.slice(index + 1);
    variants.add(`${before}${ANY_CHARACTER}${lower.slice(index)}`);
    variants.add(`${before}${after}`);
    variants.add(`${before}${ANY_CHARACTER}${after}`);
    if (index < lower.length - 1 && lower[index] !== lower[index + 1]) {
      variants.add(
        `${before}${lower[index + 1]}${lower[index]}${lower.slice(index + 2)}`,
      );
    }
  }
  variants.delete(lower);

  const alternatives = [...variants]
    .filter((variant) => variant.replaceAll(ANY_CHARACTER, '').length >= 2)
    .map((variant) => variant.split(ANY_CHARACTER).map(escapeRegex).join('.'));

  return `^(${alternatives.join('|')})`;
}

@Injectable()
export class PlacesService {
  constructor(
    @InjectRepository(Place)
    private readonly places: Repository<Place>,
  ) {}

  search(query: string, withPostalCode: boolean): Promise<Place[]> {
    if (/^\d+$/.test(query)) {
      return this.places.query(POSTAL_CODE_QUERY, [query, SUGGESTION_LIMIT]);
    }
    return this.places.query(NAME_QUERY, [
      query,
      SUGGESTION_LIMIT,
      typoPrefixPattern(query),
      withPostalCode,
    ]);
  }

  async findBySlug(slug: string): Promise<Place> {
    const place = await this.places.findOneBy({ slug });
    if (!place) {
      throw new NotFoundException(`Place "${slug}" not found.`);
    }
    return place;
  }

  async findNearest(lat: number, lng: number): Promise<Place> {
    const [place] = await this.places.query<Place[]>(NEAREST_QUERY, [lat, lng]);
    if (!place) {
      throw new NotFoundException('No place found near this location.');
    }
    return place;
  }

  existsWithPostalCode(id: string): Promise<boolean> {
    return this.places.exists({ where: { id, postalCode: Not(IsNull()) } });
  }
}
