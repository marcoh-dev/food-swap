import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { App } from "supertest/types";

import { AppModule } from "../src/app.module";
import { resetRateLimits } from "./setup/rate-limits";

type PlaceResult = { postalCode: string | null; name: string };

// Runs against the real place data, which the migrations load into the test database
describe("Place search (integration)", () => {
	let app: INestApplication<App>;

	const search = async (q: string) => {
		const response = await request(app.getHttpServer())
			.get("/places")
			.query({ q, withPostalCode: "true" })
			.expect(200);
		return (response.body as PlaceResult[]).map((place) => `${place.postalCode} ${place.name}`);
	};

	beforeAll(async () => {
		const moduleRef = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleRef.createNestApplication();
		await app.init();
	});

	beforeEach(() => {
		resetRateLimits(app);
	});

	afterAll(async () => {
		await app.close();
	});

	it("suggests at most 5 places", async () => {
		expect(await search("Hamburg")).toHaveLength(5);
		expect(await search("54655")).toHaveLength(5);
	});

	describe("postal code and name", () => {
		it("finds a place by its postal code and the start of its name", async () => {
			expect(await search("20038 Ham")).toEqual(["20038 Hamburg"]);
			expect(await search("20038 Hambu")).toEqual(["20038 Hamburg"]);
			expect(await search("20038 Hamb")).toEqual(["20038 Hamburg"]);
		});

		it("narrows down places that share a postal code", async () => {
			expect(await search("54655 Malb")).toEqual(["54655 Malberg", "54655 Malbergweich"]);
		});

		it("finds the name with ae/oe/ue/ss for umlauts", async () => {
			expect(await search("50667 Koeln")).toEqual(["50667 Köln"]);
		});

		it("finds nothing when the name doesn't belong to the postal code", async () => {
			expect(await search("20038 Berlin")).toEqual([]);
		});
	});

	describe("similar names", () => {
		const names = async (q: string) => (await search(q)).map((place) => place.split(" ")[1]);

		it("still finds names with a typo", async () => {
			expect(await names("Hambrg")).toContain("Hamburg");
			expect(await names("Dresdn")).toContain("Dresden");
			expect(await names("Kölln")).toContain("Köln");
			expect(await names("Hamxx")).toContain("Hamm");
		});

		it("finds nothing similar for a text much longer than the name", async () => {
			expect(await names("Hamxxxxxxxx")).not.toContain("Hamm");
		});
	});
});
