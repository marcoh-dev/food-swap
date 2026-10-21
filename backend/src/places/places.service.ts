import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Place } from './entities/place.entity';

const SUGGESTION_LIMIT = 10;

const RESPONSE_COLUMNS = `"id", "country_code" AS "countryCode", "postal_code" AS "postalCode", "name", "city", "county", "state"`;

const POSTAL_CODE_QUERY = `
  SELECT ${RESPONSE_COLUMNS}
  FROM "places"
  WHERE "postal_code" LIKE $1 || '%'
  ORDER BY "postal_code", ("name" <> "city") DESC, "name"
  LIMIT $2`;

const NAME_QUERY = `
  WITH "candidates" AS (
    SELECT *,
      lower(replace(replace(replace(replace("name", 'ä', 'ae'), 'ö', 'oe'), 'ü', 'ue'), 'ß', 'ss')) AS "altName",
      CASE WHEN "name" <> "city" THEN substr("name", length("city") + 2) END AS "district"
    FROM "places"
    WHERE "postal_code" IS NULL OR "name" <> "city"
  ),
  "scored" AS (
    SELECT *,
      ("name" ILIKE $1 || '%' OR "altName" LIKE lower($1) || '%' OR coalesce("district" ILIKE $1 || '%', false)) AS "isPrefix",
      greatest(similarity("name", $1), similarity("altName", lower($1)), coalesce(similarity("district", $1), 0)) AS "score"
    FROM "candidates"
  )
  SELECT ${RESPONSE_COLUMNS}
  FROM "scored"
  WHERE "isPrefix" OR "score" > 0.3
  ORDER BY "isPrefix" DESC,
    CASE WHEN "isPrefix" THEN "postal_code" IS NULL END DESC NULLS LAST,
    CASE WHEN "isPrefix" THEN "size" END DESC NULLS LAST,
    "score" DESC, "size" DESC, "postal_code" NULLS FIRST, "name"
  LIMIT $2`;

@Injectable()
export class PlacesService {
  constructor(
    @InjectRepository(Place)
    private readonly places: Repository<Place>,
  ) {}

  search(query: string): Promise<Place[]> {
    const sql = /^\d+$/.test(query) ? POSTAL_CODE_QUERY : NAME_QUERY;
    return this.places.query(sql, [query, SUGGESTION_LIMIT]);
  }
}
