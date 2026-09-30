# Graph Report - Tectonic-hackaton-TeamTrojanHorse  (2026-09-30)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 174 nodes · 304 edges · 14 communities
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `194cd029`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Community 13

## God Nodes (most connected - your core abstractions)
1. `ThemedText()` - 16 edges
2. `react-native` - 16 edges
3. `ThemedView()` - 15 edges
4. `expo` - 13 edges
5. `useTheme()` - 9 edges
6. `TabTwoScreen()` - 7 edges
7. `HomeScreen()` - 7 edges
8. `WebBadge()` - 7 edges
9. `scripts` - 7 edges
10. `Spacing` - 7 edges

## Surprising Connections (you probably didn't know these)
- `CustomTabList()` --calls--> `ThemedText()`  [EXTRACTED]
  KBC-Forecast/src/components/app-tabs.web.tsx → KBC-Forecast/src/components/themed-text.tsx
- `CustomTabList()` --calls--> `ThemedView()`  [EXTRACTED]
  KBC-Forecast/src/components/app-tabs.web.tsx → KBC-Forecast/src/components/themed-view.tsx
- `TabButton()` --calls--> `ThemedText()`  [EXTRACTED]
  KBC-Forecast/src/components/app-tabs.web.tsx → KBC-Forecast/src/components/themed-text.tsx
- `TabButton()` --calls--> `ThemedView()`  [EXTRACTED]
  KBC-Forecast/src/components/app-tabs.web.tsx → KBC-Forecast/src/components/themed-view.tsx
- `TabTwoScreen()` --calls--> `ExternalLink()`  [EXTRACTED]
  KBC-Forecast/src/app/explore.tsx → KBC-Forecast/src/components/external-link.tsx

## Import Cycles
- None detected.

## Communities (14 total, 0 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.08
Nodes (24): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, predictiveBackGestureEnabled, reactCompiler, typedRoutes (+16 more)

### Community 1 - "Community 1"
Cohesion: 0.08
Nodes (24): dependencies, expo, expo-constants, expo-device, expo-font, expo-glass-effect, expo-image, expo-linking (+16 more)

### Community 2 - "Community 2"
Cohesion: 0.10
Nodes (20): devDependencies, @types/react, typescript, main, name, private, version, expo-constants (+12 more)

### Community 3 - "Community 3"
Cohesion: 0.14
Nodes (15): TabLayout(), AnimatedIcon(), AnimatedSplashOverlay(), glowKeyframe, keyframe, logoKeyframe, styles, AppTabs() (+7 more)

### Community 4 - "Community 4"
Cohesion: 0.19
Nodes (8): styles, ThemedTextProps, ThemedViewProps, BottomTabInset, Colors, Fonts, MaxContentWidth, ThemeColor

### Community 5 - "Community 5"
Cohesion: 0.17
Nodes (7): exampleDirPath, fs, oldDirs, path, readline, rl, root

### Community 6 - "Community 6"
Cohesion: 0.50
Nodes (7): styles, TabTwoScreen(), ThemedView(), Collapsible(), styles, useTheme(), expo-symbols

### Community 7 - "Community 7"
Cohesion: 0.42
Nodes (8): getDevMenuHint(), HomeScreen(), styles, HintRow(), ThemedText(), WebBadge(), expo-device, react-native-safe-area-context

### Community 8 - "Community 8"
Cohesion: 0.22
Nodes (5): glowKeyframe, keyframe, logoKeyframe, styles, react-native-reanimated

### Community 9 - "Community 9"
Cohesion: 0.25
Nodes (7): compilerOptions, paths, strict, extends, include, @/assets/*, expo/tsconfig.base

### Community 10 - "Community 10"
Cohesion: 0.29
Nodes (7): scripts, android, ios, lint, reset-project, start, web

### Community 11 - "Community 11"
Cohesion: 0.53
Nodes (5): AppTabs(), CustomTabList(), styles, TabButton(), ExternalLink()

### Community 12 - "Community 12"
Cohesion: 0.50
Nodes (3): HintRowProps, styles, Spacing

### Community 13 - "Community 13"
Cohesion: 0.50
Nodes (3): styles, expo, expo-image

## Knowledge Gaps
- **97 isolated node(s):** `HintRowProps`, `Props`, `ThemedTextProps`, `ThemedViewProps`, `backgroundColor` (+92 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 108 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `Community 1` to `Community 2`?**
  _High betweenness centrality (0.179) - this node is a cross-community bridge._
- **Why does `react-native` connect `Community 3` to `Community 2`, `Community 4`, `Community 6`, `Community 7`, `Community 8`, `Community 11`, `Community 12`, `Community 13`?**
  _High betweenness centrality (0.151) - this node is a cross-community bridge._
- **Why does `scripts` connect `Community 10` to `Community 2`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **What connects `HintRowProps`, `Props`, `ThemedTextProps` to the rest of the system?**
  _97 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.08333333333333333 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._