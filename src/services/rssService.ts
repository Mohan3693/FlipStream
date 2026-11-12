import techImg from '../assets/images/editorial_tech_silicon_1794417505852.jpg';
import worldImg from '../assets/images/editorial_world_diplomacy_1794417506347.jpg';
import businessImg from '../assets/images/editorial_business_markets_1794417507914.jpg';
import scienceImg from '../assets/images/editorial_science_observatory_1794417508832.jpg';
import cultureImg from '../assets/images/editorial_culture_museum_1794417510497.jpg';
import aiImg from '../assets/images/editorial_ai_neural_1794420349734.jpg';
import securityImg from '../assets/images/editorial_security_cyber_1794420351718.jpg';
import warsImg from '../assets/images/editorial_wars_geopolitics_1794420353074.jpg';
import sportsImg from '../assets/images/editorial_sports_stadium_1794420353909.jpg';

export type CategoryId =
  | 'all'
  | 'tech'
  | 'ai'
  | 'security'
  | 'wars'
  | 'sports'
  | 'world'
  | 'business'
  | 'science'
  | 'culture';

export type SpecificCategoryId = Exclude<CategoryId, 'all'>;

export type ThemeId = 'oled-midnight' | 'warm-sepia' | 'eink-slate' | 'gallery-stark';

export type FeedViewMode = 'cards' | 'grid';

export interface CategoryMeta {
  id: SpecificCategoryId;
  label: string;
  title: string;
  subtitle: string;
  image: string;
}

export interface RssSource {
  id: string;
  name: string;
  category: SpecificCategoryId;
  feedUrl: string;
  domain: string;
  enabled: boolean;
  editorialTagline: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  subtitle: string;
  summary: string;
  contentParagraphs: string[];
  keyTakeaways: string[];
  pullQuote?: string;
  author: string;
  authorRole: string;
  sourceId: string;
  sourceName: string;
  category: SpecificCategoryId;
  publishedAt: string;
  publishedTimestamp?: number;
  readTimeMinutes: number;
  imageUrl: string;
  isSourceImage?: boolean;
  imageCaption: string;
  articleUrl: string;
  issueNumber: string;
}

export const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

export function purgeArticlesOlderThanThreeDays(articles: NewsArticle[]): {
  freshArticles: NewsArticle[];
  removedCount: number;
} {
  const cutoff = Date.now() - THREE_DAYS_MS;
  const freshArticles = articles.filter((a) => {
    if (!a.publishedTimestamp) return true;
    return a.publishedTimestamp >= cutoff;
  });
  return {
    freshArticles,
    removedCount: Math.max(0, articles.length - freshArticles.length),
  };
}

export interface EyeCareSettings {
  theme: ThemeId;
  amberShieldPercent: number;
  dimmerPercent: number;
  fontScale: 'sm' | 'md' | 'lg' | 'xl';
  fontFamily: 'serif' | 'sans';
  bionicReading: boolean;
}

export const EDITORIAL_IMAGES: Record<SpecificCategoryId, string> = {
  tech: techImg,
  ai: aiImg,
  security: securityImg,
  wars: warsImg,
  sports: sportsImg,
  world: worldImg,
  business: businessImg,
  science: scienceImg,
  culture: cultureImg,
};

export function getCategoryFallbackImage(category: SpecificCategoryId): string {
  return EDITORIAL_IMAGES[category] || EDITORIAL_IMAGES.tech;
}

export function getCategoryLabel(category: SpecificCategoryId): string {
  const found = ALL_CATEGORIES.find((c) => c.id === category);
  return found ? found.label : category;
}

