import React from 'react';
import { Wifi, Battery, Signal } from 'lucide-react';
import { DeviceMode } from '../services/rssService';
import { ThemePalette } from '../utils/themeUtils';

interface DeviceShellWrapperProps {
  deviceMode: DeviceMode;
  palette: ThemePalette;
  children: React.ReactNode;
}

export const DeviceShellWrapper: React.FC<DeviceShellWrapperProps> = ({
  deviceMode,
  palette,
  children,
}) => {
  if (deviceMode === 'responsive') {
    return <div className="w-full h-full overflow-hidden">{children}</div>;
  }

  const isIOS = deviceMode === 'ios';

  return (
    <div className="w-full h-full flex items-center justify-center p-2 sm:p-4 overflow-hidden">
      <div
        className={`relative w-full max-w-[412px] h-full max-h-[840px] flex flex-col overflow-hidden shadow-2xl transition-all duration-300 ${
          isIOS
            ? 'rounded-[46px] border-[10px] border-[#1E222B] ring-1 ring-white/15'
            : 'rounded-[34px] border-[8px] border-[#1A1D24] ring-1 ring-white/10'
        } ${palette.canvasBg}`}
      >
        {/* Top Native Mobile OS Status Bar */}
        <div
          className={`h-11 px-6 flex items-center justify-between text-[11px] font-mono-num shrink-0 select-none z-30 border-b ${palette.borderHairline} ${palette.canvasBg} ${palette.textPrimary}`}
        >
          <span className="font-semibold tracking-tight">09:41</span>

          {/* Hardware Cutout: iOS Dynamic Island vs Android Pixel Punch-Hole */}
          {isIOS ? (
            <div className="w-24 h-5 rounded-full bg-black border border-white/10 flex items-center justify-end px-2">
              <span className="w-2 h-2 rounded-full bg-indigo-950 border border-indigo-400/30" />
            </div>
          ) : (
            <div className="w-3.5 h-3.5 rounded-full bg-black border border-white/15" />
          )}

          <div className="flex items-center gap-1.5 opacity-85">
            <Signal className="w-3 h-3" />
            <Wifi className="w-3 h-3" />
            <Battery className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Main Viewport Content */}
        <div className="flex-1 min-h-0 relative overflow-hidden">{children}</div>

        {/* Bottom OS Home Gesture Indicator */}
        <div
          className={`h-5 flex items-center justify-center shrink-0 ${palette.canvasBg}`}
        >
          <div
            className={`rounded-full ${
              isIOS ? 'w-32 h-1' : 'w-24 h-1'
            } ${palette.isDark ? 'bg-slate-600/70' : 'bg-stone-400/70'}`}
          />
        </div>
      </div>
    </div>
  );
};
