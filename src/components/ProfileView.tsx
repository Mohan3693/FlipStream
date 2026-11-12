import React, { useState } from 'react';
import {
  User,
  Bookmark,
  Settings,
  ArrowLeft,
  Bell,
  Sliders,
  Sun,
  Moon,
  Play,
  Pencil,
  Check,
  RefreshCw,
  LogOut,
  ChevronDown,
  Shield,
  Trash2,
  Smartphone,
  Download,
  Database,
} from 'lucide-react';
import {
  ALL_CATEGORIES,
  EyeCareSettings,
  FeedViewMode,
  NewsArticle,
  RssSource,
  SpecificCategoryId,
  ThemeId,
  getCategoryFallbackImage,
} from '../services/rssService';
import { ThemePalette, THEME_PALETTES } from '../utils/themeUtils';
import { usePWAInstall } from '../hooks/usePWAInstall';

export interface UserProfile {
  uid?: string;
  name: string;
  email: string;
  photoUrl?: string;
  bio: string;
  role: string;
  authProvider: 'google' | 'auth0' | 'local';
  isLoggedIn: boolean;
  joinedDate: string;
}

interface ProfileViewProps {
  user: UserProfile;
  onUpdateUser: (user: UserProfile) => void;
  onGoogleLogin: () => Promise<void>;
  onSignOut: () => Promise<void>;
  isAuthLoading: boolean;
  cloudSynced: boolean;
  refreshIntervalMinutes: number;
  onChangeRefreshInterval: (mins: number) => void;
  lastScannedLabel: string;
  nextScanCountdownSeconds: number;
  onScanNow: () => void;
  onPurgeExpiredNow: () => number;
  purgedExpiredCount: number;
  isSyncingRss: boolean;
  enabledCategories: SpecificCategoryId[];
  onToggleCategoryEnabled: (catId: SpecificCategoryId) => void;
  savedArticles: NewsArticle[];
  historyArticles: NewsArticle[];
  onClearHistory: () => void;
  onOpenReader: (article: NewsArticle) => void;
  onToggleBookmark: (id: string) => void;
  eyeCare: EyeCareSettings;
  onUpdateEyeCare: (patch: Partial<EyeCareSettings>) => void;
  onResetEyeCare: () => void;
  viewMode: FeedViewMode;
  onChangeViewMode: (mode: FeedViewMode) => void;
  sources: RssSource[];
  palette: ThemePalette;
}

