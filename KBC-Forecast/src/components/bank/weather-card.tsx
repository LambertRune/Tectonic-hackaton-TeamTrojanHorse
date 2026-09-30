import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { KateMark, WeatherIcon } from './icons';
import { Pill, T } from './ui';
import { Color, Radius, Space } from '@/constants/bank-theme';
import { dayLabel, eur, headline, PAYDAY, spendOn, WEATHER_LABEL, type Choices, type Forecast } from '@/data/demo';

/** "Jouw financiële weerbericht" card on Start. The summary and both buttons open the full forecast.
 * The buttons sit next to the summary pressable (not inside it) so web never nests <button>s. */
export function WeatherCard({ model, choices, onOpen }: { model: Forecast; choices: Choices; onOpen: () => void }) {
  const today = model.weather[0];
  const text = headline(model, choices);
  return <View>
    <View style={styles.card}>
      <View style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}>
        <Svg width="100%" height="100%" preserveAspectRatio="none">
          <Defs><LinearGradient id="wx-sky" x1="0.33" y1="0" x2="0.67" y2="1"><Stop offset="0" stopColor="#1C2B38" /><Stop offset="0.55" stopColor={Color.card} /><Stop offset="1" stopColor={Color.card} /></LinearGradient></Defs>
          <Rect width="100%" height="100%" fill="url(#wx-sky)" />
        </Svg>
      </View>
      <Pressable testID="weather-card" accessibilityRole="button" accessibilityLabel={`Jouw financiële weerbericht, nieuw. ${eur(model.perDay)} vrij per dag tot je loon op ${PAYDAY}. Vandaag ${WEATHER_LABEL[today]}. ${text}`} accessibilityHint="Opent je weerbericht" onPress={onOpen} style={({ pressed }) => pressed && { opacity: 0.85 }}>
        <View style={styles.top}>
          <KateMark />
          <T bold style={{ fontSize: 14.5 }}>Jouw financiële weerbericht</T>
          <View style={styles.badge}><T bold style={styles.badgeText}>Nieuw</T></View>
        </View>
        <View style={styles.now}>
          <WeatherIcon type={today} size={56} />
          <View>
            <T weight="extrabold" style={styles.temp}>{eur(model.perDay)}</T>
            <T style={styles.sub}>vrij per dag{'\n'}tot je loon op {PAYDAY}</T>
          </View>
          <View style={styles.label}>
            <T bold style={{ fontSize: 14, textAlign: 'right' }}>{WEATHER_LABEL[today]}</T>
            <T style={{ fontSize: 12.5, color: Color.muted, textAlign: 'right' }}>vandaag</T>
          </View>
        </View>
        <T style={styles.headline}>{text}</T>
        <View style={styles.week}>
          {Array.from({ length: 7 }, (_, index) => {
            const total = spendOn(model.events[index]);
            return <View key={index} style={styles.weekDay}>
              <T bold={index === 0} style={[styles.dayName, index === 0 && { color: Color.text }]}>{index === 0 ? 'nu' : dayLabel(index).dn}</T>
              <WeatherIcon type={model.weather[index]} size={26} />
              <T style={styles.amount}>{total ? `-${total}` : ''}</T>
            </View>;
          })}
        </View>
      </Pressable>
      <View style={styles.buttons}>
        <Pill testID="choose-weather" size="sm" fill label="Kies je weer" onPress={onOpen} />
        <Pill size="sm" label="14 dagen" onPress={onOpen} />
      </View>
    </View>
    <View style={[styles.dot, { pointerEvents: 'none' }]} />
  </View>;
}

const styles = StyleSheet.create({
  card: { borderRadius: Radius.md, padding: Space.lg, borderWidth: 1, borderColor: '#243644', overflow: 'hidden', backgroundColor: Color.card },
  dot: { position: 'absolute', left: -6, top: -4, width: 9, height: 9, borderRadius: 5, backgroundColor: Color.red },
  top: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  badge: { marginLeft: 'auto', backgroundColor: Color.tealBadge, borderRadius: Radius.sm, paddingHorizontal: 7, paddingVertical: 2 },
  badgeText: { fontSize: 11.5, color: '#FFFFFF' },
  now: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 12, marginBottom: 6 },
  temp: { fontSize: 40, lineHeight: 44, letterSpacing: -1 },
  sub: { fontSize: 13, lineHeight: 17.5, color: Color.muted },
  label: { marginLeft: 'auto' },
  headline: { fontSize: 15, lineHeight: 22, marginTop: 6, marginBottom: 12 },
  week: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: Color.line, paddingTop: 12 },
  weekDay: { flex: 1, alignItems: 'center' },
  dayName: { fontSize: 12, color: Color.muted, marginBottom: 4 },
  amount: { fontSize: 11, color: Color.muted, marginTop: 2, minHeight: 14 },
  buttons: { flexDirection: 'row', gap: 10, marginTop: 14 },
});
