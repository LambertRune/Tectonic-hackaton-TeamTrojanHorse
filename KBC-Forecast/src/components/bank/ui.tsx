import { useEffect, type PropsWithChildren, type ReactNode } from 'react';
import { AccessibilityInfo, Platform, Pressable, StyleSheet, Text, View, type StyleProp, type TextProps, type ViewStyle } from 'react-native';
import Animated, { FadeInDown, FadeOutDown, ReduceMotion, useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { Icon, type IconName } from './icons';
import { Color, Font, hitSlopFor, Radius, Space, Touch, type FontWeight } from '@/constants/bank-theme';

export function T({ weight = 'regular', bold, style, ...props }: TextProps & { weight?: FontWeight; bold?: boolean }) {
  return <Text {...props} style={[styles.text, { fontFamily: Font[bold ? 'bold' : weight] }, style]} />;
}

/** Icon-only button. Visual size follows the mockup, the touch target is always at least 44pt. */
export function IconButton({ name, label, onPress, color = Color.text, size = 26, style, testID }: { name: IconName; label: string; onPress: () => void; color?: string; size?: number; style?: StyleProp<ViewStyle>; testID?: string }) {
  return <Pressable testID={testID} accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [styles.iconButton, style, pressed && styles.pressed]}>
    <Icon name={name} color={color} size={size} />
  </Pressable>;
}

/** Rounded outline / filled button ("pill" in the mockup). */
export function Pill({ label, onPress, fill, size = 'md', icon, testID, accessibilityLabel }: { label: string; onPress: () => void; fill?: boolean; size?: 'sm' | 'md' | 'lg'; icon?: ReactNode; testID?: string; accessibilityLabel?: string }) {
  const height = size === 'sm' ? 34 : size === 'lg' ? 46 : 38;
  return <Pressable testID={testID} accessibilityRole="button" accessibilityLabel={accessibilityLabel} onPress={onPress} hitSlop={hitSlopFor(0, height)} style={({ pressed }) => [styles.pill, { height, paddingHorizontal: size === 'sm' ? 14 : 18 }, fill && styles.pillFill, pressed && styles.pressed]}>
    {icon}
    <T weight="semibold" style={[styles.pillText, { fontSize: size === 'sm' ? 14.5 : 16 }, fill && { color: Color.onBlue }]}>{label}</T>
  </Pressable>;
}

