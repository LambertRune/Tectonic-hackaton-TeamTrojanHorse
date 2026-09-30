import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Icon, WeatherIcon, type IconName } from './icons';
import { NoticeCard, type Utility } from './start-sections';
import { Button, DetailRow, Sheet, T } from './ui';
import { Bank } from '@/constants/bank-theme';
import { dateLabel, demoDate, euro, PERSONAS, WEATHER, type DemoChoices, type DemoSnapshot, type Notice, type PersonaId } from '@/data/demo';

export type Panel =
  | { kind: 'utility'; name: Utility }
  | { kind: 'day'; date: string }
  | { kind: 'account'; id: string }
  | { kind: 'transaction'; id: string }
  | { kind: 'notice'; action: NonNullable<Notice['action']> }
  | { kind: 'communications' }
  | { kind: 'personalize' };

type Props = {
  panel: Panel;
  snapshot: DemoSnapshot;
  aliases: Record<string, string>;
  onClose: () => void;
  onOpen: (panel: Panel) => void;
  onChoice: (patch: Partial<DemoChoices>) => void;
  onPersona: (id: PersonaId) => void;
  onNext: () => void;
  onReset: () => void;
  onSaveAliases: (aliases: Record<string, string>) => void;
};

const utilityContent: Partial<Record<Utility, { icon: IconName; body: string }>> = {
  MyNWS: { icon: 'news', body: 'Nieuws dat bij je past. Hier vind je in KBC Mobile een overzicht van het nieuws van de dag.' },
  MyHome: { icon: 'home', body: 'Alles voor je woning op één plek: van je energie tot je woonverzekering. Je financiële weerbericht houdt je bekende woonlasten al mee in het oog.' },
  MyMobility: { icon: 'directions', body: 'Onderweg met KBC. Je trein, parking en andere mobiliteitsdiensten krijgen hier hun plek.' },
  'Mijn KBC': { icon: 'list', body: 'Je rekeningen, verzekeringen en documenten samen. In deze demo kun je je rekeningen op Start bekijken.' },
  Beleggen: { icon: 'piggy', body: 'Ruimte om aan later te denken. Eerst een heldere kijk op je financiële weer, daarna je volgende stap.' },
  Aanbod: { icon: 'layers', body: 'Ontdek wat bij je leven past. Kate kijkt eerst naar wat jij nodig hebt, ook als dat betekent dat je geen extra product nodig hebt.' },
  transfer: { icon: 'transfer', body: 'Hier start je een overschrijving. Deze demo toont je betaalrekening en de impact van uitgaven via het Weerbericht.' },
};

function kateReply(question: string, snapshot: DemoSnapshot) {
  if (/reis|lissabon|spaar/i.test(question) && snapshot.personaId === 'lotte') return 'Je hebt al €2.360 van je doel van €3.000 voor Lissabon. Met €50 per week ben je er over 13 weken. Ook met een avondje uit blijft je reis op schema.';
  if (/veilig|fraude|bericht|ontvanger/i.test(question) && snapshot.personaId === 'jos') return snapshot.step > 0 ? snapshot.notices[0].body : 'Er zijn op dit moment geen verdachte betalingen in je demo. Ik blijf mee vooruitkijken.';
  if (/polis|verzekering|kot/i.test(question) && snapshot.personaId === 'peeters') return snapshot.choices.kotResponse === 'confirmed' ? 'Emma’s kot valt in dit voorbeeld al onder jullie gezinspolis. De extra KBC-polis van €14 per maand is niet nodig. Je kunt mijn voorstel bekijken bij ‘Voor jou’.' : 'Ik doe pas voorstellen over een levensmoment als jullie bevestigen dat het klopt. Bekijk mijn bericht bij ‘Voor jou’.';
  return `${snapshot.notices[0].body} Tik op een dag in je weerbericht om te zien welke inkomsten en uitgaven meespelen.`;
}

