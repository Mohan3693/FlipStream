import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  Home,
  User,
  RefreshCw,
} from 'lucide-react';
import {
  ALL_CATEGORIES,
  CategoryId,
  DEFAULT_ENABLED_CATEGORIES,
  DEFAULT_SOURCES,
  CURATED_ARTICLES,
  EyeCareSettings,
  FeedViewMode,
  NewsArticle,
  RssSource,
  SpecificCategoryId,
  fetchBatchLiveRssFeeds,
  fetchLiveRssFeed,
  purgeArticlesOlderThanThreeDays,
} from './services/rssService';
import { THEME_PALETTES } from './utils/themeUtils';
import { VerticalCardDeck } from './components/VerticalCardDeck';
import { ReaderModal } from './components/ReaderModal';
import { ExploreView } from './components/ExploreView';
import { ProfileView, UserProfile, LunarAvatar } from './components/ProfileView';
import {
  auth,
  db,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  googleProvider,
  signInWithPopup,
  firebaseSignOut,
  onAuthStateChanged,
  handleFirestoreError,
  OperationType,
} from './firebase';

type MainNavTab = 'feed' | 'explore' | 'profile';

const STORAGE_KEYS = {
  BOOKMARKS: 'flipstream_bookmarks_v7',
  HISTORY: 'flipstream_history_v7',
  EYECARE: 'flipstream_eyecare_v7',
  SOURCES: 'flipstream_sources_v7',
  LIVE_ARTICLES: 'flipstream_live_articles_v7',
  USER_PROFILE: 'flipstream_user_profile_v7',
  VIEW_MODE: 'flipstream_view_mode_v7',
  REFRESH_MINUTES: 'flipstream_refresh_mins_v7',
  ENABLED_CATS: 'flipstream_enabled_cats_v7',
};

const DEFAULT_EYECARE: EyeCareSettings = {
  theme: 'gallery-stark',
  amberShieldPercent: 0,
  dimmerPercent: 0,
  fontScale: 'md',
  fontFamily: 'sans',
  bionicReading: false,
};

const DEFAULT_USER: UserProfile = {
  name: 'Satish Mohan',
  email: 'satishmohan3693@gmail.com',
  bio: 'Following real-time dispatches across AI, Cybersecurity, Global Defense, Sports, and Tech.',
  role: 'Verified Reader',
  authProvider: 'google',
  isLoggedIn: true,
  joinedDate: 'November 2026',
};

