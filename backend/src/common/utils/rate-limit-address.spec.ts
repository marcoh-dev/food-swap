import { rateLimitAddress } from "./rate-limit-address";

describe("rateLimitAddress", () => {
	it("keeps IPv4 addresses", () => {
		expect(rateLimitAddress("203.0.113.7")).toBe("203.0.113.7");
	});

	it("turns IPv4 written as IPv6 into IPv4", () => {
		// Node reports local connections like this
		expect(rateLimitAddress("::ffff:127.0.0.1")).toBe("127.0.0.1");
	});

	it("groups IPv6 addresses by their first half", () => {
		expect(rateLimitAddress("2001:db8:1:2:aaaa:bbbb:cccc:dddd")).toBe("2001:db8:1:2::/64");
		expect(rateLimitAddress("2001:db8:1:2::1")).toBe("2001:db8:1:2::/64");
	});

	it("writes IPv6 groups the same way however they were sent", () => {
		// Leading zeros and "::" are optional ways to write the same address
		expect(rateLimitAddress("2001:0db8:0000:0002::1")).toBe("2001:db8:0:2::/64");
		expect(rateLimitAddress("2001:db8::2:0:0:0:1")).toBe("2001:db8:0:2::/64");
	});
});
