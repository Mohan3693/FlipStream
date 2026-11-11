import React, { useState } from 'react';
import { Rss, Plus, Check, RefreshCw, X, Globe } from 'lucide-react';
import { RssSource, CategoryId } from '../services/rssService';
import { ThemePalette } from '../utils/themeUtils';

interface SourceManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  sources: RssSource[];
  onToggleSource: (id: string) => void;
  onAddCustomFeed: (name: string, url: string, category: Exclude<CategoryId, 'all'>) => Promise<void>;
  isSyncing: boolean;
  palette: ThemePalette;
}

export const SourceManagerModal: React.FC<SourceManagerModalProps> = ({
  isOpen,
  onClose,
  sources,
  onToggleSource,
  onAddCustomFeed,
  isSyncing,
  palette,
}) => {
  const [feedName, setFeedName] = useState('');
  const [feedUrl, setFeedUrl] = useState('');
  const [feedCategory, setFeedCategory] = useState<Exclude<CategoryId, 'all'>>('tech');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedName.trim() || !feedUrl.trim()) return;
    setStatusMessage('Connecting to RSS stream and formatting cards...');
    await onAddCustomFeed(feedName.trim(), feedUrl.trim(), feedCategory);
    setFeedName('');
    setFeedUrl('');
    setStatusMessage('Feed syndicated into your FlipStream deck.');
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const quickPresets = [
    {
      name: 'Hacker News Frontpage',
      url: 'https://hnrss.org/frontpage',
      category: 'tech' as const,
    },
    {
      name: 'The Verge Tech',
      url: 'https://www.theverge.com/rss/index.xml',
      category: 'tech' as const,
    },
    {
      name: 'NASA Breaking Science',
      url: 'https://www.nasa.gov/news-release/feed/',
      category: 'science' as const,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-2xl max-h-[88vh] rounded-2xl border ${palette.borderHairline} ${palette.canvasBg} ${palette.textPrimary} flex flex-col overflow-hidden shadow-2xl`}
      >
        <header
          className={`px-6 py-4 border-b ${palette.borderHairline} ${palette.surfaceBg} flex items-center justify-between`}
        >
          <div className="flex items-center gap-2.5">
            <Rss className={`w-5 h-5 ${palette.accentText}`} />
            <div>
              <h2 className="text-base font-display font-semibold">
                RSS Syndication & Publication Sources
              </h2>
              <p className={`text-xs ${palette.textMuted}`}>
                Curate active newsrooms or connect any live XML/RSS endpoint
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`min-h-[40px] min-w-[40px] rounded-lg border ${palette.borderHairline} ${palette.elevatedBg} flex items-center justify-center`}
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Add Custom RSS Stream Form */}
          <form
            onSubmit={handleSubmit}
            className={`p-4 rounded-xl border ${palette.borderHairline} ${palette.surfaceBg} space-y-3`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Add Custom Live RSS Feed
              </span>
              {isSyncing && (
                <span className="text-xs text-amber-400 flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Syncing XML...</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <input
                type="text"
                placeholder="Publication Name (e.g. Wired)"
                value={feedName}
                onChange={(e) => setFeedName(e.target.value)}
                className={`px-3 py-2 rounded-lg border ${palette.borderHairline} ${palette.canvasBg} text-xs focus:outline-none focus:border-amber-400`}
              />
              <input
                type="url"
                placeholder="https://example.com/feed.xml"
                value={feedUrl}
                onChange={(e) => setFeedUrl(e.target.value)}
                className={`px-3 py-2 rounded-lg border ${palette.borderHairline} ${palette.canvasBg} text-xs focus:outline-none focus:border-amber-400`}
              />
              <div className="flex gap-2">
                <select
                  value={feedCategory}
                  onChange={(e) =>
                    setFeedCategory(e.target.value as Exclude<CategoryId, 'all'>)
                  }
                  className={`flex-1 px-2.5 py-2 rounded-lg border ${palette.borderHairline} ${palette.canvasBg} text-xs focus:outline-none`}
                >
                  <option value="tech">Tech</option>
                  <option value="world">World</option>
                  <option value="business">Business</option>
                  <option value="science">Science</option>
                  <option value="culture">Culture</option>
                </select>
                <button
                  type="submit"
                  disabled={isSyncing}
                  className="px-3.5 py-2 rounded-lg bg-amber-500 text-slate-950 font-semibold text-xs flex items-center gap-1 hover:bg-amber-400 transition-colors whitespace-nowrap shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* One-Click Live RSS Presets */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className={`text-[11px] ${palette.textMuted}`}>Quick Live Feeds:</span>
              {quickPresets.map((preset) => (
                <button
                  key={preset.url}
                  type="button"
                  disabled={isSyncing}
                  onClick={() => onAddCustomFeed(preset.name, preset.url, preset.category)}
                  className={`text-[11px] px-2.5 py-1 rounded-md border ${palette.borderHairline} ${palette.elevatedBg} hover:border-amber-400/50 transition-colors`}
                >
                  + {preset.name}
                </button>
              ))}
            </div>

            {statusMessage && (
              <p className="text-xs text-emerald-400 pt-1">{statusMessage}</p>
            )}
          </form>

          {/* Active Curated Directory */}
          <div className="space-y-2.5">
            <h3 className={`text-xs font-semibold uppercase tracking-wider ${palette.textSecondary}`}>
              Active Syndication Directory ({sources.filter((s) => s.enabled).length} of {sources.length} enabled)
            </h3>

            <div className="divide-y divide-slate-800/40 border rounded-xl overflow-hidden border-slate-800/60">
              {sources.map((source) => (
                <div
                  key={source.id}
                  onClick={() => onToggleSource(source.id)}
                  className={`p-3.5 ${palette.surfaceBg} flex items-center justify-between gap-4 cursor-pointer hover:opacity-95 transition-opacity`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs">
                      <Globe className={`w-3.5 h-3.5 ${palette.accentText} shrink-0`} />
                      <span className="font-semibold truncate">{source.name}</span>
                      <span aria-hidden="true" className={palette.textMuted}>·</span>
                      <span className={`uppercase tracking-wider text-[11px] ${palette.textMuted}`}>
                        {source.category}
                      </span>
                    </div>
                    <p className={`text-xs ${palette.textSecondary} mt-0.5 truncate`}>
                      {source.editorialTagline}
                    </p>
                  </div>

                  <button
                    type="button"
                    aria-label={`Toggle ${source.name}`}
                    className={`min-h-[36px] px-3 rounded-lg border text-xs font-medium flex items-center gap-1.5 shrink-0 ${
                      source.enabled
                        ? 'border-amber-500/40 bg-amber-500/15 text-amber-300'
                        : `${palette.borderHairline} ${palette.elevatedBg} ${palette.textMuted}`
                    }`}
                  >
                    <Check className={`w-3.5 h-3.5 ${source.enabled ? 'opacity-100' : 'opacity-0'}`} />
                    <span>{source.enabled ? 'Subscribed' : 'Muted'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
