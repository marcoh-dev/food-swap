"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const AUTH_PAGES = ["/login", "/registration"];

type AuthLinkProps = Omit<React.ComponentProps<typeof Link>, "href"> & {
	href: "/login" | "/registration";
};

export function AuthLink({ href, className, ...props }: AuthLinkProps) {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const isActive = pathname === href;

	let redirectTo: string | null;
	if (AUTH_PAGES.includes(pathname)) {
		redirectTo = searchParams.get("redirect");
	} else {
		const params = new URLSearchParams(searchParams.toString());
		params.delete("toast");
		const query = params.toString();
		redirectTo = query ? `${pathname}?${query}` : pathname;
	}

	const target =
		redirectTo && redirectTo !== "/"
			? `${href}?redirect=${encodeURIComponent(redirectTo)}`
			: href;

	return (
		<Link
			href={target}
			aria-current={isActive ? "page" : undefined}
			className={`${isActive ? "no-underline before:mr-2 before:content-['🍅']" : "no-underline"} ${className ?? ""}`}
			{...props}
		/>
	);
}
