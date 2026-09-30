import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Accounts, BankHeader, BottomNavigation, Chips, GoalCard, InUit, KateTip, Transactions } from '@/components/bank/start-sections';
import { Section } from '@/components/bank/ui';
import { WeatherCard } from '@/components/bank/weather-card';
import { Color } from '@/constants/bank-theme';
import { goalText } from '@/data/demo';
import { useDemo } from '@/hooks/use-demo';

const TAB_BAR = 64;

export default function StartScreen() {
  const insets = useSafeAreaInsets();
  const { model, choices, paymentsVisible, togglePayments, tipDismissed, dismissTip, notify } = useDemo();
  const soon = (label: string) => notify(`${label} is niet uitgewerkt in deze demo.`);

  return <View style={[styles.screen, { paddingTop: insets.top }]}>
    <BankHeader unread onSettings={() => router.push('/demo')} onKate={() => router.push('/kate')} onBell={() => soon('Meldingen')} />
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: TAB_BAR + insets.bottom + 90 }}>
      <Chips onChip={soon} />
      <Accounts onAccount={soon} onFavorites={() => soon('Favorieten')} onNew={() => soon('Een nieuwe rekening')} />
      <Transactions visible={paymentsVisible} onToggle={togglePayments} />

      <Section title="Voor jou" action="Alle communicatie" onAction={() => soon('Alle communicatie')}>
        <WeatherCard model={model} choices={choices} onOpen={() => router.push('/weerbericht')} />
        {!tipDismissed && <KateTip onDismiss={dismissTip} />}
      </Section>

      <Section title="Zicht op je geldzaken" action="Toon alles" onAction={() => soon('Zicht op je geldzaken')}>
        <InUit onMore={() => soon('In & uit')} />
      </Section>

      <Section title="Sparen voor je dromen" action="Bekijk meer" onAction={() => soon('Sparen voor je dromen')}>
        <GoalCard text={goalText(model)} />
      </Section>
    </ScrollView>
    <BottomNavigation bottom={insets.bottom} onTab={label => label !== 'Start' && soon(label)} onTransfer={() => soon('Overschrijven')} />
  </View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Color.bg },
});
