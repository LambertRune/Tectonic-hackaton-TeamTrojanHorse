// KBC design tokens (kdl-design-tokens, kbc.be) as used by the KBC Mobile dark theme in
// Quinten's mockup. Nunito Sans stands in for the licensed MuseoSans.

export const Brand = {
  navy: '#0D2A50',
  deep: '#021E43',
  accent: '#0097DB',
  accentDark: '#007AB1',
  accentLight: '#46ADE0',
  yellow: '#FECC00',
  orange: '#F29400',
  red: '#E2001A',
  green: '#009036',
} as const;

export const Color = {
  backdrop: '#05080B',
  bg: '#111315',
  card: '#1E2022',
  card2: '#26292C',
  line: '#2C3034',
  field: '#1A1C1E',
  fieldLine: '#2A2D30',
  tabBar: '#141618',
  tabLine: '#1C1F22',
  text: '#F2F4F5',
  muted: '#A3AAB1',
  // Mockup uses #6F777F; raised so small print passes WCAG AA (5.2:1 on cards).
  dim: '#8A939B',
  tab: '#9AA0A6',
  blue: '#1A9FE4',
  onBlue: '#06131C',
  blueDark: Brand.navy,
  green: '#5BA215',
  positive: '#7ED957',
  teal: '#0E9E83',
  // Mockup uses teal for the "Nieuw" badge; white on it only reaches 3.4:1.
  tealBadge: '#0A7F69',
  yellow: '#E9C100',
  orange: '#F69D14',
  red: '#D64040',
  rain: '#74C8ED',
  chip: '#1D2A33',
  chipText: '#C9D1D9',
  chipSelected: '#E9E9E9',
  kateBubble: '#E6F6FF',
  userBubble: '#23313D',
  switchOff: '#3A3F44',
  closeChip: '#2A3238',
  emoji: '#2A2D30',
  track: '#2E3337',
  warnBg: '#3A1718',
  warnLine: '#6B2626',
  cautionBg: '#3A2A12',
  cautionLine: '#7A5310',
  cautionText: '#FFA663',
  gainBg: '#1E3A14',
  gainText: '#8CD656',
  alertText: '#FFB4B0',
  alertBody: '#F1D2D0',
  alertLine: '#8C2A2A',
  scrim: 'rgba(0,0,0,0.55)',
} as const;

export const Font = {
  light: 'NunitoSans_300Light',
  regular: 'NunitoSans_400Regular',
  semibold: 'NunitoSans_600SemiBold',
  bold: 'NunitoSans_700Bold',
  extrabold: 'NunitoSans_800ExtraBold',
} as const;

export type FontWeight = keyof typeof Font;

export const Space = { xxs: 2, xs: 4, sm: 8, md: 12, lg: 16, xl: 22, xxl: 30 } as const;

export const Radius = { sm: 6, md: 10, lg: 12, xl: 16, sheet: 20, pill: 999 } as const;

// Minimum touch target (Apple HIG 44pt, Material 48dp → 44 is the shared floor we enforce).
export const Touch = 44;

export const Layout = {
  // Phone frame used on wide web screens; the mockup phone is 390 × 844.
  phoneWidth: 390,
  phoneHeight: 844,
  gutter: 16,
  wideBreakpoint: 760,
} as const;

// Grows a visually small control to the 44pt touch target.
export const hitSlopFor = (width: number, height = width) => {
  const x = Math.max(0, (Touch - width) / 2);
  const y = Math.max(0, (Touch - height) / 2);
  return { top: y, bottom: y, left: x, right: x };
};