export function Card({ children, style }: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Section({ title, action, onAction, aside, children, style }: PropsWithChildren<{ title?: string; action?: string; onAction?: () => void; aside?: ReactNode; style?: StyleProp<ViewStyle> }>) {
  return <View style={[styles.section, style]}>
    {title && <View style={styles.sectionHead}>
      <T accessibilityRole="header" style={styles.sectionTitle}>{title}</T>
      {action && onAction && <Pressable accessibilityRole="button" onPress={onAction} hitSlop={hitSlopFor(0, 20)}><T bold style={styles.link}>{action}</T></Pressable>}
      {aside}
    </View>}
    {children}
  </View>;
}

/** Top bar of the sub screens: back, centered title, optional right action. */
export function SubHeader({ title, onBack, right }: { title: string; onBack: () => void; right?: ReactNode }) {
  return <View style={styles.subhead}>
    <IconButton name="back" label="Terug naar Start" onPress={onBack} color={Color.blue} testID="back" />
    <T accessibilityRole="header" weight="semibold" style={styles.subheadTitle}>{title}</T>
    {right ?? <View style={{ width: Touch }} />}
  </View>;
}

export function KeyValue({ label, value, first }: { label: string; value: string; first?: boolean }) {
  return <View style={[styles.kv, first && { borderTopWidth: 0 }]} accessible accessibilityLabel={`${label}: ${value}`}>
    <T style={styles.kvLabel}>{label}</T>
    <T weight="semibold" style={styles.kvValue}>{value}</T>
  </View>;
}

/** iOS-style switch from the mockup (50 × 30). Knob motion follows the system reduce-motion setting. */
export function Switch({ value }: { value: boolean }) {
  const knob = useAnimatedStyle(() => ({ transform: [{ translateX: withTiming(value ? 20 : 0, { duration: 200, reduceMotion: ReduceMotion.System }) }] }));
  const track = useAnimatedStyle(() => ({ backgroundColor: withTiming(value ? Color.blue : Color.switchOff, { duration: 200, reduceMotion: ReduceMotion.System }) }));
  return <Animated.View style={[styles.switch, track, { pointerEvents: 'none' }]}>
    <Animated.View style={[styles.knob, knob]} />
  </Animated.View>;
}

export function ProgressBar({ value, max, color = Color.green, label }: { value: number; max: number; color?: string; label: string }) {
  const bar = useAnimatedStyle(() => ({ width: withTiming(`${Math.min(100, (value / max) * 100)}%`, { duration: 400, reduceMotion: ReduceMotion.System }) }));
  return <View style={styles.track} accessibilityRole="progressbar" accessibilityLabel={label} accessibilityValue={{ min: 0, max, now: value }}>
    <Animated.View style={[styles.bar, { backgroundColor: color }, bar]} />
  </View>;
}

/**
 * Content of a sheet route. Native uses the real formSheet presentation; web has no native sheet,
 * so the route is a transparent modal and this draws the mockup's scrim and bottom sheet itself.
 */
export function SheetFrame({ children, onClose, background = Color.field }: PropsWithChildren<{ onClose: () => void; background?: string }>) {
  if (Platform.OS !== 'web') return <>{children}</>;
  return <View style={styles.scrim}>
    <Pressable style={StyleSheet.absoluteFill} accessibilityRole="button" accessibilityLabel="Sluiten" onPress={onClose} />
    <Animated.View entering={FadeInDown.duration(300).reduceMotion(ReduceMotion.System)} style={[styles.webSheet, { backgroundColor: background }]} accessibilityViewIsModal>
      <View style={styles.grab} />
      {children}
    </Animated.View>
  </View>;
}

export function Toast({ message }: { message: string | null }) {
  useEffect(() => { if (message) AccessibilityInfo.announceForAccessibility(message); }, [message]);
  if (!message) return null;
  return <Animated.View key={message} entering={FadeInDown.duration(220).reduceMotion(ReduceMotion.System)} exiting={FadeOutDown.duration(180).reduceMotion(ReduceMotion.System)} style={[styles.toast, { pointerEvents: 'none' }]} accessibilityLiveRegion="polite">
    <T style={{ fontSize: 14, color: Color.text }}>{message}</T>
  </Animated.View>;
}

export const styles = StyleSheet.create({
  text: { color: Color.text, fontSize: 15 },
  pressed: { opacity: 0.6 },
  iconButton: { width: Touch, height: Touch, alignItems: 'center', justifyContent: 'center' },
  pill: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: Radius.pill, borderWidth: 1.5, borderColor: Color.blue },
  pillFill: { backgroundColor: Color.blue },
  pillText: { color: Color.blue },
  card: { backgroundColor: Color.card, borderRadius: Radius.md, padding: Space.lg },
  section: { paddingTop: Space.xl, paddingHorizontal: Space.lg },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: Space.md },
  sectionTitle: { fontSize: 18 },
  link: { color: Color.blue, fontSize: 14 },
  subhead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Space.sm, paddingTop: Space.xs, paddingBottom: Space.xs },
  subheadTitle: { fontSize: 17, flex: 1, textAlign: 'center' },
  kv: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, paddingVertical: 10, borderTopWidth: 1, borderTopColor: Color.line },
  kvLabel: { color: Color.muted, fontSize: 14.5 },
  kvValue: { fontSize: 14.5, textAlign: 'right', flexShrink: 1 },
  switch: { width: 50, height: 30, borderRadius: 15, padding: 3 },
  knob: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#FFFFFF' },
  track: { height: 8, borderRadius: 4, backgroundColor: Color.track, marginTop: 10, marginBottom: 8, overflow: 'hidden' },
  bar: { height: '100%', borderRadius: 4 },
  scrim: { flex: 1, backgroundColor: Color.scrim, justifyContent: 'flex-end' },
  webSheet: { borderTopLeftRadius: Radius.sheet, borderTopRightRadius: Radius.sheet, paddingTop: 18 },
  grab: { width: 40, height: 5, borderRadius: 3, backgroundColor: Color.switchOff, alignSelf: 'center' },
  toast: { position: 'absolute', left: Space.lg, right: Space.lg, bottom: 110, backgroundColor: Color.card2, borderRadius: Radius.lg, paddingVertical: Space.md, paddingHorizontal: Space.lg, borderWidth: 1, borderColor: Color.line, zIndex: 50 },
});
