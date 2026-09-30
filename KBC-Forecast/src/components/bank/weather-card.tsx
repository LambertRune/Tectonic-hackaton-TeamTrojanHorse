import { useMemo, useRef, useState } from 'react';
import { Animated, PanResponder, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { Icon, WeatherIcon } from './icons';
import { T } from './ui';
import { Bank } from '@/constants/bank-theme';
import { dateLabel, euro, WEATHER, type DemoSnapshot, type ForecastDay } from '@/data/demo';

type Props = {
  snapshot: DemoSnapshot;
  selectedDay: ForecastDay;
  onSelect: (day: ForecastDay) => void;
  onExplain: () => void;
  onScenario: (enabled: boolean) => void;
  onDragChange: (dragging: boolean) => void;
};

export function WeatherCard({ snapshot, selectedDay, onSelect, onExplain, onScenario, onDragChange }: Props) {
  const { width } = useWindowDimensions();
  const dayWidth = (Math.min(width, Bank.maxWidth) - 68) / 7;
  const friday = useRef<View>(null);
  const timeline = useRef<ScrollView>(null);
  const position = useRef(new Animated.ValueXY()).current;
  const dropBounds = useRef<{ x: number; y: number; width: number; height: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const active = snapshot.choices.nightOut;
  const weather = WEATHER[selectedDay.weather];

  const responder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onMoveShouldSetPanResponder: (_, gesture) => !active && (Math.abs(gesture.dx) > 6 || Math.abs(gesture.dy) > 6),
    onMoveShouldSetPanResponderCapture: (_, gesture) => !active && (Math.abs(gesture.dx) > 6 || Math.abs(gesture.dy) > 6),
    onPanResponderGrant: () => {
      setDragging(true);
      onDragChange(true);
      timeline.current?.scrollTo({ x: 0, animated: false });
      requestAnimationFrame(() => friday.current?.measureInWindow((x, y, measuredWidth, height) => {
        dropBounds.current = { x, y, width: measuredWidth, height };
      }));
    },
    onPanResponderMove: (_, gesture) => position.setValue({ x: gesture.dx, y: gesture.dy }),
    onPanResponderRelease: (_, gesture) => {
      const bounds = dropBounds.current;
      if (bounds && gesture.moveX >= bounds.x - 12 && gesture.moveX <= bounds.x + bounds.width + 12 && gesture.moveY >= bounds.y - 12 && gesture.moveY <= bounds.y + bounds.height + 12) onScenario(true);
      setDragging(false);
      onDragChange(false);
      Animated.spring(position, { toValue: { x: 0, y: 0 }, useNativeDriver: false, friction: 8 }).start();
    },
    onPanResponderTerminate: () => { setDragging(false); onDragChange(false); position.setValue({ x: 0, y: 0 }); },
    onPanResponderTerminationRequest: () => false,
  }), [active, onDragChange, onScenario, position]);

  return <View style={styles.section}>
    <View style={styles.sectionHeading}>
      <T bold accessibilityRole="header" style={styles.heading}>Jouw financieel weer</T>
      <View style={styles.horizon}><T bold style={styles.horizonText}>14 dagen</T></View>
    </View>
    <View style={styles.card}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width="100%" height="100%" preserveAspectRatio="none">
          <Defs><LinearGradient id="sky" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#F0FAFF" /><Stop offset="1" stopColor="#E2F3FB" /></LinearGradient></Defs>
          <Rect width="100%" height="100%" fill="url(#sky)" /><Circle cx="100%" cy="0" r="150" fill="#FFFFFF" opacity=".32" />
        </Svg>
      </View>
      <View style={styles.hero}>
        <T style={styles.date}>{dateLabel(selectedDay.date)}</T>
        <View style={styles.heroRow}>
          <View style={styles.heroCopy}>
            <T bold style={styles.heroTitle}>{weather.title}</T>
            <T style={styles.heroDescription}>{selectedDay.summary}</T>
          </View>
          <View style={styles.weatherArt}><WeatherIcon type={selectedDay.weather} size={108} /></View>
        </View>
        {snapshot.season && <View style={styles.season}><Icon name="graduation" color={Bank.blueDark} size={16} /><T bold style={{ fontSize: 12, color: Bank.blueDark }}>{snapshot.season}</T></View>}
      </View>

      <ScrollView ref={timeline} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.timeline} scrollEnabled={!dragging}>
        {snapshot.forecast.map((day, index) => {
          const selected = selectedDay.date === day.date;
          return <View ref={day.dayIndex === 4 ? friday : undefined} key={day.date} collapsable={false}>
            <Pressable testID={`forecast-day-${day.dayIndex}`} accessibilityRole="button" accessibilityLabel={`${dateLabel(day.date)}, ${WEATHER[day.weather].label}, ${euro(day.balance)}`} accessibilityState={{ selected }} onPress={() => onSelect(day)} style={({ pressed }) => [styles.day, { width: dayWidth }, selected && styles.selectedDay, dragging && day.dayIndex === 4 && styles.dropDay, pressed && { opacity: 0.6 }]}>
              <T bold={selected} style={[styles.dayName, selected && { color: Bank.blueDark }]}>{index === 0 ? 'Vandaag' : dateLabel(day.date, { weekday: 'short' }).replace('.', '')}</T>
              <WeatherIcon type={day.weather} size={31} />
              <T style={styles.dayNumber}>{dateLabel(day.date, { day: 'numeric' })}</T>
            </Pressable>
          </View>;
        })}
      </ScrollView>

      <Pressable accessibilityRole="button" accessibilityLabel="Waarom zie ik dit weer?" testID="weather-explanation" onPress={onExplain} style={({ pressed }) => [styles.forecastFooter, pressed && { opacity: 0.6 }]}>
        <View><T style={styles.balanceLabel}>Verwacht beschikbaar</T><T bold style={styles.balanceValue}>€ {euro(selectedDay.balance, false)}</T></View>
        <View style={styles.why}><T bold style={styles.whyText}>Waarom dit weer?</T><Icon name="info" size={16} color={Bank.blueDark} /></View>
      </Pressable>
    </View>

    {snapshot.personaId === 'lotte' && snapshot.step === 0 && <View style={styles.scenarios}>
      <View style={styles.scenarioHeading}><T bold style={styles.scenarioTitle}>Jij kiest het weer</T><T style={styles.scenarioHint}>{dragging ? 'Laat los op vrijdag' : active ? 'Je scenario is meegerekend' : 'Tik of sleep naar vrijdag'}</T></View>
      <Animated.View {...responder.panHandlers} style={[styles.scenarioWrap, { transform: position.getTranslateTransform() }, dragging && styles.dragging]}>
        <Pressable testID="night-out-scenario" accessibilityRole="button" accessibilityLabel={active ? 'Verwijder scenario vrijdag uitgaan 60 euro' : 'Probeer scenario vrijdag uitgaan 60 euro'} accessibilityState={{ selected: active }} onPress={() => onScenario(!active)} style={({ pressed }) => [styles.scenario, active && styles.scenarioActive, pressed && !dragging && { opacity: 0.7 }]}>
          <View style={styles.scenarioIcon}><Icon name={active ? 'check' : 'plus'} size={20} color={Bank.blueDark} /></View>
          <View style={{ flex: 1 }}><T bold style={{ fontSize: 14 }}>Vrijdag uitgaan</T><T style={{ fontSize: 11, lineHeight: 16, color: Bank.muted }}>{active ? 'Zondag schijnt de zon weer' : 'Een avondje voor jezelf'}</T></View>
          <T bold style={styles.scenarioAmount}>€60</T><Icon name={active ? 'close' : 'grip'} color={Bank.muted} size={17} />
        </Pressable>
      </Animated.View>
    </View>}
    <View style={styles.reassurance}><Icon name="shield" size={13} color={Bank.muted} /><T style={styles.reassuranceText}>Een voorspelling. Jij houdt de regie.</T></View>
  </View>;
}

