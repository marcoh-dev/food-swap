import placeholderImage from "@food-swap/shared/assets/listing-placeholder.svg";
import type { StaticImageData } from "next/image";

// Next.js types SVG imports as any; the default loader returns StaticImageData.
const placeholder = placeholderImage as StaticImageData;

export default function ListingImagePlaceholder() {
	return (
		<div className="absolute inset-0 flex items-center justify-center bg-muted">
			<div
				aria-hidden
				className="size-2/3 bg-card [mask-size:contain] [mask-position:center] [mask-repeat:no-repeat]"
				style={{ maskImage: `url(${placeholder.src})` }}
			/>
		</div>
	);
}
