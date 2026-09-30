import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { CardPattern, Icon, type IconName } from './icons';
import { IconButton, T } from './ui';
import { Bank, cardShadow } from '@/constants/bank-theme';
import { dateLabel, euro, type Account, type Notice, type Transaction } from '@/data/demo';

export type Utility = 'settings' | 'kate' | 'notifications' | 'MyNWS' | 'MyHome' | 'MyMobility' | 'Mijn KBC' | 'Beleggen' | 'Aanbod' | 'transfer';

export function BankHeader({ unread, onOpen }: { unread: boolean; onOpen: (utility: Utility) => void }) {
  return <View>
    <View style={styles.header}>
      <IconButton testID="demo-settings" name="settings" label="Instellingen en demo bedienen" onPress={() => onOpen('settings')} style={styles.roundButton} />
      <Pressable accessibilityRole="button" accessibilityLabel="Vraag het aan Kate" onPress={() => onOpen('kate')} style={({ pressed }) => [styles.kateSearch, pressed && { opacity: 0.7 }]}>
        <Icon name="search" size={16} color="#84A5C6" />
        <T numberOfLines={1} style={styles.searchPlaceholder}>Hoe kan ik je helpen?</T>
        <View style={styles.kateLogo}><Icon name="kate" size={18} /><T bold style={styles.kateWord}>Kate</T></View>
      </Pressable>
      <View><IconButton name="bell" label={unread ? 'Meldingen, nieuwe berichten' : 'Meldingen'} onPress={() => onOpen('notifications')} style={styles.roundButton} />{unread && <View pointerEvents="none" style={styles.notificationDot} />}</View>
    </View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
      <View accessibilityLabel="Mijn geld, geselecteerd" style={styles.activeCategory}><Icon name="wallet" size={21} color={Bank.white} /></View>
      {(['MyNWS', 'MyHome', 'MyMobility'] as const).map((label, index) => <Pressable key={label} accessibilityRole="button" onPress={() => onOpen(label)} style={({ pressed }) => [styles.category, pressed && { opacity: 0.65 }]}><Icon name={(['news', 'home', 'directions'] as const)[index]} size={19} color="#567C9F" /><T bold style={styles.categoryLabel}>{label}</T></Pressable>)}
    </ScrollView>
  </View>;
}

export function Accounts({ accounts, onAccount, onEdit }: { accounts: Account[]; onAccount: (account: Account) => void; onEdit: () => void }) {
  return <View style={styles.accountsSection}>
    <View style={styles.sectionHeading}><T bold accessibilityRole="header" style={styles.heading}>Je rekeningen</T><IconButton name="edit" label="Rekeningen personaliseren" onPress={onEdit} color={Bank.blue} /></View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.accounts}>
      {accounts.map((account, index) => <Pressable key={account.id} testID={`account-${index}`} accessibilityRole="button" accessibilityLabel={`${account.label}, ${euro(account.balance)}`} onPress={() => onAccount(account)} style={({ pressed }) => [styles.account, pressed && { opacity: 0.8 }]}>
        <View style={styles.accountArt}><View style={StyleSheet.absoluteFill}><CardPattern /></View><Icon name={account.kind} color="white" size={48} strokeWidth={1.25} /></View>
        <View style={styles.accountContent}><T numberOfLines={1} style={styles.accountOwner}>{account.owner}</T><T bold numberOfLines={1} style={styles.accountBalance}>{euro(account.balance, false)} <T bold style={{ fontSize: 10 }}>EUR</T></T><T numberOfLines={1} style={styles.accountLabel}>{account.label}</T></View>
        <View style={[styles.accountIndicator, index === 0 && { backgroundColor: Bank.blue }]} />
      </Pressable>)}
    </ScrollView>
  </View>;
}

