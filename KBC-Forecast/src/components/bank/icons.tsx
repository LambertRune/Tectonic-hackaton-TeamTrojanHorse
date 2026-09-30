import Svg, { Circle, Defs, Ellipse, G, Line, LinearGradient, Path, Polygon, Rect, Stop } from 'react-native-svg';

import { Bank } from '@/constants/bank-theme';
import type { WeatherType } from '@/data/demo';

const paths = {
  wallet: 'M19 7H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2ZM4 7V5l13-3v3M17 14h.01',
  piggy: 'M7 5a4 4 0 0 1 7-1M5 8C2 8 2 12 4 13l1 4 2 1v3h3l1-2h5l1 2h3v-4l2-2v-5h-3l-2-3 1-4-5 3H9a7 7 0 0 0-4 2ZM16 10h.01',
  settings: 'm9 3 1-2h4l1 2 3 2 2-.2 2 3-1 2v4l1 2-2 3-2-.2-3 2-1 2h-4l-1-2-3-2-2 .2-2-3 1-2v-4l-1-2 2-3 2 .2 3-2ZM16 12a4 4 0 1 0-8 0 4 4 0 0 0 8 0Z',
  search: 'M16 16l5 5M18 10a8 8 0 1 0-16 0 8 8 0 0 0 16 0Z',
  bell: 'M5 9a7 7 0 0 1 14 0v7l2 3H3l2-3V9ZM9 22h6',
  home: 'm2 10 10-8 10 8M5 8v13h5v-7h4v7h5V8',
  news: 'M7 3h14v18H5a2 2 0 0 1-2-2V6h4M7 3v16M10 7h8v5h-8ZM10 16h8',
  directions: 'M12 2v20M4 5h14l3 3-3 3H4V5ZM20 14H6l-3 3 3 3h14v-6Z',
  list: 'M8 5h13M8 12h13M8 19h13M3 5h.01M3 12h.01M3 19h.01',
  layers: 'm12 2 10 5-10 5L2 7l10-5ZM2 12l10 5 10-5M2 17l10 5 10-5',
  transfer: 'M3 7h18l-5-5M21 17H3l5 5M21 7l-5 5M3 17l5-5',
  up: 'm5 15 7-7 7 7',
  down: 'm5 9 7 7 7-7',
  right: 'm9 5 7 7-7 7',
  arrow: 'M3 12h18m-7-7 7 7-7 7',
  close: 'm6 6 12 12M6 18 18 6',
  plus: 'M12 5v14M5 12h14',
  check: 'm5 12 4 4L19 6',
  edit: 'm15 4 5 5M4 15 16 3l5 5L9 20l-6 1 1-6ZM3 23h18',
  info: 'M12 11v6M12 7h.01M22 12a10 10 0 1 0-20 0 10 10 0 0 0 20 0Z',
  shield: 'M12 2 3 6v6c0 5 9 10 9 10s9-5 9-10V6l-9-4Zm-5 10 3 3 7-7',
  calendar: 'M7 2v4M17 2v4M3 9h18M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2ZM7 13h2M15 13h2M7 17h2',
  reset: 'M3 10a9 9 0 1 1 1 8M3 3v7h7',
  play: 'm8 4 12 8-12 8V4Z',
  heart: 'M12 21 3 12C-3 4 7-2 12 6c5-8 15-2 9 6l-9 9Z',
  graduation: 'm1 8 11-5 11 5-11 5L1 8ZM5 10v7c4 4 10 4 14 0v-7M23 8v9',
  headphones: 'M3 13V11a9 9 0 0 1 18 0v7M3 13h4v8H3v-8Zm14 0h4v8h-4v-8Z',
  airplane: 'm22 2-8 20-4-8-8-4L22 2ZM10 14 22 2',
  lock: 'M6 10V7a6 6 0 0 1 12 0v3M4 10h16v12H4V10ZM12 15v3',
  grip: 'M8 5h.01M16 5h.01M8 12h.01M16 12h.01M8 19h.01M16 19h.01',
} as const;

export type IconName = keyof typeof paths | 'kate';

export function Icon({ name, size = 24, color = Bank.navy, strokeWidth = 1.7 }: { name: IconName; size?: number; color?: string; strokeWidth?: number }) {
  if (name === 'kate') return (
    <Svg width={size} height={size} viewBox="0 0 32 32" accessible={false}>
      <Circle cx="16" cy="16" r="14.5" fill="#F8FDFF" stroke="#B2E3F5" strokeWidth="1.5" />
      <Circle cx="16" cy="16" r="12.5" fill="none" stroke="#E1F5FC" />
      <G stroke={color === Bank.navy ? Bank.blue : color} strokeWidth="2" strokeLinecap="round">
        <Line x1="14" y1="9" x2="17" y2="9" /><Line x1="11" y1="13" x2="20" y2="13" />
        <Line x1="9" y1="17" x2="22" y2="17" /><Line x1="13" y1="21" x2="18" y2="21" /><Line x1="15" y1="24" x2="16" y2="24" />
      </G>
    </Svg>
  );
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" accessible={false}><Path d={paths[name]} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
}

