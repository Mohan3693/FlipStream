import React, { useState } from 'react';
import {
  Search,
  RefreshCw,
  Newspaper,
  Star,
  Flame,
  Layers,
  Plus,
  Rss,
  Check,
  X,
  ChevronRight,
} from 'lucide-react';
import {
  ALL_CATEGORIES,
  CategoryId,
  NewsArticle,
  RssSource,
  SpecificCategoryId,
  getCategoryFallbackImage,
  getCategoryLabel,
} from '../services/rssService';
import { ThemePalette } from '../utils/themeUtils';

interface ExploreViewProps {
  articles: NewsArticle[];
  sources: RssSource[];
  enabledCategories: SpecificCategoryId[];
  onToggleCategoryEnabled: (catId: SpecificCategoryId) => void;
  bookmarkedIds: string[];
  onToggleBookmark: (id: string) => void;
  onOpenReader: (article: NewsArticle) => void;
  onSelectCategoryInFeed: (cat: CategoryId) => void;
  onToggleSource: (sourceId: string) => void;
  onAddCustomFeed: (
    name: string,
    url: string,
    category: SpecificCategoryId
  ) => Promise<void>;
  onRefreshAllFeeds: () => Promise<void>;
  isSyncing: boolean;
  lastScannedLabel: string;
  palette: ThemePalette;
}

