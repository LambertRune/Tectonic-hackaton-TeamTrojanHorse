import { useEffect, useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, ReduceMotion } from 'react-native-reanimated';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Polyline, Stop, Text as SvgText } from 'react-native-svg';

import { WeatherIcon } from './icons';
import { Card, Pill, Switch, T } from './ui';
import { Color, Font, Radius, Space, Touch } from '@/constants/bank-theme';
import { CHOICES, DAYS, dayLabel, dayText, eur, headline, PAYDAY, spendOn, WEATHER_LABEL, type ChoiceKey, type Choices, type Forecast } from '@/data/demo';

export function Hero({ model, baseline, choices }: { model: Forecast; baseline: Forecast; choices: Choices }) {
  const delta = Math.round(model.perDay) - Math.round(baseline.perDay);
  return <View style={styles.hero}>
    <View style={styles.big}>
      <WeatherIcon type={model.redDay > 0 ? 'storm' : model.weather[0]} size={64} />
      <T accessibilityRole="header" accessibilityLiveRegion="polite" weight="extrabold" style={styles.h2}>{headline(model, choices)}</T>
    </View>
    <View style={styles.temp} accessible accessibilityLiveRegion="polite" accessibilityLabel={`${eur(model.perDay)} vrij per dag tot je loon op ${PAYDAY}${delta ? `, ${delta > 0 ? 'plus' : 'min'} ${Math.abs(delta)} euro` : ''}`}>
      <T weight="extrabold" style={styles.tempValue}>{eur(model.perDay)}</T>
      <T style={styles.tempText}>vrij per dag tot je loon op {PAYDAY}</T>
      {delta !== 0 && <View style={[styles.delta, { backgroundColor: delta < 0 ? Color.cautionBg : Color.gainBg }]}>
        <T bold style={{ fontSize: 13, color: delta < 0 ? Color.cautionText : Color.gainText }}>{delta > 0 ? '+' : '−'}€{Math.abs(delta)}</T>
      </View>}
    </View>
  </View>;
}

export function StormWarning({ onPostpone, onOptions }: { onPostpone: () => void; onOptions: () => void }) {
  return <Animated.View entering={FadeIn.duration(250).reduceMotion(ReduceMotion.System)} exiting={FadeOut.duration(150).reduceMotion(ReduceMotion.System)} style={styles.warn} accessibilityLiveRegion="assertive">
    <T style={styles.warnText}><T bold>Kate:</T> Wacht je tot na je loon op {PAYDAY}, dan blijft het hele maand droog. Of spreid ik de aankoop over 3 maanden, zonder kosten?</T>
    <View style={styles.pills}>
      <Pill testID="postpone" size="sm" label="Stel uit tot na je loon" onPress={onPostpone} />
      <Pill size="sm" label="Toon opties" onPress={onOptions} />
    </View>
  </Animated.View>;
}

const DAY_WIDTH = 62;
const DAY_GAP = 8;

export function DayStrip({ model, selected, onSelect }: { model: Forecast; selected: number; onSelect: (index: number) => void }) {
  const strip = useRef<ScrollView>(null);
  useEffect(() => {
    strip.current?.scrollTo({ x: Math.max(0, selected * (DAY_WIDTH + DAY_GAP) - DAY_WIDTH * 2), animated: true });
  }, [selected]);
  return <ScrollView ref={strip} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.strip}>
    {Array.from({ length: 14 }, (_, index) => {
      const label = dayLabel(index);
      const total = spendOn(model.events[index]);
      const on = index === selected;
      return <Pressable key={index} testID={`day-${index}`} accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityLabel={`${index === 0 ? 'Vandaag' : label.long} ${label.dd}, ${WEATHER_LABEL[model.weather[index]]}${total ? `, ${total} euro uitgaven` : ''}`} onPress={() => onSelect(index)} style={({ pressed }) => [styles.day, on && styles.daySelected, pressed && { opacity: 0.7 }]}>
        <T style={styles.dn}>{index === 0 ? 'vandaag' : label.dn}</T>
        <T bold style={styles.dd}>{label.dd}</T>
        <WeatherIcon type={model.weather[index]} size={30} />
        <T numberOfLines={1} style={styles.ev}>{total ? `-€${total}` : ''}</T>
      </Pressable>;
    })}
  </ScrollView>;
}

export function DayInfo({ model, index }: { model: Forecast; index: number }) {
  const info = dayText(model, index);
  return <View style={styles.dayinfo} accessible accessibilityLiveRegion="polite">
    <T bold style={{ fontSize: 15, marginBottom: 2 }}>{info.title}</T>
    <T style={{ fontSize: 14.5, lineHeight: 22 }}>{info.body}</T>
    {info.events.length > 0 && <View style={{ marginTop: 6, gap: 2 }}>
      {info.events.map(event => <T key={event.name} style={styles.li}>•  {event.name}: {eur(event.amount)}</T>)}
    </View>}
  </View>;
}

