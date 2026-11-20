import Slide from "@/components/Slide";
import { SLIDES } from "@/lib/slides";

export default function Carousel() {
	return (
		<>
			{SLIDES.map((slide) => (
				<Slide key={slide.id} title={slide.title} body={slide.body} />
			))}
		</>
	);
}
