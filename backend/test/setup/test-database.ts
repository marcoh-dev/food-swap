import 'dotenv/config';

export function testDatabaseUrl(): string {
  const url = process.env.TEST_DATABASE_URL;

  if (!url) {
    throw new Error('TEST_DATABASE_URL is not set.');
  }

  if (url === process.env.DATABASE_URL) {
    throw new Error('TEST_DATABASE_URL must not be the DATABASE_URL.');
  }

  return url;
}
