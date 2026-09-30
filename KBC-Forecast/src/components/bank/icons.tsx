import type { ReactNode } from 'react';
import Svg, { Circle, Ellipse, G, Line, Path, Rect } from 'react-native-svg';

import { Color } from '@/constants/bank-theme';
import type { WeatherType } from '@/data/demo';

// Line icons from the mockup (24×24 grid, 1.6 stroke). Everything decorative is hidden from screen readers;
// the pressable around an icon carries the accessibility label.
const glyphs = {
  gear: <><Circle cx="12" cy="12" r="3" /><Path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></>,
  search: <><Circle cx="11" cy="11" r="7" /><Path d="m20 20-3.5-3.5" /></>,
  bell: <><Path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><Path d="M10.3 21a1.9 1.9 0 0 0 3.4 0" /></>,
  wallet: <><Path d="M4 7h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7z" /><Path d="M4 7l11-3v3" /><Circle cx="16" cy="13.5" r=".8" fill="currentColor" /></>,
  news: <Path d="M5 3h15v18H5a2 2 0 0 1-2-2V7h2M5 3v16M9 7h7M9 11h7M9 15h5" />,
  house: <><Path d="M3 11 12 4l9 7" /><Path d="M5 10v10h14V10" /></>,
  sign: <Path d="M12 3v18M5 6h12l2 2-2 2H5zM19 13H7l-2 2 2 2h12z" />,
  star: <Path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />,
  plus: <><Circle cx="12" cy="12" r="9" /><Path d="M12 8v8M8 12h8" /></>,
  hex: <Path d="M9 5l3-2 3 2v3l-3 2-3-2zM4 12l3-2 3 2v3l-3 2-3-2zM14 12l3-2 3 2v3l-3 2-3-2zM9 17l3-2 3 2v3l-3 2-3-2z" />,
  coins: <><Ellipse cx="10" cy="8" rx="6" ry="2.5" /><Path d="M4 8v4c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5V8M4 12v4c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5v-4" /></>,
  swap: <Path d="M4 8h15M15 4l4 4-4 4M20 16H5M9 12l-4 4 4 4" />,
  list: <><Circle cx="4.5" cy="6" r="1.2" /><Circle cx="4.5" cy="12" r="1.2" /><Circle cx="4.5" cy="18" r="1.2" /><Rect x="8" y="4.5" width="13" height="3" rx="1.5" /><Rect x="8" y="10.5" width="13" height="3" rx="1.5" /><Rect x="8" y="16.5" width="13" height="3" rx="1.5" /></>,
  piggy: <><Path d="M19 10c1 .4 2 1.4 2 2.5v1.5h-2c-.6 1.6-1.8 2.8-3 3.4V20h-3v-2h-3v2H7v-2.8A6.5 6.5 0 0 1 11.5 6c2.4 0 4.6 1.2 5.8 3z" /><Path d="M13 4.5a2 2 0 0 1 3 1.5" /><Circle cx="16" cy="11" r=".6" fill="currentColor" /></>,
  layers: <><Path d="m12 3 9 5-9 5-9-5z" /><Path d="m3 12 9 5 9-5M3 16l9 5 9-5" /></>,
  back: <Path d="M20 12H4M10 6l-6 6 6 6" />,
  close: <Path d="M5 5l14 14M19 5 5 19" />,
  info: <><Circle cx="12" cy="12" r="9" /><Path d="M12 11v5M12 8h.01" /></>,
  mic: <><Rect x="9" y="3" width="6" height="11" rx="3" /><Path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></>,
  up: <Path d="m6 15 6-6 6 6" />,
  phone: <Path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />,
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof glyphs | 'wallet-filled' | 'coins-plus' | 'coins-minus' | 'shield' | 'storm-small';

export function Icon({ name, size = 24, color = Color.text, strokeWidth = 1.6 }: { name: IconName; size?: number; color?: string; strokeWidth?: number }) {
  const svg = (children: ReactNode, props: object = {}) => <Svg width={size} height={size} viewBox="0 0 24 24" {...props}>{children}</Svg>;
  switch (name) {
    case 'wallet-filled':
      return svg(<><Path d="M4 7h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7z" fill={color} /><Path d="M4 7l11-3v3" stroke={color} strokeWidth={1.6} fill="none" /><Circle cx="16" cy="13.5" r="1" fill={Color.tabBar} /></>);
    case 'coins-plus':
    case 'coins-minus':
      return svg(<G fill="none" stroke={color} strokeWidth={1.5}>{glyphs.coins}{name === 'coins-plus' ? <Path d="M19 3v4M17 5h4" /> : <Path d="M17 5h4" />}</G>);
    case 'shield':
      return svg(<><Path d="M12 3 4 6v6c0 5 3.4 8 8 9 4.6-1 8-4 8-9V6z" fill="#DC7507" /><Path d="M12 8v5M12 16h.01" stroke="#231300" strokeWidth={2} strokeLinecap="round" /></>);
    case 'storm-small':
      return svg(<><Path d="M7 16a4.5 4.5 0 1 1 1-8.9A6 6 0 0 1 19.5 9 3.5 3.5 0 0 1 18 16z" fill={Color.alertText} /><Path d="m13 13-3 5h3l-2 4" stroke={Color.red} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" /></>);
    default:
      return svg(<G fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">{glyphs[name]}</G>, { color });
  }
}

/** KBC "K" mark as used in the Kate logo. */
export function KateMark({ size = 16, color = Color.blue, badge = true }: { size?: number; color?: string; badge?: boolean }) {
  const mark = <G>
    <Rect x="1" y="2" width="8" height="1.4" rx=".7" fill={color} />
    <Rect x="2.5" y="4.3" width="5" height="1.4" rx=".7" fill={color} />
    <Rect x="1" y="6.6" width="8" height="1.4" rx=".7" fill={color} />
  </G>;
  if (!badge) return <Svg width={size} height={size} viewBox="0 0 10 10">{mark}</Svg>;
  // Mockup: 16 px light-blue disc with a 10 px mark, i.e. mark spans 10/16 of the badge.
  return <Svg width={size} height={size} viewBox="0 0 16 16">
    <Circle cx="8" cy="8" r="8" fill={Color.kateBubble} />
    <G transform="translate(3 3)">{mark}</G>
  </Svg>;
}

const CLOUD = 'M7 18a4.5 4.5 0 1 1 1-8.9A6 6 0 0 1 19.5 11 3.5 3.5 0 0 1 18 18z';

function Sun({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return <G>
    <G stroke={Color.yellow} strokeWidth={1.8} strokeLinecap="round">
      {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => {
        const rad = (angle * Math.PI) / 180;
        return <Line key={angle} x1={cx + Math.cos(rad) * (r + 2.5)} y1={cy + Math.sin(rad) * (r + 2.5)} x2={cx + Math.cos(rad) * (r + 5)} y2={cy + Math.sin(rad) * (r + 5)} />;
      })}
    </G>
    <Circle cx={cx} cy={cy} r={r} fill={Color.yellow} />
  </G>;
}

const bolt = (color: string, width: number) => <Path d="m13 12-3 5h3.5l-2 5" stroke={color} strokeWidth={width} fill="none" strokeLinecap="round" strokeLinejoin="round" />;

/** Weather glyphs from the mockup: flat, readable at 26 px in the week row. */
export function WeatherIcon({ type, size = 28 }: { type: WeatherType; size?: number }) {
  let body: ReactNode = null;
  if (type === 'sun') body = <Sun cx={12} cy={12} r={5} />;
  if (type === 'cloud') body = <><Sun cx={9} cy={8.5} r={3.6} /><Path d={CLOUD} fill="#C9D3DC" transform="translate(1.5 1.5) scale(.9)" /></>;
  if (type === 'rain') body = <><Path d={CLOUD} transform="translate(0 -3)" fill="#AFC0CF" /><Path d="M8 18l-1 3M12 18l-1 3M16 18l-1 3" stroke={Color.rain} strokeWidth={1.8} strokeLinecap="round" /></>;
  if (type === 'thunder') body = <><Path d={CLOUD} transform="translate(0 -3)" fill="#8997A5" />{bolt(Color.orange, 2)}</>;
  if (type === 'storm') body = <><Path d={CLOUD} transform="translate(0 -3)" fill="#5F6B77" />{bolt(Color.red, 2.2)}<Path d="M7 17l-1.5 3M18 17l-1.5 3" stroke={Color.rain} strokeWidth={1.8} strokeLinecap="round" /></>;
  if (type === 'rainbow') body = <G fill="none" strokeWidth={1.8}>
    <Path d="M3 17a9 9 0 0 1 18 0" stroke="#EE7079" /><Path d="M5.5 17a6.5 6.5 0 0 1 13 0" stroke={Color.yellow} />
    <Path d="M8 17a4 4 0 0 1 8 0" stroke={Color.green} /><Path d="M10.3 17a1.7 1.7 0 0 1 3.4 0" stroke={Color.rain} />
  </G>;
  return <Svg width={size} height={size} viewBox="0 0 24 24">{body}</Svg>;
}
