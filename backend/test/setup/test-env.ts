import { testDatabaseUrl } from "./test-database";

process.env.DATABASE_URL = testDatabaseUrl();
// The rate limit tests send it to pretend requests come from different IPs
process.env.INTERNAL_API_SECRET ??= "test-internal-secret";
