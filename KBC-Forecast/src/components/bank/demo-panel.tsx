import { Pressable, StyleSheet, View } from 'react-native';

import { T } from './ui';
import { Color, Radius, Space, Touch } from '@/constants/bank-theme';
import { DISCLAIMER } from '@/data/demo';
import { SCENES, type SceneId } from '@/hooks/use-scenes';

/** Presenter panel from the mockup: pick a scene, reset the demo. */
export function DemoPanel({ current, onGo, onReset, compact }: { current: SceneId | null; onGo: (id: SceneId) => void; onReset: () => void; compact?: boolean }) {
  return <View style={styles.panel}>
    <T accessibilityRole="header" weight="extrabold" style={styles.title}>KBC Weerbericht</T>
    <T style={styles.intro}>{compact ? 'Kies een scène.' : 'Klikbare conceptmockup. Kies een scène, of druk op 1 tot 5.'}</T>
    <View style={{ gap: Space.sm }}>
      {SCENES.map((scene, index) => {
        const on = scene.id === current;
        return <Pressable key={scene.id} testID={`scene-${scene.id}`} accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityLabel={`Scène ${index + 1}: ${scene.title}, ${scene.subtitle}`} onPress={() => onGo(scene.id)} style={({ pressed }) => [styles.scene, on && styles.sceneOn, pressed && { opacity: 0.7 }]}>
          <View style={[styles.number, on && styles.numberOn]}><T weight="semibold" style={{ fontSize: 12, color: on ? '#051018' : Color.text }}>{index + 1}</T></View>
          <View style={{ flex: 1 }}><T style={{ fontSize: 14 }}>{scene.title}</T><T style={styles.small}>{scene.subtitle}</T></View>
        </Pressable>;
      })}
    </View>
    <Pressable testID="reset-demo" accessibilityRole="button" onPress={onReset} style={({ pressed }) => [styles.scene, { justifyContent: 'center' }, pressed && { opacity: 0.7 }]}>
      <T style={{ fontSize: 14, color: Color.muted }}>Demo resetten</T>
    </Pressable>
    <T style={styles.disclaimer}>{DISCLAIMER}</T>
  </View>;
}

const styles = StyleSheet.create({
  panel: { gap: 10 },
  title: { fontSize: 20, lineHeight: 24 },
  intro: { fontSize: 13, lineHeight: 19.5, color: Color.muted },
  scene: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: Touch, paddingVertical: 10, paddingHorizontal: 12, borderRadius: Radius.md, backgroundColor: '#12171C', borderWidth: 1, borderColor: '#1E262E' },
  sceneOn: { borderColor: Color.blue, backgroundColor: '#0E2231' },
  number: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#1E262E', alignItems: 'center', justifyContent: 'center' },
  numberOn: { backgroundColor: Color.blue },
  small: { fontSize: 12, color: Color.muted },
  disclaimer: { fontSize: 11.5, lineHeight: 16, color: Color.dim, marginTop: 6 },
});
