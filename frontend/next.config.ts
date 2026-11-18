import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	transpilePackages: ["@food-swap/shared"],
	reactCompiler: true,
	experimental: { authInterrupts: true },
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "*",
			},
		],
	},
};

export default nextConfig;
