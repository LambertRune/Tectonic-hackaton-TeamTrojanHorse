// Fictional forecast model for Lotte (23), ported from Quinten's mockup. No real bank data.

export type WeatherType = 'sun' | 'cloud' | 'rain' | 'thunder' | 'storm' | 'rainbow';
export type Choices = { uitgaan: boolean; gsm: boolean; sparen: boolean };
export type ChoiceKey = keyof Choices;
export type EventKind = 'vast' | 'impuls' | 'groot' | 'sparen';
export type ForecastEvent = { name: string; amount: number; kind: EventKind };

export type Forecast = {
  events: ForecastEvent[][];
  /** Free to spend per day until payday. */
  perDay: number;
  /** Balance at the start of each day, plus the balance on payday (length DAYS + 1). */
  path: number[];
  low: number;
  weather: WeatherType[];
  /** Index in `path` where the balance first drops below zero, -1 when it stays positive. */
  redDay: number;
  weeksToGoal: number | null;
};

export const START = Date.UTC(2026, 9, 2); // Friday 2 October 2026
export const DAYS = 29; // up to Thursday 29/10, salary arrives Friday 30/10
export const BALANCE = 1120;
export const DAILY = 20;
export const BUFFER = 100;
export const GOAL = { name: 'Lissabon', saved: 340, target: 600, weekly: 25 } as const;
export const PAYDAY = '30/10';
export const GSM_DAY = 8;

const FIXED: Record<number, { name: string; amount: number }[]> = {
  3: [{ name: 'Gsm-abonnement', amount: 25 }],
  4: [{ name: 'Cadeau Sara (verjaardag)', amount: 35 }],
  5: [{ name: 'Voorschot energie', amount: 85 }],
  6: [{ name: 'Spotify', amount: 12 }],
  13: [{ name: 'Huurdersverzekering', amount: 48 }],
  18: [{ name: 'Fitness', amount: 30 }],
};

export const WEATHER_LABEL: Record<WeatherType, string> = {
  sun: 'Zonnig', cloud: 'Bewolkt', rain: 'Regen', thunder: 'Onweer', storm: 'Storm', rainbow: 'Opklaringen',
};

export const CHOICES: { key: ChoiceKey; emoji: string; title: string; detail: string }[] = [
  { key: 'uitgaan', emoji: '🎉', title: 'Vanavond uitgaan', detail: 'vr 2/10 · ongeveer € 60' },
  { key: 'gsm', emoji: '📱', title: 'Nieuwe gsm kopen', detail: 'za 10/10 · € 299' },
  { key: 'sparen', emoji: '✈️', title: 'Elke vrijdag € 25 naar Lissabon', detail: 'vanaf vr 9/10' },
];

export const initialChoices = (): Choices => ({ uitgaan: false, gsm: false, sparen: true });

const DAY_NAMES = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'];
const MONTHS = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
const DAY_NAMES_LONG: Record<string, string> = { zo: 'Zondag', ma: 'Maandag', di: 'Dinsdag', wo: 'Woensdag', do: 'Donderdag', vr: 'Vrijdag', za: 'Zaterdag' };

const day = (index: number) => new Date(START + index * 864e5);

export function dayLabel(index: number) {
  const date = day(index);
  const dn = DAY_NAMES[date.getUTCDay()];
  return { dn, dd: `${date.getUTCDate()}/${date.getUTCMonth() + 1}`, long: DAY_NAMES_LONG[dn] };
}

/** "€ 1.120" style used throughout the mockup (rounded, nl-BE grouping). */
export function eur(value: number) {
  const rounded = Math.round(value);
  const grouped = Math.abs(rounded).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `€ ${rounded < 0 ? '-' : ''}${grouped}`;
}

/** "€ 1.120,00" style for account balances and transactions. */
export function eurCents(value: number, sign = false) {
  const [whole, cents] = Math.abs(value).toFixed(2).split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const prefix = value < 0 ? '- ' : sign ? '+ ' : '';
  return `${prefix}${grouped},${cents}`;
}

export const spendOn = (events: ForecastEvent[]) => events.filter(event => event.kind !== 'sparen').reduce((sum, event) => sum + event.amount, 0);