export function ChoiceList({ choices, onToggle }: { choices: Choices; onToggle: (key: ChoiceKey) => void }) {
  return <Card style={{ paddingVertical: Space.xs }}>
    {CHOICES.map((choice, index) => <Pressable key={choice.key} testID={`toggle-${choice.key}`} accessibilityRole="switch" accessibilityState={{ checked: choices[choice.key] }} accessibilityLabel={`${choice.title}, ${choice.detail}`} onPress={() => onToggle(choice.key)} style={({ pressed }) => [styles.toggle, index > 0 && styles.toggleLine, pressed && { opacity: 0.8 }]}>
      <View style={styles.emoji}><T style={{ fontSize: 17 }}>{choice.emoji}</T></View>
      <View style={{ flex: 1 }}>
        <T style={{ fontSize: 15, lineHeight: 20 }}>{choice.title}</T>
        <T style={{ fontSize: 13, color: Color.muted }}>{choice.detail}</T>
      </View>
      <Switch value={choices[choice.key]} />
    </Pressable>)}
  </Card>;
}

const W = 330;
const H = 150;
const PAD = 10;
const MAX = 1200;
const MIN = -300;

/** Balance until payday. Turns red when the month dips below zero. */
export function BalanceChart({ model }: { model: Forecast }) {
  const x = (index: number) => PAD + (index * (W - 2 * PAD)) / DAYS;
  const y = (value: number) => PAD + ((MAX - value) * (H - 2 * PAD)) / (MAX - MIN);
  const points = model.path.map((value, index) => `${x(index).toFixed(1)},${y(value).toFixed(1)}`);
  const negative = model.low < 0;
  const color = negative ? Color.red : Color.blue;
  const end = model.path[DAYS];
  return <Card style={{ paddingTop: 14, paddingHorizontal: 12, paddingBottom: 10 }}>
    <View accessible accessibilityRole="image" accessibilityLabel={`Grafiek van je rekening tot je loon. Op ${PAYDAY} sta je op ${eur(end)}.${negative ? ` Je zakt onder nul vanaf ${dayLabel(model.redDay - 1).dd}.` : ''}`}>
      <Svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', aspectRatio: W / H }}>
        <Defs><LinearGradient id="balance" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor={color} stopOpacity={0.35} /><Stop offset="1" stopColor={color} stopOpacity={0} /></LinearGradient></Defs>
        <Line x1={PAD} x2={W - PAD} y1={y(0)} y2={y(0)} stroke="#4A5057" strokeDasharray="3 4" />
        <SvgText x={PAD} y={y(0) + 13} fontSize={10} fill={Color.muted} fontFamily={Font.regular}>€ 0</SvgText>
        <Path d={`M${points.join('L')}L${x(DAYS)},${y(MIN)}L${x(0)},${y(MIN)}Z`} fill="url(#balance)" />
        <Polyline points={points.join(' ')} fill="none" stroke={color} strokeWidth={2.4} strokeLinejoin="round" />
        <Circle cx={x(DAYS)} cy={y(end)} r={4} fill={color} />
        <SvgText x={x(DAYS) - 6} y={y(end) + (negative ? -10 : 16)} textAnchor="end" fontSize={11} fontFamily={Font.bold} fill={Color.text}>{eur(end)}</SvgText>
      </Svg>
    </View>
    <View style={styles.legend}><T style={styles.legendText}>vandaag</T><T style={styles.legendText}>loon {PAYDAY}</T></View>
  </Card>;
}

const styles = StyleSheet.create({
  hero: { paddingHorizontal: Space.lg, paddingTop: 6 },
  big: { flexDirection: 'row', gap: Space.lg, alignItems: 'center' },
  h2: { fontSize: 22, lineHeight: 27.5, flex: 1 },
  temp: { flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', columnGap: Space.sm, marginTop: 10 },
  tempValue: { fontSize: 34, lineHeight: 40, letterSpacing: -1 },
  tempText: { color: Color.muted, fontSize: 14, flexShrink: 1 },
  delta: { borderRadius: Radius.sm, paddingHorizontal: 7, paddingVertical: 2 },
  warn: { marginTop: Space.md, marginHorizontal: Space.lg, borderRadius: Radius.md, paddingVertical: Space.md, paddingHorizontal: 14, backgroundColor: Color.warnBg, borderWidth: 1, borderColor: Color.warnLine },
  warnText: { fontSize: 14, lineHeight: 20.5 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: Space.sm, marginTop: 10 },
  strip: { gap: DAY_GAP, paddingHorizontal: Space.lg, paddingTop: 14, paddingBottom: 4 },
  day: { width: DAY_WIDTH, minHeight: Touch, borderRadius: Radius.md, backgroundColor: Color.card, paddingTop: 10, paddingBottom: 8, paddingHorizontal: 4, alignItems: 'center', borderWidth: 1.5, borderColor: 'transparent' },
  daySelected: { borderColor: Color.blue },
  dn: { fontSize: 12, color: Color.muted },
  dd: { fontSize: 13, marginBottom: 6 },
  ev: { fontSize: 11, color: Color.muted, marginTop: 4, minHeight: 14 },
  dayinfo: { marginTop: 10, marginHorizontal: Space.lg, backgroundColor: Color.card, borderRadius: Radius.md, paddingVertical: 14, paddingHorizontal: Space.lg },
  li: { fontSize: 13.5, color: Color.muted },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: Space.md, paddingVertical: Space.md, minHeight: Touch },
  toggleLine: { borderTopWidth: 1, borderTopColor: Color.line },
  emoji: { width: 34, height: 34, borderRadius: 9, backgroundColor: Color.emoji, alignItems: 'center', justifyContent: 'center' },
  legend: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  legendText: { fontSize: 12, color: Color.muted },
});
