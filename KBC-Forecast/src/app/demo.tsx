import { router } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DemoPanel } from '@/components/bank/demo-panel';
import { SheetFrame } from '@/components/bank/ui';
import { Color, Space } from '@/constants/bank-theme';
import { useScenes } from '@/hooks/use-scenes';

/** Gear sheet on Start: the presenter panel for phones, where there is no room for a side panel. */
export default function DemoSheet() {
  const insets = useSafeAreaInsets();
  const { go, resetDemo } = useScenes();
  return <SheetFrame background={Color.bg} onClose={() => router.back()}><View style={{ padding: Space.lg + 4, paddingBottom: insets.bottom + Space.xl }}>
    <DemoPanel compact current="start" onGo={go} onReset={resetDemo} />
  </View></SheetFrame>;
}
