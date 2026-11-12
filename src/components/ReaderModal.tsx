import React from 'react';
import {
  X,
  Bookmark,
  ExternalLink,
  Type,
  Sparkles,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { NewsArticle, EyeCareSettings } from '../services/rssService';
import { ThemePalette, renderBionicText } from '../utils/themeUtils';
import { SourceImage } from './SourceImage';

interface ReaderModalProps {
  article: NewsArticle | null;
  onClose: () => void;
  bookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  eyeCare: EyeCareSettings;
  onUpdateEyeCare: (patch: Partial<EyeCareSettings>) => void;
  palette: ThemePalette;
  onPrevArticle?: () => void;
  onNextArticle?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export const ReaderModal: React.FC<ReaderModalProps> = ({
  article,
  onClose,
  bookmarked,
  onToggleBookmark,
  eyeCare,
  onUpdateEyeCare,
  palette,
  onPrevArticle,
  onNextArticle,
  hasPrev,
  hasNext,
}) => {
  if (!article) return null;

  const proseSizeClass =
    eyeCare.fontScale === 'sm'
      ? 'text-[15px] leading-[1.75]'
      : eyeCare.fontScale === 'lg'
      ? 'text-[19px] leading-[1.85]'
      : eyeCare.fontScale === 'xl'
      ? 'text-[22px] leading-[1.9]'
      : 'text-[17px] leading-[1.8]';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full h-full sm:h-[92vh] sm:max-w-3xl sm:rounded-2xl border ${palette.borderHairline} ${palette.canvasBg} ${palette.textPrimary} flex flex-col overflow-hidden shadow-2xl`}
      >
        {/* Top Utility Bar */}
        <header
          className={`h-14 px-4 sm:px-6 border-b ${palette.borderHairline} ${palette.surfaceBg} flex items-center justify-between gap-4 shrink-0`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={onClose}
              className={`min-h-[40px] px-3 rounded-lg border ${palette.borderHairline} ${palette.elevatedBg} text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0`}
            >
              <X className="w-4 h-4" />
              <span>Close</span>
            </button>
            <span className={`text-xs truncate hidden sm:inline ${palette.textSecondary}`}>
              {article.sourceName} · {article.readTimeMinutes} min read
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() =>
                onUpdateEyeCare({
                  fontFamily: eyeCare.fontFamily === 'serif' ? 'sans' : 'serif',
                })
              }
              title="Toggle Serif / Sans-Serif"
              className={`min-h-[40px] px-2.5 rounded-lg border ${palette.borderHairline} ${palette.elevatedBg} text-xs font-medium flex items-center gap-1 whitespace-nowrap`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>{eyeCare.fontFamily === 'serif' ? 'Serif' : 'Sans'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const order: Array<EyeCareSettings['fontScale']> = ['sm', 'md', 'lg', 'xl'];
                const next = order[(order.indexOf(eyeCare.fontScale) + 1) % order.length];
                onUpdateEyeCare({ fontScale: next });
              }}
              title="Cycle Font Size"
              className={`min-h-[40px] px-2.5 rounded-lg border ${palette.borderHairline} ${palette.elevatedBg} text-xs font-mono-num font-medium whitespace-nowrap`}
            >
              A+ ({eyeCare.fontScale.toUpperCase()})
            </button>

            <button
              type="button"
              onClick={() => onUpdateEyeCare({ bionicReading: !eyeCare.bionicReading })}
              title="Toggle Bionic Reading Eye-Guidance"
              className={`min-h-[40px] px-2.5 rounded-lg border text-xs font-medium flex items-center gap-1 whitespace-nowrap ${
                eyeCare.bionicReading
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                  : `${palette.borderHairline} ${palette.elevatedBg} ${palette.textSecondary}`
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Bionic</span>
            </button>

            <button
              type="button"
              onClick={() => onToggleBookmark(article.id)}
              title="Bookmark Story"
              className={`min-h-[40px] min-w-[40px] px-2.5 rounded-lg border flex items-center justify-center ${
                bookmarked
                  ? 'bg-sky-500/20 text-sky-400 border-sky-500/40'
                  : `${palette.borderHairline} ${palette.elevatedBg} ${palette.textSecondary}`
              }`}
            >
              <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </header>

        {/* Smooth Scrollable Article Reader Body */}
        <div className="flex-1 overflow-y-auto scroll-smooth overscroll-contain px-5 sm:px-12 py-7 sm:py-9">
          <div className="max-w-2xl mx-auto">
            <div className={`flex flex-wrap items-center gap-2 text-xs uppercase tracking-widest ${palette.textMuted} mb-3`}>
              <span className={`font-semibold ${palette.accentText}`}>{article.sourceName}</span>
              <span aria-hidden="true">·</span>
              <span className="capitalize">{article.category}</span>
              <span aria-hidden="true">·</span>
              <span>{article.publishedAt}</span>
            </div>

            <h1
              className={`text-2xl sm:text-4xl font-semibold tracking-tight leading-[1.18] ${palette.textPrimary} mb-4`}
              style={{ textWrap: 'balance' } as React.CSSProperties}
            >
              {article.title}
            </h1>

            <p className={`text-base sm:text-lg ${palette.textSecondary} leading-relaxed mb-5`}>
              {renderBionicText(article.subtitle, eyeCare.bionicReading)}
            </p>

            <div
              className={`py-3 mb-6 border-y ${palette.borderHairline} flex flex-wrap items-center justify-between gap-2 text-xs ${palette.textSecondary}`}
            >
              <div>
                <span className={`font-medium ${palette.textPrimary}`}>{article.author}</span>
                <span aria-hidden="true"> · </span>
                <span>{article.sourceName}</span>
              </div>
              <span className="font-mono-num">
                {article.readTimeMinutes} min read
              </span>
            </div>

            {/* Guaranteed 16:9 Source Image Container */}
            <figure className="mb-8">
              <div className={`w-full aspect-video min-h-[210px] sm:min-h-[320px] rounded-xl overflow-hidden border ${palette.borderHairline} bg-[#090B10]`}>
                <SourceImage
                  src={article.imageUrl}
                  alt={article.title}
                  category={article.category}
                  className="w-full h-full object-cover"
                />
              </div>
              <figcaption className={`text-xs ${palette.textMuted} mt-2`}>
                {article.imageCaption}
              </figcaption>
            </figure>

            {/* Key Takeaways */}
            {article.keyTakeaways.length > 0 && (
              <div className={`p-4 sm:p-5 rounded-xl border ${palette.borderHairline} ${palette.surfaceBg} mb-7`}>
                <div className={`text-xs uppercase tracking-wider font-semibold ${palette.accentText} mb-2`}>
                  Key Story Highlights
                </div>
                <ul className={`space-y-2 text-sm ${palette.textSecondary}`}>
                  {article.keyTakeaways.map((point, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className={`font-mono-num text-xs mt-0.5 ${palette.textMuted}`}>
                        0{i + 1}
                      </span>
                      <span>{renderBionicText(point, eyeCare.bionicReading)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Article Paragraphs */}
            <div
              className={`space-y-5 ${
                eyeCare.fontFamily === 'serif' ? 'font-editorial' : 'font-sans'
              } ${proseSizeClass} ${palette.textPrimary}`}
            >
              {article.contentParagraphs.map((para, index) => (
                <p key={index}>
                  {renderBionicText(para, eyeCare.bionicReading)}
                </p>
              ))}
            </div>

            {/* Footer Source Link & Prev/Next */}
            <div
              className={`mt-10 pt-6 border-t ${palette.borderHairline} flex flex-wrap items-center justify-between gap-4`}
            >
              <a
                href={article.articleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 bg-sky-500 text-slate-950 hover:bg-sky-400 transition-colors"
              >
                <span>Open Original Article at {article.sourceName}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <div className="flex items-center gap-2">
                {onPrevArticle && (
                  <button
                    type="button"
                    disabled={!hasPrev}
                    onClick={onPrevArticle}
                    className={`min-h-[40px] px-3 rounded-lg border ${palette.borderHairline} ${palette.surfaceBg} text-xs font-medium flex items-center gap-1.5 disabled:opacity-30`}
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Previous</span>
                  </button>
                )}
                {onNextArticle && (
                  <button
                    type="button"
                    disabled={!hasNext}
                    onClick={onNextArticle}
                    className={`min-h-[40px] px-3 rounded-lg border ${palette.borderHairline} ${palette.surfaceBg} text-xs font-medium flex items-center gap-1.5 disabled:opacity-30`}
                  >
                    <span>Next</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
