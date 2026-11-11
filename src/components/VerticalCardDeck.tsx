import React, { useState, useRef, useEffect } from 'react';
import {
  Bookmark,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Volume2,
  VolumeX,
  Share2,
  Sparkles,
  Check,
  Compass,
} from 'lucide-react';
import { NewsArticle, EyeCareSettings, DeviceMode } from '../services/rssService';
import { ThemePalette, renderBionicText } from '../utils/themeUtils';

interface VerticalCardDeckProps {
  articles: NewsArticle[];
  activeIndex: number;
  onSelectIndex: (index: number) => void;
  onOpenReader: (article: NewsArticle) => void;
  bookmarkedIds: string[];
  onToggleBookmark: (id: string) => void;
  eyeCare: EyeCareSettings;
  palette: ThemePalette;
  deviceMode: DeviceMode;
  speakingArticleId: string | null;
  onToggleSpeak: (article: NewsArticle) => void;
}

export const VerticalCardDeck: React.FC<VerticalCardDeckProps> = ({
  articles,
  activeIndex,
  onSelectIndex,
  onOpenReader,
  bookmarkedIds,
  onToggleBookmark,
  eyeCare,
  palette,
  deviceMode,
  speakingArticleId,
  onToggleSpeak,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  // Sync scroll position when activeIndex changes via buttons or keyboard
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const cardHeight = container.clientHeight;
    if (cardHeight > 0) {
      container.scrollTo({
        top: activeIndex * cardHeight,
        behavior: eyeCare.reducedMotion ? 'auto' : 'smooth',
      });
    }
  }, [activeIndex, eyeCare.reducedMotion]);

  // Handle native scroll snap index detection
  const handleScroll = () => {
    const container = containerRef.current;
    if (!container || container.clientHeight === 0) return;
    const newIndex = Math.round(container.scrollTop / container.clientHeight);
    if (newIndex !== activeIndex && newIndex >= 0 && newIndex < articles.length) {
      onSelectIndex(newIndex);
    }
  };

  // Handle touch swipe gestures for smooth mobile ergonomics
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY === null) return;
    const deltaY = touchStartY - e.changedTouches[0].clientY;
    if (Math.abs(deltaY) > 48) {
      if (deltaY > 0 && activeIndex < articles.length - 1) {
        onSelectIndex(activeIndex + 1);
      } else if (deltaY < 0 && activeIndex > 0) {
        onSelectIndex(activeIndex - 1);
      }
    }
    setTouchStartY(null);
  };

  const handleShare = (article: NewsArticle, e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${article.title} — ${article.sourceName} (${article.articleUrl})`);
      setCopiedId(article.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const fontSizeTitle =
    deviceMode !== 'responsive'
      ? 'text-2xl sm:text-3xl leading-[1.18]'
      : eyeCare.fontScale === 'sm'
      ? 'text-2xl sm:text-3xl lg:text-4xl leading-[1.15]'
      : eyeCare.fontScale === 'lg'
      ? 'text-3xl sm:text-4xl lg:text-[2.75rem] leading-[1.12]'
      : eyeCare.fontScale === 'xl'
      ? 'text-3xl sm:text-4xl lg:text-5xl leading-[1.1]'
      : 'text-2xl sm:text-3xl lg:text-[2.5rem] leading-[1.14]';

  const fontSizeBody =
    deviceMode !== 'responsive'
      ? 'text-sm leading-relaxed'
      : eyeCare.fontScale === 'sm'
      ? 'text-sm sm:text-base leading-relaxed'
      : eyeCare.fontScale === 'lg'
      ? 'text-base sm:text-lg leading-relaxed'
      : eyeCare.fontScale === 'xl'
      ? 'text-lg sm:text-xl leading-relaxed'
      : 'text-base leading-relaxed';

  if (articles.length === 0) {
    return (
      <div className={`w-full h-full flex flex-col items-center justify-center p-8 text-center ${palette.canvasBg} ${palette.textPrimary}`}>
        <Compass className={`w-10 h-10 mb-3 ${palette.textMuted}`} />
        <h2 className="text-xl font-display font-semibold mb-2">No Dispatches Match Filter</h2>
        <p className={`text-sm max-w-md ${palette.textSecondary}`}>
          Try selecting another editorial channel or enabling additional RSS feeds in the Source Manager.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full select-none overflow-hidden">
      {/* Main Vertical Scroll-Snap Container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="w-full h-full overflow-y-scroll snap-y-mandatory no-scrollbar"
      >
        {articles.map((article, idx) => {
          const isBookmarked = bookmarkedIds.includes(article.id);
          const isSpeaking = speakingArticleId === article.id;
          const imgFailed = failedImages[article.id];

          return (
            <article
              key={article.id}
              onClick={() => onOpenReader(article)}
              className={`snap-card-center relative w-full h-full flex flex-col justify-between overflow-hidden cursor-pointer border-b ${palette.borderHairline} ${palette.canvasBg}`}
            >
              {/* Top Visual Editorial Plate (46% to 52% of vertical card height) */}
              <div className="relative w-full h-[46%] sm:h-[50%] shrink-0 overflow-hidden bg-[#090B10]">
                {!imgFailed ? (
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    referrerPolicy="no-referrer"
                    onError={() =>
                      setFailedImages((prev) => ({ ...prev, [article.id]: true }))
                    }
                    className={`w-full h-full object-cover transition-transform duration-700 ${
                      idx === activeIndex && !eyeCare.reducedMotion ? 'scale-100' : 'scale-105'
                    } ${palette.isDark ? 'brightness-90 contrast-[1.04]' : 'brightness-95'}`}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-950 to-black flex flex-col items-center justify-center p-6 text-center">
                    <BookOpen className="w-10 h-10 text-amber-400/60 mb-2" />
                    <span className="text-xs uppercase tracking-widest text-slate-400">
                      {article.sourceName} · Archival Plate
                    </span>
                  </div>
                )}

                {/* Measured Gradient Scrim for Seamless Transition into OLED/Paper Canvas */}
                <div
                  className={`absolute inset-0 ${
                    palette.id === 'oled-midnight'
                      ? 'bg-gradient-to-t from-[#000000] via-[#000000]/45 to-black/30'
                      : palette.id === 'eink-slate'
                      ? 'bg-gradient-to-t from-[#16181D] via-[#16181D]/40 to-black/25'
                      : palette.id === 'warm-sepia'
                      ? 'bg-gradient-to-t from-[#F5F0E6] via-[#F5F0E6]/20 to-black/25'
                      : 'bg-gradient-to-t from-[#FAFAFA] via-transparent to-black/25'
                  }`}
                />

                {/* Top Masthead Kicker Bar */}
                <div className="absolute top-4 left-5 right-5 flex items-center justify-between text-xs text-slate-200/90 drop-shadow">
                  <div className="flex items-center gap-2 font-mono-num tracking-wider uppercase text-[11px]">
                    <span>{article.issueNumber}</span>
                    <span aria-hidden="true">·</span>
                    <span>
                      CARD {String(idx + 1).padStart(2, '0')} / {String(articles.length).padStart(2, '0')}
                    </span>
                  </div>
                  <span className="text-[11px] tracking-wide text-slate-200/80 font-mono-num">
                    {article.publishedAt}
                  </span>
                </div>
              </div>

              {/* Bottom Editorial Typography & Story Body (50% to 54% of card height) */}
              <div className="flex-1 flex flex-col justify-between px-5 sm:px-8 pt-3 pb-6 sm:pb-8 max-w-3xl mx-auto w-full">
                <div className="space-y-3">
                  {/* Zero-Pill Metadata Line */}
                  <div className={`flex flex-wrap items-center gap-2 text-xs tracking-wide ${palette.textSecondary}`}>
                    <span className={`font-semibold uppercase tracking-wider ${palette.accentText}`}>
                      {article.sourceName}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="capitalize">{article.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono-num">{article.readTimeMinutes} min read</span>
                    <span aria-hidden="true">·</span>
                    <span>By {article.author}</span>
                  </div>

                  {/* Display Headline with text-wrap: balance */}
                  <h2
                    className={`font-display font-semibold tracking-tight ${fontSizeTitle} ${palette.textPrimary}`}
                    style={{ textWrap: 'balance' } as React.CSSProperties}
                  >
                    {article.title}
                  </h2>

                  {/* Editorial Deck / Subtitle */}
                  <p
                    className={`${
                      eyeCare.fontFamily === 'serif' ? 'font-editorial' : 'font-sans'
                    } ${fontSizeBody} ${palette.textSecondary} line-clamp-2 sm:line-clamp-3`}
                  >
                    {renderBionicText(article.subtitle, eyeCare.bionicReading)}
                  </p>

                  {/* Curated Lead Paragraph Preview */}
                  <p
                    className={`hidden sm:block ${
                      eyeCare.fontFamily === 'serif' ? 'font-editorial' : 'font-sans'
                    } text-sm leading-relaxed ${palette.textMuted} line-clamp-2 pt-1`}
                  >
                    {renderBionicText(article.summary, eyeCare.bionicReading)}
                  </p>
                </div>

                {/* Card Bottom Action & Flip Bar (All touch targets >= 44px) */}
                <div
                  className={`pt-4 mt-2 border-t ${palette.borderHairline} flex items-center justify-between gap-3`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => onOpenReader(article)}
                    className={`min-h-[44px] px-4 py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 ${
                      palette.isDark
                        ? 'bg-slate-100 text-slate-950 hover:bg-white'
                        : 'bg-stone-900 text-stone-50 hover:bg-stone-800'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Read Full Story</span>
                  </button>

                  <div className="flex items-center gap-1 sm:gap-2">
                    <button
                      type="button"
                      onClick={() => onToggleSpeak(article)}
                      title={isSpeaking ? 'Stop Audio Narration' : 'Listen to Dispatch'}
                      className={`min-h-[44px] min-w-[44px] px-2.5 rounded-lg border ${palette.borderHairline} flex items-center justify-center gap-1.5 text-xs transition-colors ${
                        isSpeaking
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : `${palette.surfaceBg} ${palette.textSecondary} hover:${palette.textPrimary}`
                      }`}
                    >
                      {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      <span className="hidden md:inline whitespace-nowrap">
                        {isSpeaking ? 'Stop Audio' : 'Listen'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onToggleBookmark(article.id)}
                      title={isBookmarked ? 'Remove from Saved Library' : 'Save for Offline Reading'}
                      className={`min-h-[44px] min-w-[44px] px-2.5 rounded-lg border ${palette.borderHairline} flex items-center justify-center gap-1.5 text-xs transition-colors ${
                        isBookmarked
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                          : `${palette.surfaceBg} ${palette.textSecondary} hover:${palette.textPrimary}`
                      }`}
                    >
                      <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                      <span className="hidden md:inline whitespace-nowrap">
                        {isBookmarked ? 'Saved' : 'Save'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleShare(article, e)}
                      title="Copy Article Link"
                      className={`min-h-[44px] min-w-[44px] px-2.5 rounded-lg border ${palette.borderHairline} ${palette.surfaceBg} ${palette.textSecondary} flex items-center justify-center gap-1.5 text-xs transition-colors`}
                    >
                      {copiedId === article.id ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Share2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Right-Edge Tactile Vertical Card Stepper Controls */}
      <div className="hidden sm:flex flex-col items-center gap-1.5 absolute right-4 top-1/2 -translate-y-1/2 z-20">
        <button
          type="button"
          onClick={() => activeIndex > 0 && onSelectIndex(activeIndex - 1)}
          disabled={activeIndex === 0}
          aria-label="Previous Story Card"
          className={`min-h-[40px] min-w-[40px] rounded-full border ${palette.borderHairline} ${palette.surfaceBg}/90 backdrop-blur-md flex items-center justify-center ${palette.textSecondary} disabled:opacity-30 transition-opacity`}
        >
          <ChevronUp className="w-4 h-4" />
        </button>

        <div className={`py-2 px-1.5 rounded-full border ${palette.borderHairline} ${palette.surfaceBg}/80 backdrop-blur-md flex flex-col items-center gap-1.5`}>
          {articles.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectIndex(idx)}
              aria-label={`Jump to story ${idx + 1}`}
              className={`w-1.5 rounded-full transition-all ${
                idx === activeIndex
                  ? 'h-5 bg-amber-400'
                  : `h-1.5 ${palette.isDark ? 'bg-slate-700 hover:bg-slate-500' : 'bg-stone-300 hover:bg-stone-500'}`
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => activeIndex < articles.length - 1 && onSelectIndex(activeIndex + 1)}
          disabled={activeIndex === articles.length - 1}
          aria-label="Next Story Card"
          className={`min-h-[40px] min-w-[40px] rounded-full border ${palette.borderHairline} ${palette.surfaceBg}/90 backdrop-blur-md flex items-center justify-center ${palette.textSecondary} disabled:opacity-30 transition-opacity`}
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Subtle Bionic Mode Indicator if active */}
      {eyeCare.bionicReading && (
        <div
          className={`pointer-events-none absolute bottom-20 left-5 px-2.5 py-1 rounded text-[11px] border ${palette.borderHairline} ${palette.surfaceBg}/90 ${palette.textSecondary} flex items-center gap-1.5`}
        >
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Bionic Saccadic Reading Active</span>
        </div>
      )}
    </div>
  );
};
