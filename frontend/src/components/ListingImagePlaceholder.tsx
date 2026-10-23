export default function ListingImagePlaceholder() {
	return (
		<div className="absolute inset-0 flex items-center justify-center bg-muted">
			<div
				aria-hidden
				className="size-2/3 bg-muted-foreground/40 [mask-image:url('/logo.svg')] [mask-size:contain] [mask-repeat:no-repeat] [mask-position:center]"
			/>
		</div>
	);
}