export const ALL_CATEGORIES: CategoryMeta[] = [
  {
    id: 'tech',
    label: 'Tech',
    title: 'Technology & Hardware',
    subtitle: 'Consumer electronics, silicon, mobile OS & cloud systems',
    image: EDITORIAL_IMAGES.tech,
  },
  {
    id: 'ai',
    label: 'AI',
    title: 'AI & Robotics',
    subtitle: 'Foundation models, neural compute clusters & autonomous robotics',
    image: EDITORIAL_IMAGES.ai,
  },
  {
    id: 'security',
    label: 'Security',
    title: 'Cybersecurity & Zero-Day',
    subtitle: 'Threat intelligence, cryptography, network defense & InfoSec',
    image: EDITORIAL_IMAGES.security,
  },
  {
    id: 'wars',
    label: 'Wars & Defense',
    title: 'Wars, Conflict & Defense',
    subtitle: 'Frontline dispatches, strategic defense analysis & military logistics',
    image: EDITORIAL_IMAGES.wars,
  },
  {
    id: 'sports',
    label: 'Sports',
    title: 'Global Sports',
    subtitle: 'Football, cricket, Formula 1, athletics & live tournament scores',
    image: EDITORIAL_IMAGES.sports,
  },
  {
    id: 'world',
    label: 'World',
    title: 'World & Diplomacy',
    subtitle: 'International summits, treaties, elections & global bureaus',
    image: EDITORIAL_IMAGES.world,
  },
  {
    id: 'business',
    label: 'Business',
    title: 'Markets & Economy',
    subtitle: 'Global equities, central banks, sovereign bonds & trade',
    image: EDITORIAL_IMAGES.business,
  },
  {
    id: 'science',
    label: 'Science',
    title: 'Science & Space',
    subtitle: 'Astrophysics, NASA missions, climate science & biotechnology',
    image: EDITORIAL_IMAGES.science,
  },
  {
    id: 'culture',
    label: 'Culture',
    title: 'Architecture & Culture',
    subtitle: 'Civic architecture, museums, cinema & design criticism',
    image: EDITORIAL_IMAGES.culture,
  },
];

export const DEFAULT_ENABLED_CATEGORIES: SpecificCategoryId[] = [
  'tech',
  'ai',
  'security',
  'wars',
  'sports',
  'world',
  'business',
  'science',
  'culture',
];