export function Transactions({ transactions, visible, onToggle, onTransaction }: { transactions: Transaction[]; visible: boolean; onToggle: () => void; onTransaction: (transaction: Transaction) => void }) {
  return <View style={styles.transactions}>
    {visible && transactions.slice(0, 3).map(transaction => <Pressable key={transaction.id} accessibilityRole="button" accessibilityLabel={`${transaction.merchant}, ${euro(transaction.amount)}${transaction.status ? `, ${transaction.status === 'held' ? 'tegengehouden' : 'geannuleerd'}` : ''}`} onPress={() => onTransaction(transaction)} style={({ pressed }) => [styles.transaction, pressed && { opacity: 0.6 }]}>
      <T style={styles.transactionDate}>{dateLabel(transaction.date, { day: '2-digit', month: '2-digit' })}</T>
      <View style={{ flex: 1, gap: 1 }}><T numberOfLines={1} style={styles.merchant}>{transaction.merchant}</T>{transaction.status && <T bold style={{ fontSize: 10, lineHeight: 14, color: transaction.status === 'held' ? Bank.red : Bank.green }}>{transaction.status === 'held' ? 'Tegengehouden' : 'Geannuleerd'}</T>}</View>
      <T bold style={[styles.transactionAmount, transaction.status === 'cancelled' && { textDecorationLine: 'line-through', color: Bank.muted }]}>{euro(transaction.amount, false)} <T style={{ fontSize: 10 }}>EUR</T></T>
    </Pressable>)}
    <Pressable testID="toggle-payments" accessibilityRole="button" accessibilityState={{ expanded: visible }} onPress={onToggle} style={styles.togglePayments}><Icon name={visible ? 'up' : 'down'} color={Bank.blue} size={18} /><T bold style={{ color: Bank.blue, fontSize: 12 }}>{visible ? 'Verberg betalingen' : 'Toon betalingen'}</T></Pressable>
  </View>;
}

export function NoticeCard({ notice, onOpen, onDismiss }: { notice: Notice; onOpen: () => void; onDismiss?: () => void }) {
  const danger = notice.tone === 'danger';
  return <View style={[styles.notice, danger && styles.dangerNotice]} testID={`notice-${notice.id}`}>
    <View style={styles.noticeRow}>
      <View style={styles.noticeSymbol}><Icon name={danger ? 'shield' : 'kate'} size={34} color={danger ? Bank.red : Bank.blue} /></View>
      <View style={{ flex: 1, gap: 6 }}>
        <View style={styles.noticeByline}><T bold style={{ fontSize: 11, color: danger ? Bank.red : Bank.navy }}>{danger ? 'Kate beschermt je · code rood' : notice.tone === 'success' ? 'Kate staat aan je zijde' : 'Kate kijkt vooruit'}</T></View>
        <T bold style={{ fontSize: 16, lineHeight: 21, paddingRight: onDismiss ? 10 : 0 }}>{notice.title}</T>
        <T style={styles.noticeBody}>{notice.body}</T>
        {notice.action && <Pressable accessibilityRole="button" onPress={onOpen} style={styles.noticeAction}><T bold style={{ color: danger ? Bank.red : Bank.blueDark, fontSize: 12, flexShrink: 1 }}>{notice.actionLabel}</T><Icon name="arrow" size={16} color={danger ? Bank.red : Bank.blueDark} /></Pressable>}
      </View>
    </View>
    {onDismiss && !danger && <View style={styles.dismiss}><IconButton name="close" label={`Sluit tip: ${notice.title}`} onPress={onDismiss} color={Bank.muted} style={{ width: 36, height: 36 }} /></View>}
  </View>;
}

