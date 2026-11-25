import { readdir } from "node:fs/promises";
import path from "node:path";
import { DataSource, type MigrationInterface } from "typeorm";

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

type MigrationClass = new () => MigrationInterface;

// The migration classes, loaded through Vitest so their TypeScript is compiled; TypeORM would load
// the files from its glob with Node directly, which can't import their type-only imports
async function loadMigrations(): Promise<MigrationClass[]> {
	const dir = path.resolve("src/migrations");
	const files = (await readdir(dir)).filter((file) => file.endsWith(".ts"));
	const modules = await Promise.all(
		files.map(
			(file) => import(path.join(dir, file)) as Promise<Record<string, MigrationClass>>,
		),
	);

	return modules.flatMap((module) => Object.values(module));
}

export default async function globalSetup(): Promise<void> {
	const url = testDatabaseUrl();
	await createDatabaseIfMissing(url);

	const dataSource = new DataSource({
		type: "postgres",
		url,
		entities: AppDataSource.options.entities,
		migrations: await loadMigrations(),
	});
	await dataSource.initialize();
	await dataSource.runMigrations();
	await dataSource.destroy();
}
