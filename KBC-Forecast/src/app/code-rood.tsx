import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { Icon } from '@/components/bank/icons';
import { Card, KeyValue, Pill, Section, SubHeader, T } from '@/components/bank/ui';
import { Color, Radius, Space, Touch } from '@/constants/bank-theme';
import { eurCents, FRAUD } from '@/data/demo';
import { useDemo } from '@/hooks/use-demo';
import { useScenes } from '@/hooks/use-scenes';

/** Scene 5: Kate holds a suspicious transfer for Jos (74) while a fake "KBC" caller is on the line. */
export default function CodeRoodScreen() {
  const insets = useSafeAreaInsets();
  const { goStart } = useScenes();
  const { notify } = useDemo();

  return <View style={[styles.screen, { paddingTop: insets.top }]}>
    <SubHeader title="Overschrijving" onBack={goStart} />
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 30 }}>
      <View style={styles.alert} accessible accessibilityRole="alert" accessibilityLabel="Weerwaarschuwing code rood. Jos, ik hou deze betaling even vast. Ze lijkt sterk op een bekende oplichting. Je geld is veilig, er is nog niets vertrokken.">
        <View style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}>
          <Svg width="100%" height="100%" preserveAspectRatio="none">
            <Defs><LinearGradient id="alert" x1="0.2" y1="0" x2="0.8" y2="1"><Stop offset="0" stopColor="#5A1416" /><Stop offset="1" stopColor="#2B0D0E" /></LinearGradient></Defs>
            <Rect width="100%" height="100%" fill="url(#alert)" />
          </Svg>
        </View>
        <View style={styles.alertHead}><Icon name="storm-small" size={22} /><T weight="extrabold" style={styles.alertLabel}>Weerwaarschuwing code rood</T></View>
        <T weight="extrabold" style={styles.alertTitle}>Jos, ik hou deze betaling even vast.</T>
        <T style={styles.alertBody}>Ze lijkt sterk op een bekende oplichting. Je geld is veilig, er is nog niets vertrokken.</T>
      </View>

      <Section style={{ paddingTop: 14 }}>
        <Card style={{ paddingVertical: 6 }}>
          <KeyValue first label="Bedrag" value={`€ ${eurCents(FRAUD.amount)}`} />
          <KeyValue label="Naar" value={FRAUD.iban} />
          <KeyValue label="Naam die je ingaf" value={FRAUD.enteredName} />
        </Card>
        <View style={styles.shield}>
          <Icon name="shield" size={22} />
          <T style={styles.shieldText}><T bold>Naam komt niet overeen.</T> Deze rekening staat op naam van een privépersoon, niet van KBC.</T>
        </View>
      </Section>

      <Section title="Wat Kate zag">
        <Card>
          {FRAUD.signals.map(signal => <View key={signal} style={styles.sig}><View style={styles.sigDot} /><T style={styles.sigText}>{signal}</T></View>)}
        </Card>
      </Section>

      <Section>
        <Card style={styles.angel}>
          <View style={styles.avatar}><T weight="extrabold" style={{ color: '#3B1117' }}>{FRAUD.angel.initial}</T></View>
          <View style={{ flex: 1 }}>
            <T bold style={{ fontSize: 14.5, lineHeight: 21 }}>{FRAUD.angel.name}, je engelbewaarder, is verwittigd.</T>
            <T style={{ fontSize: 14.5, lineHeight: 21, color: Color.muted }}>Zij en KBC Live kijken samen met je mee.</T>
          </View>
        </Card>
      </Section>

      <View style={styles.stack}>
        <Pill testID="call-kbc" fill size="lg" label="📞  Bel KBC Live nu" accessibilityLabel="Bel KBC Live nu" onPress={() => notify('Demo: hier bel je KBC Live via het vertrouwde nummer.')} />
        <Pill size="lg" label="Check je gesprek" onPress={() => notify('Demo: Kate toont hoe je een echt KBC-nummer herkent.')} />
        <Pressable accessibilityRole="button" onPress={() => notify('Deze betaling blijft vastgehouden tot KBC Live je terugbelt.')} style={styles.textButton}>
          <T style={styles.textButtonLabel}>Ik ken deze persoon, ik wil toch betalen</T>
        </Pressable>
      </View>
      <T style={styles.fine}>KBC vraagt je nooit om geld over te schrijven naar een &quot;veilige rekening&quot;. Hang op als iemand dat vraagt.</T>
    </ScrollView>
  </View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Color.bg },
  alert: { marginTop: Space.xs, marginHorizontal: Space.lg, borderRadius: Radius.lg, borderWidth: 1, borderColor: Color.alertLine, padding: Space.lg, overflow: 'hidden' },
  alertHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  alertLabel: { fontSize: 13, letterSpacing: 0.6, textTransform: 'uppercase', color: Color.alertText },
  alertTitle: { fontSize: 21, lineHeight: 27, marginTop: 10 },
  alertBody: { fontSize: 14.5, lineHeight: 21.75, color: Color.alertBody, marginTop: 6 },
  shield: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', backgroundColor: Color.cautionBg, borderWidth: 1, borderColor: Color.cautionLine, borderRadius: Radius.md, paddingVertical: 10, paddingHorizontal: Space.md, marginTop: 10 },
  shieldText: { flex: 1, fontSize: 14, lineHeight: 20.3 },
  sig: { flexDirection: 'row', gap: 10, paddingVertical: 7 },
  sigDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Color.red, marginTop: 7 },
  sigText: { flex: 1, fontSize: 14.5, lineHeight: 21 },
  angel: { flexDirection: 'row', gap: Space.md, alignItems: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F29AA6', alignItems: 'center', justifyContent: 'center' },
  stack: { gap: 10, padding: Space.lg },
  textButton: { minHeight: Touch, justifyContent: 'center', padding: 6 },
  textButtonLabel: { color: Color.muted, fontSize: 14, textAlign: 'center', textDecorationLine: 'underline' },
  fine: { fontSize: 12.5, lineHeight: 18, color: Color.dim, paddingHorizontal: Space.lg },
});
