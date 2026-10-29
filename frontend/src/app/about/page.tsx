import type { Metadata } from "next";

import { pageTitles } from "@/lib/constants/titles.constants";

export const metadata: Metadata = { title: pageTitles.about };

export default function About() {
	return (
		<div className="mx-auto max-w-prose">
			<h1>Wir sind FoodSwap.</h1>

			<section className="mt-8">
				<h2 className="mb-2 font-medium">Datenquellen</h2>
				<p className="text-body-small">
					Orte und Postleitzahlen stammen von{" "}
					<a
						href="https://www.geonames.org/"
						target="_blank"
						rel="noopener noreferrer"
						className="underline"
					>
						GeoNames
					</a>{" "}
					und stehen unter der Lizenz{" "}
					<a
						href="https://creativecommons.org/licenses/by/4.0/deed.de"
						target="_blank"
						rel="noopener noreferrer"
						className="underline"
					>
						CC BY 4.0
					</a>
					. Die Daten wurden für Food Swap gefiltert und um Städte ergänzt.
				</p>
			</section>
		</div>
	);
}