export function DemoPanel({ panel, snapshot, aliases, onClose, onOpen, onChoice, onPersona, onNext, onReset, onSaveAliases }: Props) {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<{ question: string; answer: string }[]>([]);
  const [names, setNames] = useState<Record<string, string>>(() => Object.fromEntries(snapshot.accounts.map(account => [account.id, aliases[account.id] ?? account.label])));
  let title = '';
  let subtitle: string | undefined;
  let content: ReactNode;

  const send = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setMessages(previous => [...previous, { question: trimmed, answer: kateReply(trimmed, snapshot) }]);
    setQuestion('');
  };

  if (panel.kind === 'utility' && panel.name === 'settings') {
    title = 'Demo-instellingen';
    subtitle = 'Drie mensen. Drie verhalen.';
    content = <>
      <T bold style={styles.eyebrow}>KIES EEN PERSONA</T>
      <View style={{ gap: 8 }}>{PERSONAS.map(persona => <Pressable key={persona.id} testID={`persona-${persona.id}`} accessibilityRole="button" accessibilityState={{ selected: persona.id === snapshot.personaId }} onPress={() => onPersona(persona.id)} style={({ pressed }) => [styles.persona, persona.id === snapshot.personaId && styles.selectedPersona, pressed && { opacity: 0.7 }]}>
        <View style={styles.avatar}><T bold style={{ color: Bank.blueDark }}>{persona.initials}</T></View>
        <View style={{ flex: 1 }}><T bold>{persona.name}</T><T style={styles.small}>{persona.description}</T></View>
        <Icon name={persona.id === snapshot.personaId ? 'check' : 'right'} color={Bank.blue} size={18} />
      </Pressable>)}</View>
      <DetailRow label="Huidig moment" value={snapshot.stepLabel} />
      <Button testID="next-step" label={snapshot.step > 0 ? 'Laatste demostap bereikt' : snapshot.nextStepLabel} icon="play" disabled={snapshot.step > 0} onPress={onNext} />
      <Button testID="reset-demo" label="Begin opnieuw met deze persona" icon="reset" variant="secondary" onPress={onReset} />
      <T style={styles.footnote}>Alle namen, betalingen en voorspellingen zijn fictief. Wisselen of resetten herstelt de beginsituatie.</T>
    </>;
  } else if (panel.kind === 'utility' && panel.name === 'kate') {
    title = 'Vraag het aan Kate';
    subtitle = 'Ik kijk met je vooruit.';
    content = <>
      <View style={styles.kateMessage}><Icon name="kate" size={30} /><T style={{ flex: 1 }}>Dag {snapshot.name}. {snapshot.notices[0].body}</T></View>
      {messages.map((message, index) => <View key={index} style={{ gap: 10 }}><View style={styles.userMessage}><T>{message.question}</T></View><View style={styles.kateMessage}><Icon name="kate" size={24} /><T style={{ flex: 1 }}>{message.answer}</T></View></View>)}
      <View style={{ gap: 7 }}>{[snapshot.personaId === 'lotte' ? 'Blijft mijn reis op schema?' : snapshot.personaId === 'peeters' ? 'Wat verandert er als Emma op kot gaat?' : 'Zijn mijn betalingen veilig?', 'Waarom ziet mijn weer er zo uit?'].map(suggestion => <Button key={suggestion} label={suggestion} variant="secondary" onPress={() => send(suggestion)} />)}</View>
      <View style={styles.inputRow}><TextInput accessibilityLabel="Je vraag aan Kate" placeholder="Stel je vraag…" placeholderTextColor={Bank.muted} value={question} onChangeText={setQuestion} onSubmitEditing={() => send(question)} returnKeyType="send" maxLength={250} style={[styles.input, { flex: 1 }]} /><Button label="Stuur" onPress={() => send(question)} disabled={!question.trim()} /></View>
      <T style={styles.footnote}>Kate gebruikt hier de vooraf geschreven antwoorden uit de demo.</T>
    </>;
  } else if (panel.kind === 'communications' || (panel.kind === 'utility' && panel.name === 'notifications')) {
    title = panel.kind === 'communications' ? 'Alle communicatie' : 'Je meldingen';
    subtitle = `Voor ${snapshot.name}`;
    content = <>{snapshot.notices.map(notice => <NoticeCard key={notice.id} notice={notice} onOpen={() => notice.action && onOpen({ kind: 'notice', action: notice.action })} />)}</>;
  } else if (panel.kind === 'day') {
    const day = snapshot.forecast.find(item => item.date === panel.date) ?? snapshot.forecast[0];
    title = 'Waarom dit weer?';
    subtitle = dateLabel(day.date);
    content = <>
      <View style={styles.weatherDetail}><WeatherIcon type={day.weather} size={84} /><T bold style={styles.detailTitle}>{WEATHER[day.weather].label}</T><T style={styles.centered}>{day.summary}</T></View>
      <DetailRow label="Verwacht beschikbaar" value={`€ ${euro(day.balance, false)}`} />
      <T bold style={styles.eyebrow}>DIT SPEELT MEE</T>
      {day.signals.map((signal, index) => signal.amount !== undefined ? <DetailRow key={index} label={signal.label} value={`${signal.amount > 0 ? '+' : ''}€ ${euro(signal.amount, false)}`} positive={signal.amount > 0} /> : <View key={index} style={styles.signal}><Icon name="check" color={Bank.blue} size={17} /><T style={{ flex: 1 }}>{signal.label}</T></View>)}
      <T style={styles.footnote}>Gebaseerd op de fictieve transacties, vaste lasten en gekozen scenario’s van {snapshot.name}. Een scenario is nog geen betaling.</T>
    </>;
  } else if (panel.kind === 'account') {
    const account = snapshot.accounts.find(item => item.id === panel.id) ?? snapshot.accounts[0];
    title = aliases[account.id] ?? account.label;
    subtitle = account.number;
    content = <><View style={styles.accountDetail}><Icon name={account.kind} size={40} color={Bank.blue} /><T bold style={styles.bigNumber}>€ {euro(account.balance, false)}</T><T style={styles.small}>{account.owner}</T></View><DetailRow label="Munt" value="EUR" /><DetailRow label="Rekeningtype" value={account.kind === 'piggy' ? 'Spaarrekening' : 'Betaalrekening'} />{snapshot.personaId === 'lotte' && account.kind === 'piggy' && <Button label="Bekijk spaardoel Lissabon" icon="airplane" onPress={() => onOpen({ kind: 'notice', action: 'goal' })} />}<T style={styles.footnote}>Een fictieve rekening voor de hackathondemo.</T></>;
  } else if (panel.kind === 'transaction') {
    const transaction = snapshot.transactions.find(item => item.id === panel.id) ?? snapshot.transactions[0];
    title = transaction.merchant;
    subtitle = dateLabel(transaction.date);
    content = <><T bold style={[styles.bigNumber, { textAlign: 'center', marginVertical: 12 }]}>{euro(transaction.amount)}</T><DetailRow label="Status" value={transaction.status === 'held' ? 'Tegengehouden' : transaction.status === 'cancelled' ? 'Geannuleerd' : 'Verwerkt'} /><DetailRow label="Rekening" value="Betaalrekening" />{transaction.status && <Button label="Bekijk Kate’s uitleg" icon="shield" onPress={() => onOpen({ kind: 'notice', action: 'fraud' })} />}<T style={styles.footnote}>Deze betaling maakt deel uit van de fictieve tijdlijn.</T></>;
  } else if (panel.kind === 'personalize') {
    title = 'Jouw rekeningen';
    subtitle = 'Geef je rekeningkaarten een eigen naam.';
    content = <>{snapshot.accounts.map(account => <View key={account.id} style={{ gap: 7 }}><T bold style={{ fontSize: 12 }}>{account.number}</T><TextInput accessibilityLabel={`Naam van ${account.label}`} maxLength={32} value={names[account.id] ?? account.label} onChangeText={value => setNames(previous => ({ ...previous, [account.id]: value }))} style={styles.input} /></View>)}<Button label="Bewaar namen" onPress={() => onSaveAliases(Object.fromEntries(Object.entries(names).map(([key, value]) => [key, value.trim()])))} disabled={Object.values(names).some(name => !name.trim())} /><T style={styles.footnote}>Je wijzigingen blijven tot je de demo opnieuw begint.</T></>;
  } else if (panel.kind === 'notice') {
    if (panel.action === 'goal') {
      title = 'Op naar Lissabon';
      subtitle = 'Een reis om naar uit te kijken.';
      content = <><View style={styles.goalArt}><Icon name="airplane" size={45} color={Bank.blue} /><T bold style={styles.bigNumber}>€ 2.360</T><T style={styles.small}>van je doel van € 3.000</T></View><View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 3000, now: 2360 }} style={styles.progressTrack}><View style={styles.progressValue} /></View><DetailRow label="Elke week opzij" value="€ 50,00" /><DetailRow label="Nog te sparen" value="€ 640,00" /><DetailRow label="Op je bestemming" value="Over 13 weken" /><View style={styles.callout}><Icon name="check" size={20} color={Bank.green} /><T style={{ flex: 1 }}>Je reis blijft op schema. Er is ook ruimte om vandaag te genieten.</T></View></>;
    } else if (panel.action === 'moment') {
      title = 'Een nieuw seizoen?';
      subtitle = 'Klopt het dat Emma op kot gaat?';
      content = <><View style={styles.goalArt}><Icon name="graduation" size={54} color={Bank.blue} /></View><T>Er is een kotwaarborg betaald voor Emma in Gent. Als je dit bevestigt, bekijkt Kate de komende kosten en jullie bestaande verzekeringen samen.</T><DetailRow label="Signaal" value="Kotwaarborg · €850" /><Button testID="confirm-kot" label="Ja, Emma gaat op kot" icon="check" onPress={() => { onChoice({ kotResponse: 'confirmed' }); onClose(); }} /><Button label="Liever geen voorstellen hierover" variant="secondary" onPress={() => { onChoice({ kotResponse: 'dismissed' }); onClose(); }} /><T style={styles.footnote}>Jullie kiezen welke levensmomenten Kate mag meenemen.</T></>;
    } else if (panel.action === 'buffer') {
      title = snapshot.choices.bufferAccepted ? 'Wat extra ademruimte' : 'Een buffer voor de drukke week';
      subtitle = 'Kotwaarborg, woonlast en schoolrekening.';
      content = <><T>Een tijdelijke buffer overbrugt de dagen tot jullie loon binnenkomt. In deze demo verandert de storm dan in een bui.</T><DetailRow label="Tijdelijke ruimte" value="€ 500,00" /><DetailRow label="Rente in dit voorbeeld" value="€ 0,00" /><DetailRow label="Terugbetaling" value={dateLabel(demoDate(6), { day: 'numeric', month: 'long' })} />{snapshot.choices.bufferAccepted ? <View style={styles.callout}><Icon name="check" color={Bank.green} /><T style={{ flex: 1 }}>De demo-buffer is toegevoegd aan jullie voorspelling.</T></View> : <Button testID="accept-buffer" label="Probeer de demo-buffer" onPress={() => onChoice({ bufferAccepted: true })} />}<T style={styles.footnote}>Een gesimuleerd voorstel; er wordt geen krediet aangevraagd.</T></>;
    } else if (panel.action === 'policy') {
      title = snapshot.choices.policyCancelled ? '€14 per maand voor jullie' : 'Deze extra polis is niet nodig';
      subtitle = 'Kate kiest jullie. Ook als dat KBC iets kost.';
      content = <><View style={styles.kateMessage}><Icon name="kate" size={30} /><T style={{ flex: 1 }}>In dit voorbeeld dekt jullie gezinspolis Emma’s kot al. De extra KBC-polis overlapt met die dekking.</T></View><DetailRow label="Extra polis" value="€ 14,00 / maand" /><DetailRow label="Besparing per jaar" value="€ 168,00" positive />{snapshot.choices.policyCancelled ? <View style={styles.callout}><Icon name="check" color={Bank.green} /><T style={{ flex: 1 }}>De extra polis is stopgezet in de demo. De volgende afschrijving is uit de voorspelling gehaald.</T></View> : <Button testID="cancel-policy" label="Schrap de overbodige polis" onPress={() => onChoice({ policyCancelled: true })} />}<T style={styles.footnote}>Fictieve polissen en dekking. Deze actie werkt alleen binnen de demo.</T></>;
    } else if (panel.action === 'fraud') {
      const cancelled = snapshot.choices.paymentCancelled;
      title = cancelled ? 'Je geld is veilig gebleven' : 'Even wachten, Jos';
      subtitle = cancelled ? 'De overschrijving is geannuleerd.' : 'Kate beschermt je · code rood';
      content = <>
        <View style={[styles.fraudIcon, cancelled && { backgroundColor: '#EAF7F2' }]}><Icon name="shield" size={42} color={cancelled ? Bank.green : Bank.red} /></View>
        <DetailRow label="Ontvanger" value="Onbekende ontvanger" /><DetailRow label="Bedrag" value="€ 950,00" /><DetailRow label="Status" value={cancelled ? 'Geannuleerd' : 'Tegengehouden'} />
        <View style={styles.quote}><T style={{ fontSize: 12, color: Bank.muted }}>Het bericht in dit voorbeeld</T><T>“Nieuw nummer, papa. Kun je even €950 overschrijven?”</T></View>
        <T>Een nieuw nummer en een eerste betaling naar een onbekende ontvanger komen samen. Er is niets van je rekening gegaan.</T>
        {snapshot.choices.helpRequested && !cancelled && <View style={styles.kateMessage}><Icon name="kate" size={27} /><T style={{ flex: 1 }}>Bel je dochter op haar vertrouwde nummer om de vraag te controleren. De betaling blijft ondertussen tegengehouden.</T></View>}
        {!cancelled && <><Button testID="fraud-help" label={snapshot.choices.helpRequested ? 'Kate’s uitleg staat hierboven' : 'Laat Kate meekijken'} icon="headphones" disabled={snapshot.choices.helpRequested} onPress={() => onChoice({ helpRequested: true })} /><Button testID="cancel-payment" label="Annuleer deze betaling" variant="danger" onPress={() => onChoice({ paymentCancelled: true })} /></>}
        <T style={styles.footnote}>Dit is een gesimuleerde fraudepoging met fictieve gegevens.</T>
      </>;
    } else {
      title = 'Hou de warmte binnen';
      subtitle = 'Kleine gewoontes, meer comfort.';
      content = <><View style={styles.goalArt}><Icon name="home" size={44} color={Bank.blue} /></View>{['Sluit ’s avonds gordijnen om de warmte langer binnen te houden.', 'Verwarm vooral de kamers die je gebruikt.', 'Vergelijk je voorschot regelmatig met je werkelijke verbruik.'].map(tip => <View key={tip} style={styles.signal}><Icon name="check" color={Bank.blue} size={18} /><T style={{ flex: 1 }}>{tip}</T></View>)}</>;
    }
  } else if (panel.kind === 'utility') {
    const item = utilityContent[panel.name] ?? { icon: 'home' as const, body: 'Deze sectie maakt deel uit van KBC Mobile.' };
    title = panel.name === 'transfer' ? 'Overschrijven' : panel.name;
    subtitle = 'KBC Mobile';
    content = <><View style={styles.goalArt}><Icon name={item.icon} size={48} color={Bank.blue} /></View><T style={styles.centered}>{item.body}</T>{panel.name === 'transfer' && <DetailRow label="Beschikbaar op je betaalrekening" value={`€ ${euro(snapshot.accounts[0].balance, false)}`} />}<Button label="Bekijk je betaalrekening" onPress={() => onOpen({ kind: 'account', id: snapshot.accounts[0].id })} /><Button label="Terug naar Start" variant="quiet" onPress={onClose} /></>;
  }

  return <Sheet title={title} subtitle={subtitle} onClose={onClose}>{content}</Sheet>;
}