const styles = StyleSheet.create({
  section: { marginHorizontal: 16, marginTop: 23, zIndex: 2 },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13, gap: 8 },
  heading: { fontSize: 21, lineHeight: 27, letterSpacing: -0.4 },
  horizon: { backgroundColor: Bank.pale, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  horizonText: { fontSize: 11, color: Bank.muted },
  card: { borderRadius: 22, overflow: 'hidden', borderWidth: 1, borderColor: '#DEEFF7' },
  hero: { padding: 19, paddingBottom: 13 },
  date: { fontSize: 11, lineHeight: 16, color: Bank.muted, textTransform: 'uppercase', letterSpacing: 0.8 },
  heroRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 0 },
  heroCopy: { flex: 1, zIndex: 1 },
  heroTitle: { fontSize: 25, lineHeight: 28, letterSpacing: -0.6, maxWidth: 220 },
  heroDescription: { marginTop: 10, fontSize: 12, lineHeight: 18, color: '#4E718F' },
  weatherArt: { width: 94, alignItems: 'center', marginRight: -7, marginLeft: 2 },
  season: { marginTop: 12, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 20, backgroundColor: '#FFFFFFA8', paddingHorizontal: 10, paddingVertical: 4 },
  timeline: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 14 },
  day: { minHeight: 83, alignItems: 'center', paddingVertical: 8, gap: 3, borderRadius: 12, borderWidth: 1, borderColor: 'transparent' },
  selectedDay: { backgroundColor: '#FFFFFF', borderColor: '#D5EAF6', boxShadow: '0 3px 8px rgba(40, 98, 126, 0.05)' },
  dropDay: { backgroundColor: '#CAECFB', borderColor: Bank.blue, borderStyle: 'dashed' },
  dayName: { fontSize: 10, lineHeight: 14, color: '#567C97' },
  dayNumber: { fontSize: 10, lineHeight: 13, color: '#6C8BA0' },
  forecastFooter: { minHeight: 65, borderTopWidth: 1, borderColor: '#D9EBF4', marginHorizontal: 18, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 5 },
  balanceLabel: { fontSize: 10, lineHeight: 15, color: Bank.muted },
  balanceValue: { fontSize: 16, lineHeight: 23 },
  why: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  whyText: { fontSize: 11, color: Bank.blueDark },
  scenarios: { marginTop: 16, zIndex: 3 },
  scenarioHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 5, marginBottom: 9 },
  scenarioTitle: { fontSize: 13 },
  scenarioHint: { fontSize: 10, color: Bank.muted },
  scenarioWrap: { zIndex: 5 },
  dragging: { zIndex: 99, boxShadow: '0 10px 25px rgba(0, 90, 135, .17)' },
  scenario: { borderWidth: 1, borderStyle: 'dashed', borderColor: '#BDDDEB', borderRadius: 15, padding: 11, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FBFDFF' },
  scenarioActive: { backgroundColor: '#F0FAFF', borderStyle: 'solid', borderColor: '#7ACAE9' },
  scenarioIcon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E7F5FC' },
  scenarioAmount: { fontSize: 16, color: Bank.blueDark },
  reassurance: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingTop: 12 },
  reassuranceText: { fontSize: 10, color: Bank.muted },
});
