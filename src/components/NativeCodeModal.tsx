import React, { useState } from 'react';
import { Code2, Copy, Check, X, Smartphone } from 'lucide-react';
import { SWIFT_UI_CODE, ANDROID_COMPOSE_CODE } from '../data/nativeCodeTemplates';
import { ThemePalette } from '../utils/themeUtils';

interface NativeCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  palette: ThemePalette;
}

export const NativeCodeModal: React.FC<NativeCodeModalProps> = ({
  isOpen,
  onClose,
  palette,
}) => {
  const [activeTab, setActiveTab] = useState<'ios' | 'android'>('ios');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentCode = activeTab === 'ios' ? SWIFT_UI_CODE : ANDROID_COMPOSE_CODE;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-4xl max-h-[88vh] rounded-2xl border ${palette.borderHairline} ${palette.canvasBg} ${palette.textPrimary} flex flex-col overflow-hidden shadow-2xl`}
      >
        <header
          className={`px-6 py-4 border-b ${palette.borderHairline} ${palette.surfaceBg} flex flex-wrap items-center justify-between gap-4`}
        >
          <div className="flex items-center gap-2.5">
            <Code2 className={`w-5 h-5 ${palette.accentText}`} />
            <div>
              <h2 className="text-base font-display font-semibold">
                Native iOS (SwiftUI) & Android (Jetpack Compose) Full Source Code
              </h2>
              <p className={`text-xs ${palette.textMuted}`}>
                Production-ready native vertical paging & OLED eye-care implementations for Xcode and Android Studio
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className={`p-1 rounded-lg border ${palette.borderHairline} ${palette.elevatedBg} flex items-center gap-1`}>
              <button
                type="button"
                onClick={() => setActiveTab('ios')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                  activeTab === 'ios'
                    ? 'bg-amber-500 text-slate-950 font-semibold'
                    : palette.textSecondary
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>iOS 18 (SwiftUI)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('android')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                  activeTab === 'android'
                    ? 'bg-amber-500 text-slate-950 font-semibold'
                    : palette.textSecondary
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Android 15 (Kotlin Compose)</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              className={`min-h-[38px] px-3 rounded-lg border ${palette.borderHairline} ${palette.elevatedBg} text-xs font-medium flex items-center gap-1.5`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className={`min-h-[38px] min-w-[38px] rounded-lg border ${palette.borderHairline} ${palette.elevatedBg} flex items-center justify-center`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 bg-[#05070B] text-slate-200 font-mono text-xs leading-relaxed">
          <pre className="whitespace-pre-wrap break-words select-all">{currentCode}</pre>
        </div>
      </div>
    </div>
  );
};
