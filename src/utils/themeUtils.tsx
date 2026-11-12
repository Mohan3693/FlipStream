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
  accentSolid: string;
  chromeBg: string;
  isDark: boolean;
}

export const THEME_PALETTES: Record<ThemeId, ThemePalette> = {
  'gallery-stark': {
    id: 'gallery-stark',
    name: 'Daylight Studio',
    subtitle: 'Crisp alabaster cards with obsidian navigation bars',
    canvasBg: 'bg-[#F4F6F9]',
    surfaceBg: 'bg-[#FFFFFF]',
    elevatedBg: 'bg-[#EFF3F8]',
    textPrimary: 'text-[#111827]',
    textSecondary: 'text-[#4B5563]',
    textMuted: 'text-[#9CA3AF]',
    borderHairline: 'border-[#E5E7EB]',
    accentText: 'text-[#0284C7]',
    accentBg: 'bg-[#0284C7]/10 text-[#0284C7] border-[#0284C7]/25',
    accentSolid: 'bg-[#0284C7]',
    chromeBg: 'bg-[#0B0F17]',
    isDark: false,
  },
  'oled-midnight': {
    id: 'oled-midnight',
    name: 'Midnight OLED',
    subtitle: 'True deep black canvas with cool slate typography',
    canvasBg: 'bg-[#05070B]',
    surfaceBg: 'bg-[#0F141C]',
    elevatedBg: 'bg-[#18202C]',
    textPrimary: 'text-[#F3F4F6]',
    textSecondary: 'text-[#9CA3AF]',
    textMuted: 'text-[#6B7280]',
    borderHairline: 'border-[#1F2937]',
    accentText: 'text-[#38BDF8]',
    accentBg: 'bg-[#38BDF8]/15 text-[#38BDF8] border-[#38BDF8]/30',
    accentSolid: 'bg-[#0284C7]',
    chromeBg: 'bg-[#05070B]',
    isDark: true,
  },
  'eink-slate': {
    id: 'eink-slate',
    name: 'Nordic Graphite',
    subtitle: 'Soft low-contrast slate for extended reading',
    canvasBg: 'bg-[#12161F]',
    surfaceBg: 'bg-[#1A202C]',
    elevatedBg: 'bg-[#242C3D]',
    textPrimary: 'text-[#E2E8F0]',
    textSecondary: 'text-[#94A3B8]',
    textMuted: 'text-[#64748B]',
    borderHairline: 'border-[#2D3748]',
    accentText: 'text-[#38BDF8]',
    accentBg: 'bg-[#38BDF8]/15 text-[#38BDF8] border-[#38BDF8]/30',
    accentSolid: 'bg-[#0284C7]',
    chromeBg: 'bg-[#0D1117]',
    isDark: true,
  },
  'warm-sepia': {
    id: 'warm-sepia',
    name: 'Editorial Parchment',
    subtitle: 'Warm eye-soothing cream paper with espresso ink',
    canvasBg: 'bg-[#F4EFE6]',
    surfaceBg: 'bg-[#FAF7F2]',
    elevatedBg: 'bg-[#EAE3D5]',
    textPrimary: 'text-[#1F2421]',
    textSecondary: 'text-[#525B56]',
    textMuted: 'text-[#848C88]',
    borderHairline: 'border-[#E0D8C8]',
    accentText: 'text-[#0369A1]',
    accentBg: 'bg-[#0369A1]/10 text-[#0369A1] border-[#0369A1]/25',
    accentSolid: 'bg-[#0369A1]',
    chromeBg: 'bg-[#141413]',
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
