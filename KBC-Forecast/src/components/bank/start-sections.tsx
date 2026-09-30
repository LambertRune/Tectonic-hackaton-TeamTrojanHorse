import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Rect, Stop, Text as SvgText } from 'react-native-svg';

import { Icon, KateMark, type IconName } from './icons';
import { Card, IconButton, ProgressBar, styles as ui, T } from './ui';
import { Color, hitSlopFor, Radius, Space, Touch } from '@/constants/bank-theme';
import { ACCOUNTS, eurCents, GOAL, IN_OUT, TRANSACTIONS } from '@/data/demo';

export function BankHeader({ unread, onSettings, onKate, onBell }: { unread: boolean; onSettings: () => void; onKate: () => void; onBell: () => void }) {
  return <View style={styles.top}>
    <IconButton testID="demo-settings" name="gear" label="Instellingen en demo-scènes" onPress={onSettings} style={styles.topButton} />
    <Pressable testID="kate-search" accessibilityRole="button" accessibilityLabel="Hoe kan ik je helpen? Vraag het aan Kate" onPress={onKate} style={({ pressed }) => [styles.search, pressed && ui.pressed]}>
      <Icon name="search" size={20} color={Color.muted} />
      <T numberOfLines={1} style={styles.searchText}>Hoe kan ik je helpen?</T>
      <View style={styles.kate}><KateMark /><T weight="extrabold" style={{ fontSize: 15 }}>Kate</T></View>
    </Pressable>
    <View>
      <IconButton name="bell" label={unread ? 'Meldingen, nieuwe melding' : 'Meldingen'} onPress={onBell} color={Color.blue} style={styles.topButton} />
      {unread && <View style={[styles.bellDot, { pointerEvents: 'none' }]} />}
    </View>
  </View>;
}

const CHIPS: { label: string; icon: IconName }[] = [{ label: 'MyNWS', icon: 'news' }, { label: 'MyHome', icon: 'house' }, { label: 'MyMobility', icon: 'sign' }];

export function Chips({ onChip }: { onChip: (label: string) => void }) {
  return <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
    <View accessible accessibilityLabel="Mijn geld, geselecteerd" style={[styles.chip, styles.chipSelected]}><Icon name="wallet" size={20} color="#111111" /></View>
    {CHIPS.map(chip => <Pressable key={chip.label} accessibilityRole="button" onPress={() => onChip(chip.label)} hitSlop={hitSlopFor(0, 32)} style={({ pressed }) => [styles.chip, pressed && ui.pressed]}>
      <Icon name={chip.icon} size={18} color={Color.chipText} /><T style={styles.chipText}>{chip.label}</T>
    </Pressable>)}
  </ScrollView>;
}

function AccountArt({ art }: { art: 'lotte' | 'sunset' }) {
  if (art === 'lotte') return <Svg width="100%" height="100%" viewBox="0 0 128 92" preserveAspectRatio="xMidYMid slice">
    <Defs><LinearGradient id="acct-blue" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#46ADE0" /><Stop offset="1" stopColor="#0B5E93" /></LinearGradient></Defs>
    <Rect width="128" height="92" fill="url(#acct-blue)" />
    <Circle cx="98" cy="22" r="30" fill="#fff" opacity=".12" /><Circle cx="24" cy="80" r="40" fill="#fff" opacity=".08" />
    <SvgText x="14" y="54" fill="#fff" fontSize="22" fontWeight="800" fontFamily="NunitoSans_800ExtraBold">Lotte</SvgText>
  </Svg>;
  return <Svg width="100%" height="100%" viewBox="0 0 128 92" preserveAspectRatio="xMidYMid slice">
    <Defs><LinearGradient id="acct-sunset" x1="0.2" y1="0" x2="0.8" y2="1"><Stop offset="0" stopColor="#F69D14" /><Stop offset="0.55" stopColor="#EE7079" /><Stop offset="1" stopColor="#7C45B6" /></LinearGradient></Defs>
    <Rect width="128" height="92" fill="url(#acct-sunset)" />
    <Circle cx="64" cy="70" r="26" fill="#FFD66B" /><Rect y="68" width="128" height="24" fill="#2B2350" opacity=".7" />
  </Svg>;
}

