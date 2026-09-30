import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { ReduceMotion, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

import { KateMark, WeatherIcon } from './icons';
import { Card, T } from './ui';
import { Color, Radius, Space } from '@/constants/bank-theme';
import { dayLabel, eur, spendOn, WEATHER_LABEL, type Forecast } from '@/data/demo';

export function KateAvatar() {
  return <View style={styles.avatar}><KateMark badge={false} size={10} /></View>;
}

export function Message({ children }: { children: string }) {
  return <T style={styles.msg}>{children}</T>;
}

export function UserMessage({ children }: { children: string }) {
  return <View style={styles.umsg} accessible accessibilityLabel={`Jij: ${children}`}><T style={{ fontSize: 15.5, lineHeight: 22 }}>{children}</T></View>;
}

function Dot({ delay }: { delay: number }) {
  const opacity = useSharedValue(1);
  useEffect(() => {
    opacity.value = withDelay(delay, withRepeat(withSequence(withTiming(0.25, { duration: 500 }), withTiming(1, { duration: 500 })), -1, false, undefined, ReduceMotion.System), ReduceMotion.System);
  }, [delay, opacity]);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={[styles.dot, style]} />;
}

export function Typing() {
  return <View style={styles.typing} accessible accessibilityLabel="Kate is aan het typen">
    <Dot delay={0} /><Dot delay={200} /><Dot delay={400} />
  </View>;
}

/** Week summary card: free money per day before → after Friday's night out. */
export function MiniWeek({ before, after }: { before: Forecast; after: Forecast }) {
  return <Card style={styles.mini}>
    <View style={styles.miniHead} accessible accessibilityLabel={`Je week. Van ${eur(before.perDay)} naar ${eur(after.perDay)} per dag.`}>
      <T bold style={{ fontSize: 14.5 }}>Je week</T>
      <T style={{ fontSize: 14.5, color: Color.muted }}>{eur(before.perDay)} → <T bold>{eur(after.perDay)}</T> per dag</T>
    </View>
    <View style={styles.miniWeek}>
      {[1, 2, 3, 4, 5].map(index => {
        const total = spendOn(after.events[index]);
        const name = index === 1 ? 'vandaag' : dayLabel(index).dn;
        const detail = total ? `-€${total}` : WEATHER_LABEL[after.weather[index]].toLowerCase();
        return <View key={index} style={styles.miniDay} accessible accessibilityLabel={`${name}: ${WEATHER_LABEL[after.weather[index]]}${total ? `, ${total} euro` : ''}`}>
          <T style={styles.miniSmall}>{name}</T>
          <WeatherIcon type={after.weather[index]} size={28} />
          <T style={styles.miniEm}>{detail}</T>
        </View>;
      })}
    </View>
  </Card>;
}

const styles = StyleSheet.create({
  avatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: Color.kateBubble, alignItems: 'center', justifyContent: 'center', marginTop: 14, marginBottom: 6 },
  msg: { fontSize: 16, lineHeight: 24.8, marginVertical: Space.sm },
  umsg: { marginTop: 14, marginBottom: 6, alignSelf: 'flex-end', maxWidth: '78%', backgroundColor: Color.userBubble, borderRadius: Radius.xl, borderBottomRightRadius: 4, paddingVertical: 10, paddingHorizontal: 14 },
  typing: { flexDirection: 'row', gap: 4, marginVertical: 14 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Color.muted },
  mini: { borderRadius: Radius.lg, padding: 14, marginVertical: 10 },
  miniHead: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4 },
  miniWeek: { flexDirection: 'row', marginTop: 10 },
  miniDay: { flex: 1, alignItems: 'center', gap: 2 },
  miniSmall: { fontSize: 12, color: Color.muted },
  miniEm: { fontSize: 11.5, color: Color.muted, marginTop: 2 },
});
