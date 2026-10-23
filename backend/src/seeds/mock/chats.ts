// Each chat belongs to a listing. `user` is the person who wrote to the
// listing owner; messages are sent by either the `user` or the `owner`.
export type MockChat = {
  key: string;
  listing: string;
  user: string;
  messages: { from: 'user' | 'owner'; at: string; content: string }[];
};

export const mockChats: MockChat[] = [
  {
    key: 'ole-apples-jana',
    listing: 'ole-01',
    user: 'jana',
    messages: [
      {
        from: 'user',
        at: '2026-09-06 19:12',
        content:
          'Hallo! Sind die Äpfel noch zu haben? Ich würde am Samstag mit dem Auto vorbeikommen.',
      },
      {
        from: 'owner',
        at: '2026-09-06 20:30',
        content:
          'Moin Jana, ja klar. Samstag ab 10 bin ich im Garten. Bring die Kiste bitte irgendwann zurück 😊',
      },
      {
        from: 'user',
        at: '2026-09-06 20:41',
        content:
          'Super, dann bis Samstag gegen 11! Ich bringe dir ein Glas Johannisbeergelee mit.',
      },
      {
        from: 'owner',
        at: '2026-09-12 15:20',
        content: 'Danke nochmal für das Gelee, war lecker!',
      },
    ],
  },
  {
    key: 'jana-kombucha-ole',
    listing: 'jana-04',
    user: 'ole',
    messages: [
      {
        from: 'user',
        at: '2026-09-14 08:30',
        content:
          'Hallo, ist der Teepilz noch da? Meine Frau will unbedingt mal Kombucha probieren.',
      },
      {
        from: 'owner',
        at: '2026-09-14 12:10',
        content:
          'Ja! Ich kann ihn dir mitbringen, wenn ich die Apfelkiste zurückbringe.',
      },
      { from: 'user', at: '2026-09-14 12:30', content: 'Perfekt 👍' },
    ],
  },
  {
    key: 'ole-pumpkin-jana',
    listing: 'ole-08',
    user: 'jana',
    messages: [
      {
        from: 'user',
        at: '2026-09-21 18:30',
        content:
          'Hi Ole, würdest du den Kürbis gegen Kartoffeln tauschen? Ich habe noch einiges an Linda.',
      },
      {
        from: 'owner',
        at: '2026-09-21 19:45',
        content: 'Gerne! Reicht dir ein halber oder willst du den ganzen?',
      },
      {
        from: 'user',
        at: '2026-09-21 19:50',
        content: 'Halb reicht völlig 😅',
      },
    ],
  },
  {
    key: 'lotte-zucchini-mehmet',
    listing: 'lotte-01',
    user: 'mehmet',
    messages: [
      {
        from: 'user',
        at: '2026-08-05 17:40',
        content:
          'Hi Lotte, ich nehme gerne zwei Zucchini! Kann ich heute Abend in Pankow vorbeikommen?',
      },
      {
        from: 'owner',
        at: '2026-08-05 18:15',
        content: 'Hi! Heute klappt leider nicht, morgen ab 18 Uhr?',
      },
      {
        from: 'user',
        at: '2026-08-05 18:20',
        content: 'Morgen passt. Soll ich dir ein paar Tomaten mitbringen?',
      },
      { from: 'owner', at: '2026-08-05 18:22', content: 'Oh ja, gerne!' },
    ],
  },
  {
    key: 'mehmet-paste-lotte',
    listing: 'mehmet-02',
    user: 'lotte',
    messages: [
      {
        from: 'user',
        at: '2026-09-08 09:15',
        content:
          'Hallo Mehmet, das klingt super. Würdest du ein Glas gegen Pflaumenmus tauschen?',
      },
      {
        from: 'owner',
        at: '2026-09-08 12:40',
        content:
          'Klar, sehr gern. Ich bin Mittwoch im Garten, magst du dahin kommen?',
      },
      {
        from: 'user',
        at: '2026-09-08 13:02',
        content: 'Mittwoch geht. Welches Beet?',
      },
      {
        from: 'owner',
        at: '2026-09-08 13:10',
        content: 'Beim großen Kompost, frag einfach nach mir 🙂',
      },
    ],
  },
  {
    key: 'mehmet-ajvar-lotte',
    listing: 'mehmet-07',
    user: 'lotte',
    messages: [
      {
        from: 'user',
        at: '2026-09-24 08:00',
        content:
          'Guten Morgen! Ist das Ajvar sehr scharf? Mein Freund verträgt nicht viel.',
      },
      {
        from: 'owner',
        at: '2026-09-24 09:30',
        content:
          'Nein, ganz mild. Die scharfe Version habe ich für mich behalten 😄',
      },
      {
        from: 'user',
        at: '2026-09-24 09:41',
        content: 'Dann nehme ich gerne ein Glas! Ich könnte Samstag.',
      },
      {
        from: 'owner',
        at: '2026-09-24 10:02',
        content: 'Samstag passt. Ich reserviere es für dich.',
      },
    ],
  },
  {
    key: 'lotte-kotzen-mehmet',
    listing: 'lotte-07',
    user: 'mehmet',
    messages: [
      {
        from: 'user',
        at: '2026-09-19 20:03',
        content:
          'Ich musste so lachen beim Ortsnamen 😂 Bringst du zufällig Äpfel mit nach Berlin?',
      },
      {
        from: 'owner',
        at: '2026-09-19 21:10',
        content:
          'Haha, das fragen alle. Ich bringe Sonntag eine Kiste mit nach Pankow, davon kann ich dir 3 kg abzweigen.',
      },
      { from: 'user', at: '2026-09-19 21:12', content: 'Das wäre top, danke!' },
    ],
  },
  {
    key: 'fabian-figs-ines',
    listing: 'fabian-03',
    user: 'ines',
    messages: [
      {
        from: 'user',
        at: '2026-09-03 18:20',
        content:
          'Hallo Fabian, ich hätte großes Interesse an den Feigen! Wie viele sind es denn?',
      },
      {
        from: 'owner',
        at: '2026-09-03 19:05',
        content:
          'Ca. ein Kilo, werden aber jeden Tag mehr. Magst du Freitag kommen?',
      },
      {
        from: 'user',
        at: '2026-09-03 19:30',
        content: 'Freitag nach der Arbeit, so gegen 17:30?',
      },
      {
        from: 'owner',
        at: '2026-09-03 19:31',
        content: 'Passt. Ich reserviere sie dir.',
      },
    ],
  },
  {
    key: 'ines-seeds-fabian',
    listing: 'ines-01',
    user: 'fabian',
    messages: [
      {
        from: 'user',
        at: '2026-09-16 21:00',
        content:
          'Servus! Hättest du Interesse an Samen von Ochsenherz? Dann würde ich gerne Black Krim und Green Zebra nehmen.',
      },
      {
        from: 'owner',
        at: '2026-09-17 07:45',
        content:
          'Sehr gerne, Ochsenherz fehlt mir noch! Soll ich dir meine einfach in den Briefkasten werfen? Die Wiehre ist ja nicht weit.',
      },
      {
        from: 'user',
        at: '2026-09-17 08:10',
        content: 'Gerne! Meine bringe ich dir dann nach Herdern.',
      },
    ],
  },
  {
    key: 'fabian-walnuts-ines',
    listing: 'fabian-05',
    user: 'ines',
    messages: [
      {
        from: 'user',
        at: '2026-09-28 10:15',
        content:
          'Ich schon wieder 🙈 Die Walnüsse würde ich auch nehmen, falls noch keiner gefragt hat.',
      },
      {
        from: 'owner',
        at: '2026-09-28 11:00',
        content:
          'Für dich immer. Sie sind aber noch nass, ich lasse sie noch zwei Wochen trocknen.',
      },
      {
        from: 'user',
        at: '2026-09-28 11:05',
        content: 'Kein Problem, ich warte.',
      },
      {
        from: 'owner',
        at: '2026-10-12 18:30',
        content:
          'Die Walnüsse sind trocken. Diese Woche kannst du sie abholen!',
      },
      {
        from: 'user',
        at: '2026-10-12 19:02',
        content: 'Mega, ich komme Donnerstag.',
      },
    ],
  },
  {
    key: 'heinz-lentils-sepp',
    listing: 'heinz-02',
    user: 'sepp',
    messages: [
      {
        from: 'user',
        at: '2026-09-10 20:00',
        content:
          'Ich wohne in Möhrendorf und verschenke Möhren. Ich fühle mich verstanden. 😄',
      },
      {
        from: 'owner',
        at: '2026-09-10 20:45',
        content: 'Haha! Dann sind wir ja quasi Kollegen. Grüße nach Franken!',
      },
    ],
  },
];
