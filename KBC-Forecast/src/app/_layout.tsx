import {
  NunitoSans_300Light,
  NunitoSans_400Regular,
  NunitoSans_600SemiBold,
  NunitoSans_700Bold,
  NunitoSans_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/nunito-sans';
import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, type PropsWithChildren } from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { DemoPanel } from '@/components/bank/demo-panel';
import { Toast } from '@/components/bank/ui';
import { Color, Layout } from '@/constants/bank-theme';
import { DemoProvider, useDemo } from '@/hooks/use-demo';
import { SCENES, useScenes } from '@/hooks/use-scenes';

import '@/global.css';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

const theme = { ...DarkTheme, colors: { ...DarkTheme.colors, background: Color.bg, card: Color.bg, primary: Color.blue, text: Color.text } };

// Native: real form sheet. Web: transparent modal, the route draws its own sheet (see SheetFrame).
const sheet = (background: string) => Platform.OS === 'web'
  ? { presentation: 'transparentModal' as const, animation: 'none' as const, contentStyle: { backgroundColor: 'transparent' } }
  : { presentation: 'formSheet' as const, sheetAllowedDetents: 'fitToContents' as const, sheetGrabberVisible: true, sheetCornerRadius: 20, contentStyle: { backgroundColor: background } };

export default function RootLayout() {
  const [loaded, error] = useFonts({ NunitoSans_300Light, NunitoSans_400Regular, NunitoSans_600SemiBold, NunitoSans_700Bold, NunitoSans_800ExtraBold });

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync().catch(() => undefined);
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return <SafeAreaProvider>
    <DemoProvider>
      <ThemeProvider value={theme}>
        <StatusBar style="light" />
        <Frame>
          <Screens />
        </Frame>
      </ThemeProvider>
    </DemoProvider>
  </SafeAreaProvider>;
}

function Screens() {
  const reduceMotion = useReducedMotion();
  const { toast } = useDemo();
  return <>
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Color.bg }, animation: reduceMotion ? 'none' : 'default' }}>
      <Stack.Screen name="index" options={{ title: 'KBC Weerbericht' }} />
      <Stack.Screen name="weerbericht" options={{ title: 'Jouw weerbericht' }} />
      <Stack.Screen name="zaterdag" options={{ title: 'Zaterdagochtend', animation: reduceMotion ? 'none' : 'fade' }} />
      <Stack.Screen name="kate" options={{ title: 'Kate' }} />
      <Stack.Screen name="code-rood" options={{ title: 'Overschrijving' }} />
      <Stack.Screen name="waarom" options={{ title: 'Waarom zie ik dit?', ...sheet(Color.field) }} />
      <Stack.Screen name="demo" options={{ title: 'Demo-scènes', ...sheet(Color.bg) }} />
    </Stack>
    <Toast message={toast} />
  </>;
}

/** On wide web screens the app sits in a phone frame next to the presenter panel, like the mockup. */
function Frame({ children }: PropsWithChildren) {
  const { width, height } = useWindowDimensions();
  const wide = Platform.OS === 'web' && width >= Layout.wideBreakpoint;
  const { current, go, resetDemo } = useScenes();

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
      const index = Number(event.key) - 1;
      if (index >= 0 && index < SCENES.length) go(SCENES[index].id);
      if (event.key === 'r') resetDemo();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, resetDemo]);

  if (!wide) return <View style={styles.native}>{children}</View>;
  return <View style={styles.wide}>
    <View style={styles.panel}><DemoPanel current={current} onGo={go} onReset={resetDemo} /></View>
    <View style={[styles.phone, { height: Math.min(Layout.phoneHeight, height - 40) }]}>{children}</View>
  </View>;
}

const styles = StyleSheet.create({
  native: { flex: 1, backgroundColor: Color.bg },
  wide: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 40, backgroundColor: Color.backdrop },
  panel: { width: 260 },
  phone: { width: Layout.phoneWidth, borderRadius: 54, overflow: 'hidden', backgroundColor: Color.bg, boxShadow: '0 0 0 10px #1a1d20, 0 0 0 11px #2a2e33, 0 30px 80px rgba(0,0,0,.6)' },
});
