import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, ReduceMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { KateMark } from '@/components/bank/icons';
import { T } from '@/components/bank/ui';
import { Color, Space } from '@/constants/bank-theme';

const NOTIFICATION = 'Na regen komt zonneschijn ☀️ Gisteren was het onweer. Ik heb je week herschikt, vanaf morgen is het weer zon.';

/** Scene 3: Saturday morning lock screen with Kate's push notification. */
export default function LockScreen() {
  const insets = useSafeAreaInsets();
  return <View style={styles.screen}>
    <View style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}>
      <Svg width="100%" height="100%">
        <Defs>
          <RadialGradient id="lock" cx="50%" cy="0%" rx="120%" ry="80%" fx="50%" fy="0%">
            <Stop offset="0" stopColor="#20507A" /><Stop offset="0.45" stopColor="#0E2238" /><Stop offset="1" stopColor="#070D14" />
          </RadialGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#lock)" />
      </Svg>
    </View>
    <View style={[styles.clock, { marginTop: insets.top + 34 }]} accessible accessibilityLabel="Zaterdag 3 oktober, 9 uur 12">
      <T weight="semibold" style={styles.date}>zaterdag 3 oktober</T>
      <T weight="light" style={styles.time}>9:12</T>
    </View>
    <Animated.View entering={FadeInDown.delay(300).duration(600).reduceMotion(ReduceMotion.System)} style={[styles.notifWrap, { marginBottom: insets.bottom + 150 }]}>
      <Pressable testID="notification" accessibilityRole="button" accessibilityLabel={`Melding van KBC Mobile, Kate, nu: ${NOTIFICATION}`} accessibilityHint="Opent het gesprek met Kate" onPress={() => router.push('/kate')} style={({ pressed }) => [styles.notif, pressed && { opacity: 0.85 }]}>
        <View style={styles.appIcon}><KateMark badge={false} size={22} color="#FFFFFF" /></View>
        <View style={{ flex: 1 }}>
          <View style={styles.notifHead}><T bold style={{ fontSize: 14 }}>KBC Mobile · Kate</T><T style={styles.now}>nu</T></View>
          <T style={styles.body}>{NOTIFICATION}</T>
        </View>
      </Pressable>
    </Animated.View>
    <T style={[styles.hint, { bottom: insets.bottom + 40 }]}>Tik op de melding</T>
  </View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#070D14' },
  clock: { alignItems: 'center' },
  date: { fontSize: 19, color: '#DDE7F0' },
  time: { fontSize: 92, lineHeight: 97, letterSpacing: -2, color: Color.text },
  notifWrap: { marginTop: 'auto', marginHorizontal: Space.md },
  notif: { borderRadius: 22, backgroundColor: 'rgba(40,52,64,0.88)', paddingVertical: 14, paddingHorizontal: Space.lg, flexDirection: 'row', gap: Space.md },
  appIcon: { width: 38, height: 38, borderRadius: 9, backgroundColor: '#1283C8', alignItems: 'center', justifyContent: 'center' },
  notifHead: { flexDirection: 'row', justifyContent: 'space-between' },
  now: { fontSize: 13, color: '#C3CDD6' },
  body: { fontSize: 14.5, lineHeight: 20.3, marginTop: 2, color: '#EEF3F7' },
  hint: { position: 'absolute', width: '100%', textAlign: 'center', fontSize: 13, color: '#9FB3C6' },
});
