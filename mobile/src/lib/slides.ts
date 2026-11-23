export type SlideContent = {
	id: string;
	type: "team" | "news" | "facts" | "waste";
	title: string;
	body: string;
	source?: string;
	image?: string;
};

export const SLIDES: SlideContent[] = [
	{
		id: "why-tomatoes",
		type: "team",
		title: "Warum Tomatoes?",
		body: 'Die drei EntwicklerInnen hinter FoodSwap lieben Pomodori. Und finden es lustig, die Lerntechnik "Pomodoro" auch mal als "Tomato" zu bezeichnen.',
	},

	{
		id: "yearly-food-waste",
		type: "facts",
		title: "Wegwerfen\nist keine Lösung!",
		body: "In Deutschland wirft jede Person pro Jahr durchschnittlich 75 kg Lebensmittel weg. Das sind ungefähr 600 Tomaten. Lasst mal lieber tauschen und verschenken.",
		source: "Quelle: Umweltbundesamt",
	},
	{
		id: "mobile-app-release",
		type: "news",
		title: "Neues aus dem Beet",
		body: "FoodSwap gibt's bald auch als Mobile App! 🎉 Mehr dazu in Kürze.",
		// image: "https://images.pexels.com/photos/8516717/pexels-photo-8516717.jpeg"
	},
	{
		id: "the-strich",
		type: "team",
		title: "Der Strich",
		body: 'Aus dem Alltag: Drei EntwicklerInnen schauen gemeinsam auf ihren Code.\n"Da fehlt ein Strich."\n"Was für ein Strich?"',
	},
	{
		id: "tomato-etymology",
		type: "facts",
		title: "Woher kommt das Wort Tomate?",
		body: "Das Wort stammt aus dem Nahuatl: Die Azteken nannten die Frucht „tomatl“. In Deutschland war sie lange nur als Zierpflanze „Liebesapfel“ bekannt.",
		source: "Quelle: DWDS",
	},
];