export function BottomNavigation({ bottom, onOpen, onStart }: { bottom: number; onOpen: (utility: Utility) => void; onStart: () => void }) {
  const tabs: { label: 'Start' | 'Mijn KBC' | 'Beleggen' | 'Aanbod'; icon: IconName }[] = [{ label: 'Start', icon: 'wallet' }, { label: 'Mijn KBC', icon: 'list' }, { label: 'Beleggen', icon: 'piggy' }, { label: 'Aanbod', icon: 'layers' }];
  return <>
    <Pressable testID="transfer-button" accessibilityRole="button" accessibilityLabel="Overschrijven" onPress={() => onOpen('transfer')} style={({ pressed }) => [styles.transfer, { bottom: bottom + 91 }, pressed && { opacity: 0.8 }]}><Icon name="transfer" size={27} color={Bank.white} /></Pressable>
    <View style={[styles.bottomNav, { bottom: bottom + 8 }]}>
      {tabs.map(tab => <Pressable key={tab.label} accessibilityRole="button" accessibilityLabel={tab.label} accessibilityState={{ selected: tab.label === 'Start' }} onPress={() => tab.label === 'Start' ? onStart() : onOpen(tab.label)} style={({ pressed }) => [styles.tab, tab.label === 'Start' && styles.selectedTab, pressed && { opacity: 0.6 }]}><Icon name={tab.icon} size={23} color={tab.label === 'Start' ? Bank.navy : '#3E4650'} /><T bold={tab.label === 'Start'} style={[styles.tabLabel, tab.label !== 'Start' && { color: '#333C45' }]}>{tab.label}</T></Pressable>)}
    </View>
  </>;
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 16, paddingTop: 13, paddingBottom: 22 },
  roundButton: { backgroundColor: Bank.white, boxShadow: '0 5px 22px rgba(27, 55, 76, .07)' },
  kateSearch: { flex: 1, minWidth: 0, minHeight: 42, borderWidth: 1.3, borderColor: '#C3DCFF', borderRadius: 25, paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', gap: 7 },
  searchPlaceholder: { fontSize: 13, color: '#83A2C4', flex: 1 },
  kateLogo: { flexDirection: 'row', gap: 3, alignItems: 'center' },
  kateWord: { fontSize: 18, letterSpacing: -0.7 },
  notificationDot: { position: 'absolute', right: 7, top: 8, width: 10, height: 10, borderRadius: 6, backgroundColor: '#ED5857', borderWidth: 1.5, borderColor: 'white' },
  categories: { paddingHorizontal: 16, gap: 8, alignItems: 'center' },
  activeCategory: { width: 44, height: 40, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: Bank.navy },
  category: { minHeight: 40, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 7, borderRadius: 24, backgroundColor: Bank.pale },
  categoryLabel: { color: '#4F729A', fontSize: 14 },
  accountsSection: { marginTop: 17 },
  sectionHeading: { marginHorizontal: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 },
  heading: { fontSize: 20, lineHeight: 27, letterSpacing: -0.4 },
  accounts: { paddingHorizontal: 16, paddingBottom: 20, gap: 11 },
  account: { width: 144, backgroundColor: Bank.white, borderRadius: 13, overflow: 'hidden', ...cardShadow },
  accountArt: { height: 93, alignItems: 'center', justifyContent: 'center' },
  accountContent: { padding: 11, paddingBottom: 8, gap: 3 },
  accountOwner: { color: '#557799', fontSize: 10, lineHeight: 15 },
  accountBalance: { fontSize: 18, lineHeight: 25, letterSpacing: -0.3 },
  accountLabel: { color: Bank.muted, fontSize: 9, lineHeight: 16 },
  accountIndicator: { height: 3, marginHorizontal: 11, borderRadius: 3, marginBottom: 9, backgroundColor: 'transparent' },
  transactions: { marginHorizontal: 22, marginTop: -4 },
  transaction: { minHeight: 36, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6 },
  transactionDate: { color: '#8096AA', fontSize: 10, width: 33 },
  merchant: { fontSize: 13, lineHeight: 18 },
  transactionAmount: { fontSize: 13, lineHeight: 20 },
  togglePayments: { flexDirection: 'row', gap: 12, alignItems: 'center', minHeight: 46, alignSelf: 'flex-start', marginTop: 6 },
  notice: { backgroundColor: Bank.white, borderRadius: 17, padding: 17, ...cardShadow, borderWidth: 1, borderColor: '#F1F5F8' },
  dangerNotice: { backgroundColor: '#FFF8F8', borderColor: '#F4D5D8' },
  noticeRow: { flexDirection: 'row', gap: 12 },
  noticeSymbol: { paddingTop: 1 },
  noticeByline: { minHeight: 19, paddingRight: 15 },
  noticeBody: { fontSize: 13, lineHeight: 20, color: '#51708F' },
  noticeAction: { minHeight: 36, flexDirection: 'row', alignItems: 'center', gap: 7, alignSelf: 'flex-start', paddingTop: 4 },
  dismiss: { position: 'absolute', right: 4, top: 4 },
  transfer: { position: 'absolute', right: 23, width: 55, height: 55, borderRadius: 30, backgroundColor: Bank.blue, alignItems: 'center', justifyContent: 'center', boxShadow: '0 7px 20px rgba(0, 142, 196, .22)', zIndex: 5 },
  bottomNav: { position: 'absolute', left: 16, right: 16, padding: 5, flexDirection: 'row', height: 70, backgroundColor: '#FFFFFFF5', borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 38, boxShadow: '0 4px 34px rgba(35, 61, 79, .13)', zIndex: 6 },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2, borderRadius: 30 },
  selectedTab: { backgroundColor: '#EEF1F4' },
  tabLabel: { fontSize: 11, lineHeight: 17 },
});
