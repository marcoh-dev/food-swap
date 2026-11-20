export type SlideContent = {
	id: string;
	type: "team" | "news" | "facts" | "waste";
	title: string;
	body: string;
    source?: string;
};

export const SLIDES: SlideContent[] = [
	{
		id: "why-tomatoes",
		type: "team",
		title: "Warum Tomatoes?",
		body: 'Die drei EntwicklerInnen hinter FoodSwap lieben Pomodori. Und finden es lustig, die Lerntechnik "Pomodoro" auch mal als "Tomato" zu bezeichnen.',
	},
	
	
	{ id: "yearly-food-waste", type: "facts", title: "Wegwerfen ist keine Lösung!", body: "In Deutschland wirft jede Person pro Jahr durchschnittlich 75 kg Lebensmittel weg. Das sind ungefähr 600 Tomaten. Lasst mal mehr tauschen und verschenken.", source: "Quelle: Umweltbundesamt" },
	{
		id: "mobile-app-release",
		type: "news",
		title: "Neues aus dem Beet",
		body: "FoodSwap gibt's bald auch als Mobile App!",
	},
    {
		id: "the-strich",
		type: "team",
		title: "Der Strich",
		body: 'Aus dem Alltag: Drei EntwicklerInnen schauen gemeinsam auf ihren Code.\n"Da fehlt ein Strich."\n"Was für ein Strich?"',
	},
    { id: "slide-5", type: "facts", title: "…", body: "…" },
];
