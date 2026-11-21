import { isIPv6 } from "node:net";

/**
 * Returns the address that rate limits count for: IPv4 addresses in full, IPv6 addresses by
 * their first half (/64), because a household gets a whole range of them.
 */
export function rateLimitAddress(ip: string): string {
	// IPv4 written as IPv6, e.g. "::ffff:203.0.113.7"
	const mappedIpv4 = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/i.exec(ip)?.[1];
	if (mappedIpv4) return mappedIpv4;
	if (!isIPv6(ip)) return ip;

	// "::" stands for as many zero groups as are missing to make eight
	const [head = "", tail] = ip.split("::");
	const headGroups = head ? head.split(":") : [];
	const tailGroups = tail ? tail.split(":") : [];
	const zeros =
		tail === undefined
			? []
			: Array<string>(8 - headGroups.length - tailGroups.length).fill("0");
	const groups = [...headGroups, ...zeros, ...tailGroups];

	return `${groups
		.slice(0, 4)
		.map((group) => parseInt(group, 16).toString(16))
		.join(":")}::/64`;
}
