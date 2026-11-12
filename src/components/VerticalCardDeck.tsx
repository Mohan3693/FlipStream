import React, { useRef, useState, useCallback } from 'react';
import {
  Bookmark,
  Share2,
  MoreHorizontal,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  Clock,
  Check,
  Newspaper,
} from 'lucide-react';
import {
  NewsArticle,
  EyeCareSettings,
  FeedViewMode,
  getCategoryFallbackImage,
  getCategoryLabel,
} from '../services/rssService';
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
  viewMode: FeedViewMode;
  hdImages?: boolean;
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
  viewMode,
}) => {
  const deckContainerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleImageError = (articleId: string) => {
    setFailedImages((prev) => ({ ...prev, [articleId]: true }));
  };

  const getArticleImage = (article: NewsArticle) => {
    if (failedImages[article.id] || !article.imageUrl) {
      return getCategoryFallbackImage(article.category);
    }
    return article.imageUrl;
  };

  const handleShare = async (e: React.MouseEvent, article: NewsArticle) => {
    e.stopPropagation();
    const shareUrl = article.articleUrl || window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.summary,
          url: shareUrl,
        });
        return;
      } catch {
        // fallback to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(`${article.title} — ${shareUrl}`);
      setCopiedId(article.id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      // ignore
    }
  };

  // Smooth passive scroll listener without programmatic scroll fighting
  const handleScroll = useCallback(() => {
    if (viewMode !== 'cards') return;
    if (rafRef.current !== null) return;

    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null;
      const container = deckContainerRef.current;
      if (!container) return;
      const cardHeight = container.clientHeight;
      if (cardHeight <= 0) return;
      const nextIndex = Math.round(container.scrollTop / cardHeight);
      const clamped = Math.max(0, Math.min(articles.length - 1, nextIndex));
      if (clamped !== activeIndex) {
        onSelectIndex(clamped);
      }
    });
  }, [viewMode, articles.length, activeIndex, onSelectIndex]);

  const scrollToCard = (targetIdx: number) => {
    const clamped = Math.max(0, Math.min(articles.length - 1, targetIdx));
    onSelectIndex(clamped);
    const container = deckContainerRef.current;
    if (!container) return;
    const cardHeight = container.clientHeight;
    if (cardHeight > 0) {
      container.scrollTo({
        top: clamped * cardHeight,
        behavior: 'smooth',
      });
    }
  };

  const headlineScaleClass = {
    sm: 'text-[17px] sm:text-[19px]',
    md: 'text-[19px] sm:text-[22px]',
    lg: 'text-[21px] sm:text-[24px]',
    xl: 'text-[23px] sm:text-[26px]',
  }[eyeCare.fontScale];

  const bodyScaleClass = {
    sm: 'text-[14px] sm:text-[15px]',
    md: 'text-[15px] sm:text-[16.5px]',
    lg: 'text-[16.5px] sm:text-[18px]',
    xl: 'text-[18px] sm:text-[19.5px]',
  }[eyeCare.fontScale];

  const fontClass = eyeCare.fontFamily === 'serif' ? 'font-serif-body' : 'font-sans';

  if (articles.length === 0) {
    return (
      <div className={`w-full h-full flex items-center justify-center p-8 ${palette.surfaceBg}`}>
        <div className="max-w-sm text-center space-y-2">
          <p className={`text-lg font-semibold ${palette.textPrimary}`}>
            No stories in this stream
          </p>
          <p className={`text-sm ${palette.textSecondary}`}>
            Select another topic above or enable more RSS sources in Discover.
          </p>
        </div>
      </div>
    );
  }

  // GRID VIEW MODE
  if (viewMode === 'grid') {
    return (
      <div
        className={`w-full h-full overflow-y-auto scroll-smooth overscroll-contain px-4 sm:px-6 py-5 ${palette.canvasBg}`}
      >
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-12">
          {articles.map((article, idx) => {
            const isBookmarked = bookmarkedIds.includes(article.id);
            const imgSrc = getArticleImage(article);

            return (
              <article
                key={article.id}
                onClick={() => {
                  onSelectIndex(idx);
                  onOpenReader(article);
                }}
                className={`group rounded-2xl border ${palette.borderHairline} ${palette.surfaceBg} overflow-hidden flex flex-col cursor-pointer transition-shadow hover:shadow-md`}
              >
                <div className="relative h-44 w-full overflow-hidden bg-slate-900">
                  <img
                    src={imgSrc}
                    alt={article.title}
                    loading="lazy"
                    onError={() => handleImageError(article.id)}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-black/75 text-white">
                      {getCategoryLabel(article.category)}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleBookmark(article.id);
                      }}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isBookmarked
                          ? 'bg-[#0284C7] text-white'
                          : 'bg-black/65 text-white hover:bg-black/85'
                      }`}
                    >
                      <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className={`font-semibold ${palette.accentText}`}>
                        {article.sourceName}
                      </span>
                      <span className={`font-mono-num ${palette.textMuted}`}>
                        {article.publishedAt}
                      </span>
                    </div>
                    <h3
                      className={`text-base font-semibold leading-snug line-clamp-2 ${palette.textPrimary}`}
                    >
                      {renderBionicText(article.title, eyeCare.bionicReading)}
                    </h3>
                    <p className={`text-xs leading-relaxed line-clamp-3 ${palette.textSecondary}`}>
                      {renderBionicText(article.summary, eyeCare.bionicReading)}
                    </p>
                  </div>

                  <div
                    className={`pt-2.5 border-t ${palette.borderHairline} flex items-center justify-between text-[11px] ${palette.textMuted}`}
                  >
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {article.readTimeMinutes}m read
                    </span>
                    <span className={`font-semibold ${palette.accentText}`}>
                      Read story →
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    );
  }

  // SHORT-CARD STREAM MODE (Matches Reference Screenshot 2)
  const progressPercent =
    articles.length > 0 ? Math.min(100, ((activeIndex + 1) / articles.length) * 100) : 0;

  return (
    <div className={`relative w-full h-full flex flex-col ${palette.chromeBg} overflow-hidden`}>
      {/* Smooth Vertical Card Scroll Viewport */}
      <div
        ref={deckContainerRef}
        onScroll={handleScroll}
        className="flex-1 min-h-0 w-full overflow-y-scroll smooth-scroll-container no-scrollbar"
      >
        {articles.map((article, index) => {
          const isBookmarked = bookmarkedIds.includes(article.id);
          const imgSrc = getArticleImage(article);

          // Combine summary + first content paragraph into a rich ~60-word digest card body
          const secondSentence =
            article.contentParagraphs && article.contentParagraphs.length > 0
              ? article.contentParagraphs[0]
              : '';
          const digestSummary =
            article.summary.length < 180 && secondSentence && secondSentence !== article.summary
              ? `${article.summary} ${secondSentence}`
              : article.summary;

          const bottomCalloutHeadline =
            article.subtitle ||
            (article.contentParagraphs && article.contentParagraphs.length > 1
              ? article.contentParagraphs[1]
              : `${article.sourceName} · ${getCategoryLabel(article.category)} Dispatch`);

          return (
            <section
              key={article.id}
              aria-label={`Story ${index + 1} of ${articles.length}`}
              className="w-full h-full smooth-scroll-card flex items-stretch justify-center"
            >
              <article
                className={`relative w-full max-w-2xl h-full rounded-t-[22px] overflow-hidden flex flex-col ${palette.surfaceBg} shadow-2xl`}
              >
                {/* Top 42% Hero Source Image */}
                <div
                  onClick={() => onOpenReader(article)}
                  className="relative h-[41%] sm:h-[43%] w-full shrink-0 bg-slate-900 cursor-pointer overflow-hidden"
                >
                  <img
                    src={imgSrc}
                    alt={article.title}
                    loading={index <= 2 ? 'eager' : 'lazy'}
                    onError={() => handleImageError(article.id)}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/20 pointer-events-none" />

                  {/* Top-Right ••• Action Button on Image */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenReader(article);
                    }}
                    title="Open Full Article View"
                    className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-black/45 hover:bg-black/65 text-white/90 flex items-center justify-center backdrop-blur-sm transition-colors"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>

                  {/* Bottom-Left Floating Cutout Tab: Publisher Badge */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className={`absolute bottom-0 left-0 ${palette.surfaceBg} rounded-tr-2xl px-3.5 pt-1.5 pb-1 flex items-center gap-1.5 z-10`}
                  >
                    <span className="w-4 h-4 rounded bg-[#0284C7] text-white flex items-center justify-center shrink-0">
                      <Newspaper className="w-2.5 h-2.5" />
                    </span>
                    <span className={`text-xs font-bold tracking-tight ${palette.textPrimary}`}>
                      {article.sourceName}
                    </span>
                  </div>

                  {/* Bottom-Right Floating Cutout Tab: Bookmark & Share */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className={`absolute bottom-0 right-0 ${palette.surfaceBg} rounded-tl-2xl px-4 pt-1.5 pb-1 flex items-center gap-4 z-10`}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleBookmark(article.id);
                      }}
                      aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark story'}
                      className={`p-0.5 transition-colors ${
                        isBookmarked
                          ? 'text-[#0284C7]'
                          : `${palette.textSecondary} hover:${palette.textPrimary}`
                      }`}
                    >
                      <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleShare(e, article)}
                      aria-label="Share story"
                      className={`p-0.5 transition-colors ${palette.textSecondary} hover:${palette.textPrimary}`}
                    >
                      {copiedId === article.id ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Share2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Middle 45% Summary Content Area */}
                <div
                  onClick={() => onOpenReader(article)}
                  className={`flex-1 min-h-0 px-5 pt-3.5 pb-3 flex flex-col justify-between cursor-pointer overflow-hidden ${palette.surfaceBg}`}
                >
                  <div className="space-y-2.5 overflow-hidden">
                    <h2
                      className={`${headlineScaleClass} font-semibold leading-[1.32] tracking-tight line-clamp-3 ${palette.textPrimary}`}
                    >
                      {renderBionicText(article.title, eyeCare.bionicReading)}
                    </h2>

                    <p
                      className={`${fontClass} ${bodyScaleClass} leading-[1.58] line-clamp-6 sm:line-clamp-7 ${palette.textSecondary}`}
                    >
                      {renderBionicText(digestSummary, eyeCare.bionicReading)}
                    </p>
                  </div>

                  {/* Subtle Timestamp | Author | Publisher Footer */}
                  <div className={`pt-2 text-[11.5px] ${palette.textMuted} truncate`}>
                    <span>{article.publishedAt}</span>
                    {article.author && <span> | {article.author}</span>}
                    <span> | {article.sourceName}</span>
                  </div>
                </div>

                {/* Bottom Docked Story Context Bar (Tap to read full story) */}
                <div
                  onClick={() => onOpenReader(article)}
                  className="h-14 sm:h-16 px-5 bg-gradient-to-r from-[#38332E] via-[#2B2D35] to-[#1F242D] text-white flex items-center justify-between gap-3 shrink-0 cursor-pointer hover:brightness-110 transition-all"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-white/95 truncate">
                      {bottomCalloutHeadline}
                    </p>
                    <p className="text-[11.5px] text-white/70 mt-0.5 flex items-center gap-1">
                      Tap to read full dispatch
                    </p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-white/70 shrink-0" />
                </div>
              </article>
            </section>
          );
        })}
      </div>

      {/* Bottom Thin Progress Bar & Counter (Directly above Bottom Nav) */}
      <div className="h-6 max-w-2xl w-full mx-auto px-4 flex items-center justify-between gap-4 shrink-0 bg-[#0B0F17] text-slate-300">
        <div className="w-28 sm:w-36 h-1 bg-white/15 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={activeIndex === 0}
            onClick={() => scrollToCard(activeIndex - 1)}
            aria-label="Previous story"
            className="hidden sm:inline-flex p-0.5 text-slate-400 hover:text-white disabled:opacity-30"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono-num font-semibold text-[#38BDF8]">
            {activeIndex + 1}/{articles.length}
          </span>
          <button
            type="button"
            disabled={activeIndex >= articles.length - 1}
            onClick={() => scrollToCard(activeIndex + 1)}
            aria-label="Next story"
            className="hidden sm:inline-flex p-0.5 text-slate-400 hover:text-white disabled:opacity-30"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
