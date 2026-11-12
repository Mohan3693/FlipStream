import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface ParsedRssItem {
  title: string;
  link: string;
  pubDate: string;
  publishedTimestamp: number;
  author: string;
  description: string;
  content: string;
  imageUrl: string | null;
}

// Strict 3-Day (72-Hour) Maximum Article Retention Window
const MAX_ARTICLE_AGE_MS = 3 * 24 * 60 * 60 * 1000;
const CACHE_TTL_MS = 3 * 60 * 1000; // 3-minute cache TTL for fast live updates

const rssCache = new Map<
  string,
  { timestamp: number; items: ParsedRssItem[]; purgedCount: number }
>();

let totalPurgedArticlesCount = 0;

function decodeHtmlEntities(str: string): string {
  if (!str) return '';
  return str
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8217;/g, '’')
    .replace(/&#8216;/g, '‘')
    .replace(/&#8220;/g, '“')
    .replace(/&#8221;/g, '”')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—');
}

function extractTagContent(xml: string, tagName: string): string {
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i');
  const match = xml.match(regex);
  return match ? decodeHtmlEntities(match[1].trim()) : '';
}

function extractImageFromItemXml(itemXml: string): string | null {
  // 1. Check <media:content url="..." />
  const mediaContents = [...itemXml.matchAll(/<media:content[^>]+url=["']([^"']+)["'][^>]*>/gi)];
  for (const match of mediaContents) {
    const url = decodeHtmlEntities(match[1]);
    if (url && !url.endsWith('.mp3') && !url.endsWith('.mp4')) {
      return url.replace(/^http:\/\//i, 'https://');
    }
  }

  // 2. Check <media:thumbnail url="..." />
  const mediaThumbs = [...itemXml.matchAll(/<media:thumbnail[^>]+url=["']([^"']+)["'][^>]*>/gi)];
  if (mediaThumbs.length > 0) {
    const bestThumb = mediaThumbs[mediaThumbs.length - 1][1];
    return decodeHtmlEntities(bestThumb).replace(/^http:\/\//i, 'https://');
  }

  // 3. Check <enclosure url="..." type="image/..." />
  const enclosureMatch = itemXml.match(/<enclosure[^>]+url=["']([^"']+)["'][^>]*>/i);
  if (enclosureMatch) {
    const url = decodeHtmlEntities(enclosureMatch[1]);
    if (/\.(jpg|jpeg|png|webp|gif)/i.test(url) || /type=["']image\//i.test(enclosureMatch[0])) {
      return url.replace(/^http:\/\//i, 'https://');
    }
  }

  // 4. Check <img src="..." /> inside content:encoded or description
  const rawCleared = decodeHtmlEntities(itemXml);
  const imgMatches = [...rawCleared.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)];
  for (const imgMatch of imgMatches) {
    const src = imgMatch[1];
    if (
      src &&
      src.startsWith('http') &&
      !src.includes('pixel') &&
      !src.includes('tracker') &&
      !src.includes('1x1') &&
      !src.includes('feedburner') &&
      !src.endsWith('.svg')
    ) {
      return src.replace(/^http:\/\//i, 'https://');
    }
  }

  // 5. Check <url> tag inside item
  const itemImageTag = extractTagContent(itemXml, 'url');
  if (itemImageTag && itemImageTag.startsWith('http')) {
    return itemImageTag.replace(/^http:\/\//i, 'https://');
  }

  return null;
}

async function fetchOgImage(articleUrl: string): Promise<string | null> {
  if (!articleUrl || !articleUrl.startsWith('http')) return null;
  try {
    const res = await fetch(articleUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; FlipStreamReader/4.0)',
        Accept: 'text/html',
      },
      signal: AbortSignal.timeout(1200),
    });
    if (!res.ok) return null;
    const html = await res.text();
    const ogMatch =
      html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i) ||
      html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);
    if (ogMatch && ogMatch[1] && ogMatch[1].startsWith('http')) {
      return decodeHtmlEntities(ogMatch[1]).replace(/^http:\/\//i, 'https://');
    }
  } catch {
    // ignore timeout
  }
  return null;
}

function purgeExpiredItems(items: ParsedRssItem[]): {
  freshItems: ParsedRssItem[];
  purgedCount: number;
} {
  const now = Date.now();
  const cutoff = now - MAX_ARTICLE_AGE_MS;
  const freshItems = items.filter((item) => item.publishedTimestamp >= cutoff);
  const purgedCount = Math.max(0, items.length - freshItems.length);
  return { freshItems, purgedCount };
}

async function fetchAndParseRss(
  feedUrl: string,
  forceRefresh = false
): Promise<{ items: ParsedRssItem[]; purgedCount: number }> {
  const cached = rssCache.get(feedUrl);
  if (!forceRefresh && cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    const { freshItems, purgedCount } = purgeExpiredItems(cached.items);
    return { items: freshItems, purgedCount: cached.purgedCount + purgedCount };
  }

  const response = await fetch(feedUrl, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
      Accept: 'application/rss+xml, application/xml, application/atom+xml, text/xml, */*',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
    },
    signal: AbortSignal.timeout(4500),
  });

  if (!response.ok) {
    throw new Error(`Feed returned HTTP ${response.status}`);
  }

  const xml = await response.text();

  const itemBlocks = [
    ...xml.matchAll(/<item[\s>]([\s\S]*?)<\/item>/gi),
    ...xml.matchAll(/<entry[\s>]([\s\S]*?)<\/entry>/gi),
  ].map((m) => m[1]);

  const now = Date.now();

  const rawItems: ParsedRssItem[] = itemBlocks.slice(0, 10).map((block, idx) => {
    const title = extractTagContent(block, 'title').replace(/<[^>]+>/g, '').trim();

    let link = extractTagContent(block, 'link');
    if (!link) {
      const atomLink = block.match(/<link[^>]+href=["']([^"']+)["'][^>]*>/i);
      if (atomLink) link = atomLink[1];
    }

    const pubDate =
      extractTagContent(block, 'pubDate') ||
      extractTagContent(block, 'published') ||
      extractTagContent(block, 'updated') ||
      extractTagContent(block, 'dc:date');

    const parsedMs = pubDate ? Date.parse(pubDate) : NaN;
    const publishedTimestamp = !isNaN(parsedMs)
      ? parsedMs
      : now - idx * 15 * 60 * 1000;

    const author =
      extractTagContent(block, 'dc:creator') ||
      extractTagContent(block, 'author') ||
      extractTagContent(block, 'name');

    const description =
      extractTagContent(block, 'description') || extractTagContent(block, 'summary');

    const content =
      extractTagContent(block, 'content:encoded') ||
      extractTagContent(block, 'content') ||
      description;

    const imageUrl = extractImageFromItemXml(block);

    return {
      title,
      link: link.trim(),
      pubDate: pubDate.trim() || new Date(publishedTimestamp).toUTCString(),
      publishedTimestamp,
      author: author.replace(/<[^>]+>/g, '').trim(),
      description,
      content,
      imageUrl,
    };
  });

  // 1. Filter out invalid titles
  const validItems = rawItems.filter((item) => item.title.length > 4);

  // 2. Enforce strict 3-Day (72-hour) retention window
  const { freshItems, purgedCount } = purgeExpiredItems(validItems);
  totalPurgedArticlesCount += purgedCount;

  // 3. Enrich only top 1 item with OG image if missing inline XML image (keeps batch fast)
  const enrichedItems = await Promise.all(
    freshItems.slice(0, 6).map(async (item, idx) => {
      if (!item.imageUrl && idx === 0 && item.link) {
        const ogImg = await fetchOgImage(item.link);
        return { ...item, imageUrl: ogImg };
      }
      return item;
    })
  );

  // Sort newest first
  enrichedItems.sort((a, b) => b.publishedTimestamp - a.publishedTimestamp);

  rssCache.set(feedUrl, {
    timestamp: Date.now(),
    items: enrichedItems,
    purgedCount,
  });

  return { items: enrichedItems, purgedCount };
}

// Default background feed list to pre-warm cache on server startup and every 3 minutes
const BACKGROUND_FEEDS = [
  'https://techcrunch.com/feed/',
  'https://www.theverge.com/rss/index.xml',
  'https://feeds.arstechnica.com/arstechnica/index',
  'https://www.wired.com/feed/tag/ai/latest/rss',
  'https://venturebeat.com/category/ai/feed/',
  'https://feeds.feedburner.com/TheHackersNews',
  'https://www.bleepingcomputer.com/feed/',
  'https://www.defenseone.com/rss/all/',
  'https://breakingdefense.com/feed/',
  'https://feeds.bbci.co.uk/sport/rss.xml',
  'https://www.espn.com/espn/rss/news',
  'https://feeds.bbci.co.uk/news/world/rss.xml',
  'https://www.aljazeera.com/xml/rss/all.xml',
  'https://feeds.npr.org/1001/rss.xml',
  'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100003114',
  'https://www.sciencedaily.com/rss/top/science.xml',
  'https://www.theguardian.com/uk/culture/rss',
];

async function runBackgroundRssSweep() {
  await Promise.allSettled(
    BACKGROUND_FEEDS.map((url) => fetchAndParseRss(url, true))
  );
  // Also purge any expired entries across all cached feeds
  for (const [url, entry] of rssCache.entries()) {
    const { freshItems, purgedCount } = purgeExpiredItems(entry.items);
    if (purgedCount > 0) {
      totalPurgedArticlesCount += purgedCount;
      rssCache.set(url, {
        ...entry,
        items: freshItems,
        purgedCount: entry.purgedCount + purgedCount,
      });
    }
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Pre-warm live RSS cache immediately in background
  runBackgroundRssSweep().catch(() => {});
  // Automatically refresh & purge >3-day-old articles every 3 minutes on server
  setInterval(() => {
    runBackgroundRssSweep().catch(() => {});
  }, 3 * 60 * 1000);

  // Single RSS feed endpoint
  app.get('/api/rss', async (req, res) => {
    const url = req.query.url as string;
    const force = req.query.force === 'true';
    if (!url) {
      res.status(400).json({ error: 'Missing url parameter' });
      return;
    }
    try {
      const { items, purgedCount } = await fetchAndParseRss(url, force);
      res.json({
        status: 'ok',
        items,
        purgedCount,
        retentionDays: 3,
        scannedAt: new Date().toISOString(),
      });
    } catch (err) {
      res.status(502).json({
        status: 'error',
        message: err instanceof Error ? err.message : 'Failed to parse RSS feed',
        items: [],
      });
    }
  });

  // Batch RSS feed endpoint for initial & automatic background scanning
  app.post('/api/rss/batch', async (req, res) => {
    const feeds: Array<{ id: string; name: string; category: string; feedUrl: string }> =
      req.body?.feeds || [];
    const forceRefresh = Boolean(req.body?.forceRefresh);

    let batchPurgedCount = 0;

    const results = await Promise.all(
      feeds.map(async (feed) => {
        try {
          const { items, purgedCount } = await fetchAndParseRss(feed.feedUrl, forceRefresh);
          batchPurgedCount += purgedCount;
          return {
            sourceId: feed.id,
            sourceName: feed.name,
            category: feed.category,
            items,
          };
        } catch {
          return {
            sourceId: feed.id,
            sourceName: feed.name,
            category: feed.category,
            items: [],
          };
        }
      })
    );

    res.json({
      status: 'ok',
      scannedAt: new Date().toISOString(),
      retentionWindowHours: 72,
      purgedExpiredCount: batchPurgedCount + totalPurgedArticlesCount,
      results,
    });
  });

  // Image proxy to prevent hotlink blocking from publisher CDNs
  app.get('/api/image-proxy', async (req, res) => {
    const imageUrl = req.query.url as string;
    if (!imageUrl || !imageUrl.startsWith('http')) {
      res.status(400).send('Invalid image URL');
      return;
    }
    try {
      const imgRes = await fetch(imageUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; FlipStreamReader/4.0)',
          Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        },
        signal: AbortSignal.timeout(5000),
      });
      if (!imgRes.ok) {
        res.status(imgRes.status).send('Upstream image error');
        return;
      }
      const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=3600');
      const arrayBuffer = await imgRes.arrayBuffer();
      res.send(Buffer.from(arrayBuffer));
    } catch {
      res.status(502).send('Image proxy timeout');
    }
  });

  // Auth0 / OIDC OAuth2 URL endpoint for popup-based third-party authentication
  app.get('/api/auth/auth0-url', (req, res) => {
    const domain = (req.query.domain as string) || process.env.AUTH0_DOMAIN || '';
    const clientId = (req.query.clientId as string) || process.env.AUTH0_CLIENT_ID || '';
    const origin = (req.query.origin as string) || process.env.APP_URL || 'http://localhost:3000';
    const redirectUri = `${origin.replace(/\/$/, '')}/auth/callback`;

    if (!domain || !clientId) {
      res.json({
        configured: false,
        redirectUri,
      });
      return;
    }

    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'token id_token',
      scope: 'openid profile email',
      nonce: `fs_${Date.now()}`,
    });

    res.json({
      configured: true,
      url: `https://${cleanDomain}/authorize?${params.toString()}`,
      redirectUri,
    });
  });

  // OAuth / Auth0 Popup Callback Route
  app.get(['/auth/callback', '/auth/callback/'], (_req, res) => {
    res.send(`
      <!doctype html>
      <html>
        <head><title>FlipStream Authentication</title></head>
        <body style="background:#000;color:#f1f5f9;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
          <script>
            (function() {
              const hash = window.location.hash.substring(1);
              const params = new URLSearchParams(hash || window.location.search);
              const idToken = params.get('id_token');
              const accessToken = params.get('access_token');
              if (window.opener) {
                window.opener.postMessage({
                  type: 'OAUTH_AUTH_SUCCESS',
                  idToken: idToken,
                  accessToken: accessToken
                }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            })();
          </script>
          <p>Authentication complete. Closing window...</p>
        </body>
      </html>
    `);
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FlipStream RSS & Auth Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