export function forecast(choices: Choices): Forecast {
  const events: ForecastEvent[][] = Array.from({ length: DAYS }, (_, index) => (FIXED[index] ?? []).map(item => ({ ...item, kind: 'vast' as const })));
  if (choices.uitgaan) events[0].push({ name: 'Uitgaan', amount: 60, kind: 'impuls' });
  if (choices.gsm) events[GSM_DAY].push({ name: 'Nieuwe gsm', amount: 299, kind: 'groot' });
  if (choices.sparen) [7, 14, 21].forEach(index => events[index].push({ name: 'Naar Lissabon', amount: GOAL.weekly, kind: 'sparen' }));

  const planned = events.flat().reduce((sum, event) => sum + event.amount, 0);
  const perDay = (BALANCE - planned - BUFFER) / DAYS;
  const path = [BALANCE];
  let balance = BALANCE;
  for (let index = 0; index < DAYS; index++) {
    balance -= DAILY + events[index].reduce((sum, event) => sum + event.amount, 0);
    path.push(balance);
  }
  const low = Math.min(...path);

  const weather: WeatherType[] = [];
  for (let index = 0; index < DAYS; index++) {
    const today = events[index];
    let type: WeatherType;
    if (today.some(event => event.kind === 'groot')) type = low < 0 ? 'storm' : 'rain';
    else if (today.some(event => event.kind === 'impuls')) type = 'thunder';
    else if (spendOn(today) >= 30) type = 'rain';
    else if (index > 0 && weather[index - 1] === 'thunder') type = 'cloud';
    else if (index > 1 && weather[index - 2] === 'thunder' && weather[index - 1] === 'cloud') type = 'rainbow';
    else if (perDay < 18) type = 'cloud';
    else type = 'sun';
    weather.push(type);
  }

  const redDay = path.findIndex((value, index) => index > 0 && value < 0);
  const weeksToGoal = choices.sparen ? Math.ceil((GOAL.target - GOAL.saved) / GOAL.weekly) : null;
  return { events, perDay, path, low, weather, redDay, weeksToGoal };
}

export function headline(model: Forecast, choices: Choices) {
  if (model.redDay > 0) return `Storm op zaterdag 10/10. Met die gsm sta je vanaf ${dayLabel(model.redDay - 1).dd} in het rood.`;
  if (choices.uitgaan) return 'Vanavond onweer, maar na regen komt zonneschijn: zondag is het weer zon.';
  return 'Een zonnige maand, met wat regen op 6 en 7 oktober.';
}

export function dayText(model: Forecast, index: number) {
  const type = model.weather[index];
  const label = dayLabel(index);
  const bodies: Record<WeatherType, string> = {
    sun: 'Geen grote uitgaven gepland. Geniet ervan.',
    cloud: index > 0 && model.weather[index - 1] === 'thunder' ? 'Een rustige dag na gisteren. Geen probleem, je week is al herschikt.' : 'Krap maar veilig. Kate stuurt vandaag niets.',
    rain: 'Een geplande uitgave. Je buffer vangt ze op.',
    thunder: 'Een avond uit. Geen verwijt: Kate herschikt de dagen erna.',
    storm: 'Deze aankoop duwt je rekening voor het einde van de maand in het rood.',
    rainbow: 'Na regen komt zonneschijn: je zit weer op koers.',
  };
  const name = index === 0 ? 'Vandaag' : label.dn === 'za' || label.dn === 'zo' ? label.long : label.dn;
  return { title: `${name} ${label.dd} · ${WEATHER_LABEL[type]}`, body: bodies[type], events: model.events[index] };
}

export function goalText(model: Forecast) {
  if (model.weeksToGoal === null) return 'Zonder vaste spaarbooster haal je het niet voor de zomer.';
  const date = day(7 + model.weeksToGoal * 7);
  return `Met € ${GOAL.weekly} per week haal je het rond ${MONTHS[date.getUTCMonth()]}.`;
}

// ---------- Static content of the Start screen ----------

export const ACCOUNTS = [
  { id: 'zicht', name: 'Zichtrekening', owner: 'Lotte', balance: 1120, art: 'lotte' as const },
  { id: 'lissabon', name: 'Lissabon', balance: 340, art: 'sunset' as const },
];

export const TRANSACTIONS = [
  { id: 'delhaize', date: '02/10', merchant: 'Delhaize Gent', amount: -23.4 },
  { id: 'huur', date: '01/10', merchant: 'Huur oktober', amount: -650 },
  { id: 'loon', date: '30/09', merchant: 'Studio Noord (loon)', amount: 2180 },
];

export const IN_OUT = {
  month: 'Oktober',
  income: 0,
  expenses: 673.4,
  // [inkomsten, uitgaven] bar heights in px, May to October.
  bars: [[40, 55], [62, 48], [60, 90], [58, 50], [64, 52], [0, 26]] as [number, number][],
  months: ['Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt'],
};

export const WHY_REASONS = [
  'Je loon komt meestal op de laatste werkdag binnen.',
  'Vaste betalingen: gsm, energie, Spotify, fitness en je huurdersverzekering.',
  'Vorig jaar kocht je rond 6 oktober een cadeau. Klopt het dat Sara jarig is?',
  'Je geeft op een gewone dag ongeveer € 20 uit.',
];

// ---------- Scene 5: code rood (Jos, 74) ----------

export const FRAUD = {
  amount: 2450,
  iban: 'BE71 0961 2345 6769',
  enteredName: 'KBC Veiligheidsdienst',
  signals: [
    'Je bent nu aan het bellen met een nummer dat niet van KBC is.',
    'Je hebt nooit eerder naar dit rekeningnummer betaald.',
    'Het bedrag is 30 keer hoger dan je gewone betalingen.',
  ],
  angel: { initial: 'E', name: 'Els' },
};

export const DISCLAIMER = 'Conceptmockup voor de KBC-challenge van de Tectonic hackathon. Geen officiële KBC-app. Alle personen en bedragen zijn fictief.';
