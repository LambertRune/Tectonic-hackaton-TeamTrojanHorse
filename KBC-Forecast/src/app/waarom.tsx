import { router } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Pill, SheetFrame, T } from '@/components/bank/ui';
import { Color, Space } from '@/constants/bank-theme';
import { WHY_REASONS } from '@/data/demo';
import { useDemo } from '@/hooks/use-demo';

/** "Waarom zie ik dit?" sheet: Kate explains her signals and the user stays in control. */
export default function WhySheet() {
  const insets = useSafeAreaInsets();
  const { notify } = useDemo();
  const answer = (message: string) => { router.back(); notify(message); };

  return <SheetFrame onClose={() => router.back()}><View style={[styles.sheet, { paddingBottom: insets.bottom + 40 }]}>
    <T accessibilityRole="header" bold style={styles.title}>Waarom zie ik dit?</T>
    <View style={{ gap: Space.xs }}>
      {WHY_REASONS.map(reason => <View key={reason} style={styles.li}><T style={styles.bullet}>•</T><T style={styles.reason}>{reason}</T></View>)}
    </View>
    <View style={styles.pills}>
      <Pill testID="why-ok" size="sm" label="Klopt" onPress={() => answer('Bedankt, Kate rekent hiermee verder.')} />
      <Pill size="sm" label="Pas aan" onPress={() => answer('Aanpassen is niet uitgewerkt in deze demo.')} />
      <Pill size="sm" label="Hier wil ik niets over horen" onPress={() => answer('Begrepen. Kate stelt hier geen vragen meer over.')} />
    </View>
  </View></SheetFrame>;
}

const styles = StyleSheet.create({
  sheet: { paddingHorizontal: 18, paddingTop: Platform.OS === 'web' ? 14 : 22 },
  title: { fontSize: 18, marginBottom: Space.sm },
  li: { flexDirection: 'row', gap: 8, paddingLeft: 4 },
  bullet: { color: Color.muted, fontSize: 14, lineHeight: 21 },
  reason: { flex: 1, fontSize: 14, lineHeight: 21, color: Color.muted },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: Space.sm, marginTop: Space.lg },
});