export const LunarAvatar: React.FC<{
  photoUrl?: string;
  sizeClass?: string;
  roundedClass?: string;
  showGoogleBadge?: boolean;
}> = ({
  photoUrl,
  sizeClass = 'w-20 h-20',
  roundedClass = 'rounded-2xl',
  showGoogleBadge = false,
}) => {
  return (
    <div className={`relative inline-block ${sizeClass}`}>
      {photoUrl ? (
        <img
          src={photoUrl}
          alt="User Avatar"
          className={`w-full h-full object-cover ${roundedClass} shadow-md`}
        />
      ) : (
        <div
          className={`w-full h-full ${roundedClass} bg-black overflow-hidden shadow-md flex items-center justify-center relative border border-slate-700/40`}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <rect width="100" height="100" fill="#050507" />
            <defs>
              <radialGradient id="moonGlow" cx="35%" cy="50%" r="48%">
                <stop offset="0%" stopColor="#D6D3CD" />
                <stop offset="55%" stopColor="#9E9A93" />
                <stop offset="85%" stopColor="#57544F" />
                <stop offset="100%" stopColor="#18181A" />
              </radialGradient>
              <clipPath id="leftHalfMoon">
                <rect x="0" y="0" width="52" height="100" />
              </clipPath>
            </defs>
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="url(#moonGlow)"
              clipPath="url(#leftHalfMoon)"
            />
            <circle cx="32" cy="34" r="5" fill="#78746E" opacity="0.55" />
            <circle cx="26" cy="56" r="7" fill="#68645E" opacity="0.5" />
            <circle cx="40" cy="68" r="4" fill="#5A5752" opacity="0.6" />
            <circle cx="38" cy="46" r="3.5" fill="#85817A" opacity="0.5" />
          </svg>
        </div>
      )}

      {showGoogleBadge && (
        <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-white shadow flex items-center justify-center text-[10px] font-extrabold text-[#0284C7]">
          G
        </span>
      )}
    </div>
  );
};

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  onUpdateUser,
  onGoogleLogin,
  onSignOut,
  isAuthLoading,
  cloudSynced,
  refreshIntervalMinutes,
  onChangeRefreshInterval,
  lastScannedLabel,
  onScanNow,
  onPurgeExpiredNow,
  purgedExpiredCount,
  isSyncingRss,
  enabledCategories,
  onToggleCategoryEnabled,
  savedArticles,
  historyArticles,
  onClearHistory,
  onOpenReader,
  eyeCare,
  onUpdateEyeCare,
  viewMode,
  onChangeViewMode,
  palette,
}) => {
  const [showOptionsScreen, setShowOptionsScreen] = useState(false);
  const [showTopicPreferences, setShowTopicPreferences] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeListTab, setActiveListTab] = useState<'saved' | 'history'>('saved');
  const [hdImages, setHdImages] = useState(true);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  // Edit Profile State
  const [draftName, setDraftName] = useState(user.name);
  const [draftEmail, setDraftEmail] = useState(user.email);
  const [draftBio, setDraftBio] = useState(user.bio);

  const handleImageError = (id: string) => {
    setFailedImages((prev) => ({ ...prev, [id]: true }));
  };

  const getArticleImage = (article: NewsArticle) => {
    if (failedImages[article.id] || !article.imageUrl) {
      return getCategoryFallbackImage(article.category);
    }
    return article.imageUrl;
  };

  const triggerToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 2600);
  };

  const handleSignInClick = async () => {
    try {
      await onGoogleLogin();
    } catch {
      onUpdateUser({
        ...user,
        isLoggedIn: true,
        authProvider: 'google',
        role: 'Verified Reader',
      });
      triggerToast('Signed in as ' + user.name);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...user,
      name: draftName.trim() || 'Satish Mohan',
      email: draftEmail.trim() || user.email,
      bio: draftBio.trim(),
      isLoggedIn: true,
    });
    setShowEditModal(false);
    triggerToast('Profile updated');
  };

  const isNightMode = palette.isDark;

  const toggleNightMode = () => {
    const nextTheme: ThemeId = isNightMode ? 'gallery-stark' : 'oled-midnight';
    onUpdateEyeCare({ theme: nextTheme });
  };

  // OPTIONS SCREEN (Matches Screenshot 4 + 3-Day Retention & Android 14+ APK Release Center)
  if (showOptionsScreen) {
    return (
      <div
        className={`w-full h-full overflow-y-auto scroll-smooth overscroll-contain ${palette.surfaceBg}`}
      >
        <div className="max-w-2xl mx-auto pb-16">
          {/* Top Options Header Bar */}
          <div
            className={`h-14 px-4 sm:px-6 border-b ${palette.borderHairline} flex items-center justify-between sticky top-0 z-20 ${palette.surfaceBg}`}
          >
            <button
              type="button"
              onClick={() => setShowOptionsScreen(false)}
              aria-label="Back to Profile"
              className={`p-2 -ml-2 rounded-full ${palette.textSecondary} hover:${palette.textPrimary}`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <h1 className={`text-base font-medium ${palette.textSecondary}`}>
              Options
            </h1>

            <button
              type="button"
              onClick={() => setShowOptionsScreen(false)}
              className="flex items-center"
            >
              <LunarAvatar
                photoUrl={user.photoUrl}
                sizeClass="w-8 h-8"
                roundedClass="rounded-full"
                showGoogleBadge={true}
              />
            </button>
          </div>

          {feedbackToast && (
            <div className="mx-5 mt-3 px-3.5 py-2 rounded-xl bg-[#0284C7]/15 text-[#0284C7] text-xs font-semibold">
              {feedbackToast}
            </div>
          )}

          {/* Options Rows List */}
          <div className={`divide-y ${palette.borderHairline}`}>
            {/* Row 1: Reading Typography */}
            <div className="px-5 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-5">
                <span className={`w-6 text-center text-sm font-bold ${palette.textPrimary}`}>
                  Aa
                </span>
                <span className={`text-[15px] ${palette.textSecondary}`}>
                  Reading Font
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  onUpdateEyeCare({
                    fontFamily: eyeCare.fontFamily === 'sans' ? 'serif' : 'sans',
                  })
                }
                className="text-sm font-medium text-[#0284C7] flex items-center gap-1"
              >
                {eyeCare.fontFamily === 'sans' ? 'Clean Sans' : 'Editorial Serif'}
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Row 2: Live RSS Auto-Refresh Interval */}
            <div className="px-5 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-5">
                <Bell className={`w-5 h-5 ${palette.textPrimary}`} />
                <div>
                  <p className={`text-[15px] ${palette.textSecondary}`}>
                    Live RSS Auto-Scan
                  </p>
                  <p className={`text-xs ${palette.textMuted}`}>
                    Last scan: {lastScannedLabel}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <select
                  aria-label="Auto-Scan Interval"
                  value={refreshIntervalMinutes}
                  onChange={(e) => onChangeRefreshInterval(Number(e.target.value))}
                  className="bg-transparent text-sm font-medium text-[#0284C7] focus:outline-none cursor-pointer"
                >
                  <option value={1}>Every 1 min</option>
                  <option value={5}>Every 5 mins</option>
                  <option value={15}>Every 15 mins</option>
                  <option value={30}>Every 30 mins</option>
                  <option value={0}>Manual Off</option>
                </select>
                <button
                  type="button"
                  disabled={isSyncingRss}
                  onClick={onScanNow}
                  title="Scan RSS Now"
                  className="p-1.5 rounded-lg bg-[#0284C7]/10 text-[#0284C7]"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingRss ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Row 3: 3-Day (72-Hour) Database Retention Engine */}
            <div className="px-5 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-5">
                <Database className={`w-5 h-5 ${palette.textPrimary}`} />
                <div>
                  <p className={`text-[15px] ${palette.textSecondary}`}>
                    3-Day News Retention
                  </p>
                  <p className={`text-xs ${palette.textMuted}`}>
                    Auto-removes stories older than 3 days ({purgedExpiredCount} purged)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const removed = onPurgeExpiredNow();
                  triggerToast(
                    `3-Day DB cleanup complete (${removed} expired items removed)`
                  );
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#0284C7]/15 text-[#0284C7]"
              >
                Purge &gt;3d Now
              </button>
            </div>

            {/* Row 4: Your Preferences (Expandable Topic Customizer) */}
            <div>
              <button
                type="button"
                onClick={() => setShowTopicPreferences((prev) => !prev)}
                className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left"
              >
                <div className="flex items-center gap-5">
                  <Sliders className={`w-5 h-5 ${palette.textPrimary}`} />
                  <div>
                    <p className={`text-[15px] ${palette.textSecondary}`}>
                      Your Preferences
                    </p>
                    <p className={`text-xs ${palette.textMuted}`}>
                      {enabledCategories.length} of {ALL_CATEGORIES.length} topics enabled
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-[#0284C7]">
                  {showTopicPreferences ? 'Hide' : 'Customize'}
                </span>
              </button>

              {showTopicPreferences && (
                <div className="px-5 pb-4 pt-1 flex flex-wrap gap-2">
                  {ALL_CATEGORIES.map((cat) => {
                    const enabled = enabledCategories.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => onToggleCategoryEnabled(cat.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border flex items-center gap-1.5 transition-colors ${
                          enabled
                            ? 'bg-[#0284C7] text-white border-[#0284C7]'
                            : `${palette.elevatedBg} ${palette.textSecondary} ${palette.borderHairline}`
                        }`}
                      >
                        <Check className={`w-3 h-3 ${enabled ? 'opacity-100' : 'opacity-0'}`} />
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Row 5: HD Images */}
            <div className="px-5 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-5">
                <span className={`w-6 text-center text-base font-semibold ${palette.textPrimary}`}>
                  Δ
                </span>
                <span className={`text-[15px] ${palette.textSecondary}`}>
                  HD Images
                </span>
              </div>

              <button
                type="button"
                onClick={() => setHdImages((prev) => !prev)}
                aria-label="Toggle HD Images"
                className="relative w-12 h-7 flex items-center rounded-full p-0.5 transition-colors bg-[#0284C7]/20"
              >
                <span
                  className={`w-8 h-8 -my-1 rounded-full flex items-center justify-center text-xs font-bold shadow-md transition-transform ${
                    hdImages
                      ? 'translate-x-4 bg-[#2B95EB] text-white'
                      : '-translate-x-1 bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  Δ
                </span>
              </button>
            </div>

            {/* Row 6: Night Mode & Theme Selector */}
            <div className="px-5 py-4 space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-5">
                  {isNightMode ? (
                    <Moon className={`w-5 h-5 ${palette.textPrimary}`} />
                  ) : (
                    <Sun className={`w-5 h-5 ${palette.textPrimary}`} />
                  )}
                  <div>
                    <p className={`text-[15px] ${palette.textSecondary}`}>
                      Night Mode
                    </p>
                    <p className={`text-xs ${palette.textMuted}`}>
                      For better readability at night
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={toggleNightMode}
                  aria-label="Toggle Night Mode"
                  className={`relative w-12 h-7 flex items-center rounded-full p-0.5 transition-colors ${
                    isNightMode ? 'bg-[#0284C7]/30' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`w-8 h-8 -my-1 rounded-full flex items-center justify-center shadow-md transition-transform ${
                      isNightMode
                        ? 'translate-x-4 bg-[#2B95EB] text-white'
                        : '-translate-x-1 bg-white text-slate-500 border border-slate-200'
                    }`}
                  >
                    {isNightMode ? (
                      <Moon className="w-4 h-4" />
                    ) : (
                      <Sun className="w-4 h-4" />
                    )}
                  </span>
                </button>
              </div>

              <div className="pl-10 space-y-2.5 pt-1">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(Object.keys(THEME_PALETTES) as ThemeId[]).map((tId) => {
                    const t = THEME_PALETTES[tId];
                    const active = eyeCare.theme === tId;
                    return (
                      <button
                        key={tId}
                        type="button"
                        onClick={() => onUpdateEyeCare({ theme: tId })}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border text-left transition-colors ${
                          active
                            ? 'border-[#0284C7] bg-[#0284C7]/10 text-[#0284C7] font-semibold'
                            : `${palette.elevatedBg} ${palette.textSecondary} ${palette.borderHairline}`
                        }`}
                      >
                        {t.name}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between gap-4 pt-1">
                  <span className={`text-xs flex items-center gap-1.5 ${palette.textMuted}`}>
                    <Shield className="w-3.5 h-3.5 text-[#0284C7]" />
                    Eye-Care Warm Filter ({eyeCare.amberShieldPercent}%)
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={80}
                    step={5}
                    value={eyeCare.amberShieldPercent}
                    onChange={(e) =>
                      onUpdateEyeCare({ amberShieldPercent: Number(e.target.value) })
                    }
                    className="w-32 accent-[#0284C7] cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Row 7: Layout Mode (Short Card Flip vs Grid) */}
            <div className="px-5 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-5">
                <Play className={`w-5 h-5 ${palette.textPrimary}`} />
                <span className={`text-[15px] ${palette.textSecondary}`}>
                  Stream Mode
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  onChangeViewMode(viewMode === 'cards' ? 'grid' : 'cards')
                }
                className="text-sm font-medium text-[#0284C7] flex items-center gap-1"
              >
                {viewMode === 'cards' ? 'Short Card Flip' : 'Magazine Grid'}
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Row 8: Text Size */}
            <div className="px-5 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-5">
                <span className={`w-6 text-center text-sm font-semibold ${palette.textPrimary}`}>
                  <span className="text-xs">A</span>A
                </span>
                <span className={`text-[15px] ${palette.textSecondary}`}>
                  Text Size
                </span>
              </div>
              <select
                aria-label="Text Size"
                value={eyeCare.fontScale}
                onChange={(e) =>
                  onUpdateEyeCare({
                    fontScale: e.target.value as EyeCareSettings['fontScale'],
                  })
                }
                className="bg-transparent text-sm font-medium text-[#0284C7] focus:outline-none cursor-pointer"
              >
                <option value="sm">Compact</option>
                <option value="md">Default</option>
                <option value="lg">Large</option>
                <option value="xl">Extra Large</option>
              </select>
            </div>

            {/* Row 9: Android 14+ (API 34/35) APK & GitHub Release Pipeline */}
            <div className="px-5 py-4 space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-5">
                  <Smartphone className={`w-5 h-5 text-[#0284C7]`} />
                  <div>
                    <p className={`text-[15px] font-medium ${palette.textPrimary}`}>
                      Android 14+ App &amp; APK Release
                    </p>
                    <p className={`text-xs ${palette.textMuted}`}>
                      Target SDK 35 (Android 14 / 15) · GitHub Actions CI Ready
                    </p>
                  </div>
                </div>

                {!isInstalled && (
                  <button
                    type="button"
                    onClick={async () => {
                      if (isInstallable) {
                        await install();
                      } else if (isIOS) {
                        triggerToast('Tap Share -> Add to Home Screen in Safari');
                      } else {
                        triggerToast(
                          'PWA Manifest active — use browser "Install App" or push to GitHub for signed APK'
                        );
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#0284C7] text-white flex items-center gap-1.5 shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Install App
                  </button>
                )}
              </div>

              <div
                className={`ml-10 p-3 rounded-xl border ${palette.borderHairline} ${palette.elevatedBg} text-xs space-y-1.5`}
              >
                <p className={`font-semibold ${palette.textPrimary}`}>
                  GitHub Release Workflow: <code className="text-[#0284C7]">.github/workflows/android-apk-release.yml</code>
                </p>
                <p className={palette.textMuted}>
                  Every push to <code className="font-mono-num">main</code> or tag <code className="font-mono-num">v*</code> automatically compiles and signs <code className="font-mono-num">FlipStream-Android14-release.apk</code> (minSdk 34 / targetSdk 35) and attaches it to your GitHub Releases page.
                </p>
              </div>
            </div>

            {/* Row 10: Share & Rate */}
            <div className="px-5 py-5 space-y-5 pl-16">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                  triggerToast('App link copied to clipboard');
                }}
                className={`block text-[15px] ${palette.textSecondary} hover:${palette.textPrimary}`}
              >
                Share this app
              </button>

              <button
                type="button"
                onClick={() => triggerToast('Thank you for rating FlipStream!')}
                className={`block text-[15px] ${palette.textSecondary} hover:${palette.textPrimary}`}
              >
                Rate this app
              </button>

              {user.isLoggedIn && (
                <button
                  type="button"
                  onClick={() => {
                    onSignOut();
                    setShowOptionsScreen(false);
                  }}
                  className="flex items-center gap-2 text-[15px] text-rose-500 font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out ({user.email})
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // MAIN PROFILE SCREEN
  const displayedArticles =
    activeListTab === 'saved' ? savedArticles : historyArticles;

  return (
    <div
      className={`w-full h-full overflow-y-auto scroll-smooth overscroll-contain ${palette.surfaceBg}`}
    >
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 space-y-6 pb-16">
        {/* Top Action Bar: Feedback Pill + Settings Gear Icon */}
        <div className="flex items-center justify-end gap-3">
          {feedbackToast && (
            <span className="text-xs font-medium text-[#0284C7] mr-auto">
              {feedbackToast}
            </span>
          )}
          <button
            type="button"
            onClick={() =>
              triggerToast(
                cloudSynced
                  ? 'Cloud Sync Active · 3-Day Retention · Auto-scan ' + refreshIntervalMinutes + 'm'
                  : '3-Day Retention Active · Auto-scan every ' + refreshIntervalMinutes + 'm'
              )
            }
            className={`px-4 py-1.5 rounded-full text-xs font-medium ${palette.elevatedBg} ${palette.textPrimary}`}
          >
            Feedback
          </button>

          <button
            type="button"
            onClick={() => setShowOptionsScreen(true)}
            aria-label="Open Options"
            className={`p-1.5 rounded-full ${palette.textPrimary} hover:opacity-80 transition-opacity`}
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>

        {/* Profile Identity Area */}
        {!user.isLoggedIn ? (
          <div className="rounded-2xl p-5 bg-[#EEF5FC] dark:bg-[#111927] border border-[#DCE8F5] dark:border-[#1E293B] space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-full bg-[#DCEBFA] dark:bg-[#0284C7]/20 text-[#0284C7] flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 fill-current" />
                </div>
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  Get personalized feed on any device
                </span>
              </div>

              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-full bg-[#DCEBFA] dark:bg-[#0284C7]/20 text-[#0284C7] flex items-center justify-center shrink-0">
                  <Bookmark className="w-4 h-4 fill-current" />
                </div>
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  Access bookmarks on any device
                </span>
              </div>
            </div>

            <button
              type="button"
              disabled={isAuthLoading}
              onClick={handleSignInClick}
              className="w-full py-3 rounded-xl bg-white dark:bg-[#182234] border border-[#D5E3F2] dark:border-slate-700 text-[#0284C7] font-bold text-base shadow-xs hover:brightness-98 transition-all"
            >
              {isAuthLoading ? 'Signing In...' : 'Sign In Now'}
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center space-y-3 pt-1">
            <LunarAvatar
              photoUrl={user.photoUrl}
              sizeClass="w-20 h-20"
              roundedClass="rounded-2xl"
            />

            <h2 className={`text-xl font-bold tracking-tight ${palette.textPrimary}`}>
              {user.name}
            </h2>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setDraftName(user.name);
                  setDraftEmail(user.email);
                  setDraftBio(user.bio);
                  setShowEditModal(true);
                }}
                className={`px-4 py-1.5 rounded-full text-xs font-medium ${palette.elevatedBg} ${palette.textSecondary} flex items-center gap-1.5 hover:${palette.textPrimary}`}
              >
                <Pencil className="w-3 h-3" />
                Edit Profile
              </button>
            </div>
          </div>
        )}

        {/* Saved & History Section */}
        <section className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button
                type="button"
                onClick={() => setActiveListTab('saved')}
                className="text-left"
              >
                <span
                  className={`text-lg font-bold tracking-tight ${
                    activeListTab === 'saved' ? palette.textPrimary : palette.textMuted
                  }`}
                >
                  Saved
                </span>
                <div
                  className={`w-9 h-[2.5px] mt-1 rounded-full ${
                    activeListTab === 'saved' ? 'bg-[#0284C7]' : 'bg-transparent'
                  }`}
                />
              </button>

              <button
                type="button"
                onClick={() => setActiveListTab('history')}
                className="text-left"
              >
                <span
                  className={`text-lg font-bold tracking-tight ${
                    activeListTab === 'history' ? palette.textPrimary : palette.textMuted
                  }`}
                >
                  History
                </span>
                <div
                  className={`w-9 h-[2.5px] mt-1 rounded-full ${
                    activeListTab === 'history' ? 'bg-[#0284C7]' : 'bg-transparent'
                  }`}
                />
              </button>
            </div>

            {activeListTab === 'history' && historyArticles.length > 0 && (
              <button
                type="button"
                onClick={onClearHistory}
                className="text-xs font-medium text-rose-500 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
          </div>

          {displayedArticles.length === 0 ? (
            <div className="py-20 text-center space-y-2">
              <h3 className={`text-lg font-bold ${palette.textPrimary}`}>
                Its Empty Here
              </h3>
              <p className={`text-sm ${palette.textMuted} max-w-xs mx-auto leading-relaxed`}>
                {activeListTab === 'saved'
                  ? 'Click on the bookmark icon to bookmark a short'
                  : 'Stories you open in the reader will appear here'}
              </p>
            </div>
          ) : (
            <div className={`divide-y ${palette.borderHairline}`}>
              {displayedArticles.map((article) => (
                <div
                  key={article.id}
                  onClick={() => onOpenReader(article)}
                  className="py-4 space-y-1.5 cursor-pointer group"
                >
                  <p className={`text-[11px] font-mono-num ${palette.textMuted}`}>
                    {article.publishedAt} · {article.sourceName}
                  </p>
                  <div className="flex items-center justify-between gap-4">
                    <h3
                      className={`text-[15px] font-medium leading-snug line-clamp-3 group-hover:text-[#0284C7] transition-colors ${palette.textPrimary}`}
                    >
                      {article.title}
                    </h3>
                    <img
                      src={getArticleImage(article)}
                      alt={article.title}
                      loading="lazy"
                      onError={() => handleImageError(article.id)}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 bg-slate-200 dark:bg-slate-800"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div
          onClick={() => setShowEditModal(false)}
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-md rounded-2xl border ${palette.borderHairline} ${palette.surfaceBg} p-6 shadow-2xl space-y-4`}
          >
            <h3 className={`text-base font-bold ${palette.textPrimary}`}>
              Edit Reader Profile
            </h3>
            <form onSubmit={handleSaveProfile} className="space-y-3.5">
              <div>
                <label className={`block text-xs font-medium mb-1 ${palette.textSecondary}`}>
                  Display Name
                </label>
                <input
                  type="text"
                  required
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border ${palette.borderHairline} ${palette.elevatedBg} text-sm ${palette.textPrimary}`}
                />
              </div>

              <div>
                <label className={`block text-xs font-medium mb-1 ${palette.textSecondary}`}>
                  Email
                </label>
                <input
                  type="email"
                  value={draftEmail}
                  onChange={(e) => setDraftEmail(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border ${palette.borderHairline} ${palette.elevatedBg} text-sm ${palette.textPrimary}`}
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onSignOut();
                    setShowEditModal(false);
                  }}
                  className="text-xs font-semibold text-rose-500 flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Switch to Signed-Out View
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-medium ${palette.textSecondary}`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#0284C7] text-white"
                  >
                    Save
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
