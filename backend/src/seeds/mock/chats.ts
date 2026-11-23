// Each chat belongs to a listing. `user` is the person who wrote to the
// listing owner; messages are sent by either the `user` or the `owner`.
// `at` is "+N HH:mm" or "+N HH:mm:ss": N days after the listing was created,
// in Berlin time. Both have read the whole chat, unless `unread` is set: then
// the person who didn't send the last message hasn't read it yet.
// `user: null` is a deleted account: its messages have no sender and nobody can
// reply. `listingDeleted` leaves the chat without its listing (e.g. after the
// nightly cleanup); the listing's dates still time the messages.
export type MockChat = {
	key: string;
	listing: string;
	user: string | null;
	listingDeleted?: boolean;
	unread?: boolean;
	messages: MockMessage[];
};

type MockMessage = { from: "user" | "owner"; at: string; content: string };

type Session = { day: number; start: string; lines: [MockMessage["from"], string][] };

const SAME_SENDER_GAP_IN_S = 10;
const REPLY_GAP_IN_S = 2 * 60;

// Turns a long conversation into messages: each session is one chat on one
// day. Consecutive lines of the same person follow 10 seconds apart (so they
// are usually sent in the same minute), answers two minutes later.
function conversation(sessions: Session[]): MockMessage[] {
	return sessions.flatMap(({ day, start, lines }) => {
		const [hours, minutes] = start.split(":").map(Number) as [number, number];
		let seconds = (hours * 60 + minutes) * 60;

		return lines.map(([from, content], index) => {
			if (index > 0) {
				seconds += lines[index - 1]![0] === from ? SAME_SENDER_GAP_IN_S : REPLY_GAP_IN_S;
			}
			const time = [seconds / 3600, (seconds / 60) % 60, seconds % 60]
				.map((part) => String(Math.floor(part)).padStart(2, "0"))
				.join(":");

			return { from, at: `+${day} ${time}`, content };
		});
	});
}

