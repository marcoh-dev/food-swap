"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";

type NavLinkProps = ComponentProps<typeof Link> & { activeHref?: string };

export default function NavLink({ href, activeHref, className, ...props }: NavLinkProps) {
	const pathname = usePathname();
	const isActive = pathname === (activeHref ?? href);

	return (
		<Link
			href={href}
			aria-current={isActive ? "page" : undefined}
			className={`${
				isActive
					? "no-underline before:mr-2 before:inline-block before:size-7 before:bg-[url('/logo.svg')] before:bg-contain before:bg-center before:bg-no-repeat before:align-middle before:content-['']"
					: "no-underline"
			} ${className ?? ""}`}
			{...props}
		/>
	);
}