export function Accounts({ onAccount, onFavorites, onNew }: { onAccount: (name: string) => void; onFavorites: () => void; onNew: () => void }) {
  return <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.accounts}>
    {ACCOUNTS.map((account, index) => <Pressable key={account.id} testID={`account-${account.id}`} accessibilityRole="button" accessibilityLabel={`${account.name}, ${eurCents(account.balance)} euro${index === 0 ? ', geselecteerd' : ''}`} onPress={() => onAccount(account.name)} style={({ pressed }) => [styles.account, pressed && ui.pressed]}>
      <View style={styles.accountArt}><AccountArt art={account.art} /></View>
      <T numberOfLines={1} style={styles.accountName}>{account.name}</T>
      <T bold style={styles.accountBalance}>€ {eurCents(account.balance)}</T>
      {index === 0 && <View style={styles.accountSelected} />}
    </Pressable>)}
    <View style={[styles.account, styles.accountSmall]}>
      <Pressable accessibilityRole="button" onPress={onFavorites} style={({ pressed }) => [styles.smallAction, pressed && ui.pressed]}><Icon name="star" size={22} color={Color.muted} /><T style={styles.smallText}>Wijzig favorieten</T></Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Nieuwe rekening" onPress={onNew} style={({ pressed }) => [styles.smallAction, pressed && ui.pressed]}><Icon name="plus" size={22} color={Color.green} /><T style={styles.smallText}>Nieuw</T></Pressable>
    </View>
  </ScrollView>;
}

export function Transactions({ visible, onToggle }: { visible: boolean; onToggle: () => void }) {
  return <View style={styles.tx}>
    {visible && TRANSACTIONS.map(item => <View key={item.id} style={styles.txRow} accessible accessibilityLabel={`${item.date}, ${item.merchant}, ${eurCents(item.amount, true)} euro`}>
      <T style={styles.txDate}>{item.date}</T>
      <T style={styles.txName} numberOfLines={1}>{item.merchant}</T>
      <T weight="semibold" style={[styles.txAmount, item.amount > 0 && { color: Color.positive }]}>{eurCents(item.amount, true)}</T>
    </View>)}
    <Pressable testID="toggle-payments" accessibilityRole="button" accessibilityState={{ expanded: visible }} onPress={onToggle} style={styles.txToggle}>
      <View style={{ transform: [{ rotate: visible ? '0deg' : '180deg' }] }}><Icon name="up" size={16} color={Color.blue} strokeWidth={2} /></View>
      <T bold style={ui.link}>{visible ? 'Verberg betalingen' : 'Toon betalingen'}</T>
    </Pressable>
  </View>;
}

export function KateTip({ onDismiss }: { onDismiss: () => void }) {
  return <Card style={{ marginTop: Space.md }}>
    <View style={styles.tip}>
      <View style={{ width: 34, paddingTop: 2 }}><Icon name="hex" size={32} color="#C8CDD2" /></View>
      <View style={{ flex: 1, paddingRight: 18 }}>
        <View style={styles.tipHead}><KateMark /><T bold style={{ fontSize: 14.5 }}>Kate tip</T></View>
        <T style={styles.tipText}>Jouw top 10 Extra diensten altijd binnen handbereik? Stel je favorieten nu in.</T>
      </View>
    </View>
    <Pressable accessibilityRole="button" accessibilityLabel="Sluit Kate tip" onPress={onDismiss} hitSlop={hitSlopFor(22)} style={styles.close}><T style={{ fontSize: 11, color: Color.muted }}>✕</T></Pressable>
  </Card>;
}

