import React from 'react';
import { Eye, Sun, Moon, Sparkles, Type, RotateCcw, X } from 'lucide-react';
import { EyeCareSettings, ThemeId } from '../services/rssService';
import { THEME_PALETTES, ThemePalette } from '../utils/themeUtils';

interface EyeCarePanelProps {
  eyeCare: EyeCareSettings;
  onUpdate: (patch: Partial<EyeCareSettings>) => void;
  onReset: () => void;
  palette: ThemePalette;
  onCloseModal?: () => void;
}

export const EyeCarePanel: React.FC<EyeCarePanelProps> = ({
  eyeCare,
  onUpdate,
  onReset,
  palette,
  onCloseModal,
}) => {
  const themeOrder: ThemeId[] = [
    'oled-midnight',
    'eink-slate',
    'warm-sepia',
    'gallery-stark',
  ];

  return (
    <div className={`flex flex-col gap-5 ${palette.textPrimary}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className={`w-4 h-4 ${palette.accentText}`} />
          <h3 className="text-sm font-semibold tracking-tight">
            Eye-Care & Theme Studio
          </h3>
        </div>
        {onCloseModal ? (
          <button
            type="button"
            onClick={onCloseModal}
            className={`min-h-[36px] min-w-[36px] rounded-lg border ${palette.borderHairline} flex items-center justify-center ${palette.textSecondary}`}
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onReset}
            title="Reset to Pure Midnight OLED Default"
            className={`text-xs ${palette.textMuted} hover:${palette.textPrimary} flex items-center gap-1 transition-colors`}
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* 1. Surface Palettes */}
      <div className="space-y-2">
        <label className={`text-xs font-medium ${palette.textSecondary} block`}>
          01. Surface Theme
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          {themeOrder.map((tId) => {
            const t = THEME_PALETTES[tId];
            const active = eyeCare.theme === tId;
            return (
              <button
                key={tId}
                type="button"
                onClick={() => onUpdate({ theme: tId })}
                className={`p-3 rounded-xl border text-left transition-colors ${
                  active
                    ? 'border-sky-500 bg-sky-500/10'
                    : `${palette.borderHairline} ${palette.canvasBg}`
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold truncate">{t.name}</span>
                  <span
                    className={`w-3.5 h-3.5 rounded-full border border-slate-500/40 shrink-0 ${
                      tId === 'oled-midnight'
                        ? 'bg-black'
                        : tId === 'warm-sepia'
                        ? 'bg-[#F6F4F0]'
                        : tId === 'eink-slate'
                        ? 'bg-[#1C202B]'
                        : 'bg-white'
                    }`}
                  />
                </div>
                <p className={`text-[11px] leading-tight line-clamp-2 ${palette.textMuted}`}>
                  {t.subtitle}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Optional Night-Shift Blue-Light Filter */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className={`font-medium flex items-center gap-1.5 ${palette.textSecondary}`}>
            <Sun className="w-3.5 h-3.5 text-sky-400" />
            <span>Blue-Light Reduction Filter</span>
          </span>
          <span className="font-mono-num text-sky-400 font-medium">
            {eyeCare.amberShieldPercent}%
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={65}
          step={5}
          value={eyeCare.amberShieldPercent}
          onChange={(e) => onUpdate({ amberShieldPercent: Number(e.target.value) })}
          className="w-full accent-sky-500 cursor-pointer h-1.5 rounded-lg"
        />
        <div className={`flex justify-between text-[11px] font-mono-num ${palette.textMuted}`}>
          <span>0% (Clean Default)</span>
          <span>25% (Soft)</span>
          <span>65% (Max Night)</span>
        </div>
      </div>

      {/* 3. Sub-Pixel Luminance Dimmer */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className={`font-medium flex items-center gap-1.5 ${palette.textSecondary}`}>
            <Moon className="w-3.5 h-3.5 text-sky-400" />
            <span>OLED Screen Dimmer</span>
          </span>
          <span className="font-mono-num">{eyeCare.dimmerPercent}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={45}
          step={5}
          value={eyeCare.dimmerPercent}
          onChange={(e) => onUpdate({ dimmerPercent: Number(e.target.value) })}
          className="w-full accent-sky-500 cursor-pointer h-1.5 rounded-lg"
        />
      </div>

      {/* 4. Typography & Scale */}
      <div className="space-y-2">
        <label className={`text-xs font-medium flex items-center gap-1.5 ${palette.textSecondary}`}>
          <Type className="w-3.5 h-3.5" />
          <span>02. Font Style & Text Size</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onUpdate({ fontFamily: 'sans' })}
            className={`min-h-[40px] px-3 py-1.5 rounded-lg border text-xs font-sans font-medium transition-colors ${
              eyeCare.fontFamily === 'sans'
                ? 'border-sky-500 bg-sky-500/15 text-sky-300'
                : `${palette.borderHairline} ${palette.canvasBg} ${palette.textSecondary}`
            }`}
          >
            Modern Sans
          </button>
          <button
            type="button"
            onClick={() => onUpdate({ fontFamily: 'serif' })}
            className={`min-h-[40px] px-3 py-1.5 rounded-lg border text-xs font-editorial font-medium transition-colors ${
              eyeCare.fontFamily === 'serif'
                ? 'border-sky-500 bg-sky-500/15 text-sky-300'
                : `${palette.borderHairline} ${palette.canvasBg} ${palette.textSecondary}`
            }`}
          >
            Book Serif
          </button>
        </div>

        <div className="grid grid-cols-4 gap-1.5 pt-1">
          {(['sm', 'md', 'lg', 'xl'] as const).map((sz) => (
            <button
              key={sz}
              type="button"
              onClick={() => onUpdate({ fontScale: sz })}
              className={`min-h-[38px] rounded-lg border text-xs font-mono-num uppercase transition-colors ${
                eyeCare.fontScale === sz
                  ? 'border-sky-500 bg-sky-500/15 text-sky-300 font-semibold'
                  : `${palette.borderHairline} ${palette.canvasBg} ${palette.textSecondary}`
              }`}
            >
              {sz}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Bionic Reading */}
      <div className={`pt-3 border-t ${palette.borderHairline}`}>
        <button
          type="button"
          onClick={() => onUpdate({ bionicReading: !eyeCare.bionicReading })}
          className={`w-full min-h-[42px] px-3 py-2 rounded-xl border flex items-center justify-between text-xs font-medium transition-colors ${
            eyeCare.bionicReading
              ? 'border-sky-500/60 bg-sky-500/15 text-sky-300'
              : `${palette.borderHairline} ${palette.canvasBg} ${palette.textSecondary}`
          }`}
        >
          <span className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Bionic Fast Reading</span>
          </span>
          <span className="font-mono-num uppercase">
            {eyeCare.bionicReading ? 'Active' : 'Off'}
          </span>
        </button>
      </div>
    </div>
  );
};