export default function App() {
  // 3-Option Bottom Navigation: 'explore' (left) | 'feed' (center) | 'profile' (right)
  const [activeTab, setActiveTab] = useState<MainNavTab>('feed');

  // Feed View Mode: 'cards' (Short Card Flip) | 'grid' (Magazine Grid)
  const [viewMode, setViewMode] = useState<FeedViewMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.VIEW_MODE);
      return saved === 'grid' || saved === 'cards' ? saved : 'cards';
    } catch {
      return 'cards';
    }
  });

  // Customizable Automatic RSS Refresh Interval (Default: 5 minutes)
  const [refreshIntervalMinutes, setRefreshIntervalMinutes] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REFRESH_MINUTES);
      return saved !== null ? Number(saved) : 5;
    } catch {
      return 5;
    }
  });

  const [nextScanCountdownSeconds, setNextScanCountdownSeconds] = useState<number>(
    () => refreshIntervalMinutes * 60
  );
  const [lastScannedLabel, setLastScannedLabel] = useState<string>('Scanning live...');
  const [purgedExpiredCount, setPurgedExpiredCount] = useState<number>(0);

  // Enabled Category Sections (Tech, AI, Security, Wars, Sports, World, Business, Science, Culture)
  const [enabledCategories, setEnabledCategories] = useState<SpecificCategoryId[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ENABLED_CATS);
      return saved ? JSON.parse(saved) : DEFAULT_ENABLED_CATEGORIES;
    } catch {
      return DEFAULT_ENABLED_CATEGORIES;
    }
  });

  // Eye-Care & Theme State
  const [eyeCare, setEyeCare] = useState<EyeCareSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EYECARE);
      return saved ? { ...DEFAULT_EYECARE, ...JSON.parse(saved) } : DEFAULT_EYECARE;
    } catch {
      return DEFAULT_EYECARE;
    }
  });

  // User Profile & Auth State
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      return saved ? JSON.parse(saved) : DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  });
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [cloudSynced, setCloudSynced] = useState(false);

  // RSS Sources State (24 sources across 9 categories)
  const [sources, setSources] = useState<RssSource[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SOURCES);
      return saved ? JSON.parse(saved) : DEFAULT_SOURCES;
    } catch {
      return DEFAULT_SOURCES;
    }
  });

  // Live Syndicated Articles State (Filtered on boot for < 3 days old)
  const [liveArticles, setLiveArticles] = useState<NewsArticle[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LIVE_ARTICLES);
      if (!saved) return [];
      const parsed: NewsArticle[] = JSON.parse(saved);
      const { freshArticles } = purgeArticlesOlderThanThreeDays(parsed);
      return freshArticles;
    } catch {
      return [];
    }
  });

  // Saved Bookmarks & Reading History IDs
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      return saved
        ? JSON.parse(saved)
        : ['art-ai-1', 'art-sec-1', 'art-tech-1'];
    } catch {
      return ['art-ai-1', 'art-sec-1', 'art-tech-1'];
    }
  });

  const [historyIds, setHistoryIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Feed Category & Reader States
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');
  const [activeIndex, setActiveIndex] = useState(0);
  const [readerArticle, setReaderArticle] = useState<NewsArticle | null>(null);
  const [isSyncingRss, setIsSyncingRss] = useState(false);

  const palette = THEME_PALETTES[eyeCare.theme];

  useEffect(() => {
    if (palette.isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [palette.isDark]);

  // Listen to Firebase Auth state & load user settings from Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const userDocPath = `users/${fbUser.uid}`;
        let loadedSettings = false;
        try {
          const snap = await getDoc(doc(db, 'users', fbUser.uid));
          if (snap.exists()) {
            const data = snap.data();
            loadedSettings = true;
            if (typeof data.refreshIntervalMinutes === 'number') {
              setRefreshIntervalMinutes(data.refreshIntervalMinutes);
            }
            if (data.viewMode === 'cards' || data.viewMode === 'grid') {
              setViewMode(data.viewMode);
            }
            if (data.theme && THEME_PALETTES[data.theme as EyeCareSettings['theme']]) {
              setEyeCare((prev) => ({ ...prev, theme: data.theme }));
            }
            if (Array.isArray(data.bookmarkedIds)) {
              setBookmarkedIds(data.bookmarkedIds.slice(0, 50));
            }
            if (Array.isArray(data.enabledCategories) && data.enabledCategories.length > 0) {
              setEnabledCategories(data.enabledCategories.slice(0, 12));
            }
            setUserProfile({
              uid: fbUser.uid,
              name: data.displayName || fbUser.displayName || 'Satish Mohan',
              email: fbUser.email || '',
              photoUrl: fbUser.photoURL || undefined,
              bio:
                data.bio ||
                'Following real-time dispatches across AI, Cybersecurity, Global Defense, Sports, and Tech.',
              role: 'Google Verified Member',
              authProvider: 'google',
              isLoggedIn: true,
              joinedDate: 'Verified Account',
            });
            setCloudSynced(true);
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, userDocPath);
        }

        if (!loadedSettings) {
          const newProfile: UserProfile = {
            uid: fbUser.uid,
            name: (fbUser.displayName || 'Satish Mohan').slice(0, 80),
            email: fbUser.email || '',
            photoUrl: fbUser.photoURL || undefined,
            bio: 'Following real-time dispatches across AI, Cybersecurity, Global Defense, Sports, and Tech.',
            role: 'Google Verified Member',
            authProvider: 'google',
            isLoggedIn: true,
            joinedDate: 'Verified Account',
          };
          setUserProfile(newProfile);
          if (fbUser.emailVerified) {
            try {
              await setDoc(doc(db, 'users', fbUser.uid), {
                uid: fbUser.uid,
                displayName: newProfile.name.slice(0, 80),
                bio: newProfile.bio.slice(0, 240),
                refreshIntervalMinutes,
                viewMode,
                theme: eyeCare.theme,
                bookmarkedIds: bookmarkedIds.slice(0, 50),
                enabledCategories: enabledCategories.slice(0, 12),
                updatedAt: serverTimestamp(),
              });
              setCloudSynced(true);
            } catch (err) {
              handleFirestoreError(err, OperationType.CREATE, userDocPath);
            }
          }
        }
      } else {
        setCloudSynced(false);
      }
    });
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync changes to Firestore whenever an authenticated Google user updates their settings
  useEffect(() => {
    const fbUser = auth.currentUser;
    if (!fbUser || !fbUser.emailVerified || !cloudSynced) return;
    const userDocPath = `users/${fbUser.uid}`;
    const timer = setTimeout(async () => {
      try {
        await setDoc(doc(db, 'users', fbUser.uid), {
          uid: fbUser.uid,
          displayName: (userProfile.name || 'Reader').slice(0, 80),
          bio: (userProfile.bio || '').slice(0, 240),
          refreshIntervalMinutes: Math.max(0, Math.min(120, Math.round(refreshIntervalMinutes))),
          viewMode,
          theme: eyeCare.theme,
          bookmarkedIds: bookmarkedIds.slice(0, 50).map((id) => String(id).slice(0, 160)),
          enabledCategories: (enabledCategories.length > 0
            ? enabledCategories
            : DEFAULT_ENABLED_CATEGORIES
          )
            .slice(0, 12)
            .map((c) => String(c).slice(0, 24)),
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, userDocPath);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [
    cloudSynced,
    userProfile.name,
    userProfile.bio,
    refreshIntervalMinutes,
    viewMode,
    eyeCare.theme,
    bookmarkedIds,
    enabledCategories,
  ]);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.VIEW_MODE, viewMode);
      localStorage.setItem(STORAGE_KEYS.REFRESH_MINUTES, String(refreshIntervalMinutes));
      localStorage.setItem(STORAGE_KEYS.ENABLED_CATS, JSON.stringify(enabledCategories));
      localStorage.setItem(STORAGE_KEYS.EYECARE, JSON.stringify(eyeCare));
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(userProfile));
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarkedIds));
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(historyIds));
      localStorage.setItem(STORAGE_KEYS.SOURCES, JSON.stringify(sources));
    } catch {
      // ignore
    }
  }, [
    viewMode,
    refreshIntervalMinutes,
    enabledCategories,
    eyeCare,
    userProfile,
    bookmarkedIds,
    historyIds,
    sources,
  ]);

  useEffect(() => {
    try {
      if (liveArticles.length > 0) {
        localStorage.setItem(
          STORAGE_KEYS.LIVE_ARTICLES,
          JSON.stringify(liveArticles.slice(0, 90))
        );
      }
    } catch {
      // ignore
    }
  }, [liveArticles]);

  // 3-Day (72-Hour) Database & Local Cache Purge Function
  const purgeExpiredArticles = useCallback((): number => {
    let removedTotal = 0;
    setLiveArticles((prev) => {
      const { freshArticles, removedCount } = purgeArticlesOlderThanThreeDays(prev);
      removedTotal += removedCount;
      const validIds = new Set([
        ...freshArticles.map((a) => a.id),
        ...CURATED_ARTICLES.map((a) => a.id),
      ]);
      // Also clean expired article IDs from bookmarks & reading history (which syncs to Firestore)
      setBookmarkedIds((bPrev) => bPrev.filter((id) => validIds.has(id)));
      setHistoryIds((hPrev) => hPrev.filter((id) => validIds.has(id)));
      return freshArticles;
    });
    if (removedTotal > 0) {
      setPurgedExpiredCount((c) => c + removedTotal);
    }
    return removedTotal;
  }, []);

  // Real-time RSS Scanner Function
  const syncAllFeeds = useCallback(
    async (currentSources: RssSource[], forceRefresh = false) => {
      setIsSyncingRss(true);
      const fetched = await fetchBatchLiveRssFeeds(currentSources, forceRefresh);
      if (fetched.length > 0) {
        const { freshArticles, removedCount } = purgeArticlesOlderThanThreeDays(fetched);
        if (removedCount > 0) {
          setPurgedExpiredCount((c) => c + removedCount);
        }
        setLiveArticles(freshArticles);
      }
      const now = new Date();
      setLastScannedLabel(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
      setNextScanCountdownSeconds(refreshIntervalMinutes * 60);
      setIsSyncingRss(false);
    },
    [refreshIntervalMinutes]
  );

  // Initial scan on mount + periodic 60-second 3-day retention enforcement
  useEffect(() => {
    syncAllFeeds(sources, false);
    const retentionInterval = setInterval(() => {
      purgeExpiredArticles();
    }, 60 * 1000);
    return () => clearInterval(retentionInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset countdown when user changes refreshIntervalMinutes in Profile
  useEffect(() => {
    setNextScanCountdownSeconds(refreshIntervalMinutes * 60);
  }, [refreshIntervalMinutes]);

  // Automatic Background RSS Scanner Timer (Every 5 mins by default)
  useEffect(() => {
    if (refreshIntervalMinutes <= 0) return;
    const interval = setInterval(() => {
      setNextScanCountdownSeconds((prev) => {
        if (prev <= 1) {
          syncAllFeeds(sources, true);
          return refreshIntervalMinutes * 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [refreshIntervalMinutes, sources, syncAllFeeds]);

  const handleGoogleLogin = async () => {
    setIsAuthLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (auth.currentUser) {
      await firebaseSignOut(auth);
    }
    setCloudSynced(false);
    setUserProfile((prev) => ({
      ...prev,
      isLoggedIn: false,
      authProvider: 'local',
      role: 'Guest Reader',
    }));
  };

  const allArticles = useMemo(() => {
    const { freshArticles } = purgeArticlesOlderThanThreeDays(liveArticles);
    if (freshArticles.length > 0) {
      return [...freshArticles, ...CURATED_ARTICLES];
    }
    return CURATED_ARTICLES;
  }, [liveArticles]);

  const enabledSourceIds = useMemo(
    () => new Set(sources.filter((s) => s.enabled).map((s) => s.id)),
    [sources]
  );

  const activeFeedArticles = useMemo(() => {
    return allArticles.filter((article) => {
      if (!enabledSourceIds.has(article.sourceId)) return false;
      if (!enabledCategories.includes(article.category)) return false;
      if (selectedCategory !== 'all' && article.category !== selectedCategory) {
        return false;
      }
      return true;
    });
  }, [allArticles, enabledSourceIds, enabledCategories, selectedCategory]);

  const savedArticlesList = useMemo(
    () => allArticles.filter((a) => bookmarkedIds.includes(a.id)),
    [allArticles, bookmarkedIds]
  );

  const historyArticlesList = useMemo(
    () =>
      historyIds
        .map((id) => allArticles.find((a) => a.id === id))
        .filter((a): a is NewsArticle => Boolean(a)),
    [allArticles, historyIds]
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [selectedCategory]);

  const handleOpenReader = (article: NewsArticle) => {
    setReaderArticle(article);
    setHistoryIds((prev) =>
      [article.id, ...prev.filter((id) => id !== article.id)].slice(0, 40)
    );
  };

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

  const handleToggleCategoryEnabled = (catId: SpecificCategoryId) => {
    setEnabledCategories((prev) => {
      if (prev.includes(catId)) {
        if (prev.length <= 1) return prev;
        const next = prev.filter((c) => c !== catId);
        if (selectedCategory === catId) setSelectedCategory('all');
        return next;
      }
      return [...prev, catId];
    });
  };

  const handleAddCustomFeed = async (
    name: string,
    url: string,
    category: SpecificCategoryId
  ) => {
    setIsSyncingRss(true);
    const sourceId = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const newSource: RssSource = {
      id: sourceId,
      name,
      category,
      feedUrl: url,
      domain: url.replace(/^https?:\/\//, '').split('/')[0] || 'rss.feed',
      enabled: true,
      editorialTagline: `Live RSS syndication stream (${url})`,
    };

    setSources((prev) => {
      if (prev.some((s) => s.id === sourceId)) return prev;
      return [newSource, ...prev];
    });

    if (!enabledCategories.includes(category)) {
      setEnabledCategories((prev) => [...prev, category]);
    }

    const liveItems = await fetchLiveRssFeed(url, name, category);
    if (liveItems.length > 0) {
      const { freshArticles } = purgeArticlesOlderThanThreeDays(liveItems);
      setLiveArticles((prev) => [...freshArticles, ...prev]);
    }

    setIsSyncingRss(false);
  };

  const visibleCategoryTabs = useMemo(() => {
    return [
      { id: 'all' as CategoryId, label: 'My Stream' },
      ...ALL_CATEGORIES.filter((c) => enabledCategories.includes(c.id)).map((c) => ({
        id: c.id as CategoryId,
        label: c.label,
      })),
    ];
  }, [enabledCategories]);

  return (
    <div
      className={`relative w-screen h-screen overflow-hidden flex flex-col select-none ${palette.canvasBg} ${palette.textPrimary}`}
    >
      {/* Top Category Strip on Feed Tab */}
      {activeTab === 'feed' && (
        <header
          className={`h-12 px-4 sm:px-6 ${palette.chromeBg} flex items-center justify-between gap-4 shrink-0 z-30`}
        >
          <div className="flex items-center gap-5 overflow-x-auto scroll-smooth no-scrollbar">
            {visibleCategoryTabs.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`py-1 text-sm whitespace-nowrap shrink-0 transition-colors ${
                    isActive
                      ? 'text-[#2B95EB] font-bold'
                      : 'text-slate-400 hover:text-slate-200 font-medium'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            disabled={isSyncingRss}
            onClick={() => syncAllFeeds(sources, true)}
            title="Live RSS Auto-Scanner (3-Day Retention Active — Click to scan now)"
            className="text-[11px] font-mono-num text-slate-400 hover:text-white flex items-center gap-1.5 shrink-0"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isSyncingRss ? 'animate-spin text-[#38BDF8]' : ''}`}
            />
            <span className="hidden sm:inline">
              {isSyncingRss
                ? 'Scanning...'
                : refreshIntervalMinutes > 0
                ? `${Math.floor(nextScanCountdownSeconds / 60)}:${String(
                    nextScanCountdownSeconds % 60
                  ).padStart(2, '0')}`
                : 'Live'}
            </span>
          </button>
        </header>
      )}

      {/* Main Content Viewport */}
      <main className="flex-1 min-h-0 w-full relative overflow-hidden">
        {activeTab === 'feed' && (
          <VerticalCardDeck
            articles={activeFeedArticles}
            activeIndex={activeIndex}
            onSelectIndex={setActiveIndex}
            onOpenReader={handleOpenReader}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={handleToggleBookmark}
            eyeCare={eyeCare}
            palette={palette}
            viewMode={viewMode}
          />
        )}

        {activeTab === 'explore' && (
          <ExploreView
            articles={allArticles.filter((a) => enabledSourceIds.has(a.sourceId))}
            sources={sources}
            enabledCategories={enabledCategories}
            onToggleCategoryEnabled={handleToggleCategoryEnabled}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={handleToggleBookmark}
            onOpenReader={handleOpenReader}
            onSelectCategoryInFeed={(cat) => {
              setSelectedCategory(cat);
              setActiveTab('feed');
            }}
            onToggleSource={handleToggleSource}
            onAddCustomFeed={handleAddCustomFeed}
            onRefreshAllFeeds={() => syncAllFeeds(sources, true)}
            isSyncing={isSyncingRss}
            lastScannedLabel={lastScannedLabel}
            palette={palette}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            user={userProfile}
            onUpdateUser={setUserProfile}
            onGoogleLogin={handleGoogleLogin}
            onSignOut={handleSignOut}
            isAuthLoading={isAuthLoading}
            cloudSynced={cloudSynced}
            refreshIntervalMinutes={refreshIntervalMinutes}
            onChangeRefreshInterval={setRefreshIntervalMinutes}
            lastScannedLabel={lastScannedLabel}
            nextScanCountdownSeconds={nextScanCountdownSeconds}
            onScanNow={() => syncAllFeeds(sources, true)}
            onPurgeExpiredNow={purgeExpiredArticles}
            purgedExpiredCount={purgedExpiredCount}
            isSyncingRss={isSyncingRss}
            enabledCategories={enabledCategories}
            onToggleCategoryEnabled={handleToggleCategoryEnabled}
            savedArticles={savedArticlesList}
            historyArticles={historyArticlesList}
            onClearHistory={() => setHistoryIds([])}
            onOpenReader={handleOpenReader}
            onToggleBookmark={handleToggleBookmark}
            eyeCare={eyeCare}
            onUpdateEyeCare={handleUpdateEyeCare}
            onResetEyeCare={() => setEyeCare(DEFAULT_EYECARE)}
            viewMode={viewMode}
            onChangeViewMode={setViewMode}
            sources={sources}
            palette={palette}
          />
        )}
      </main>

      {/* Sleek Obsidian 3-Icon Bottom Navigation Bar */}
      <nav
        aria-label="Primary Bottom Navigation"
        className={`h-14 px-4 ${palette.chromeBg} border-t border-white/10 flex flex-col items-center justify-between pt-2 pb-1.5 shrink-0 z-30`}
      >
        <div className="w-full max-w-md grid grid-cols-3 items-center">
          {/* Left Icon: Search / Discover */}
          <button
            type="button"
            onClick={() => setActiveTab('explore')}
            aria-label="Discover & Search"
            className={`flex items-center justify-center py-1 transition-colors ${
              activeTab === 'explore' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Search className="w-5 h-5 stroke-[2.2]" />
          </button>

          {/* Center Icon: Home / Main Stream */}
          <button
            type="button"
            onClick={() => setActiveTab('feed')}
            aria-label="Home Stream"
            className={`flex items-center justify-center py-1 transition-colors ${
              activeTab === 'feed' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Home
              className={`w-5 h-5 stroke-[2.2] ${
                activeTab === 'feed' ? 'fill-white text-white' : ''
              }`}
            />
          </button>

          {/* Right Icon: Profile / Lunar Avatar */}
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            aria-label="Profile & Saved"
            className={`flex items-center justify-center py-0.5 transition-colors ${
              activeTab === 'profile' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {userProfile.isLoggedIn ? (
              <div
                className={`rounded-full p-0.5 ${
                  activeTab === 'profile' ? 'ring-1.5 ring-[#2B95EB]' : ''
                }`}
              >
                <LunarAvatar
                  photoUrl={userProfile.photoUrl}
                  sizeClass="w-6 h-6"
                  roundedClass="rounded-full"
                />
              </div>
            ) : (
              <User
                className={`w-5 h-5 stroke-[2.2] ${
                  activeTab === 'profile' ? 'fill-white text-white' : ''
                }`}
              />
            )}
          </button>
        </div>

        {/* Bottom Home Indicator Pill */}
        <div className="w-28 h-1 rounded-full bg-white/30" />
      </nav>

      {/* Full-Screen Editorial Article Reader Modal */}
      <ReaderModal
        article={readerArticle}
        onClose={() => setReaderArticle(null)}
        bookmarked={readerArticle ? bookmarkedIds.includes(readerArticle.id) : false}
        onToggleBookmark={handleToggleBookmark}
        eyeCare={eyeCare}
        onUpdateEyeCare={handleUpdateEyeCare}
        palette={palette}
        hasPrev={activeIndex > 0}
        hasNext={activeIndex < activeFeedArticles.length - 1}
        onPrevArticle={() => {
          if (activeIndex > 0) {
            const nextIdx = activeIndex - 1;
            setActiveIndex(nextIdx);
            handleOpenReader(activeFeedArticles[nextIdx]);
          }
        }}
        onNextArticle={() => {
          if (activeIndex < activeFeedArticles.length - 1) {
            const nextIdx = activeIndex + 1;
            setActiveIndex(nextIdx);
            handleOpenReader(activeFeedArticles[nextIdx]);
          }
        }}
      />

      {/* Global Eye-Protective Warm Filter & Dimmer Overlay */}
      {eyeCare.amberShieldPercent > 0 && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-[60]"
          style={{
            backgroundColor: `rgba(245, 158, 11, ${(eyeCare.amberShieldPercent / 100) * 0.24})`,
            mixBlendMode: palette.isDark ? 'screen' : 'multiply',
          }}
        />
      )}

      {eyeCare.dimmerPercent > 0 && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-[61] bg-black"
          style={{
            opacity: eyeCare.dimmerPercent / 100,
          }}
        />
      )}
    </div>
  );
}