export const mockChats: MockChat[] = [
	{
		key: "ole-apples-jana",
		listing: "ole-01",
		user: "jana",
		messages: [
			{
				from: "user",
				at: "+0 19:12",
				content:
					"Hallo! Sind die Äpfel noch zu haben? Ich würde am Samstag mit dem Auto vorbeikommen.",
			},
			{
				from: "owner",
				at: "+0 20:30",
				content:
					"Moin Jana, ja klar. Samstag ab 10 bin ich im Garten. Bring die Kiste bitte irgendwann zurück 😊",
			},
			{
				from: "user",
				at: "+0 20:41",
				content:
					"Super, dann bis Samstag gegen 11! Ich bringe dir ein Glas Johannisbeergelee mit.",
			},
			{
				from: "owner",
				at: "+6 15:20",
				content: "Danke nochmal für das Gelee, war lecker!",
			},
		],
	},
	{
		key: "jana-kombucha-ole",
		listing: "jana-04",
		user: "ole",
		messages: [
			{
				from: "user",
				at: "+35 08:30",
				content:
					"Hallo, ist der Teepilz noch da? Meine Frau will unbedingt mal Kombucha probieren.",
			},
			{
				from: "owner",
				at: "+35 12:10",
				content: "Ja! Ich kann ihn dir mitbringen, wenn ich die Apfelkiste zurückbringe.",
			},
			{ from: "user", at: "+35 12:30", content: "Perfekt 👍" },
		],
	},
	{
		key: "ole-pumpkin-jana",
		listing: "ole-08",
		user: "jana",
		messages: [
			{
				from: "user",
				at: "+1 18:30",
				content:
					"Hi Ole, würdest du den Kürbis gegen Kartoffeln tauschen? Ich habe noch einiges an Linda.",
			},
			{
				from: "owner",
				at: "+1 19:45",
				content: "Gerne! Reicht dir ein halber oder willst du den ganzen?",
			},
			{
				from: "user",
				at: "+1 19:50",
				content: "Halb reicht völlig 😅",
			},
		],
	},
	{
		key: "lotte-zucchini-mehmet",
		listing: "lotte-01",
		user: "mehmet",
		messages: [
			{
				from: "user",
				at: "+1 17:40",
				content:
					"Hi Lotte, ich nehme gerne zwei Zucchini! Kann ich heute Abend in Pankow vorbeikommen?",
			},
			{
				from: "owner",
				at: "+1 18:15",
				content: "Hi! Heute klappt leider nicht, morgen ab 18 Uhr?",
			},
			{
				from: "user",
				at: "+1 18:20",
				content: "Morgen passt. Soll ich dir ein paar Tomaten mitbringen?",
			},
			{ from: "owner", at: "+1 18:22", content: "Oh ja, gerne!" },
		],
	},
	{
		key: "mehmet-paste-lotte",
		listing: "mehmet-02",
		user: "lotte",
		messages: [
			{
				from: "user",
				at: "+1 09:15",
				content:
					"Hallo Mehmet, das klingt super. Würdest du ein Glas gegen Pflaumenmus tauschen?",
			},
			{
				from: "owner",
				at: "+1 12:40",
				content: "Klar, sehr gern. Ich bin Mittwoch im Garten, magst du dahin kommen?",
			},
			{
				from: "user",
				at: "+1 13:02",
				content: "Mittwoch geht. Welches Beet?",
			},
			{
				from: "owner",
				at: "+1 13:10",
				content: "Beim großen Kompost, frag einfach nach mir 🙂",
			},
		],
	},
	{
		key: "mehmet-ajvar-lotte",
		listing: "mehmet-07",
		user: "lotte",
		messages: [
			{
				from: "user",
				at: "+1 08:00",
				content:
					"Guten Morgen! Ist das Ajvar sehr scharf? Mein Freund verträgt nicht viel.",
			},
			{
				from: "owner",
				at: "+1 09:30",
				content: "Nein, ganz mild. Die scharfe Version habe ich für mich behalten 😄",
			},
			{
				from: "user",
				at: "+1 09:41",
				content: "Dann nehme ich gerne ein Glas! Ich könnte Samstag.",
			},
			{
				from: "owner",
				at: "+1 10:02",
				content: "Samstag passt. Ich reserviere es für dich.",
			},
		],
	},
	{
		key: "lotte-kotzen-mehmet",
		listing: "lotte-07",
		user: "mehmet",
		messages: [
			{
				from: "user",
				at: "+0 20:03",
				content:
					"Ich musste so lachen beim Ortsnamen 😂 Bringst du zufällig Äpfel mit nach Berlin?",
			},
			{
				from: "owner",
				at: "+0 21:10",
				content:
					"Haha, das fragen alle. Ich bringe Sonntag eine Kiste mit nach Pankow, davon kann ich dir 3 kg abzweigen.",
			},
			{ from: "user", at: "+0 21:12", content: "Das wäre top, danke!" },
		],
	},
	{
		key: "fabian-figs-ines",
		listing: "fabian-03",
		user: "ines",
		messages: [
			{
				from: "user",
				at: "+0 18:20",
				content:
					"Hallo Fabian, ich hätte großes Interesse an den Feigen! Wie viele sind es denn?",
			},
			{
				from: "owner",
				at: "+0 19:05",
				content: "Ca. ein Kilo, werden aber jeden Tag mehr. Magst du Freitag kommen?",
			},
			{
				from: "user",
				at: "+0 19:30",
				content: "Freitag nach der Arbeit, so gegen 17:30?",
			},
			{
				from: "owner",
				at: "+0 19:31",
				content: "Passt. Ich reserviere sie dir.",
			},
		],
	},
	{
		key: "ines-seeds-fabian",
		listing: "ines-01",
		user: "fabian",
		messages: [
			{
				from: "user",
				at: "+1 21:00",
				content:
					"Servus! Hättest du Interesse an Samen von Ochsenherz? Dann würde ich gerne Black Krim und Green Zebra nehmen.",
			},
			{
				from: "owner",
				at: "+2 07:45",
				content:
					"Sehr gerne, Ochsenherz fehlt mir noch! Soll ich dir meine einfach in den Briefkasten werfen? Die Wiehre ist ja nicht weit.",
			},
			{
				from: "user",
				at: "+2 08:10",
				content: "Gerne! Meine bringe ich dir dann nach Herdern.",
			},
		],
	},
	{
		key: "fabian-walnuts-ines",
		listing: "fabian-05",
		user: "ines",
		messages: [
			{
				from: "user",
				at: "+1 10:15",
				content:
					"Ich schon wieder 🙈 Die Walnüsse würde ich auch nehmen, falls noch keiner gefragt hat.",
			},
			{
				from: "owner",
				at: "+1 11:00",
				content:
					"Für dich immer. Sie sind aber noch nass, ich lasse sie noch zwei Wochen trocknen.",
			},
			{
				from: "user",
				at: "+1 11:05",
				content: "Kein Problem, ich warte.",
			},
			{
				from: "owner",
				at: "+15 18:30",
				content: "Die Walnüsse sind trocken. Diese Woche kannst du sie abholen!",
			},
			{
				from: "user",
				at: "+15 19:02",
				content: "Mega, ich komme Donnerstag.",
			},
		],
	},
	{
		key: "heinz-lentils-sepp",
		listing: "heinz-02",
		user: "sepp",
		messages: [
			{
				from: "user",
				at: "+1 20:00",
				content:
					"Ich wohne in Möhrendorf und verschenke Möhren. Ich fühle mich verstanden. 😄",
			},
			{
				from: "owner",
				at: "+1 20:45",
				content: "Haha! Dann sind wir ja quasi Kollegen. Grüße nach Franken!",
			},
		],
	},
	// Jana's chats: more than a screen full, a few unread and one long chat.
	// mock_gerda has no chats, to show the empty chat list
	{
		key: "jana-pumpkins-deleted",
		listing: "jana-10",
		user: null,
		unread: true,
		messages: [
			{
				from: "user",
				at: "+2 17:00",
				content: "Hallo, ich hätte gern einen Kürbis. Geht das noch diese Woche?",
			},
			{
				from: "owner",
				at: "+2 18:10",
				content: "Hallo! Ja, Mittwoch oder Donnerstag nach 17 Uhr.",
			},
			{ from: "user", at: "+2 18:30", content: "Donnerstag passt. Bis dann!" },
		],
	},
	{
		key: "jana-zucchini-sepp",
		listing: "jana-21",
		user: "sepp",
		listingDeleted: true,
		unread: true,
		messages: [
			{
				from: "user",
				at: "+3 19:15",
				content: "Servus Jana! Sind die Zucchini noch da? Ich würde Zucchinibrot backen.",
			},
			{ from: "owner", at: "+3 20:00", content: "Ja, aber nur noch zwei kleine." },
			{ from: "user", at: "+3 20:05", content: "Reicht völlig, danke dir!" },
		],
	},
	{
		key: "jana-basil-ole",
		listing: "jana-06",
		user: "ole",
		unread: true,
		messages: conversation([
			{
				day: 1,
				start: "18:30",
				lines: [
					["user", "Moin Jana, du ziehst um? Den Basilikum nehme ich gern."],
					["user", "Wohin geht's denn?"],
					["owner", "Moin Ole! Nach Ottensen, nur ein paar Straßen weiter."],
					["owner", "Aber die neue Wohnung hat keinen Balkon 😢"],
					["user", "Oh nein. Dann musst du wohl öfter zu mir in den Garten kommen."],
					["owner", "Haha, gerne! Wann willst du den Basilikum holen?"],
					["user", "Samstag? Ich bin eh in Hamburg."],
					["owner", "Samstag ist Umzugstag, da ist hier Chaos."],
					["owner", "Freitag ginge besser."],
					["user", "Freitag nach 17 Uhr?"],
					["owner", "Perfekt."],
				],
			},
			{
				day: 2,
				start: "08:05",
				lines: [
					["user", "Sag mal, braucht ihr noch Hilfe beim Umzug?"],
					["user", "Ich hätte einen Anhänger."],
					["owner", "Ernsthaft? Das wäre ein Traum!"],
					["owner", "Wir haben bisher nur einen Transporter für die Möbel."],
					["owner", "Die ganzen Pflanzen und Kisten passen da nicht mehr rein."],
					["user", "Dann bringe ich den Anhänger Samstag mit."],
					["user", "Wann soll ich da sein?"],
					["owner", "Um 9? Ich mache Kaffee und Franzbrötchen."],
					["user", "Für Franzbrötchen komme ich auch um 8 😄"],
					["owner", "Abgemacht!"],
				],
			},
			{
				day: 4,
				start: "20:10",
				lines: [
					["owner", "Ole, kurze Frage: Wie groß ist dein Anhänger?"],
					["user", "Zwei Meter lang, gut einen Meter breit."],
					["user", "Mit Plane."],
					["owner", "Dann passen die Pflanzen und die Kisten rein."],
					["owner", "Und vielleicht das Regal."],
					["user", "Das Regal binden wir fest, kein Problem."],
					["owner", "Du bist ein Schatz."],
					["user", "Ich weiß 😄"],
					["user", "Wie viele Pflanzen sind es denn?"],
					["owner", "Ehrlich gesagt … ungefähr 30."],
					["owner", "Tomaten, Kräuter, die Chilis, die Physalis."],
					["owner", "Und die Zitrone, die ist schon 1,5 Meter hoch."],
					["user", "Ich sehe schon, ich fahre zweimal."],
					["owner", "Sorry 🙈"],
					["user", "Alles gut, das wird lustig."],
				],
			},
			{
				day: 7,
				start: "18:00",
				lines: [
					["user", "Bin gut zu Hause angekommen."],
					["user", "Der Basilikum steht schon auf der Fensterbank."],
					["owner", "Danke nochmal für alles!"],
					["owner", "Ohne dich hätten wir das nicht geschafft."],
					["owner", "Die Zitrone hat den Umzug auch überlebt 🍋"],
					["user", "Sehr gut. Wie ist die neue Wohnung?"],
					["owner", "Schön hell, aber eben ohne Balkon."],
					["owner", "Die Pflanzen stehen jetzt alle im Treppenhaus 😅"],
					["user", "Die Nachbarn freuen sich bestimmt."],
					["owner", "Eine hat sich schon beschwert."],
					["owner", "Eine andere hat gefragt, ob sie Tomaten haben kann."],
					["user", "Siehst du, so findet man Freunde."],
				],
			},
			{
				day: 9,
				start: "19:30",
				lines: [
					["user", "Ich hatte eine Idee wegen deiner Pflanzen."],
					["user", "Bei uns im Garten ist noch ein Beet frei."],
					["user", "Und im Gewächshaus wäre Platz für die Zitrone."],
					["owner", "Wirklich? Das wäre großartig!"],
					["owner", "Aber Himmelpforten ist ja nicht gerade um die Ecke."],
					["user", "Mit der S-Bahn bis Stade und dann mit dem Rad, das geht."],
					["user", "Und am Wochenende kannst du ernten, was du willst."],
					["owner", "Das klingt fast zu schön."],
					["owner", "Was möchtest du dafür?"],
					["user", "Ab und zu ein Glas Johannisbeergelee."],
					["user", "Und vielleicht ein Brot mit deinem Sauerteig."],
					["owner", "Deal! Hefe-Heinz backt für dich."],
					["user", "Wer ist Hefe-Heinz?"],
					["owner", "Mein Sauerteig 😄"],
					["owner", "Er ist vier Jahre alt."],
					["user", "Dann grüß ihn schön."],
				],
			},
			{
				day: 12,
				start: "17:45",
				lines: [
					["owner", "Hallo Ole, wir haben am Wochenende Zeit."],
					["owner", "Sollen wir die Pflanzen Samstag rausbringen?"],
					["user", "Samstag passt gut."],
					["user", "Ich hole euch mit dem Anhänger ab."],
					["owner", "Super, dann packe ich heute schon alles zusammen."],
					["user", "Bring Handschuhe mit, das Beet muss noch umgegraben werden."],
					["owner", "Und Franzbrötchen?"],
					["user", "Natürlich auch Franzbrötchen."],
					["user", "Und den Basilikum bringe ich zurück, der fühlt sich bei dir wohler."],
					["user", "Er sieht bei mir ein bisschen traurig aus 😅"],
					["owner", "Oh nein 😄 Dann bekommt er einen Ehrenplatz im Beet."],
					["user", "Bis Samstag!"],
					["user", "Ich bin um 9 da."],
				],
			},
		]),
	},
	{
		key: "jana-chili-heinz",
		listing: "jana-17",
		user: "heinz",
		unread: true,
		messages: [
			{
				from: "user",
				at: "+24 19:00",
				content: "Hallo Jana! Wie scharf ist wirklich scharf? Ich esse auch Habaneros pur.",
			},
			{ from: "user", at: "+24 19:00:30", content: "Ich hätte Apfelwein im Tausch 🍎" },
		],
	},
	{
		key: "jana-beets-fabian",
		listing: "jana-09",
		user: "fabian",
		unread: true,
		messages: [
			{
				from: "user",
				at: "+13 15:00",
				content:
					"Hallo, die Chioggia-Bete sind so hübsch! Ich hätte Topaz-Äpfel zum Tausch.",
			},
			{
				from: "owner",
				at: "+13 18:30",
				content: "Hallo Fabian, sehr gern! Wie viele Äpfel könntest du schicken?",
			},
			{
				from: "user",
				at: "+14 09:10",
				content:
					"Ich schicke dir ein Paket mit 2 kg, die Bete kannst du mir dann zurückschicken.",
			},
			{ from: "user", at: "+14 09:10:40", content: "Ist das in Ordnung?" },
		],
	},
	{
		key: "heinz-cider-jana",
		listing: "heinz-04",
		user: "jana",
		unread: true,
		messages: [
			{
				from: "user",
				at: "+7 18:00",
				content:
					"Hallo Heinz, ich würde gern Apfelwein ansetzen. Gibst du auch kleine Mengen ab, so 10 kg?",
			},
			{
				from: "owner",
				at: "+8 09:15",
				content: "Hallo Jana, klar, 10 kg sind kein Problem.",
			},
			{
				from: "owner",
				at: "+8 09:15:30",
				content: "Aber Hamburg ist ein Stück weg. Kommst du mal in die Gegend?",
			},
		],
	},
	{
		key: "jana-potatoes-lotte",
		listing: "jana-20",
		user: "lotte",
		messages: [
			{
				from: "user",
				at: "+1 09:30",
				content:
					"Hallo Jana, ich hätte einen Hokkaido zum Tauschen. Sind die Kartoffeln noch da?",
			},
			{
				from: "owner",
				at: "+1 10:05",
				content: "Hi Lotte, ja! Ich reserviere sie dir. Wie kommen sie nach Berlin?",
			},
			{
				from: "user",
				at: "+1 10:20",
				content: "Meine Schwester wohnt in Altona und holt sie Freitag ab.",
			},
			{
				from: "owner",
				at: "+1 10:21",
				content: "Perfekt, dann tauschen die beiden für uns 😊",
			},
		],
	},
	{
		key: "sepp-cabbage-jana",
		listing: "sepp-08",
		user: "jana",
		messages: [
			{
				from: "user",
				at: "+1 12:00",
				content:
					"Servus Sepp! Drei Köpfe Weißkraut – genau richtig für Sauerkraut. Schickst du auch?",
			},
			{
				from: "owner",
				at: "+1 13:40",
				content:
					"Grüß dich! Verschicken ist schwierig, die Köpfe sind riesig. Tut mir leid.",
			},
			{
				from: "user",
				at: "+1 13:45",
				content: "Kein Problem, dann viel Spaß beim Einlegen!",
			},
		],
	},
	{
		key: "ole-elderberries-jana",
		listing: "ole-18",
		user: "jana",
		messages: [
			{
				from: "user",
				at: "+0 18:02",
				content: "Ole, die Holunderbeeren nehme ich! Ich mache Saft daraus.",
			},
			{
				from: "owner",
				at: "+0 18:40",
				content: "Dachte ich mir 😄 Ich stelle sie dir morgen vor die Tür.",
			},
			{ from: "user", at: "+1 08:12", content: "Sind angekommen, danke!" },
		],
	},
	{
		key: "kim-buckthorn-jana",
		listing: "kim-02",
		user: "jana",
		messages: [
			{
				from: "user",
				at: "+2 10:30",
				content:
					"Hi! Sanddorn hätte ich gern für Saft. Ist der Kummerower See weit von dir?",
			},
			{
				from: "owner",
				at: "+2 11:15",
				content:
					"Nein, das ist mein Lieblingsplatz. Ich bin aber erst in zwei Wochen wieder in Hamburg, dann bringe ich dir eine Schüssel mit.",
			},
			{
				from: "user",
				at: "+2 11:20",
				content: "Wie lieb, danke! Ich gebe dir dafür ein Glas Chili-Öl.",
			},
		],
	},
	{
		key: "fabian-grapes-jana",
		listing: "fabian-04",
		user: "jana",
		messages: [
			{
				from: "user",
				at: "+2 19:00",
				content:
					"Hallo Fabian, die Trauben klingen toll. Würdest du sie gegen Gurken tauschen? Ich weiß, Hamburg ist etwas weit 😅",
			},
			{
				from: "owner",
				at: "+2 20:10",
				content:
					"Haha, ja, das wird schwierig. Aber wenn du mal in Freiburg bist, melde dich!",
			},
			{ from: "user", at: "+2 20:12", content: "Mach ich, danke!" },
		],
	},
	{
		key: "jana-sourdough-fabian",
		listing: "jana-05",
		user: "fabian",
		messages: [
			{
				from: "user",
				at: "+1 18:30",
				content:
					"Hallo Jana, ich würde gern ein Stück von Hefe-Heinz adoptieren 😄 Kannst du es trocknen und schicken?",
			},
			{
				from: "owner",
				at: "+1 19:05",
				content: "Gern! Getrocknet übersteht er die Reise problemlos.",
			},
			{
				from: "user",
				at: "+1 19:10",
				content: "Super, danke! Ich schicke dir dafür ein Glas Mirabellenmarmelade.",
			},
		],
	},
	{
		key: "jana-calendula-kim",
		listing: "jana-19",
		user: "kim",
		messages: [
			{
				from: "user",
				at: "+4 17:00",
				content:
					"Hi Jana, ich würde mir gern die Ringelblumen holen. Ich mache Salbe daraus.",
			},
			{ from: "owner", at: "+4 17:30", content: "Gern! Wann passt es dir?" },
			{ from: "user", at: "+4 17:32", content: "Donnerstag nach der Arbeit, so um 18 Uhr?" },
			{ from: "owner", at: "+4 17:33", content: "Passt, klingel einfach bei Petersen." },
		],
	},
	{
		key: "jana-tomatoes-ole",
		listing: "jana-01",
		user: "ole",
		messages: [
			{
				from: "user",
				at: "+0 19:00",
				content: "Hast du noch gelbe? Meine Enkelin mag nur die gelben 😄",
			},
			{
				from: "owner",
				at: "+0 19:30",
				content: "Ein paar sind noch da, ich lege sie zur Seite.",
			},
		],
	},
	{
		key: "ines-bread-jana",
		listing: "ines-03",
		user: "jana",
		messages: [
			{
				from: "user",
				at: "+0 12:30",
				content:
					"Hi Ines, wie lange hält das Brot noch? Ich bin erst nächste Woche im Süden.",
			},
			{
				from: "owner",
				at: "+0 14:10",
				content:
					"Leider nur ein paar Tage, sorry! Aber ich backe jede Woche, frag gern nochmal.",
			},
		],
	},
	{
		key: "jana-chard-ines",
		listing: "jana-14",
		user: "ines",
		messages: [
			{
				from: "user",
				at: "+2 16:00",
				content:
					"Hallo Jana, Dill habe ich reichlich. Soll ich dir welchen trocknen und schicken?",
			},
			{
				from: "owner",
				at: "+2 18:20",
				content:
					"Oh ja, getrockneter Dill wäre super! Den Mangold schicke ich dir aber lieber nicht, der welkt unterwegs 😅",
			},
			{ from: "user", at: "+2 18:25", content: "Dann einfach so, als Gruß aus Freiburg!" },
			{ from: "owner", at: "+2 18:26", content: "Danke dir, das ist lieb!" },
		],
	},
	{
		key: "mehmet-tomatoes-jana",
		listing: "mehmet-01",
		user: "jana",
		messages: [
			{
				from: "user",
				at: "+1 19:05",
				content:
					"Hallo Mehmet! Hast du noch ein paar Fleischtomaten? Ich bin am Wochenende in Berlin.",
			},
			{
				from: "owner",
				at: "+1 20:12",
				content:
					"Hi Jana, ja, ein paar Kilo sind noch da. Samstag bin ich ab 11 im Garten.",
			},
			{ from: "user", at: "+1 20:15", content: "Super, ich komme gegen 12 vorbei!" },
		],
	},
	{
		key: "lotte-apples-jana",
		listing: "lotte-07",
		user: "jana",
		messages: [
			{
				from: "user",
				at: "+3 10:20",
				content: "Hallo Lotte, sind noch Äpfel übrig? Ich würde Apfelmus einkochen.",
			},
			{
				from: "owner",
				at: "+3 12:45",
				content: "Ja, noch etwa die Hälfte. Sonntag bin ich in Pankow, passt dir das?",
			},
			{ from: "user", at: "+3 12:50", content: "Sonntag passt, danke!" },
		],
	},
	{
		key: "jana-green-tomatoes-mehmet",
		listing: "jana-02",
		user: "mehmet",
		messages: [
			{
				from: "user",
				at: "+1 18:00",
				content: "Hallo Jana, grüne Tomaten lege ich gern sauer ein. Wie bei meiner Oma 🙂",
			},
			{
				from: "owner",
				at: "+1 19:15",
				content:
					"Das klingt lecker! Leider ist Hamburg weit von Neukölln. Kommst du zufällig in den Norden?",
			},
			{
				from: "user",
				at: "+1 19:40",
				content: "Nächsten Monat bin ich zu einer Hochzeit in Hamburg. Ich melde mich!",
			},
		],
	},
	{
		key: "jana-cucumbers-kim",
		listing: "jana-12",
		user: "kim",
		messages: [
			{
				from: "user",
				at: "+3 08:15",
				content: "Moin! Ich bräuchte Gurken für einen Salat am Wochenende.",
			},
			{
				from: "owner",
				at: "+3 09:00",
				content: "Moin Kim, nimm gerne vier mit. Samstag ab 10 bin ich da.",
			},
			{ from: "user", at: "+3 09:05", content: "Danke, bis Samstag!" },
		],
	},
];
