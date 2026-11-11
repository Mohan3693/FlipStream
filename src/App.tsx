import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Bookmark,
  Rss,
  Eye,
  Smartphone,
  Monitor,
  Code2,
  Compass,
  BookOpen,
} from 'lucide-react';
import {
  CategoryId,
  DeviceMode,
  EyeCareSettings,
  NewsArticle,
  RssSource,
  DEFAULT_SOURCES,
  CURATED_ARTICLES,
  fetchLiveRssFeed,
} from './services/rssService';
import { THEME_PALETTES, renderBionicText } from './utils/themeUtils';
import { VerticalCardDeck } from './components/VerticalCardDeck';
import { ReaderModal } from './components/ReaderModal';
import { EyeCarePanel } from './components/EyeCarePanel';
import { SourceManagerModal } from './components/SourceManagerModal';
import { NativeCodeModal } from './components/NativeCodeModal';
import { DeviceShellWrapper } from './components/DeviceShellWrapper';

const STORAGE_KEYS = {
  BOOKMARKS: 'flipstream_bookmarks_v1',
  EYECARE: 'flipstream_eyecare_v1',
  SOURCES: 'flipstream_sources_v1',
  CUSTOM_ARTICLES: 'flipstream_custom_articles_v1',
};

const DEFAULT_EYECARE: EyeCareSettings = {
  theme: 'oled-midnight',
  amberShieldPercent: 15,
  dimmerPercent: 0,
  fontScale: 'md',
  fontFamily: 'serif',
  bionicReading: false,
  reducedMotion: false,
};

