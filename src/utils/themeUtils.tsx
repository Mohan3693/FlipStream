import React from 'react';
import { ThemeId } from '../services/rssService';

export interface ThemePalette {
  id: ThemeId;
  name: string;
  subtitle: string;
  canvasBg: string;
  surfaceBg: string;
  elevatedBg: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  borderHairline: string;
  accentText: string;
  accentBg: string;
  isDark: boolean;
}

export const THEME_PALETTES: Record<ThemeId, ThemePalette> = {
  'oled-midnight': {
    id: 'oled-midnight',
    name: 'Pure Midnight OLED',
    subtitle: 'True 0% black pixels with muted slate typography',
    canvasBg: 'bg-[#000000]',
    surfaceBg: 'bg-[#090B10]',
    elevatedBg: 'bg-[#121620]',
    textPrimary: 'text-[#E2E8F0]',
    textSecondary: 'text-[#94A3B8]',
    textMuted: 'text-[#64748B]',
    borderHairline: 'border-[#1E2532]',
    accentText: 'text-amber-400',
    accentBg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    isDark: true,
  },
  'warm-sepia': {
    id: 'warm-sepia',
    name: 'Archival Warm Sepia',
    subtitle: 'Low-glare alabaster parchment with charcoal ink',
    canvasBg: 'bg-[#F5F0E6]',
    surfaceBg: 'bg-[#EBE4D5]',
    elevatedBg: 'bg-[#E2D9C6]',
    textPrimary: 'text-[#1C1917]',
    textSecondary: 'text-[#44403C]',
    textMuted: 'text-[#78716C]',
    borderHairline: 'border-[#D6CEBE]',
    accentText: 'text-[#9A3412]',
    accentBg: 'bg-[#9A3412]/10 text-[#9A3412] border-[#9A3412]/25',
    isDark: false,
  },
  'eink-slate': {
    id: 'eink-slate',
    name: 'Soft Matte E-Ink',
    subtitle: 'Reduced contrast graphite canvas for extended sessions',
    canvasBg: 'bg-[#16181D]',
    surfaceBg: 'bg-[#1E2128]',
    elevatedBg: 'bg-[#262A33]',
    textPrimary: 'text-[#D1D5DB]',
    textSecondary: 'text-[#9CA3AF]',
    textMuted: 'text-[#6B7280]',
    borderHairline: 'border-[#2E333E]',
    accentText: 'text-sky-300',
    accentBg: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    isDark: true,
  },
  'gallery-stark': {
    id: 'gallery-stark',
    name: 'Daylight Gallery',
    subtitle: 'High-legibility paper white for bright outdoor light',
    canvasBg: 'bg-[#FAFAFA]',
    surfaceBg: 'bg-[#FFFFFF]',
    elevatedBg: 'bg-[#F3F4F6]',
    textPrimary: 'text-[#0F172A]',
    textSecondary: 'text-[#334155]',
    textMuted: 'text-[#64748B]',
    borderHairline: 'border-[#E2E8F0]',
    accentText: 'text-rose-700',
    accentBg: 'bg-rose-700/10 text-rose-800 border-rose-700/20',
    isDark: false,
  },
};

export function renderBionicText(text: string, enabled: boolean): React.ReactNode {
  if (!enabled) return text;
  const words = text.split(' ');
  return words.map((word, index) => {
    if (word.length <= 2) {
      return (
        <React.Fragment key={index}>
          <strong className="font-semibold">{word.slice(0, 1)}</strong>
          {word.slice(1)}{' '}
        </React.Fragment>
      );
    }
    const boldLen = Math.ceil(word.length * 0.42);
    return (
      <React.Fragment key={index}>
        <strong className="font-semibold">{word.slice(0, boldLen)}</strong>
        <span className="opacity-85">{word.slice(boldLen)}</span>{' '}
      </React.Fragment>
    );
  });
}