export const DEFAULT_SOURCES: RssSource[] = [
  // TECH
  {
    id: 'the-verge',
    name: 'The Verge',
    category: 'tech',
    feedUrl: 'https://www.theverge.com/rss/index.xml',
    domain: 'theverge.com',
    enabled: true,
    editorialTagline: 'Consumer hardware, silicon, software platforms, and digital policy',
  },
  {
    id: 'techcrunch',
    name: 'TechCrunch',
    category: 'tech',
    feedUrl: 'https://techcrunch.com/feed/',
    domain: 'techcrunch.com',
    enabled: true,
    editorialTagline: 'Venture technology, mobile startups, and platform engineering',
  },
  {
    id: 'ars-technica',
    name: 'Ars Technica',
    category: 'tech',
    feedUrl: 'https://feeds.arstechnica.com/arstechnica/index',
    domain: 'arstechnica.com',
    enabled: true,
    editorialTagline: 'Deep systems architecture, semiconductors, and computing policy',
  },

  // AI & ROBOTICS
  {
    id: 'venturebeat-ai',
    name: 'VentureBeat AI',
    category: 'ai',
    feedUrl: 'https://venturebeat.com/category/ai/feed/',
    domain: 'venturebeat.com',
    enabled: true,
    editorialTagline: 'Enterprise LLMs, generative AI infrastructure, and neural hardware',
  },
  {
    id: 'wired-ai',
    name: 'WIRED AI Desk',
    category: 'ai',
    feedUrl: 'https://www.wired.com/feed/tag/ai/latest/rss',
    domain: 'wired.com',
    enabled: true,
    editorialTagline: 'Deep reporting on artificial intelligence, robotics, and automation',
  },
  {
    id: 'mit-ai',
    name: 'MIT Tech Review',
    category: 'ai',
    feedUrl: 'https://www.technologyreview.com/feed/',
    domain: 'technologyreview.com',
    enabled: true,
    editorialTagline: 'Frontier research in machine learning, quantum computing, and robotics',
  },

  // CYBERSECURITY
  {
    id: 'the-hacker-news',
    name: 'The Hacker News',
    category: 'security',
    feedUrl: 'https://feeds.feedburner.com/TheHackersNews',
    domain: 'thehackernews.com',
    enabled: true,
    editorialTagline: 'Zero-day vulnerabilities, ransomware analysis, and cyber defense',
  },
  {
    id: 'bleeping-computer',
    name: 'BleepingComputer',
    category: 'security',
    feedUrl: 'https://www.bleepingcomputer.com/feed/',
    domain: 'bleepingcomputer.com',
    enabled: true,
    editorialTagline: 'Breaking cybersecurity incident response, malware, and patch advisories',
  },
  {
    id: 'krebs-security',
    name: 'Krebs on Security',
    category: 'security',
    feedUrl: 'https://krebsonsecurity.com/feed/',
    domain: 'krebsonsecurity.com',
    enabled: true,
    editorialTagline: 'Investigative reporting on cybercrime syndicates and data breaches',
  },

  // WARS & DEFENSE
  {
    id: 'defense-one',
    name: 'Defense One',
    category: 'wars',
    feedUrl: 'https://www.defenseone.com/rss/all/',
    domain: 'defenseone.com',
    enabled: true,
    editorialTagline: 'Global military strategy, defense technology, and national security',
  },
  {
    id: 'war-on-the-rocks',
    name: 'War on the Rocks',
    category: 'wars',
    feedUrl: 'https://warontherocks.com/feed/',
    domain: 'warontherocks.com',
    enabled: true,
    editorialTagline: 'Frontline geopolitical conflict analysis, deterrence, and defense policy',
  },
  {
    id: 'aljazeera-conflict',
    name: 'Al Jazeera Global Conflict',
    category: 'wars',
    feedUrl: 'https://www.aljazeera.com/xml/rss/all.xml',
    domain: 'aljazeera.com',
    enabled: true,
    editorialTagline: '24-hour conflict correspondents, peace negotiations, and humanitarian updates',
  },

  // SPORTS
  {
    id: 'bbc-sport',
    name: 'BBC Sport',
    category: 'sports',
    feedUrl: 'https://feeds.bbci.co.uk/sport/rss.xml',
    domain: 'bbc.com',
    enabled: true,
    editorialTagline: 'Premier League, Champions League, Formula 1, Cricket, and Tennis',
  },
  {
    id: 'espn-top',
    name: 'ESPN Headlines',
    category: 'sports',
    feedUrl: 'https://www.espn.com/espn/rss/news',
    domain: 'espn.com',
    enabled: true,
    editorialTagline: 'Global championships, live match analysis, and athlete coverage',
  },
  {
    id: 'skysports-news',
    name: 'Sky Sports News',
    category: 'sports',
    feedUrl: 'https://www.skysports.com/rss/12040',
    domain: 'skysports.com',
    enabled: true,
    editorialTagline: 'European football transfers, motorsport, and international tournaments',
  },

  // WORLD
  {
    id: 'bbc-world',
    name: 'BBC World News',
    category: 'world',
    feedUrl: 'https://feeds.bbci.co.uk/news/world/rss.xml',
    domain: 'bbc.com',
    enabled: true,
    editorialTagline: 'Global correspondents, international diplomacy, and breaking news',
  },
  {
    id: 'guardian-world',
    name: 'The Guardian World',
    category: 'world',
    feedUrl: 'https://www.theguardian.com/world/rss',
    domain: 'theguardian.com',
    enabled: true,
    editorialTagline: 'International investigative reporting and global dispatches',
  },
  {
    id: 'nyt-world',
    name: 'NYT World Dispatch',
    category: 'world',
    feedUrl: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
    domain: 'nytimes.com',
    enabled: true,
    editorialTagline: 'Foreign bureaus covering geopolitics, treaties, and society',
  },

  // BUSINESS
  {
    id: 'cnbc-business',
    name: 'CNBC Global Markets',
    category: 'business',
    feedUrl: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10001147',
    domain: 'cnbc.com',
    enabled: true,
    editorialTagline: 'Equities, central banking, global trade, and corporate earnings',
  },
  {
    id: 'bbc-business',
    name: 'BBC Business & Economy',
    category: 'business',
    feedUrl: 'https://feeds.bbci.co.uk/news/business/rss.xml',
    domain: 'bbc.com',
    enabled: true,
    editorialTagline: 'Macroeconomic policy, energy markets, and global trade corridors',
  },

  // SCIENCE
  {
    id: 'nasa-breaking',
    name: 'NASA Breaking Science',
    category: 'science',
    feedUrl: 'https://www.nasa.gov/news-release/feed/',
    domain: 'nasa.gov',
    enabled: true,
    editorialTagline: 'Orbital missions, deep-space telescopes, and planetary science',
  },
  {
    id: 'sciencedaily',
    name: 'ScienceDaily',
    category: 'science',
    feedUrl: 'https://www.sciencedaily.com/rss/top/science.xml',
    domain: 'sciencedaily.com',
    enabled: true,
    editorialTagline: 'Peer-reviewed discoveries in physics, medicine, and earth science',
  },

  // CULTURE
  {
    id: 'guardian-culture',
    name: 'The Guardian Culture',
    category: 'culture',
    feedUrl: 'https://www.theguardian.com/uk/culture/rss',
    domain: 'theguardian.com',
    enabled: true,
    editorialTagline: 'Contemporary art, architecture, cinema, literature, and museum reviews',
  },
  {
    id: 'archdaily',
    name: 'ArchDaily',
    category: 'culture',
    feedUrl: 'https://www.archdaily.com/feed',
    domain: 'archdaily.com',
    enabled: true,
    editorialTagline: 'Global civic architecture, pavilions, and urban design',
  },
];

