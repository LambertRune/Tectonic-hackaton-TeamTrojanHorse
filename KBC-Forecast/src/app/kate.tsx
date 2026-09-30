import { router } from 'expo-router';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeInDown, ReduceMotion, useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/bank/icons';
import { KateAvatar, Message, MiniWeek, Typing, UserMessage } from '@/components/bank/kate-chat';
import { IconButton, Pill, SubHeader, T } from '@/components/bank/ui';
import { Color, Font, hitSlopFor, Space } from '@/constants/bank-theme';
import { forecast } from '@/data/demo';
import { useDemo } from '@/hooks/use-demo';
import { useScenes } from '@/hooks/use-scenes';

const PARTS = 5;

/** Scene 4: Saturday morning. Kate reassures Lotte after Friday's night out and replans the week. */
export default function KateScreen() {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const { goStart } = useScenes();
  const { choices, setChoice, notify } = useDemo();
  const scroll = useRef<ScrollView>(null);
  const [shown, setShown] = useState(reduceMotion ? PARTS : 0);
  const [typing, setTyping] = useState(false);
  const [draft, setDraft] = useState('');
  const [asked, setAsked] = useState<string[]>([]);

  // The chat is Saturday: Friday's night out happened. The mockup switches it on when entering this scene.
  useEffect(() => { setChoice('uitgaan', true); }, [setChoice]);

  useEffect(() => {
    if (reduceMotion) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    let t = 150;
    for (let index = 0; index < PARTS; index++) {
      if (index >= 2) { timers.push(setTimeout(() => setTyping(true), t)); t += 700; }
      timers.push(setTimeout(() => { setTyping(false); setShown(index + 1); }, t));
      t += index < 2 ? 250 : 500;
    }
    return () => timers.forEach(clearTimeout);
  }, [reduceMotion]);

  const before = forecast({ uitgaan: false, gsm: false, sparen: choices.sparen });
  const after = forecast({ uitgaan: true, gsm: false, sparen: choices.sparen });

  const parts: { key: string; node: ReactNode }[] = [
    { key: 'head', node: <View><T style={styles.chatDay}>Vandaag</T><T style={styles.chatAi}>Vraag het aan Kate, je AI-assistent ✦</T></View> },
    { key: 'hi', node: <View><KateAvatar /><Message>Goeiemorgen Lotte ☀️</Message></View> },
    { key: 'storm', node: <Message>Gisteren was het onweer, maar na regen komt zonneschijn. Ik heb je week al herschikt, je hoeft niets te doen.</Message> },
    { key: 'week', node: <MiniWeek before={before} after={after} /> },
    { key: 'goal', node: <View>
      <Message>Je droom Lissabon blijft op schema. Vandaag iets rustiger, vanaf morgen weer zon.</Message>
      <View style={styles.pills}>
        <Pill testID="chat-forecast" size="sm" label="Toon mijn weerbericht" onPress={() => router.push('/weerbericht')} />
        <Pill testID="chat-why" size="sm" label="Waarom zie ik dit?" onPress={() => { router.push('/weerbericht'); router.push('/waarom'); }} />
        <Pill size="sm" label="Geen ochtendberichten na uitgaan" onPress={() => notify('Begrepen. Geen ochtendberichten meer na een avond uit.')} />
      </View>
    </View> },
  ];

  const send = () => {
    const question = draft.trim();
    if (!question) return;
    setAsked(previous => [...previous, question]);
    setDraft('');
  };

  return <KeyboardAvoidingView style={[styles.screen, { paddingTop: insets.top }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <SubHeader title="Kate" onBack={goStart} right={<IconButton name="close" label="Sluit Kate" size={24} color={Color.blue} onPress={goStart} />} />
    <ScrollView ref={scroll} style={{ flex: 1 }} contentContainerStyle={styles.chat} showsVerticalScrollIndicator={false} onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: !reduceMotion })}>
      {parts.slice(0, shown).map(part => <Animated.View key={part.key} entering={FadeInDown.duration(450).reduceMotion(ReduceMotion.System)}>{part.node}</Animated.View>)}
      {typing && <Typing />}
      {asked.map((question, index) => <Animated.View key={index} entering={FadeInDown.duration(300).reduceMotion(ReduceMotion.System)}>
        <UserMessage>{question}</UserMessage>
        <KateAvatar />
        <Message>Goeie vraag. In deze demo antwoord ik alleen via de knoppen hierboven.</Message>
      </Animated.View>)}
    </ScrollView>
    <View style={[styles.input, { marginBottom: Math.max(insets.bottom, Space.lg) + 14 }]}>
      <TextInput testID="chat-input" accessibilityLabel="Schrijf hier je vraag aan Kate" placeholder="Schrijf hier je vraag" placeholderTextColor={Color.muted} value={draft} onChangeText={setDraft} onSubmitEditing={send} returnKeyType="send" maxLength={250} style={styles.field} />
      <Pressable accessibilityRole="button" accessibilityLabel={draft.trim() ? 'Verstuur' : 'Spreek je vraag in'} onPress={() => draft.trim() ? send() : notify('Spraak is niet uitgewerkt in deze demo.')} hitSlop={hitSlopFor(42)} style={({ pressed }) => [styles.mic, pressed && { opacity: 0.7 }]}>
        <Icon name={draft.trim() ? 'up' : 'mic'} size={22} color={Color.onBlue} strokeWidth={draft.trim() ? 2.2 : 1.6} />
      </Pressable>
    </View>
  </KeyboardAvoidingView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Color.bg },
  chat: { paddingHorizontal: Space.lg, paddingBottom: Space.lg },
  chatDay: { textAlign: 'center', fontSize: 14, marginTop: Space.md },
  chatAi: { textAlign: 'center', color: Color.blue, fontSize: 14, marginTop: Space.xs, marginBottom: 18 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: Space.sm, marginVertical: Space.md },
  input: { marginHorizontal: Space.lg, height: 50, borderRadius: 25, borderWidth: 1, borderColor: Color.switchOff, flexDirection: 'row', alignItems: 'center', paddingLeft: 18, paddingRight: 5 },
  field: { flex: 1, height: '100%', color: Color.text, fontSize: 16, fontFamily: Font.regular },
  mic: { width: 42, height: 42, borderRadius: 21, backgroundColor: Color.blue, alignItems: 'center', justifyContent: 'center' },
});
