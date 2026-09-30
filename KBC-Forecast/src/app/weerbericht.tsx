import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BalanceChart, ChoiceList, DayInfo, DayStrip, Hero, StormWarning } from '@/components/bank/forecast-detail';
import { GoalCard } from '@/components/bank/start-sections';
import { IconButton, Section, SubHeader, T } from '@/components/bank/ui';
import { Color, Space } from '@/constants/bank-theme';
import { goalText } from '@/data/demo';
import { useDemo } from '@/hooks/use-demo';
import { useScenes } from '@/hooks/use-scenes';

export default function ForecastScreen() {
  const insets = useSafeAreaInsets();
  const { goStart } = useScenes();
  const { model, baseline, choices, selectedDay, selectDay, toggleChoice, setChoice, notify } = useDemo();
  const why = () => router.push('/waarom');

  return <View style={[styles.screen, { paddingTop: insets.top }]}>
    <SubHeader title="Jouw weerbericht" onBack={goStart} right={<IconButton name="info" label="Waarom zie ik dit?" color={Color.blue} size={24} onPress={why} />} />
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
      <Hero model={model} baseline={baseline} choices={choices} />
      {model.redDay > 0 && <StormWarning onPostpone={() => { setChoice('gsm', false); notify('Oké, de gsm staat nu na je loon gepland.'); }} onOptions={() => notify('Spreiden is niet uitgewerkt in deze demo.')} />}
      <DayStrip model={model} selected={selectedDay} onSelect={selectDay} />
      <DayInfo model={model} index={selectedDay} />

      <Section title="Kies je weer" aside={<T style={{ fontSize: 13, color: Color.muted }}>live berekend</T>}>
        <ChoiceList choices={choices} onToggle={toggleChoice} />
      </Section>

      <Section title="Je rekening tot je loon">
        <BalanceChart model={model} />
      </Section>

      <Section>
        <GoalCard text={goalText(model)} />
      </Section>

      <Section>
        <Pressable testID="why-link" accessibilityRole="button" onPress={why} style={styles.whyLink}><T bold style={{ color: Color.blue, fontSize: 14 }}>Waarom zie ik dit?</T></Pressable>
      </Section>
      <T style={styles.fine}>Kate rekent met je vaste betalingen, je gewone uitgaven van de voorbije maanden en de keuzes hierboven. Het weer is een voorspelling, geen oordeel.</T>
    </ScrollView>
  </View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Color.bg },
  whyLink: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start', marginTop: -Space.md },
  fine: { fontSize: 12.5, lineHeight: 18, color: Color.dim, paddingHorizontal: Space.lg, paddingTop: 6 },
});