export default function App() {
  // Persistent Eye-Care Settings (Default: Pure Midnight OLED with muted slate typography)
  const [eyeCare, setEyeCare] = useState<EyeCareSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EYECARE);
      return saved ? { ...DEFAULT_EYECARE, ...JSON.parse(saved) } : DEFAULT_EYECARE;
    } catch {
      return DEFAULT_EYECARE;
    }
  });

  // Persistent RSS Sources
  const [sources, setSources] = useState<RssSource[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SOURCES);
      return saved ? JSON.parse(saved) : DEFAULT_SOURCES;
    } catch {
      return DEFAULT_SOURCES;
    }
  });

  // Articles (Curated + Live Syndicated RSS Items)
  const [customArticles, setCustomArticles] = useState<NewsArticle[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CUSTOM_ARTICLES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persistent Bookmarks
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      return saved ? JSON.parse(saved) : ['art-tech-1', 'art-science-1'];
    } catch {
      return ['art-tech-1', 'art-science-1'];
    }
  });

  // Navigation & UI States
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('responsive');
  const [activeIndex, setActiveIndex] = useState(0);
  const [readerArticle, setReaderArticle] = useState<NewsArticle | null>(null);
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [isMobileEyeCareOpen, setIsMobileEyeCareOpen] = useState(false);
  const [isSyncingRss, setIsSyncingRss] = useState(false);
  const [speakingArticleId, setSpeakingArticleId] = useState<string | null>(null);

  const palette = THEME_PALETTES[eyeCare.theme];

  // Sync dark class on html element
  useEffect(() => {
    if (palette.isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [palette.isDark]);

  // Save state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.EYECARE, JSON.stringify(eyeCare));
    } catch {
      // ignore storage errors
    }
  }, [eyeCare]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarkedIds));
    } catch {
      // ignore
    }
  }, [bookmarkedIds]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SOURCES, JSON.stringify(sources));
    } catch {
      // ignore
    }
  }, [sources]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_ARTICLES, JSON.stringify(customArticles));
    } catch {
      // ignore
    }
  }, [customArticles]);

  // Combine and filter articles
  const allArticles = useMemo(
    () => [...customArticles, ...CURATED_ARTICLES],
    [customArticles]
  );

  const enabledSourceIds = useMemo(
    () => new Set(sources.filter((s) => s.enabled).map((s) => s.id)),
    [sources]
  );

  const filteredArticles = useMemo(() => {
    return allArticles.filter((article) => {
      // Keep custom live RSS articles or articles from enabled sources
      const isSourceEnabled =
        article.id.startsWith('live-') || enabledSourceIds.has(article.sourceId);
      if (!isSourceEnabled) return false;

      if (showSavedOnly && !bookmarkedIds.includes(article.id)) return false;

      if (selectedCategory !== 'all' && article.category !== selectedCategory) {
        return false;
      }

      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchTitle = article.title.toLowerCase().includes(q);
        const matchSub = article.subtitle.toLowerCase().includes(q);
        const matchSource = article.sourceName.toLowerCase().includes(q);
        const matchAuthor = article.author.toLowerCase().includes(q);
        if (!matchTitle && !matchSub && !matchSource && !matchAuthor) return false;
      }

      return true;
    });
  }, [allArticles, enabledSourceIds, showSavedOnly, bookmarkedIds, selectedCategory, searchQuery]);

  // Reset active card index when filter changes
  useEffect(() => {
    setActiveIndex(0);
  }, [selectedCategory, showSavedOnly, searchQuery]);

  // Keyboard navigation for vertical card deck (Up/Down/J/K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (readerArticle || isSourceModalOpen || isCodeModalOpen) return;
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.key === 'ArrowDown' || e.key === 'j' || e.key === 'J') {
        e.preventDefault();
        setActiveIndex((prev) => Math.min(filteredArticles.length - 1, prev + 1));
      } else if (e.key === 'ArrowUp' || e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        setActiveIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'Enter' && filteredArticles[activeIndex]) {
        setReaderArticle(filteredArticles[activeIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredArticles, activeIndex, readerArticle, isSourceModalOpen, isCodeModalOpen]);

  const handleUpdateEyeCare = (patch: Partial<EyeCareSettings>) => {
    setEyeCare((prev) => ({ ...prev, ...patch }));
  };

  const handleToggleBookmark = (id: string) => {
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSource = (id: string) => {
    setSources((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const handleAddCustomFeed = async (
    name: string,
    url: string,
    category: Exclude<CategoryId, 'all'>
  ) => {
    setIsSyncingRss(true);
    const sourceId = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    // Add to sources list if not already present
    setSources((prev) => {
      if (prev.some((s) => s.id === sourceId)) return prev;
      return [
        {
          id: sourceId,
          name,
          category,
          feedUrl: url,
          domain: url.replace(/^https?:\/\//, '').split('/')[0] || 'rss.feed',
          enabled: true,
          editorialTagline: `Live RSS syndication stream (${url})`,
        },
        ...prev,
      ];
    });

    const liveItems = await fetchLiveRssFeed(url, name, category);
    if (liveItems.length > 0) {
      setCustomArticles((prev) => [...liveItems, ...prev]);
    } else {
      // Fallback synthesized dispatch if remote CORS blocks direct XML
      const fallbackArticle: NewsArticle = {
        id: `live-${category}-${Date.now()}`,
        title: `${name}: Latest Syndicated Editorial Dispatch`,
        subtitle: `Live RSS feed connected from ${url} and formatted for FlipStream eye-protective reading.`,
        summary: `Your custom RSS stream (${name}) is now active in the ${category.toUpperCase()} channel.`,
        contentParagraphs: [
          `This feed endpoint (${url}) has been registered in your FlipStream syndication directory under the ${category} desk.`,
          'All incoming dispatches are automatically stripped of tracking scripts, popups, and visual clutter before being rendered in your chosen ocular palette.',
          'Use the Eye-Protective Studio on the right rail to adjust 2700K amber warmth or enable Bionic Saccadic Reading.'
        ],
        keyTakeaways: [
          `Connected RSS endpoint: ${url}`,
          'Zero-tracking distraction-free parser enabled.',
          'Available across iOS, Android, and Responsive viewports.'
        ],
        pullQuote: 'Independent RSS syndication restores calm, deliberate reading to the open web.',
        author: `${name} Desk`,
        authorRole: 'Syndicated RSS Feed',
        sourceId,
        sourceName: name,
        category,
        publishedAt: 'Just now',
        readTimeMinutes: 3,
        imageUrl: CURATED_ARTICLES.find((a) => a.category === category)?.imageUrl || CURATED_ARTICLES[0].imageUrl,
        imageCaption: `Fig. 1 — Syndicated feed plate for ${name}.`,
        articleUrl: url,
        issueNumber: `CUSTOM RSS · ${category.toUpperCase()}`,
      };
      setCustomArticles((prev) => [fallbackArticle, ...prev]);
    }

    setSelectedCategory(category);
    setShowSavedOnly(false);
    setActiveIndex(0);
    setIsSyncingRss(false);
  };

  // Web Speech API Text-to-Speech Narration
  const handleToggleSpeak = (article: NewsArticle) => {
    if (!('speechSynthesis' in window)) return;
    if (speakingArticleId === article.id) {
      window.speechSynthesis.cancel();
      setSpeakingArticleId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(
      `${article.title}. ${article.subtitle}. ${article.contentParagraphs.join(' ')}`
    );
    utterance.rate = 0.98;
    utterance.onend = () => setSpeakingArticleId(null);
    utterance.onerror = () => setSpeakingArticleId(null);
    setSpeakingArticleId(article.id);
    window.speechSynthesis.speak(utterance);
  };

  const categories: Array<{ id: CategoryId; label: string }> = [
    { id: 'all', label: 'All Dispatches' },
    { id: 'tech', label: 'Tech' },
    { id: 'world', label: 'World' },
    { id: 'business', label: 'Business' },
    { id: 'science', label: 'Science' },
    { id: 'culture', label: 'Culture' },
  ];

  const activeStory = filteredArticles[activeIndex] || null;

  return (
    <div
      className={`relative w-screen h-screen overflow-hidden flex flex-col select-none ${palette.canvasBg} ${palette.textPrimary}`}
    >
      {/* Top Bar Contract: Strictly 1 row, 3 zones separated by gap-8 */}
      <header
        className={`h-14 px-4 sm:px-6 border-b ${palette.borderHairline} ${palette.surfaceBg} flex items-center justify-between gap-8 shrink-0 z-30`}
      >
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setSelectedCategory('all');
            setShowSavedOnly(false);
          }}
          className={`text-lg font-display font-bold tracking-tight ${palette.textPrimary} whitespace-nowrap shrink-0`}
        >
          FlipStream
        </a>

        {/* Zone 2: 5 concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {(['tech', 'world', 'business', 'science', 'culture'] as const).map((catId) => {
            const isActive = !showSavedOnly && selectedCategory === catId;
            return (
              <a
                key={catId}
                href={`#${catId}`}
                onClick={(e) => {
                  e.preventDefault();
                  setShowSavedOnly(false);
                  setSelectedCategory(catId);
                }}
                className={`capitalize transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                  isActive
                    ? `border-amber-400 ${palette.textPrimary} font-semibold`
                    : `border-transparent ${palette.textSecondary} hover:${palette.textPrimary}`
                }`}
              >
                {catId}
              </a>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() => setIsSourceModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold bg-amber-500 text-slate-950 rounded-lg hover:bg-amber-400 transition-colors whitespace-nowrap shrink-0"
          >
            Manage RSS Feeds
          </button>
        </div>
      </header>

      {/* Main 3-Column Editorial Studio Workspace (Full 1440px Desktop Presence + Mobile Ergonomics) */}
      <div className="flex-1 min-h-0 flex overflow-hidden relative">
        {/* Left Curatorial Rail (Desktop lg+) */}
        <aside
          className={`hidden lg:flex w-68 border-r ${palette.borderHairline} ${palette.surfaceBg} flex-col justify-between p-4 overflow-y-auto no-scrollbar shrink-0`}
        >
          <div className="space-y-6">
            {/* Interactive Platform Viewport Switcher (Responsive / iOS 18 / Android 15) */}
            <div className="space-y-2">
              <div className={`text-xs font-medium ${palette.textSecondary}`}>
                Platform Presentation
              </div>
              <div className={`p-1 rounded-xl border ${palette.borderHairline} ${palette.canvasBg} grid grid-cols-3 gap-1`}>
                <button
                  type="button"
                  onClick={() => setDeviceMode('responsive')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-colors whitespace-nowrap ${
                    deviceMode === 'responsive'
                      ? `${palette.elevatedBg} ${palette.textPrimary} shadow-sm font-semibold`
                      : palette.textMuted
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Full</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeviceMode('ios')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-colors whitespace-nowrap ${
                    deviceMode === 'ios'
                      ? `${palette.elevatedBg} ${palette.textPrimary} shadow-sm font-semibold`
                      : palette.textMuted
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>iOS 18</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeviceMode('android')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-colors whitespace-nowrap ${
                    deviceMode === 'android'
                      ? `${palette.elevatedBg} ${palette.textPrimary} shadow-sm font-semibold`
                      : palette.textMuted
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Android</span>
                </button>
              </div>
            </div>

            {/* Search Filter Input */}
            <div className="relative">
              <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${palette.textMuted}`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter stories or authors..."
                className={`w-full pl-9 pr-3 py-2 rounded-xl border ${palette.borderHairline} ${palette.canvasBg} text-xs focus:outline-none focus:border-amber-400`}
              />
            </div>

            {/* Editorial Editions & Saved Bookmarks */}
            <div className="space-y-1">
              <div className={`text-xs font-medium ${palette.textSecondary} px-2 mb-1.5`}>
                Editorial Channels
              </div>
              {categories.map((cat) => {
                const active = !showSavedOnly && selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setShowSavedOnly(false);
                      setSelectedCategory(cat.id);
                    }}
                    className={`w-full min-h-[38px] px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${
                      active
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold'
                        : `${palette.textSecondary} hover:${palette.elevatedBg}`
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Compass className="w-3.5 h-3.5" />
                      <span>{cat.label}</span>
                    </span>
                    <span className="font-mono-num text-[11px] opacity-75">
                      {cat.id === 'all'
                        ? allArticles.length
                        : allArticles.filter((a) => a.category === cat.id).length}
                    </span>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setShowSavedOnly(true)}
                className={`w-full min-h-[38px] px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors mt-2 ${
                  showSavedOnly
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold'
                    : `${palette.textSecondary} hover:${palette.elevatedBg}`
                }`}
              >
                <span className="flex items-center gap-2">
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Saved Reading List</span>
                </span>
                <span className="font-mono-num text-[11px]">{bookmarkedIds.length}</span>
              </button>
            </div>
          </div>

          {/* Bottom Native iOS & Android Code Export Button */}
          <div className={`pt-4 border-t ${palette.borderHairline} space-y-2`}>
            <button
              type="button"
              onClick={() => setIsCodeModalOpen(true)}
              className={`w-full min-h-[42px] px-3 py-2.5 rounded-xl border ${palette.borderHairline} ${palette.elevatedBg} text-xs font-medium flex items-center justify-between hover:border-amber-400/50 transition-colors`}
            >
              <span className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-amber-400" />
                <span>iOS & Android Native Code</span>
              </span>
              <span className={`text-[11px] font-mono-num ${palette.textMuted}`}>Swift/KT</span>
            </button>
          </div>
        </aside>

        {/* Center Stage: Vertical Swipe Magazine Card Deck (Wrapped in Device Shell when iOS/Android selected) */}
        <main className="flex-1 min-w-0 h-full relative overflow-hidden">
          <DeviceShellWrapper deviceMode={deviceMode} palette={palette}>
            <VerticalCardDeck
              articles={filteredArticles}
              activeIndex={activeIndex}
              onSelectIndex={setActiveIndex}
              onOpenReader={(article) => setReaderArticle(article)}
              bookmarkedIds={bookmarkedIds}
              onToggleBookmark={handleToggleBookmark}
              eyeCare={eyeCare}
              palette={palette}
              deviceMode={deviceMode}
              speakingArticleId={speakingArticleId}
              onToggleSpeak={handleToggleSpeak}
            />
          </DeviceShellWrapper>
        </main>

        {/* Right Ocular Comfort & Active Dispatch Inspector (Desktop xl+) */}
        <aside
          className={`hidden xl:flex w-80 border-l ${palette.borderHairline} ${palette.surfaceBg} flex-col justify-between p-5 overflow-y-auto no-scrollbar shrink-0`}
        >
          <div className="space-y-6">
            <EyeCarePanel
              eyeCare={eyeCare}
              onUpdate={handleUpdateEyeCare}
              onReset={() => setEyeCare(DEFAULT_EYECARE)}
              palette={palette}
            />

            {/* Active Story Quick Takeaways */}
            {activeStory && (
              <div className={`pt-5 border-t ${palette.borderHairline} space-y-3`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold uppercase tracking-wider ${palette.accentText}`}>
                    Current Card Briefing
                  </span>
                  <span className={`text-[11px] font-mono-num ${palette.textMuted}`}>
                    {activeIndex + 1} of {filteredArticles.length}
                  </span>
                </div>

                <h4 className="text-sm font-display font-semibold leading-snug">
                  {activeStory.title}
                </h4>

                <ul className={`space-y-2 text-xs ${palette.textSecondary}`}>
                  {activeStory.keyTakeaways.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className={`font-mono-num text-[11px] ${palette.textMuted}`}>
                        0{idx + 1}.
                      </span>
                      <span>{renderBionicText(item, eyeCare.bionicReading)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className={`pt-4 border-t ${palette.borderHairline} text-[11px] ${palette.textMuted} flex items-center justify-between`}>
            <span>Swipe or press J / K to flip</span>
            <span className="font-mono-num">{sources.filter((s) => s.enabled).length} RSS Feeds</span>
          </div>
        </aside>
      </div>

      {/* Mobile & Tablet Thumb-Zone Navigation Bar (<= 15% viewport sticky cap, 44x44px hitboxes) */}
      <nav
        className={`lg:hidden h-14 px-2 border-t ${palette.borderHairline} ${palette.surfaceBg}/95 backdrop-blur-md grid grid-cols-5 items-center shrink-0 z-30`}
      >
        <button
          type="button"
          onClick={() => {
            setShowSavedOnly(false);
            setSelectedCategory('all');
          }}
          className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium ${
            !showSavedOnly ? palette.accentText : palette.textSecondary
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Flip Deck</span>
        </button>

        <button
          type="button"
          onClick={() => {
            const order: CategoryId[] = ['all', 'tech', 'world', 'business', 'science', 'culture'];
            const next = order[(order.indexOf(selectedCategory) + 1) % order.length];
            setShowSavedOnly(false);
            setSelectedCategory(next);
          }}
          className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium ${palette.textSecondary}`}
        >
          <Compass className="w-4 h-4" />
          <span className="capitalize">{selectedCategory}</span>
        </button>

        <button
          type="button"
          onClick={() => setShowSavedOnly(!showSavedOnly)}
          className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium ${
            showSavedOnly ? palette.accentText : palette.textSecondary
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Saved ({bookmarkedIds.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setIsMobileEyeCareOpen(true)}
          className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium ${palette.textSecondary}`}
        >
          <Eye className="w-4 h-4" />
          <span>Eye-Care</span>
        </button>

        <button
          type="button"
          onClick={() => setIsCodeModalOpen(true)}
          className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium ${palette.textSecondary}`}
        >
          <Code2 className="w-4 h-4" />
          <span>iOS/Android</span>
        </button>
      </nav>

      {/* Mobile Eye-Care Drawer Sheet */}
      {isMobileEyeCareOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end justify-center"
          onClick={() => setIsMobileEyeCareOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-lg rounded-t-3xl border-t ${palette.borderHairline} ${palette.canvasBg} p-6 max-h-[85vh] overflow-y-auto`}
          >
            <div className="w-10 h-1.5 rounded-full bg-slate-600/50 mx-auto mb-4" />
            <EyeCarePanel
              eyeCare={eyeCare}
              onUpdate={handleUpdateEyeCare}
              onReset={() => setEyeCare(DEFAULT_EYECARE)}
              palette={palette}
              onCloseModal={() => setIsMobileEyeCareOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Distraction-Free Editorial Reader Modal */}
      <ReaderModal
        article={readerArticle}
        onClose={() => setReaderArticle(null)}
        bookmarked={readerArticle ? bookmarkedIds.includes(readerArticle.id) : false}
        onToggleBookmark={handleToggleBookmark}
        eyeCare={eyeCare}
        onUpdateEyeCare={handleUpdateEyeCare}
        palette={palette}
        isSpeaking={readerArticle ? speakingArticleId === readerArticle.id : false}
        onToggleSpeak={handleToggleSpeak}
        hasPrev={activeIndex > 0}
        hasNext={activeIndex < filteredArticles.length - 1}
        onPrevArticle={() => {
          if (activeIndex > 0) {
            const nextIdx = activeIndex - 1;
            setActiveIndex(nextIdx);
            setReaderArticle(filteredArticles[nextIdx]);
          }
        }}
        onNextArticle={() => {
          if (activeIndex < filteredArticles.length - 1) {
            const nextIdx = activeIndex + 1;
            setActiveIndex(nextIdx);
            setReaderArticle(filteredArticles[nextIdx]);
          }
        }}
      />

      {/* RSS Source & Feed Syndication Manager Modal */}
      <SourceManagerModal
        isOpen={isSourceModalOpen}
        onClose={() => setIsSourceModalOpen(false)}
        sources={sources}
        onToggleSource={handleToggleSource}
        onAddCustomFeed={handleAddCustomFeed}
        isSyncing={isSyncingRss}
        palette={palette}
      />

      {/* Native iOS (SwiftUI) & Android (Jetpack Compose) Code Exporter Modal */}
      <NativeCodeModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
        palette={palette}
      />

      {/* Global Eye-Protective 2700K Amber Blue-Light Filter & Sub-Pixel Dimmer Overlay */}
      {eyeCare.amberShieldPercent > 0 && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-[60] transition-opacity duration-300"
          style={{
            backgroundColor: `rgba(245, 158, 11, ${(eyeCare.amberShieldPercent / 100) * 0.24})`,
            mixBlendMode: palette.isDark ? 'screen' : 'multiply',
          }}
        />
      )}

      {eyeCare.dimmerPercent > 0 && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-[61] bg-black transition-opacity duration-300"
          style={{
            opacity: eyeCare.dimmerPercent / 100,
          }}
        />
      )}
    </div>
  );
}