export function WeatherIcon({ type, size = 48 }: { type: WeatherType; size?: number }) {
  const showSun = type === 'sun' || type === 'cloud' || type === 'rainbow';
  const showCloud = !['sun', 'fog', 'rainbow'].includes(type);
  const dark = type === 'storm' || type === 'thunder';
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" accessible={false}>
      <Defs>
        <LinearGradient id={`sun-${type}`} x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#FFDC85" /><Stop offset="1" stopColor="#F6AD36" /></LinearGradient>
        <LinearGradient id={`cloud-${type}`} x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor={dark ? '#9DA8CC' : '#FFFFFF'} /><Stop offset="1" stopColor={dark ? '#6677A5' : '#D4E7F1'} /></LinearGradient>
      </Defs>
      {showSun && <G transform={type === 'cloud' ? 'translate(-4,-7) scale(.82)' : ''}>
        <Circle cx="50" cy="47" r="36" fill="#FFC954" opacity=".10" />
        <G stroke="#F2B946" strokeWidth="3" strokeLinecap="round">
          {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => <Line key={angle} x1="50" y1="8" x2="50" y2="14" transform={`rotate(${angle} 50 47)`} />)}
        </G>
        <Circle cx="50" cy="47" r="24" fill={`url(#sun-${type})`} />
        <Path d="M34 40a18 18 0 0 1 18-12" stroke="#FFF0C6" strokeWidth="3" strokeLinecap="round" fill="none" />
      </G>}
      {showCloud && <G>
        <Ellipse cx="53" cy="77" rx="31" ry="5" fill="#193D62" opacity=".06" />
        <Path d="M26 72a16 16 0 0 1-2-32 25 25 0 0 1 47-8 20 20 0 0 1 6 40Z" fill={`url(#cloud-${type})`} />
        <Path d="M27 45a20 20 0 0 1 36-9" fill="none" stroke={dark ? '#C1C9E0' : '#FFF'} strokeWidth="3" strokeLinecap="round" />
      </G>}
      {(type === 'rain' || type === 'storm') && <G stroke="#329DCE" strokeWidth="4" strokeLinecap="round"><Line x1="31" y1="79" x2="27" y2="88" /><Line x1="51" y1="79" x2="47" y2="88" /><Line x1="71" y1="79" x2="67" y2="88" /></G>}
      {(type === 'thunder' || type === 'storm') && <Path d="m52 59-11 20h12l-5 16 21-25H56l7-11Z" fill="#FFD15D" stroke="#EAB846" strokeWidth="1" strokeLinejoin="round" />}
      {type === 'fog' && <G stroke="#9FB6C4" strokeWidth="6" strokeLinecap="round"><Line x1="22" y1="31" x2="76" y2="31" /><Line x1="13" y1="46" x2="84" y2="46" /><Line x1="21" y1="61" x2="72" y2="61" /><Line x1="31" y1="76" x2="79" y2="76" /></G>}
      {type === 'rainbow' && <G fill="none" strokeWidth="7" strokeLinecap="round"><Path d="M13 79a37 37 0 0 1 74 0" stroke="#EAA2A0" /><Path d="M21 79a29 29 0 0 1 58 0" stroke="#FFD47E" /><Path d="M29 79a21 21 0 0 1 42 0" stroke="#81C8BE" /><Path d="M37 79a13 13 0 0 1 26 0" stroke="#9AC8E8" /></G>}
    </Svg>
  );
}

export function CardPattern() {
  return <Svg width="100%" height="100%" viewBox="0 0 180 120" preserveAspectRatio="xMidYMid slice" accessible={false}>
    <Rect width="180" height="120" fill="#35BFEA" />
    <Polygon points="0,0 85,0 19,90" fill="#6DD1EE" /><Polygon points="85,0 180,0 104,64" fill="#51C8ED" />
    <Polygon points="0,70 104,64 68,120 0,120" fill="#00AFE3" /><Polygon points="104,64 180,33 180,120 138,120" fill="#5DD0EF" />
    <Polygon points="85,0 104,64 19,90" fill="#21B6E7" opacity=".65" /><Polygon points="104,64 138,120 68,120" fill="#49C4EB" />
  </Svg>;
}
