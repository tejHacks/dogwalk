/**
 * Design tokens. Friendly sky blue with a fresh green accent, on soft surfaces.
 */
import { useColorScheme } from 'react-native';

import { brand } from './brand';

const palettes = {
  light: {
    bg: '#F5F8FB',
    card: '#FFFFFF',
    chip: '#E9EFF5',
    border: '#E1E8EF',
    text: '#0B1726',
    muted: '#4A5B6E',
    subtle: '#8695A6',
    primarySoft: '#E0F2FE',
    danger: '#C2410C',
    dangerBg: '#FFEDD5',
    warn: '#B45309',
    warnBg: '#FEF3C7',
    success: '#047857',
    successBg: '#D1FAE5',
  },
  dark: {
    bg: '#0A0F16',
    card: '#121A24',
    chip: '#1B2533',
    border: '#243142',
    text: '#EEF4FA',
    muted: '#A3B3C5',
    subtle: '#6B7C90',
    primarySoft: '#0C2A40',
    danger: '#FB923C',
    dangerBg: '#3A1A0A',
    warn: '#FBBF24',
    warnBg: '#3A2C08',
    success: '#34D399',
    successBg: '#0B3326',
  },
} as const;

export type Palette = Record<keyof (typeof palettes)['light'], string> & { primary: string; primaryText: string; accent: string };

export function usePalette(): Palette {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  return { ...palettes[scheme], ...brand.colors, ...(scheme === 'dark' ? { primary: '#38BDF8', primaryText: '#04121F' } : null) };
}

export const radius = { sm: 10, md: 16, lg: 22, pill: 999 } as const;
export const space = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;