const styles = StyleSheet.create({
  eyebrow: { fontSize: 10, color: Bank.muted, letterSpacing: 1.2, lineHeight: 15 },
  small: { fontSize: 12, lineHeight: 18, color: Bank.muted },
  footnote: { fontSize: 11, lineHeight: 17, color: Bank.muted, marginTop: 3 },
  persona: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: Bank.line, borderRadius: 15, padding: 13 },
  selectedPersona: { backgroundColor: '#F3FAFE', borderColor: '#88CFED' },
  avatar: { height: 42, width: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E3F3FB' },
  kateMessage: { padding: 14, borderRadius: 16, backgroundColor: Bank.pale, flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  userMessage: { alignSelf: 'flex-end', maxWidth: '90%', backgroundColor: '#E1F1F8', padding: 13, borderRadius: 15 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: { minHeight: 47, paddingHorizontal: 13, paddingVertical: 11, borderWidth: 1, borderColor: '#CFE1EC', borderRadius: 12, fontFamily: Bank.font, fontSize: 14, color: Bank.navy, backgroundColor: '#FCFEFF' },
  weatherDetail: { alignItems: 'center', padding: 16, backgroundColor: Bank.pale, borderRadius: 18, gap: 8 },
  detailTitle: { fontSize: 23, lineHeight: 29 },
  centered: { textAlign: 'center', lineHeight: 23, color: '#51708F' },
  signal: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  accountDetail: { alignItems: 'center', gap: 12, padding: 20, borderRadius: 18, backgroundColor: Bank.pale },
  bigNumber: { fontSize: 32, lineHeight: 40, letterSpacing: -0.8 },
  goalArt: { alignItems: 'center', paddingVertical: 18, gap: 12 },
  progressTrack: { height: 8, borderRadius: 8, backgroundColor: '#E6F1F7', overflow: 'hidden' },
  progressValue: { width: '78.67%', height: 8, borderRadius: 8, backgroundColor: Bank.blue },
  callout: { backgroundColor: '#EEF8F3', borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  fraudIcon: { width: 80, height: 80, borderRadius: 26, backgroundColor: '#FBEDEE', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginVertical: 8 },
  quote: { padding: 15, backgroundColor: '#F5F7F9', borderRadius: 14, gap: 6 },
});