export function InUit({ onMore }: { onMore: () => void }) {
  const maxBar = 100;
  return <Card>
    <View style={styles.row}>
      <T style={{ fontSize: 16 }}>In &amp; uit <T style={{ color: Color.muted, fontSize: 14 }}> {IN_OUT.month}</T></T>
      <Pressable accessibilityRole="button" accessibilityLabel="Meer opties voor In en uit" onPress={onMore} hitSlop={hitSlopFor(24)}><T style={{ color: Color.muted }}>•••</T></Pressable>
    </View>
    <View style={styles.kpis}>
      <View style={styles.kpi} accessible accessibilityLabel={`Inkomsten ${eurCents(IN_OUT.income)} euro`}>
        <View style={[styles.square, { backgroundColor: Color.teal }]}><Icon name="coins-plus" color="#10302A" /></View>
        <View><T style={styles.kpiLabel}>Inkomsten</T><T bold style={{ fontSize: 15 }}>€ {eurCents(IN_OUT.income)}</T></View>
      </View>
      <View style={styles.kpi} accessible accessibilityLabel={`Uitgaven ${eurCents(IN_OUT.expenses)} euro`}>
        <View style={[styles.square, { backgroundColor: Color.yellow }]}><Icon name="coins-minus" color="#231B00" /></View>
        <View><T style={styles.kpiLabel}>Uitgaven</T><T bold style={{ fontSize: 15 }}>€ {eurCents(IN_OUT.expenses)}</T></View>
      </View>
    </View>
    <View style={[styles.bars, { height: maxBar }]} accessible accessibilityLabel="Staafgrafiek inkomsten en uitgaven van mei tot oktober">
      {IN_OUT.bars.map(([income, expense], index) => {
        const current = index === IN_OUT.bars.length - 1;
        return <View key={IN_OUT.months[index]} style={styles.barPair}>
          <View style={[styles.bar, { height: income, backgroundColor: current ? Color.teal : '#1E4A42' }]} />
          <View style={[styles.bar, { height: expense, backgroundColor: current ? Color.yellow : '#5A4D12' }]} />
        </View>;
      })}
    </View>
    <View style={styles.months}>{IN_OUT.months.map((month, index) => <T key={month} bold={index === IN_OUT.months.length - 1} style={[styles.month, index === IN_OUT.months.length - 1 && { color: Color.text }]}>{month}</T>)}</View>
  </Card>;
}

export function GoalCard({ text }: { text: string }) {
  return <Card>
    <View style={styles.row}>
      <T bold style={{ fontSize: 15 }}>✈️  {GOAL.name}</T>
      <T style={{ color: Color.muted, fontSize: 15 }}>€ {GOAL.saved} van € {GOAL.target}</T>
    </View>
    <ProgressBar value={GOAL.saved} max={GOAL.target} label={`Spaardoel ${GOAL.name}: ${GOAL.saved} van ${GOAL.target} euro`} />
    <T style={{ fontSize: 13.5, color: Color.muted }}>{text}</T>
  </Card>;
}

const TABS: { label: string; icon: IconName }[] = [{ label: 'Start', icon: 'wallet-filled' }, { label: 'Mijn KBC', icon: 'list' }, { label: 'Beleggen', icon: 'piggy' }, { label: 'Aanbod', icon: 'layers' }];

