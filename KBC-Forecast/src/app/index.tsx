import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DemoPanel, type Panel } from '@/components/bank/demo-panel';
import { Icon } from '@/components/bank/icons';
import { Accounts, BankHeader, BottomNavigation, NoticeCard, Transactions, type Utility } from '@/components/bank/start-sections';
import { Button, T } from '@/components/bank/ui';
import { WeatherCard } from '@/components/bank/weather-card';
import { Bank } from '@/constants/bank-theme';
import { dateLabel, demoDate, type DemoChoices, type Notice, type PersonaId } from '@/data/demo';
import { useDemo } from '@/hooks/use-demo';

export default function HomeScreen() {
  const { snapshot, loading, error, patchChoices, choosePersona, nextStep, reset, retry } = useDemo();
  const insets = useSafeAreaInsets();
  const scroll = useRef<ScrollView>(null);
  const [panel, setPanel] = useState<Panel | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [paymentsVisible, setPaymentsVisible] = useState(true);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [unread, setUnread] = useState(true);
  const [dragging, setDragging] = useState(false);
  const [aliases, setAliases] = useState<Record<string, string>>({});
  const selectedDay = snapshot.forecast.find(day => day.date === selectedDate) ?? snapshot.forecast[0];
  const priorityNotice = snapshot.notices.find(notice => notice.tone === 'danger');
  const visibleNotices = snapshot.notices.filter(notice => !dismissed.includes(notice.id) && notice.id !== priorityNotice?.id);

  const openUtility = (name: Utility) => {
    if (name === 'notifications') setUnread(false);
    setPanel({ kind: 'utility', name });
  };
  const openNotice = (notice: Notice) => {
    if (notice.action) setPanel({ kind: 'notice', action: notice.action });
  };
  const onScenario = useCallback((enabled: boolean) => {
    patchChoices({ nightOut: enabled });
    setSelectedDate(enabled ? demoDate(4) : null);
  }, [patchChoices]);

  const resetView = () => {
    setPanel(null);
    setSelectedDate(null);
    setPaymentsVisible(true);
    setDismissed([]);
    setUnread(true);
    setAliases({});
    setDragging(false);
    scroll.current?.scrollTo({ y: 0, animated: false });
  };
  const changePersona = (persona: PersonaId) => { choosePersona(persona); resetView(); };
  const resetDemo = () => { reset(); resetView(); };
  const advanceDemo = () => { nextStep(); setPanel(null); setSelectedDate(null); setDismissed([]); setUnread(true); scroll.current?.scrollTo({ y: 0, animated: true }); };
  const makeChoice = (patch: Partial<DemoChoices>) => {
    patchChoices(patch);
    if (patch.kotResponse === 'confirmed') setSelectedDate(demoDate(3));
    setUnread(true);
  };

  return <View style={styles.page}>
    <View style={[styles.device, { paddingTop: insets.top }]}>
      <ScrollView ref={scroll} scrollEnabled={!dragging} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 175 }}>
        <BankHeader unread={unread} onOpen={openUtility} />
        <View style={styles.greeting}><T style={styles.greetingText}>{snapshot.greeting} <T style={{ color: Bank.blue }}>✦</T></T><View style={{ flexDirection: 'row', gap: 7, alignItems: 'center' }}>{loading && <ActivityIndicator size="small" color={Bank.blue} />}<T style={styles.today}>{dateLabel(snapshot.today, { day: 'numeric', month: 'short' })}</T></View></View>
        {error && <View style={styles.error}><T>{error}</T><Button label="Probeer opnieuw" onPress={retry} /></View>}
        {priorityNotice && <View style={styles.priority}><NoticeCard notice={priorityNotice} onOpen={() => openNotice(priorityNotice)} /></View>}
        <WeatherCard snapshot={snapshot} selectedDay={selectedDay} onSelect={day => { setSelectedDate(day.date); setPanel({ kind: 'day', date: day.date }); }} onExplain={() => setPanel({ kind: 'day', date: selectedDay.date })} onScenario={onScenario} onDragChange={setDragging} />
        <Accounts accounts={snapshot.accounts.map(account => ({ ...account, label: aliases[account.id] ?? account.label }))} onAccount={account => setPanel({ kind: 'account', id: account.id })} onEdit={() => setPanel({ kind: 'personalize' })} />
        <Transactions transactions={snapshot.transactions} visible={paymentsVisible} onToggle={() => setPaymentsVisible(value => !value)} onTransaction={transaction => setPanel({ kind: 'transaction', id: transaction.id })} />
        <View style={styles.forYou}>
          <View style={styles.forYouHeading}><T bold accessibilityRole="header" style={styles.heading}>Voor jou</T><Pressable accessibilityRole="button" onPress={() => setPanel({ kind: 'communications' })} style={styles.allCommunication}><T bold style={{ color: Bank.blue, fontSize: 12 }}>Alle communicatie</T><Icon name="right" size={13} color={Bank.blue} /></Pressable></View>
          <View style={{ gap: 13 }}>{visibleNotices.map(notice => <NoticeCard key={notice.id} notice={notice} onOpen={() => openNotice(notice)} onDismiss={() => setDismissed(previous => [...previous, notice.id])} />)}</View>
          {visibleNotices.length === 0 && <View style={styles.empty}><Icon name="check" size={24} color={Bank.blue} /><T style={{ color: Bank.muted, fontSize: 13 }}>Je bent helemaal bij.</T><Button label="Bekijk alle berichten" variant="quiet" onPress={() => setPanel({ kind: 'communications' })} /></View>}
        </View>
        <View style={styles.signature}><Icon name="kate" size={20} /><T style={styles.signatureText}>KBC Weerbericht · Jij kiest het weer.</T></View>
      </ScrollView>
      <BottomNavigation bottom={Math.max(insets.bottom, 6)} onOpen={openUtility} onStart={() => scroll.current?.scrollTo({ y: 0, animated: true })} />
      {panel && <DemoPanel panel={panel} snapshot={snapshot} aliases={aliases} onClose={() => setPanel(null)} onOpen={setPanel} onChoice={makeChoice} onPersona={changePersona} onNext={advanceDemo} onReset={resetDemo} onSaveAliases={nextAliases => { setAliases(nextAliases); setPanel(null); }} />}
    </View>
  </View>;
}

const styles = StyleSheet.create({
  page: { flex: 1, alignItems: 'center', backgroundColor: Bank.backdrop },
  device: { flex: 1, width: '100%', maxWidth: Bank.maxWidth, backgroundColor: Bank.white, boxShadow: '0 0 60px rgba(26, 55, 77, .04)' },
  greeting: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 19, marginTop: 23, marginBottom: -11 },
  greetingText: { fontSize: 12, color: Bank.muted },
  today: { fontSize: 11, color: '#8A9EAF' },
  priority: { marginHorizontal: 16, marginTop: 24, marginBottom: -6 },
  error: { padding: 16, margin: 16, backgroundColor: '#FFF4ED', borderRadius: 12, gap: 10 },
  forYou: { padding: 16, paddingTop: 14, marginTop: 8, backgroundColor: '#F5FAFD' },
  forYouHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  heading: { fontSize: 21, letterSpacing: -0.4 },
  allCommunication: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 44 },
  empty: { padding: 22, alignItems: 'center', gap: 10, backgroundColor: 'white', borderRadius: 18 },
  signature: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, paddingTop: 21 },
  signatureText: { fontSize: 10, color: '#8BA0B2' },
});
