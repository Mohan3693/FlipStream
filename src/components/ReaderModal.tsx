import React, { useState } from 'react';
import {
  X,
  Bookmark,
  Volume2,
  VolumeX,
  ExternalLink,
  Type,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { NewsArticle, EyeCareSettings } from '../services/rssService';
import { ThemePalette, renderBionicText } from '../utils/themeUtils';

interface ReaderModalProps {
  article: NewsArticle | null;
  onClose: () => void;
  bookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  eyeCare: EyeCareSettings;
  onUpdateEyeCare: (patch: Partial<EyeCareSettings>) => void;
  palette: ThemePalette;
  isSpeaking: boolean;
  onToggleSpeak: (article: NewsArticle) => void;
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
  isSpeaking,
  onToggleSpeak,
  onPrevArticle,
  onNextArticle,
  hasPrev,
  hasNext,
}) => {
  const [imgError, setImgError] = useState(false);

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full h-full sm:h-[92vh] sm:max-w-3xl sm:rounded-2xl border ${palette.borderHairline} ${palette.canvasBg} ${palette.textPrimary} flex flex-col overflow-hidden shadow-2xl`}
      >
        {/* Sticky Editorial Top Utility Bar */}
        <header
          className={`h-14 px-4 sm:px-6 border-b ${palette.borderHairline} ${palette.surfaceBg} flex items-center justify-between gap-4 shrink-0`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={onClose}
              className={`min-h-[40px] px-3 rounded-lg border ${palette.borderHairline} ${palette.elevatedBg} text-xs font-medium flex items-center gap-1.5 whitespace-nowrap shrink-0`}
            >
              <X className="w-4 h-4" />
              <span>Close Reader</span>
            </button>
            <span className={`text-xs truncate hidden sm:inline ${palette.textSecondary}`}>
              {article.sourceName} · {article.readTimeMinutes} min read
            </span>
          </div>

          {/* Quick Ocular Typography Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() =>
                onUpdateEyeCare({
                  fontFamily: eyeCare.fontFamily === 'serif' ? 'sans' : 'serif',
                })
              }
              title="Toggle Editorial Serif / Sans-Serif"
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
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : `${palette.borderHairline} ${palette.elevatedBg} ${palette.textSecondary}`
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Bionic</span>
            </button>

            <button
              type="button"
              onClick={() => onToggleSpeak(article)}
              title="Read Article Aloud"
              className={`min-h-[40px] min-w-[40px] px-2.5 rounded-lg border flex items-center justify-center ${
                isSpeaking
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : `${palette.borderHairline} ${palette.elevatedBg} ${palette.textSecondary}`
              }`}
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => onToggleBookmark(article.id)}
              title="Bookmark Dispatch"
              className={`min-h-[40px] min-w-[40px] px-2.5 rounded-lg border flex items-center justify-center ${
                bookmarked
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                  : `${palette.borderHairline} ${palette.elevatedBg} ${palette.textSecondary}`
              }`}
            >
              <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </header>

        {/* Scrollable Long-Form Editorial Canvas */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-12 py-8 sm:py-10">
          <div className="max-w-2xl mx-auto">
            {/* Editorial Metadata Kicker (Zero-Pill Unboxed Text) */}
            <div className={`flex flex-wrap items-center gap-2 text-xs uppercase tracking-widest ${palette.textMuted} mb-3`}>
              <span className={palette.accentText}>{article.sourceName}</span>
              <span aria-hidden="true">·</span>
              <span>{article.issueNumber}</span>
              <span aria-hidden="true">·</span>
              <span>{article.publishedAt}</span>
            </div>

            {/* Article Headline */}
            <h1
              className={`text-2xl sm:text-4xl font-display font-semibold tracking-tight leading-[1.15] ${palette.textPrimary} mb-4`}
              style={{ textWrap: 'balance' } as React.CSSProperties}
            >
              {article.title}
            </h1>

            {/* Subtitle / Standfirst */}
            <p className={`text-base sm:text-lg font-editorial ${palette.textSecondary} leading-relaxed mb-6`}>
              {renderBionicText(article.subtitle, eyeCare.bionicReading)}
            </p>

            {/* Author & Reading Cadence Strip */}
            <div
              className={`py-3.5 mb-6 border-y ${palette.borderHairline} flex flex-wrap items-center justify-between gap-2 text-xs ${palette.textSecondary}`}
            >
              <div>
                <span className={`font-medium ${palette.textPrimary}`}>{article.author}</span>
                <span aria-hidden="true"> · </span>
                <span>{article.authorRole}</span>
              </div>
              <span className="font-mono-num">
                Reading cadence: {article.readTimeMinutes} minutes (~1,150 words)
              </span>
            </div>

            {/* Archival Plate Image + Figure Caption */}
            <figure className="mb-8">
              <div className={`w-full aspect-video rounded-xl overflow-hidden border ${palette.borderHairline} bg-slate-950`}>
                {!imgError ? (
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    referrerPolicy="no-referrer"
                    onError={() => setImgError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-slate-400">
                    <BookOpen className="w-8 h-8 mb-2 opacity-60" />
                    <span className="text-xs uppercase tracking-widest">{article.sourceName}</span>
                  </div>
                )}
              </div>
              <figcaption className={`text-xs font-editorial italic ${palette.textMuted} mt-2.5`}>
                {article.imageCaption}
              </figcaption>
            </figure>

            {/* Executive Summary Brief */}
            <div className={`p-5 rounded-xl border ${palette.borderHairline} ${palette.surfaceBg} mb-8`}>
              <div className={`text-xs uppercase tracking-widest font-semibold ${palette.accentText} mb-2.5`}>
                01. Executive Briefing & Key Takeaways
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

            {/* Body Paragraphs with Drop-Cap on First Paragraph */}
            <div
              className={`space-y-6 ${
                eyeCare.fontFamily === 'serif' ? 'font-editorial' : 'font-sans'
              } ${proseSizeClass} ${palette.textPrimary}`}
            >
              {article.contentParagraphs.map((para, index) => (
                <React.Fragment key={index}>
                  <p
                    className={
                      index === 0
                        ? 'first-letter:text-5xl first-letter:font-display first-letter:font-semibold first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:leading-none'
                        : ''
                    }
                  >
                    {renderBionicText(para, eyeCare.bionicReading)}
                  </p>

                  {/* Pull Quote after Paragraph 2 (Using Top/Bottom Hairline Dividers — Zero Left Accent Bars) */}
                  {index === 1 && article.pullQuote && (
                    <blockquote
                      className={`my-8 py-6 border-y ${palette.borderHairline} text-center px-4`}
                    >
                      <p className={`text-xl sm:text-2xl font-display italic leading-snug ${palette.textPrimary}`}>
                        “{article.pullQuote}”
                      </p>
                      <footer className={`mt-2 text-xs uppercase tracking-widest ${palette.textMuted}`}>
                        — {article.author}, {article.sourceName}
                      </footer>
                    </blockquote>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Footer Source Citation & Prev/Next Article Switcher */}
            <div
              className={`mt-12 pt-6 border-t ${palette.borderHairline} flex flex-wrap items-center justify-between gap-4`}
            >
              <a
                href={article.articleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-xs font-medium flex items-center gap-1.5 ${palette.accentText} hover:underline`}
              >
                <span>Original Source Dispatch ({article.sourceName})</span>
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
                    <span>Previous Dispatch</span>
                  </button>
                )}
                {onNextArticle && (
                  <button
                    type="button"
                    disabled={!hasNext}
                    onClick={onNextArticle}
                    className={`min-h-[40px] px-3 rounded-lg border ${palette.borderHairline} ${palette.surfaceBg} text-xs font-medium flex items-center gap-1.5 disabled:opacity-30`}
                  >
                    <span>Next Dispatch</span>
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
