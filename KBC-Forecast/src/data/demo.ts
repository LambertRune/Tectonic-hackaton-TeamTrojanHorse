export type PersonaId = 'lotte' | 'peeters' | 'jos';
export type WeatherType = 'sun' | 'cloud' | 'rain' | 'thunder' | 'storm' | 'fog' | 'rainbow';
export type DemoChoices = {
  nightOut: boolean;
  kotResponse: 'pending' | 'confirmed' | 'dismissed';
  bufferAccepted: boolean;
  policyCancelled: boolean;
  paymentCancelled: boolean;
  helpRequested: boolean;
};

export type DemoRequest = { personaId: PersonaId; step: number; choices: DemoChoices };
export type ForecastDay = {
  date: string;
  dayIndex: number;
  weather: WeatherType;
  balance: number;
  summary: string;
  signals: { label: string; amount?: number }[];
};
export type Account = { id: string; label: string; owner: string; balance: number; kind: 'wallet' | 'piggy'; number: string };
export type Transaction = { id: string; date: string; merchant: string; amount: number; status?: 'held' | 'cancelled' };
export type Notice = { id: string; title: string; body: string; action?: 'goal' | 'moment' | 'buffer' | 'policy' | 'fraud' | 'energy'; actionLabel?: string; tone?: 'normal' | 'warning' | 'danger' | 'success' };
export type DemoSnapshot = {
  personaId: PersonaId;
  name: string;
  greeting: string;
  today: string;
  step: number;
  stepLabel: string;
  nextStepLabel: string;
  forecast: ForecastDay[];
  accounts: Account[];
  transactions: Transaction[];
  notices: Notice[];
  season?: string;
  choices: DemoChoices;
};

export const PERSONAS: { id: PersonaId; name: string; initials: string; description: string }[] = [
  { id: 'lotte', name: 'Lotte', initials: 'LV', description: '23 jaar · eerste job, grote reisplannen' },
  { id: 'peeters', name: 'Familie Peeters', initials: 'FP', description: 'Een nieuw hoofdstuk: hun dochter op kot' },
  { id: 'jos', name: 'Jos', initials: 'JD', description: '74 jaar · een vertrouwde bank aan zijn zijde' },
];

export const WEATHER: Record<WeatherType, { label: string; title: string; description: string; color: string }> = {
  sun: { label: 'Zon', title: 'Zonnige vooruitzichten', description: 'Je vaste kosten zijn gedekt. Er is ruimte voor de dingen die jij belangrijk vindt.', color: '#E9A92F' },
  cloud: { label: 'Bewolkt', title: 'Even wat bewolking', description: 'Het wordt even wat krapper, maar je geplande uitgaven blijven gedekt.', color: '#779BB3' },
  rain: { label: 'Regen', title: 'Een bui trekt voorbij', description: 'Er komt een grotere uitgave aan. Je ziet nu al wanneer het weer opklaart.', color: '#329DCE' },
  thunder: { label: 'Donder', title: 'Vrijdag even onweer', description: 'Een avond om van te genieten. Daarna wordt het rustig weer. Je reis blijft op schema.', color: '#9173BC' },
  storm: { label: 'Storm', title: 'Samen door de storm', description: 'Een paar grote kosten vallen samen. Kate denkt vooruit en kijkt met je mee.', color: '#6B75A6' },
  fog: { label: 'Mist', title: 'Nog wat mistig', description: 'Een inkomen staat nog niet vast. We houden rekening met wat extra speelruimte.', color: '#8BA3B6' },
  rainbow: { label: 'Regenboog', title: 'Daar is de zon weer', description: 'De drukste dagen zijn voorbij. Je krijgt weer ruimte om vooruit te kijken.', color: '#3A9C91' },
};

export function initialChoices(): DemoChoices {
  return { nightOut: false, kotResponse: 'pending', bufferAccepted: false, policyCancelled: false, paymentCancelled: false, helpRequested: false };
}

// A fixed Monday makes the same Friday/Saturday story repeatable at every pitch.
export function demoDate(dayIndex: number): string {
  return new Date(Date.UTC(2026, 8, 7 + dayIndex)).toISOString().slice(0, 10);
}

