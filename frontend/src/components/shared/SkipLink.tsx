export function SkipLink({ href, children }: { href: string; children: React.ReactNode }) {
	return (
		<a
			href={href}
			className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-60 focus:rounded-md focus:bg-background focus:p-2"
		>
			{children}
		</a>
	);
}
