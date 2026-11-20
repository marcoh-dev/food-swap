export type SlideContent = {
        id: string;
        type: "team" | "news" |"facts" | "waste"
        title: string;
        body: string;
};

export const SLIDES: SlideContent[] = [
        {
                id: "why-tomatoes",
                type: "team",
                title: "Warum Tomatoes?",
                body: "Die drei EntwicklerInnen hinter FoodSwap lieben Pomodori. Und finden es lustig, die Lerntechnik Pomodoro auch mal als Tomato zu bezeichnen.",
        },
        { id: "the-strich", type: "team", title: "Aus dem Coding-Alltag", body: '"Da fehlt ein Strich." "Was für ein Strich?"' },
        { id: "slide-3", type: "news", title: "Neues aus dem Beet", body: "FoodSwap gibt's bald auch als Mobile App!" },
        { id: "slide-4", type: "facts", title: "…", body: "…" },
        { id: "slide-5", type: "facts", title: "…", body: "…" },
];