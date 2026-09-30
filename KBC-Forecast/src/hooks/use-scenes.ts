import { router, usePathname, type Href } from 'expo-router';
import { useCallback } from 'react';

import { useDemo } from './use-demo';

export type SceneId = 'start' | 'detail' | 'lock' | 'chat' | 'rood';

export const SCENES: { id: SceneId; href: Href; path: string; title: string; subtitle: string }[] = [
  { id: 'start', href: '/', path: '/', title: 'Start', subtitle: 'Lotte, vrijdag 18:05' },
  { id: 'detail', href: '/weerbericht', path: '/weerbericht', title: 'Jij kiest het weer', subtitle: "14 dagen + scenario's" },
  { id: 'lock', href: '/zaterdag', path: '/zaterdag', title: 'Zaterdagochtend', subtitle: 'pushmelding van Kate' },
  { id: 'chat', href: '/kate', path: '/kate', title: 'Na regen komt zonneschijn', subtitle: 'Kate-chat' },
  { id: 'rood', href: '/code-rood', path: '/code-rood', title: 'Code rood', subtitle: 'Jos, 74' },
];

/** Scene navigation shared by the presenter panel, the gear sheet and keyboard shortcuts. */
export function useScenes() {
  const pathname = usePathname();
  const { reset } = useDemo();
  const current = SCENES.find(scene => scene.path === pathname)?.id ?? null;

  const goStart = useCallback(() => router.dismissTo('/'), []);
  const go = useCallback((id: SceneId) => {
    router.dismissTo('/');
    const scene = SCENES.find(item => item.id === id);
    if (scene && id !== 'start') router.push(scene.href);
  }, []);
  const resetDemo = useCallback(() => { reset(); router.dismissTo('/'); }, [reset]);

  return { current, go, goStart, resetDemo };
}
