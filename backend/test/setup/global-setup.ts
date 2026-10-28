import { DataSource } from "typeorm";

import { testDatabaseUrl } from "./test-database";
import { AppDataSource } from "../../src/data-source";

async function createDatabaseIfMissing(url: string): Promise<void> {
	const serverUrl = new URL(url);
	const name = serverUrl.pathname.slice(1);
	serverUrl.pathname = "/postgres";

	const server = new DataSource({ type: "postgres", url: serverUrl.href });
	await server.initialize();

	const existing = await server.query<unknown[]>("SELECT 1 FROM pg_database WHERE datname = $1", [
		name,
	]);
	if (existing.length === 0) {
		await server.query(`CREATE DATABASE "${name}"`);
	}

	await server.destroy();
}

export default async function globalSetup(): Promise<void> {
	const url = testDatabaseUrl();
	await createDatabaseIfMissing(url);

	const dataSource = new DataSource({
		type: "postgres",
		url,
		entities: AppDataSource.options.entities,
		migrations: AppDataSource.options.migrations,
	});
	await dataSource.initialize();
	await dataSource.runMigrations();
	await dataSource.destroy();
}