export function BottomNavigation({ bottom, onTab, onTransfer }: { bottom: number; onTab: (label: string) => void; onTransfer: () => void }) {
  return <>
    <Pressable testID="transfer-button" accessibilityRole="button" accessibilityLabel="Overschrijven" onPress={onTransfer} style={({ pressed }) => [styles.fab, { bottom: 86 + bottom + 14 }, pressed && ui.pressed]}>
      <Icon name="swap" size={30} color={Color.onBlue} />
    </Pressable>
    <View style={[styles.tabbar, { paddingBottom: bottom }]} accessibilityRole="tablist">
      {TABS.map(tab => {
        const selected = tab.label === 'Start';
        return <Pressable key={tab.label} accessibilityRole="tab" accessibilityLabel={tab.label} accessibilityState={{ selected }} onPress={() => onTab(tab.label)} style={({ pressed }) => [styles.tab, pressed && ui.pressed]}>
          <Icon name={tab.icon} size={26} color={selected ? '#FFFFFF' : Color.tab} />
          <T style={[styles.tabLabel, selected && { color: '#FFFFFF' }]}>{tab.label}</T>
        </Pressable>;
      })}
    </View>
  </>;
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingHorizontal: 9, paddingTop: 6, paddingBottom: 4 },
  topButton: { width: Touch, height: Touch },
  search: { flex: 1, minWidth: 0, height: 40, borderRadius: 20, backgroundColor: Color.field, borderWidth: 1, borderColor: Color.fieldLine, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12 },
  searchText: { color: Color.muted, fontSize: 15, flex: 1 },
  kate: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  bellDot: { position: 'absolute', top: 9, right: 10, width: 9, height: 9, borderRadius: 5, backgroundColor: Color.red },
  chips: { gap: Space.sm, paddingHorizontal: Space.lg, paddingTop: 6, paddingBottom: 10 },
  chip: { height: 32, borderRadius: 16, backgroundColor: Color.chip, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12 },
  chipSelected: { backgroundColor: Color.chipSelected },
  chipText: { fontSize: 14, color: Color.chipText },
  accounts: { gap: 10, paddingHorizontal: Space.lg, paddingTop: 6 },
  account: { width: 128, borderRadius: Radius.md, backgroundColor: Color.card, overflow: 'hidden' },
  accountArt: { height: 92 },
  accountName: { fontSize: 13, color: Color.muted, paddingHorizontal: 10, paddingTop: 10, paddingBottom: 2, textTransform: 'uppercase', letterSpacing: 0.2 },
  accountBalance: { fontSize: 15, paddingHorizontal: 10, paddingBottom: 12 },
  accountSelected: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 3, backgroundColor: Color.text },
  accountSmall: { width: 112, justifyContent: 'center', padding: Space.sm, gap: Space.xs },
  smallAction: { minHeight: Touch, justifyContent: 'center', gap: 2, paddingHorizontal: 4 },
  smallText: { fontSize: 14, color: Color.muted },
  tx: { paddingHorizontal: Space.lg, paddingTop: Space.md, paddingBottom: Space.xs },
  txRow: { flexDirection: 'row', gap: 14, paddingVertical: 5, alignItems: 'baseline' },
  txDate: { color: Color.muted, width: 40, fontSize: 13 },
  txName: { fontSize: 15, flex: 1 },
  txAmount: { fontSize: 15 },
  txToggle: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: Touch, alignSelf: 'flex-start' },
  tip: { flexDirection: 'row', gap: 14 },
  tipHead: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  tipText: { fontSize: 15, lineHeight: 23 },
  close: { position: 'absolute', top: 12, right: 12, width: 22, height: 22, borderRadius: 11, backgroundColor: Color.closeChip, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  kpis: { flexDirection: 'row', gap: 30, marginVertical: 14 },
  kpi: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  square: { width: 40, height: 40, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  kpiLabel: { color: Color.muted, fontSize: 14 },
  bars: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', borderBottomWidth: 1, borderBottomColor: Color.line, paddingHorizontal: 12 },
  barPair: { flexDirection: 'row', gap: 3, alignItems: 'flex-end' },
  bar: { width: 7, borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  months: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8, paddingHorizontal: 6 },
  month: { fontSize: 13, color: Color.muted },
  fab: { position: 'absolute', right: Space.lg, width: 56, height: 56, borderRadius: 28, backgroundColor: Color.blue, alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 18px rgba(0,0,0,.4)', zIndex: 5 },
  tabbar: { position: 'absolute', left: 0, right: 0, bottom: 0, minHeight: 64, backgroundColor: Color.tabBar, borderTopWidth: 1, borderTopColor: Color.tabLine, flexDirection: 'row', justifyContent: 'space-around', paddingTop: Space.sm },
  tab: { alignItems: 'center', gap: 4, width: 76, minHeight: Touch },
  tabLabel: { fontSize: 12, color: Color.tab },
});