export const ExploreView: React.FC<ExploreViewProps> = ({
  articles,
  sources,
  enabledCategories,
  onToggleCategoryEnabled,
  onOpenReader,
  onSelectCategoryInFeed,
  onToggleSource,
  onAddCustomFeed,
  onRefreshAllFeeds,
  isSyncing,
  lastScannedLabel,
  palette,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllLatest, setShowAllLatest] = useState(false);
  const [showRssManager, setShowRssManager] = useState(false);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  // Custom RSS Modal State
  const [showAddFeedModal, setShowAddFeedModal] = useState(false);
  const [feedName, setFeedName] = useState('');
  const [feedUrl, setFeedUrl] = useState('');
  const [feedCategory, setFeedCategory] = useState<SpecificCategoryId>('ai');
  const [addingFeed, setAddingFeed] = useState(false);

  const handleImageError = (id: string) => {
    setFailedImages((prev) => ({ ...prev, [id]: true }));
  };

  const getArticleImage = (article: NewsArticle) => {
    if (failedImages[article.id] || !article.imageUrl) {
      return getCategoryFallbackImage(article.category);
    }
    return article.imageUrl;
  };

  const filteredArticles = searchQuery.trim()
    ? articles.filter(
        (a) =>
          a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.sourceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : articles;

  const latestWireArticles = showAllLatest
    ? filteredArticles.slice(0, 14)
    : filteredArticles.slice(0, 4);

  const deepDiveArticles = filteredArticles.slice(4, 10);

  const handleCreateFeed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedName.trim() || !feedUrl.trim()) return;
    setAddingFeed(true);
    await onAddCustomFeed(feedName.trim(), feedUrl.trim(), feedCategory);
    setAddingFeed(false);
    setFeedName('');
    setFeedUrl('');
    setShowAddFeedModal(false);
  };

  return (
    <div
      className={`w-full h-full overflow-y-auto scroll-smooth overscroll-contain ${palette.surfaceBg}`}
    >
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 space-y-6 pb-16">
        {/* 1. Top Search Input Bar (Matches Screenshot 1) */}
        <div className="relative">
          <div
            className={`w-full rounded-xl ${palette.elevatedBg} px-4 py-3 flex items-center gap-3 border ${palette.borderHairline}`}
          >
            <Search className="w-5 h-5 text-[#0284C7] shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for news, topics or publishers"
              className={`w-full bg-transparent text-sm ${palette.textPrimary} placeholder:${palette.textMuted} focus:outline-none`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className={`text-xs ${palette.textMuted} hover:${palette.textPrimary}`}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* 2. Two Feature Banner Widgets (Matches Screenshot 1 Top Cards) */}
        <div className="grid grid-cols-2 gap-3">
          {/* Left Dark Obsidian Card: Live RSS Radar */}
          <button
            type="button"
            disabled={isSyncing}
            onClick={onRefreshAllFeeds}
            className="h-28 rounded-xl bg-gradient-to-br from-[#12161F] via-[#181E29] to-[#0D1017] p-3.5 flex items-center justify-center relative overflow-hidden shadow-sm group text-left"
          >
            <div className="w-full rounded-full border border-white/25 px-3.5 py-2 flex items-center justify-center gap-2 group-hover:border-[#38BDF8]/60 transition-colors">
              <RefreshCw
                className={`w-4 h-4 text-[#38BDF8] shrink-0 ${isSyncing ? 'animate-spin' : ''}`}
              />
              <span className="text-xs sm:text-sm font-medium text-slate-200 truncate">
                {isSyncing ? 'Scanning RSS...' : 'Scan Live RSS'}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-white/15 text-slate-300 shrink-0">
                5m
              </span>
            </div>
          </button>

          {/* Right Warm Editorial Card: Topic Matrix */}
          <button
            type="button"
            onClick={() => setShowRssManager((prev) => !prev)}
            className="h-28 rounded-xl bg-gradient-to-br from-[#FDECD2] via-[#F9DFB9] to-[#F3CFA1] p-3.5 flex flex-col items-center justify-center relative overflow-hidden shadow-sm hover:brightness-95 transition-all"
          >
            <span className="text-lg sm:text-xl font-extrabold tracking-tight text-[#6E4219] leading-none">
              TOPIC
            </span>
            <span className="text-lg sm:text-xl font-extrabold tracking-tight text-[#6E4219] leading-tight">
              RADAR
            </span>
            <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#5A3411]">
              <span className="w-3.5 h-3.5 rounded bg-[#E11D48] text-white flex items-center justify-center text-[8px]">
                24
              </span>
              FEEDS
            </span>
          </button>
        </div>

        {/* 3. Four Illustrated Icon Shortcuts + Topic Strip (Matches Screenshot 1) */}
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-2 pt-1">
            <button
              type="button"
              onClick={() => onSelectCategoryInFeed('all')}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-12 h-14 rounded-xl bg-gradient-to-b from-[#BAE6FD] via-[#38BDF8] to-[#0284C7] p-1.5 flex flex-col justify-between shadow-sm group-hover:scale-105 transition-transform">
                <div className="w-full h-6 rounded-md bg-white/80" />
                <div className="space-y-1 px-0.5 pb-0.5">
                  <div className="w-full h-1 rounded-full bg-white/90" />
                  <div className="w-3/4 h-1 rounded-full bg-white/75" />
                </div>
              </div>
              <span className={`text-xs font-medium ${palette.textPrimary}`}>
                My Stream
              </span>
            </button>

            <button
              type="button"
              onClick={() => onSelectCategoryInFeed('all')}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform">
                <div className="w-12 h-11 rounded-xl bg-[#0284C7] text-white flex items-center justify-center shadow-sm relative">
                  <Newspaper className="w-6 h-6" />
                </div>
              </div>
              <span className={`text-xs font-medium ${palette.textPrimary}`}>
                All News
              </span>
            </button>

            <button
              type="button"
              onClick={() => onSelectCategoryInFeed('ai')}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform">
                <Star className="w-11 h-11 text-[#0284C7] fill-[#0284C7] drop-shadow-sm" />
              </div>
              <span className={`text-xs font-medium ${palette.textPrimary}`}>
                Top Stories
              </span>
            </button>

            <button
              type="button"
              onClick={() => onSelectCategoryInFeed('wars')}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform">
                <Flame className="w-11 h-11 text-[#0284C7] fill-[#38BDF8] drop-shadow-sm" />
              </div>
              <span className={`text-xs font-medium ${palette.textPrimary}`}>
                Trending
              </span>
            </button>
          </div>

          {/* Horizontal Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto scroll-smooth no-scrollbar pt-1">
            {ALL_CATEGORIES.map((cat) => {
              const isEnabled = enabledCategories.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onSelectCategoryInFeed(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors ${
                    isEnabled
                      ? `${palette.accentBg}`
                      : `${palette.elevatedBg} ${palette.textMuted} ${palette.borderHairline}`
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Optional Expandable RSS Topic & Source Manager */}
        {showRssManager && (
          <div
            className={`rounded-2xl border ${palette.borderHairline} ${palette.elevatedBg} p-4 space-y-4`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-sm font-bold ${palette.textPrimary}`}>
                  Active Topics & 24 Live RSS Feeds
                </h3>
                <p className={`text-xs ${palette.textMuted}`}>
                  Last auto-scanned: {lastScannedLabel}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddFeedModal(true)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#0284C7] text-white flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add RSS
                </button>
                <button
                  type="button"
                  onClick={() => setShowRssManager(false)}
                  className={`p-1.5 rounded-lg ${palette.textMuted}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Toggleable 9 Topic Sections */}
            <div className="flex flex-wrap gap-1.5">
              {ALL_CATEGORIES.map((cat) => {
                const enabled = enabledCategories.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => onToggleCategoryEnabled(cat.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 ${
                      enabled
                        ? 'bg-[#0284C7] text-white border-[#0284C7]'
                        : `${palette.surfaceBg} ${palette.textSecondary} ${palette.borderHairline}`
                    }`}
                  >
                    <Check className={`w-3 h-3 ${enabled ? 'opacity-100' : 'opacity-0'}`} />
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Publisher Feed Toggles */}
            <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
              {sources.map((source) => (
                <div
                  key={source.id}
                  className={`px-3 py-2 rounded-xl ${palette.surfaceBg} border ${palette.borderHairline} flex items-center justify-between gap-2`}
                >
                  <div className="min-w-0">
                    <p className={`text-xs font-semibold truncate ${palette.textPrimary}`}>
                      {source.name}{' '}
                      <span className={`font-normal ${palette.textMuted}`}>
                        · {getCategoryLabel(source.category)}
                      </span>
                    </p>
                    <p className={`text-[10px] font-mono-num truncate ${palette.textMuted}`}>
                      {source.domain}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onToggleSource(source.id)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold shrink-0 ${
                      source.enabled
                        ? 'bg-[#0284C7]/15 text-[#0284C7]'
                        : `${palette.elevatedBg} ${palette.textMuted}`
                    }`}
                  >
                    {source.enabled ? 'Active' : 'Muted'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Live Wire Dispatches Section (Matches "Notifications" list in Screenshot 1) */}
        <section className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-lg font-bold tracking-tight ${palette.textPrimary}`}>
                Live Dispatches
              </h2>
              <div className={`w-9 h-[2.5px] mt-1 ${palette.isDark ? 'bg-white' : 'bg-slate-900'}`} />
            </div>
            <button
              type="button"
              onClick={() => setShowAllLatest((prev) => !prev)}
              className="text-xs font-bold uppercase tracking-wider text-[#0284C7] hover:underline"
            >
              {showAllLatest ? 'SHOW LESS' : 'VIEW ALL'}
            </button>
          </div>

          <div className={`divide-y ${palette.borderHairline}`}>
            {latestWireArticles.map((article) => (
              <div
                key={article.id}
                onClick={() => onOpenReader(article)}
                className="py-3.5 flex items-center justify-between gap-4 cursor-pointer group"
              >
                <div className="flex-1 min-w-0 space-y-1">
                  <p
                    className={`text-[15px] font-medium leading-snug line-clamp-2 group-hover:text-[#0284C7] transition-colors ${palette.textPrimary}`}
                  >
                    {article.title}
                  </p>
                  <p className={`text-[11px] ${palette.textMuted}`}>
                    {article.sourceName} · {article.publishedAt}
                  </p>
                </div>
                <img
                  src={getArticleImage(article)}
                  alt={article.title}
                  loading="lazy"
                  onError={() => handleImageError(article.id)}
                  className="w-16 h-16 rounded-xl object-cover shrink-0 bg-slate-200 dark:bg-slate-800"
                />
              </div>
            ))}
          </div>
        </section>

        {/* 5. Deep Dives & Editorial Briefs Section (Matches "Insights" in Screenshot 1) */}
        <section className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-lg font-bold tracking-tight ${palette.textPrimary}`}>
                Editorial Briefs
              </h2>
              <div className={`w-9 h-[2.5px] mt-1 ${palette.isDark ? 'bg-white' : 'bg-slate-900'}`} />
            </div>
            <button
              type="button"
              onClick={() => onSelectCategoryInFeed('all')}
              className="text-xs font-bold uppercase tracking-wider text-[#0284C7] hover:underline"
            >
              VIEW ALL
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {deepDiveArticles.map((article) => (
              <div
                key={article.id}
                onClick={() => onOpenReader(article)}
                className={`rounded-2xl border ${palette.borderHairline} ${palette.elevatedBg} overflow-hidden flex items-center gap-3.5 p-3 cursor-pointer hover:border-[#0284C7]/40 transition-colors`}
              >
                <img
                  src={getArticleImage(article)}
                  alt={article.title}
                  loading="lazy"
                  onError={() => handleImageError(article.id)}
                  className="w-20 h-20 rounded-xl object-cover shrink-0 bg-slate-200 dark:bg-slate-800"
                />
                <div className="min-w-0 flex-1 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#0284C7]">
                    {getCategoryLabel(article.category)}
                  </span>
                  <h3
                    className={`text-sm font-semibold leading-snug line-clamp-2 ${palette.textPrimary}`}
                  >
                    {article.title}
                  </h3>
                  <p className={`text-[11px] ${palette.textMuted} flex items-center gap-1`}>
                    {article.sourceName} <ChevronRight className="w-3 h-3" />
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Add Custom RSS Feed Modal */}
      {showAddFeedModal && (
        <div
          onClick={() => setShowAddFeedModal(false)}
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-md rounded-2xl border ${palette.borderHairline} ${palette.surfaceBg} p-6 shadow-2xl space-y-4`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Rss className="w-4 h-4 text-[#0284C7]" />
                <h3 className={`text-base font-bold ${palette.textPrimary}`}>
                  Add Custom RSS Feed
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddFeedModal(false)}
                className={`p-1 rounded-lg ${palette.textSecondary}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateFeed} className="space-y-3.5">
              <div>
                <label className={`block text-xs font-medium mb-1 ${palette.textSecondary}`}>
                  Publisher Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MIT Technology Review"
                  value={feedName}
                  onChange={(e) => setFeedName(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border ${palette.borderHairline} ${palette.elevatedBg} text-sm ${palette.textPrimary} focus:outline-none`}
                />
              </div>

              <div>
                <label className={`block text-xs font-medium mb-1 ${palette.textSecondary}`}>
                  RSS / XML Feed URL
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://www.technologyreview.com/feed/"
                  value={feedUrl}
                  onChange={(e) => setFeedUrl(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border ${palette.borderHairline} ${palette.elevatedBg} text-sm ${palette.textPrimary} focus:outline-none`}
                />
              </div>

              <div>
                <label className={`block text-xs font-medium mb-1 ${palette.textSecondary}`}>
                  Section Category
                </label>
                <select
                  value={feedCategory}
                  onChange={(e) => setFeedCategory(e.target.value as SpecificCategoryId)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border ${palette.borderHairline} ${palette.elevatedBg} text-sm ${palette.textPrimary} focus:outline-none`}
                >
                  {ALL_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddFeedModal(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold ${palette.textSecondary}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingFeed}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#0284C7] text-white"
                >
                  {addingFeed ? 'Connecting...' : 'Add Feed'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