export function euro(amount: number, currency = true): string {
  const formatted = new Intl.NumberFormat('nl-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
  return currency ? `${formatted} EUR` : formatted;
}

export function dateLabel(date: string, options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' }): string {
  return new Intl.DateTimeFormat('nl-BE', { ...options, timeZone: 'UTC' }).format(new Date(`${date}T12:00:00Z`));
}

function scheduled(persona: PersonaId, day: number, choices: DemoChoices, step: number): { label: string; amount: number }[] {
  if (persona === 'lotte') {
    const items: { label: string; amount: number }[] = [];
    const everyday: Record<number, [string, number]> = {
      1: ['Boodschappen', -28], 2: ['Treinabonnement', -40], 3: ['Lunch en boodschappen', -24],
      4: ['Geplande dagelijkse uitgaven', -20], 5: ['Boodschappen', -15], 6: ['Bijverdienste', 300],
      7: ['Spaarpot Lissabon', -50], 8: ['Boodschappen', -32], 9: ['Sportabonnement', -25],
      10: ['Geplande dagelijkse uitgaven', -18], 11: ['Terugbetaling onkosten', 125], 12: ['Boodschappen', -35],
      13: ['Geplande dagelijkse uitgaven', -20], 15: ['Boodschappen', -28], 17: ['Geplande dagelijkse uitgaven', -24],
    };
    if (everyday[day]) items.push({ label: everyday[day][0], amount: everyday[day][1] });
    if (day === 4 && choices.nightOut) items.push({ label: 'Vrijdag uitgaan', amount: -60 });
    return items;
  }
  if (persona === 'peeters') {
    const items: { label: string; amount: number }[] = [];
    if (step > 0 && day === 1) items.push({ label: 'Kotwaarborg Emma · Gent', amount: -850 });
    if (day === 3) items.push({ label: 'Maandelijkse woonlast', amount: -720 });
    if (day === 4) items.push({ label: 'Schoolrekening Emma', amount: -175 });
    if (day === 4 && !choices.policyCancelled) items.push({ label: 'Extra KBC-polis', amount: -14 });
    if (day === 6) {
      items.push({ label: 'Loon', amount: 2450 });
      if (step > 0 && choices.kotResponse === 'confirmed' && choices.bufferAccepted) items.push({ label: 'Terugbetaling tijdelijke buffer', amount: -500 });
    }
    if ([2, 5, 8, 12, 16].includes(day)) items.push({ label: 'Boodschappen gezin', amount: -85 });
    return items;
  }
  if (day === 2 || day === 9 || day === 16) return [{ label: 'Boodschappen', amount: -54.50 }];
  if (day === 4) return [{ label: 'Energie', amount: -115 }];
  if (day === 8) return [{ label: 'Pensioen', amount: 1890 }];
  return [];
}

function baseBalance(persona: PersonaId) { return { lotte: 1348.50, peeters: 2840, jos: 1980.25 }[persona]; }

function balanceAt(persona: PersonaId, day: number, choices: DemoChoices, step: number): number {
  let balance = baseBalance(persona) + (persona === 'peeters' && step > 0 && choices.kotResponse === 'confirmed' && choices.bufferAccepted ? 500 : 0);
  for (let index = 0; index <= day; index++) balance += scheduled(persona, index, choices, step).reduce((sum, item) => sum + item.amount, 0);
  return Math.round(balance * 100) / 100;
}

function weatherAt(persona: PersonaId, day: number, choices: DemoChoices, step: number): WeatherType {
  if (persona === 'lotte') {
    if (choices.nightOut && day === 4) return 'thunder';
    if (choices.nightOut && day === 5) return 'cloud';
    return day === 9 ? 'cloud' : 'sun';
  }
  if (persona === 'peeters') {
    if (step > 0 && [3, 4, 5].includes(day)) return choices.kotResponse === 'confirmed' && choices.bufferAccepted ? 'rain' : 'storm';
    if (step > 0 && day === 6) return 'rainbow';
    if (day < 6) return day === 3 || day === 4 ? 'rain' : 'cloud';
  }
  return 'sun';
}

function noticesFor(persona: PersonaId, step: number, choices: DemoChoices): Notice[] {
  const energy: Notice = { id: 'energy', title: 'Een warm huis, een lagere rekening', body: 'Met een paar kleine gewoontes hou je de warmte binnen en je energiekosten onder controle.', action: 'energy', actionLabel: 'Bekijk de tips' };
  if (persona === 'lotte') return [
    step > 0 && choices.nightOut
      ? { id: 'recovery', title: 'Na donder komt zon', body: 'Gisteren was het onweer. Geen probleem: vandaag wat bewolking, vanaf zondag weer zon. Je spaardoel voor Lissabon blijft op schema.', action: 'goal', actionLabel: 'Bekijk je spaardoel', tone: 'success' }
      : { id: 'travel', title: 'Lissabon komt dichterbij', body: 'Je zet elke week €50 opzij. Je reis blijft op schema, mét ruimte om vandaag te genieten.', action: 'goal', actionLabel: 'Bekijk je spaardoel' },
    energy,
  ];
  if (persona === 'peeters') {
    if (step === 0) return [{ id: 'family-start', title: 'Een nieuw schooljaar', body: 'Je schoolrekening en woonlast komen eraan. Ik hou je komende weken in het oog.' }, energy];
    if (choices.kotResponse === 'pending') return [{ id: 'kot', title: 'Een nieuw seizoen voor jullie?', body: 'Ik zie een kotwaarborg voor Emma in Gent. Klopt het dat je dochter op kot gaat? Dan kijk ik graag even mee.', action: 'moment', actionLabel: 'Bekijk het levensmoment' }, energy];
    if (choices.kotResponse === 'dismissed') return [{ id: 'kot-dismissed', title: 'Jullie bepalen het tempo', body: 'Begrepen. Ik doe geen voorstellen over dit levensmoment. De bekende uitgaven blijven wel in je weerbericht staan.' }, energy];
    return [
      { id: 'buffer', title: choices.bufferAccepted ? 'Wat ademruimte voor jullie' : 'Drie kosten, één drukke week', body: choices.bufferAccepted ? 'De demo-buffer van €500 is toegevoegd. De storm wordt een bui. Je loon op zondag brengt weer ruimte.' : 'De kotwaarborg, woonlast en schoolrekening vallen samen. Een renteloze demo-buffer van €500 kan tijdelijk ruimte geven.', action: 'buffer', actionLabel: choices.bufferAccepted ? 'Bekijk je buffer' : 'Bekijk je mogelijkheden', tone: choices.bufferAccepted ? 'success' : 'warning' },
      { id: 'policy', title: choices.policyCancelled ? '€14 per maand blijft bij jullie' : 'Deze extra KBC-polis heb je niet nodig', body: choices.policyCancelled ? 'De overbodige polis is in deze demo stopgezet. Je bestaande dekking blijft behouden.' : 'In dit voorbeeld is Emma’s kot al gedekt door jullie gezinspolis. De extra polis van €14 per maand overlapt daarmee.', action: 'policy', actionLabel: choices.policyCancelled ? 'Bekijk de wijziging' : 'Bekijk Kate’s advies', tone: choices.policyCancelled ? 'success' : 'normal' },
    ];
  }
  if (step === 0) return [{ id: 'jos-start', title: 'Alles rustig, Jos', body: 'Je vaste kosten zijn gedekt. Je volgende pensioen staat al in je weerbericht. Geniet van je week.' }, energy];
  if (choices.paymentCancelled) return [{ id: 'fraud-cancelled', title: 'Je geld is veilig gebleven', body: 'De overschrijving van €950 is geannuleerd in deze demo. Er is niets van je rekening gegaan.', action: 'fraud', actionLabel: 'Bekijk de details', tone: 'success' }, energy];
  return [{ id: 'fraud', title: choices.helpRequested ? 'Kate kijkt met je mee' : 'Even wachten, Jos', body: choices.helpRequested ? 'De betaling blijft tegengehouden. Kate legt uit hoe je de vraag via het vertrouwde nummer van je dochter kunt controleren.' : 'Een onbekende ontvanger, na een bericht over een nieuw nummer. We houden deze betaling van €950 even voor je tegen.', action: 'fraud', actionLabel: 'Bekijk de waarschuwing', tone: 'danger' }, energy];
}

export function createSnapshot({ personaId, step: requestedStep, choices: requestedChoices }: DemoRequest): DemoSnapshot {
  const step = requestedStep > 0 ? 1 : 0;
  const choices = { ...requestedChoices };
  const startDay = step === 0 ? 0 : personaId === 'lotte' ? 5 : 1;
  const today = demoDate(startDay);
  const name = { lotte: 'Lotte', peeters: 'Familie Peeters', jos: 'Jos' }[personaId];
  const owner = { lotte: 'LOTTE VERMEULEN', peeters: 'FAMILIE PEETERS', jos: 'JOS DE SMET' }[personaId];
  const forecast: ForecastDay[] = Array.from({ length: 14 }, (_, index) => {
    const dayIndex = startDay + index;
    const weather = weatherAt(personaId, dayIndex, choices, step);
    const signals: ForecastDay['signals'] = scheduled(personaId, dayIndex, choices, step);
    if (signals.length === 0) signals.push({ label: index === 0 ? 'Huidig saldo en bekende vaste kosten' : 'Geen grote geplande uitgaven' });
    if (personaId === 'lotte' && dayIndex === 5 && choices.nightOut) signals.push({ label: 'Je uitgaansbudget van vrijdag is al meegerekend' });
    if (personaId === 'peeters' && step > 0 && [3, 4, 5].includes(dayIndex)) signals.push({ label: 'Kotwaarborg, woonlast en schoolrekening vallen in dezelfde week' });
    return { date: demoDate(dayIndex), dayIndex, weather, balance: balanceAt(personaId, dayIndex, choices, step), summary: WEATHER[weather].description, signals };
  });
  const transactions: Transaction[] = personaId === 'lotte' ? [
    { id: 'coffee', date: demoDate(-1), merchant: 'Koffiebar Noord', amount: -4.80 },
    { id: 'music', date: demoDate(-1), merchant: 'Muziekabonnement', amount: -10.99 },
    { id: 'pay', date: demoDate(0), merchant: 'Studio Lumen', amount: 2140 },
  ] : personaId === 'peeters' ? [
    { id: 'groceries', date: demoDate(-1), merchant: 'Buurtwinkel', amount: -86.40 },
    { id: 'school', date: demoDate(0), merchant: 'Boekenfonds Emma', amount: -124.50 },
  ] : [
    { id: 'bakery', date: demoDate(-1), merchant: 'Bakkerij De Molen', amount: -8.20 },
    { id: 'pension', date: demoDate(-2), merchant: 'Pensioendienst', amount: 1890 },
  ];
  if (personaId === 'lotte' && step > 0 && choices.nightOut) transactions.unshift({ id: 'night-out', date: demoDate(4), merchant: 'Een avond uit', amount: -60 });
  if (personaId === 'peeters' && step > 0) transactions.unshift({ id: 'kot-deposit', date: demoDate(1), merchant: 'Kotwaarborg Emma · Gent', amount: -850 });
  if (personaId === 'jos' && step > 0) transactions.unshift({ id: 'unknown', date: today, merchant: 'Onbekende ontvanger', amount: -950, status: choices.paymentCancelled ? 'cancelled' : 'held' });

  return {
    personaId, name, greeting: personaId === 'peeters' ? 'Dag familie Peeters' : `Dag ${name}`, today, step, choices,
    stepLabel: step === 0 ? 'De week begint' : { lotte: 'Zaterdagochtend', peeters: 'Emma’s kotwaarborg', jos: 'Een onverwacht bericht' }[personaId],
    nextStepLabel: { lotte: 'Naar zaterdagochtend', peeters: 'Laat de kotbetaling verschijnen', jos: 'Start de verdachte overschrijving' }[personaId],
    forecast,
    accounts: [
      { id: `${personaId}-current`, label: 'Betaalrekening', owner, balance: balanceAt(personaId, startDay, choices, step), kind: 'wallet', number: 'DEMO •••• 1042' },
      { id: `${personaId}-savings`, label: personaId === 'lotte' ? 'Spaarpot Lissabon' : 'Spaarrekening', owner, balance: { lotte: 2360, peeters: 8700, jos: 12800 }[personaId], kind: 'piggy', number: 'DEMO •••• 2086' },
      { id: `${personaId}-shared`, label: 'Gezamenlijke rekening', owner: personaId === 'lotte' ? 'LOTTE & NOOR' : owner, balance: 320, kind: 'wallet', number: 'DEMO •••• 3051' },
    ],
    transactions, notices: noticesFor(personaId, step, choices),
    season: personaId === 'peeters' && step > 0 && choices.kotResponse === 'confirmed' ? 'Kind op kot' : undefined,
  };
}

// The screen only depends on this boundary. A real service can replace it later.
export async function getSnapshot(request: DemoRequest): Promise<DemoSnapshot> {
  return createSnapshot(request);
}
