export type MockUser = {
	key: string;
	username: string;
	name: string | null;
	place: string | null;
	createdAt: string;
};

export const MOCK_USERNAME_PREFIX = "mock_";

export const mockUsers: MockUser[] = [
	{
		key: "jana",
		username: "mock_jana",
		name: "Jana Petersen",
		place: "22765-hamburg",
		createdAt: "2026-07-28 21:14",
	},
	{
		key: "ole",
		username: "mock_ole",
		name: null,
		place: "21709-himmelpforten",
		createdAt: "2026-07-30 08:02",
	},
	{
		key: "mehmet",
		username: "mock_mehmet",
		name: "Mehmet Yıldız",
		place: "12047-berlin",
		createdAt: "2026-07-19 17:45",
	},
	{
		key: "lotte",
		username: "mock_lotte",
		name: "Lotte Schulz",
		place: "13187-berlin",
		createdAt: "2026-07-24 22:31",
	},
	{
		key: "fabian",
		username: "mock_fabian",
		name: "Fabian Wehrle",
		place: null,
		createdAt: "2026-07-29 19:20",
	},
	{
		key: "ines",
		username: "mock_ines",
		name: null,
		place: "79106-freiburg-im-breisgau",
		createdAt: "2026-07-31 12:08",
	},
	{
		key: "gerda",
		username: "mock_gerda",
		name: "Gerda Kowalski",
		place: "38875-elend",
		createdAt: "2026-07-26 10:55",
	},
	{
		key: "heinz",
		username: "mock_heinz",
		name: "Heinz Brenner",
		place: "63589-linsengericht",
		createdAt: "2026-08-05 16:37",
	},
	{
		key: "kim",
		username: "mock_kim",
		name: null,
		place: null,
		createdAt: "2026-08-03 23:12",
	},
	{
		key: "sepp",
		username: "mock_sepp",
		name: "Sepp Hofmann",
		place: "91096-moehrendorf",
		createdAt: "2026-08-08 07:50",
	},
];
