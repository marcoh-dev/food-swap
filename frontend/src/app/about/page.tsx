import { ExternalLinkIcon, QuoteIcon } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";

import { pageTitles } from "@/lib/constants/titles.constants";

export const metadata: Metadata = { title: pageTitles.about };

const TEAM = [
	{ name: "Marco", github: "https://github.com/marcoh-dev" },
	{ name: "Simon", github: "https://github.com/SimonNancekievill" },
	{ name: "Maria", github: "https://github.com/maria-traut" },
];

export default function About() {
	return (
		<div className="mx-auto max-w-prose">
			<h1 className="mb-2 text-h2">Wir sind FoodSwap.</h1>
			<section className="space-y-2 text-body-small font-light">
				<ul className="flex flex-wrap gap-x-6">
					{TEAM.map(({ name, github }) => (
						<li key={name}>
							<a
								href={github}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-1.5 no-underline hover:underline"
							>
								<Image src="/icon.svg" alt="" width={16} height={14} />
								{name}
								<ExternalLinkIcon aria-hidden="true" className="size-3" />
								<span className="sr-only">(öffnet in neuem Tab)</span>
							</a>
						</li>
					))}
				</ul>
				<figure className="relative mt-4 w-fit rounded-lg bg-muted/50 px-4 py-6 sm:px-7">
					<blockquote className="space-y-2 leading-relaxed italic">
						<QuoteIcon
							aria-hidden="true"
							className="absolute -top-2.5 left-4 size-5 fill-current text-border sm:left-7"
						/>
						<p>
							Drei Tomatoes betraten im Frühjahr das Beet,
							<br />
							Verschiedene Sorten - &bdquo;Wie es uns wohl ergeht?&ldquo;.
							<br />
							Viel zu tun gab es im neuen Garten,
							<br />
							Zwischen all dem Gemüse und manchen Irrfahrten.
						</p>
						<p>
							Als im Sommer warmes Licht die Gemüter erwärmte,
							<br />
							War ein Teil des Beetes längst bereit für die Ernte.
							<br />
							Die Tomatoes blieben, ob dies sie nun verbinde?
							<br />
							Ab sofort wehten dann plötzlich stürmische Winde.
						</p>
						<p>
							Der Herbst brach an, es kam die Kälte,
							<br />
							als Zusammenhalt den nötigen Anker darstellte.
							<br />
							Sie träumten von Freiheit, schwimmen wie Delphine,
							<br />
							statt zu verschrumpeln vor Stress wie die Sultanine.
						</p>
						<p>
							Ob ich Pomodoro oder Tomato sage,
							<br />
							das war nun die entscheidende Frage.
						</p>
						<QuoteIcon
							aria-hidden="true"
							className="absolute right-4 -bottom-2.5 size-5 rotate-180 fill-current text-border sm:right-7"
						/>
					</blockquote>
					<figcaption className="mt-4 text-right not-italic">
						- The Three Tomateers
					</figcaption>
				</figure>
			</section>
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
			<section className="mt-8">
				<h2 className="mb-2 font-medium">Datenschutz</h2>
				<ul className="list-disc space-y-1 pl-5 text-body-small">
					<li>
						Deinen Standort nutzen wir nur, wenn du ihn anforderst. Er wird auf etwa
						100&nbsp;m gerundet, nur zum Finden des nächsten Ortes verwendet und nicht
						gespeichert.
					</li>
					<li>
						Wir verwenden kein Tracking. Cookies setzen wir nur für die Anmeldung und um
						die Willkommensbox auszublenden.
					</li>
					<li>Passwörter speichern wir nur verschlüsselt.</li>
					<li>
						Wenn du dein Konto löschst, werden auch deine Angebote gelöscht. Deine
						Nachrichten bleiben ohne deinen Namen im Chat deiner Gesprächspartner.
					</li>
				</ul>
			</section>
		</div>
	);
}