function formatRelativeTime(pubDateStr: string): string {
  if (!pubDateStr) return 'Just now';
  const parsed = Date.parse(pubDateStr);
  if (isNaN(parsed)) return 'Just now';
  const diffMinutes = Math.max(1, Math.floor((Date.now() - parsed) / 60000));
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function cleanRssHtmlToText(html: string): string {
  if (!html) return '';
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<\/(p|div|br|li|h[1-6])>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim();
}

function convertRawItemToNewsArticle(
  item: {
    title: string;
    link: string;
    pubDate: string;
    publishedTimestamp?: number;
    author: string;
    description: string;
    content: string;
    imageUrl: string | null;
  },
  sourceId: string,
  sourceName: string,
  category: SpecificCategoryId,
  idx: number
): NewsArticle {
  const cleanDescription = cleanRssHtmlToText(item.description);
  const cleanContent = cleanRssHtmlToText(item.content || item.description);

  const rawParagraphs = cleanContent
    .split('\n')
    .map((p) => p.trim())
    .filter((p) => p.length > 45);

  const sentences = (cleanDescription || cleanContent)
    .replace(/\n/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .filter((s) => s.trim().length > 20);

  const subtitle =
    sentences[0] ||
    cleanDescription.slice(0, 160) ||
    `Live RSS dispatch from ${sourceName}.`;

  const summary =
    sentences.slice(1, 3).join(' ') ||
    sentences[0] ||
    `Read the full report from ${sourceName}.`;

  const contentParagraphs =
    rawParagraphs.length >= 2
      ? rawParagraphs.slice(0, 8)
      : [
          subtitle,
          summary !== subtitle
            ? summary
            : `Published by ${sourceName} in the ${category.toUpperCase()} channel.`,
          `Tap "Open Original Article at ${sourceName}" below to view full publisher graphics and extended coverage.`,
        ];

  const keyTakeaways = sentences
    .slice(0, 3)
    .map((s) => (s.length > 140 ? s.slice(0, 137) + '...' : s));
  if (keyTakeaways.length === 0) {
    keyTakeaways.push(`Direct RSS syndication from ${sourceName}.`);
  }

  const hasSourceImage = Boolean(item.imageUrl && item.imageUrl.startsWith('http'));
  const resolvedImageUrl = hasSourceImage
    ? item.imageUrl!
    : EDITORIAL_IMAGES[category] || EDITORIAL_IMAGES.tech;

  const wordCount = cleanContent.split(/\s+/).length;
  const readTimeMinutes = Math.max(2, Math.min(10, Math.ceil(wordCount / 180)));

  const parsedMs = item.publishedTimestamp || (item.pubDate ? Date.parse(item.pubDate) : NaN);
  const publishedTimestamp = !isNaN(parsedMs) ? parsedMs : Date.now() - idx * 60000;

  return {
    id: `rss-${sourceId}-${idx}-${encodeURIComponent(item.title.slice(0, 22))}`,
    title: item.title,
    subtitle: subtitle.length > 180 ? subtitle.slice(0, 177) + '...' : subtitle,
    summary: summary.length > 240 ? summary.slice(0, 237) + '...' : summary,
    contentParagraphs,
    keyTakeaways,
    pullQuote: sentences[1] || sentences[0],
    author: item.author || `${sourceName} Newsroom`,
    authorRole: sourceName,
    sourceId,
    sourceName,
    category,
    publishedAt: formatRelativeTime(item.pubDate || new Date(publishedTimestamp).toUTCString()),
    publishedTimestamp,
    readTimeMinutes,
    imageUrl: resolvedImageUrl,
    isSourceImage: hasSourceImage,
    imageCaption: hasSourceImage
      ? `Source photograph published by ${sourceName}`
      : `Editorial archival photograph · ${sourceName}`,
    articleUrl: item.link || `https://${sourceId}`,
    issueNumber: `${sourceName.toUpperCase()} · ${category.toUpperCase()}`,
  };
}

export async function fetchBatchLiveRssFeeds(
  sources: RssSource[],
  forceRefresh = false
): Promise<NewsArticle[]> {
  const enabledSources = sources.filter((s) => s.enabled);
  if (enabledSources.length === 0) return [];

  try {
    const response = await fetch('/api/rss/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
      body: JSON.stringify({
        forceRefresh,
        feeds: enabledSources.map((s) => ({
          id: s.id,
          name: s.name,
          category: s.category,
          feedUrl: s.feedUrl,
        })),
      }),
      signal: AbortSignal.timeout(20000),
    });

    if (!response.ok) throw new Error('Batch endpoint non-200');
    const data = await response.json();
    if (!Array.isArray(data.results)) throw new Error('Invalid batch response');

    const allFetched: NewsArticle[] = [];

    for (const res of data.results as Array<{
      sourceId: string;
      sourceName: string;
      category: SpecificCategoryId;
      items: Array<{
        title: string;
        link: string;
        pubDate: string;
        publishedTimestamp?: number;
        author: string;
        description: string;
        content: string;
        imageUrl: string | null;
      }>;
    }>) {
      const converted = (res.items || [])
        .slice(0, 6)
        .map((item, idx) =>
          convertRawItemToNewsArticle(
            item,
            res.sourceId,
            res.sourceName,
            res.category,
            idx
          )
        );
      allFetched.push(...converted);
    }

    // Strictly enforce 3-day (72-hour) retention window
    const { freshArticles } = purgeArticlesOlderThanThreeDays(allFetched);

    // Sort by newest publishedTimestamp first so fresh RSS updates appear immediately at the top
    freshArticles.sort(
      (a, b) => (b.publishedTimestamp || 0) - (a.publishedTimestamp || 0)
    );

    return freshArticles;
  } catch {
    return [];
  }
}

export async function fetchLiveRssFeed(
  feedUrl: string,
  sourceName: string,
  category: SpecificCategoryId
): Promise<NewsArticle[]> {
  const sourceId = sourceName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  try {
    const response = await fetch(`/api/rss?url=${encodeURIComponent(feedUrl)}&force=true`, {
      signal: AbortSignal.timeout(7000),
    });
    if (!response.ok) throw new Error('RSS fetch failed');
    const data = await response.json();
    if (!Array.isArray(data.items) || data.items.length === 0) return [];

    return data.items
      .slice(0, 6)
      .map((item: never, idx: number) =>
        convertRawItemToNewsArticle(item, sourceId, sourceName, category, idx)
      );
  } catch {
    return [];
  }
}

export const CURATED_ARTICLES: NewsArticle[] = [
  {
    id: 'art-ai-1',
    title: 'Next-Generation Liquid-Cooled AI Superclusters Cut Inference Latency by 70%',
    subtitle: 'Optical backplanes and custom sparse-attention accelerators enable real-time reasoning across trillion-parameter frontier models.',
    summary: 'AI infrastructure teams have deployed rack-scale optical interconnects that link 256 neural accelerators as a single unified memory pool.',
    contentParagraphs: [
      'As frontier artificial intelligence models transition from single-pass text generation to multi-step verification and code synthesis, inference clusters face unprecedented memory-bandwidth demands.',
      'By combining direct-to-chip two-phase liquid cooling with optical circuit switches, next-generation AI data centers maintain deterministic token throughput while reducing energy consumption per query by more than half.',
    ],
    keyTakeaways: [
      'Unified optical memory pools link 256 neural processors without PCIe bottlenecks.',
      'Inference latency drops 70% on complex multi-step reasoning workloads.',
    ],
    pullQuote: 'The intelligence of a frontier system is bounded by how fast its memory fabric can think as one.',
    author: 'Elena Vance',
    authorRole: 'WIRED AI Desk',
    sourceId: 'wired-ai',
    sourceName: 'WIRED AI Desk',
    category: 'ai',
    publishedAt: '12m ago',
    readTimeMinutes: 4,
    imageUrl: EDITORIAL_IMAGES.ai,
    isSourceImage: true,
    imageCaption: 'Liquid-cooled neural compute racks inside the Zurich AI supercomputing hall.',
    articleUrl: 'https://www.wired.com/tag/artificial-intelligence/',
    issueNumber: 'WIRED AI · AI',
  },
  {
    id: 'art-sec-1',
    title: 'Post-Quantum Cryptographic Handshakes Deployed Across Global Banking Backbones',
    subtitle: 'Lattice-based key encapsulation protects interbank TLS traffic against store-now-decrypt-later harvesting.',
    summary: 'Security operations centers across major financial institutions have completed the rollout of NIST-standardized ML-KEM hybrid encryption.',
    contentParagraphs: [
      'Cybersecurity architects have long warned that adversaries are capturing encrypted financial and diplomatic traffic today with the intent of decrypting it once fault-tolerant quantum computers mature.',
      'This week, a coalition of clearinghouses and cloud security providers finalized the mandatory transition to hybrid elliptic-curve and lattice-based post-quantum key exchange across core settlement gateways.',
    ],
    keyTakeaways: [
      'Hybrid ML-KEM lattice cryptography neutralizes store-now-decrypt-later attacks.',
      'Zero measurable handshake latency penalty on modern TLS 1.3 edge routers.',
    ],
    pullQuote: 'Cryptographic agility is the difference between a thirty-year secret and a retroactive breach.',
    author: 'Marcus Thorne',
    authorRole: 'The Hacker News',
    sourceId: 'the-hacker-news',
    sourceName: 'The Hacker News',
    category: 'security',
    publishedAt: '19m ago',
    readTimeMinutes: 5,
    imageUrl: EDITORIAL_IMAGES.security,
    isSourceImage: true,
    imageCaption: 'Hardware security keys and threat monitoring consoles inside a global SOC.',
    articleUrl: 'https://thehackernews.com',
    issueNumber: 'HACKER NEWS · SECURITY',
  },
  {
    id: 'art-wars-1',
    title: 'Autonomous Counter-Drone Radar Networks Reshape Modern Airspace Defense',
    subtitle: 'Multi-band phased-array sensors paired with acoustic triangulation track low-observable aerial swarms in mountainous terrain.',
    summary: 'Defense analysts highlight how distributed mobile radar stations and low-cost interceptors have altered strategic deterrence doctrines.',
    contentParagraphs: [
      'Across contemporary conflict zones, the proliferation of low-flying autonomous aerial systems has challenged legacy air-defense batteries originally designed to track supersonic aircraft and ballistic missiles.',
      'Strategic defense commands are now deploying networked S-band and Ku-band mobile radar domes capable of fusing thermal, acoustic, and electromagnetic signatures in under two hundred milliseconds.',
    ],
    keyTakeaways: [
      'Distributed phased-array sensors detect low-altitude micro-UAVs across rugged terrain.',
      'Automated sensor fusion cuts command-and-control response times to 200ms.',
    ],
    pullQuote: 'Air superiority now begins in the lowest five hundred meters of the sky.',
    author: 'Col. David Mercer (Ret.)',
    authorRole: 'Defense One',
    sourceId: 'defense-one',
    sourceName: 'Defense One',
    category: 'wars',
    publishedAt: '27m ago',
    readTimeMinutes: 6,
    imageUrl: EDITORIAL_IMAGES.wars,
    isSourceImage: true,
    imageCaption: 'Strategic air-defense command briefing room overlooking a high-ridge radar array.',
    articleUrl: 'https://www.defenseone.com',
    issueNumber: 'DEFENSE ONE · WARS & DEFENSE',
  },
  {
    id: 'art-sports-1',
    title: 'Champions League & International Athletics Adopt Millimeter-Wave Offside & Pace Telemetry',
    subtitle: 'Stadium-wide optical tracking cameras and ultra-wideband sensors deliver instantaneous biomechanical analytics to fans and referees.',
    summary: 'Twelve high-speed cameras mounted beneath stadium roof trusses track 29 skeletal points per athlete at 500 frames per second.',
    contentParagraphs: [
      'Modern championship stadiums have evolved into high-precision optical laboratories. During this week’s international fixtures, newly calibrated computer-vision arrays synchronized with inertial sensors embedded inside match balls.',
      'Referees receive automated three-dimensional spatial alerts within half a second, while broadcast feeds overlay real-time sprint velocity and tactical formation geometry.',
    ],
    keyTakeaways: [
      '500fps optical tracking resolves millimeter-level boundary and offside decisions.',
      'Real-time biomechanical load metrics help medical staffs prevent hamstring injuries.',
    ],
    pullQuote: 'Every stride on the pitch is now captured with the precision of an wind-tunnel test.',
    author: 'Liam O’Connor',
    authorRole: 'BBC Sport',
    sourceId: 'bbc-sport',
    sourceName: 'BBC Sport',
    category: 'sports',
    publishedAt: '34m ago',
    readTimeMinutes: 4,
    imageUrl: EDITORIAL_IMAGES.sports,
    isSourceImage: true,
    imageCaption: 'Floodlit athletics and football stadium during evening international competition.',
    articleUrl: 'https://www.bbc.com/sport',
    issueNumber: 'BBC SPORT · SPORTS',
  },
  {
    id: 'art-tech-1',
    title: 'Sub-Nanometer Photonic Interconnects Redefine Wafer-Scale Silicon Efficiency',
    subtitle: 'Optical waveguides etched directly onto crystalline silicon substrates cut data-center thermal dissipation by 64 percent.',
    summary: 'Engineers in Eindhoven and Zurich have demonstrated a production-grade silicon photonics lithography pipeline that replaces copper traces between processor dies with coherent laser pulses.',
    contentParagraphs: [
      'During the past decade, the primary bottleneck in high-performance computing has shifted from transistor switching speed to the energetic cost of moving electrons across millimeters of copper interconnect.',
      'Now, a consortium of lithography physicists and optical foundry specialists has unveiled a dual-stage ultraviolet fabrication method that integrates hollow-core silicon nitride waveguides directly into standard 300-millimeter wafer runs.',
    ],
    keyTakeaways: [
      'Coherent optical waveguides replace copper interposers inside 300mm wafer assemblies.',
      'Data movement thermal dissipation drops by 64% across multi-rack compute clusters.',
    ],
    pullQuote: 'We are no longer limited by how fast a transistor gates, but by how cleanly light can traverse the boundary between memory and logic.',
    author: 'Dr. Lukas Vance',
    authorRole: 'Ars Technica',
    sourceId: 'ars-technica',
    sourceName: 'Ars Technica',
    category: 'tech',
    publishedAt: '45m ago',
    readTimeMinutes: 5,
    imageUrl: EDITORIAL_IMAGES.tech,
    isSourceImage: true,
    imageCaption: 'Optical metrology table inspecting deep-ultraviolet wafer alignment lenses.',
    articleUrl: 'https://arstechnica.com',
    issueNumber: 'ARS TECHNICA · TECH',
  },
];
