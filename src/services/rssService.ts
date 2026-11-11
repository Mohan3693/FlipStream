export type CategoryId = 'all' | 'tech' | 'world' | 'business' | 'science' | 'culture';

export type ThemeId = 'oled-midnight' | 'warm-sepia' | 'eink-slate' | 'gallery-stark';

export type DeviceMode = 'responsive' | 'ios' | 'android';

export interface RssSource {
  id: string;
  name: string;
  category: Exclude<CategoryId, 'all'>;
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
  category: Exclude<CategoryId, 'all'>;
  publishedAt: string;
  readTimeMinutes: number;
  imageUrl: string;
  imageCaption: string;
  articleUrl: string;
  issueNumber: string;
}

export interface EyeCareSettings {
  theme: ThemeId;
  amberShieldPercent: number; // 0 to 65 (2700K warmth filter)
  dimmerPercent: number; // 0 to 40
  fontScale: 'sm' | 'md' | 'lg' | 'xl';
  fontFamily: 'serif' | 'sans';
  bionicReading: boolean;
  reducedMotion: boolean;
}

// Generated high-resolution editorial visuals
export const EDITORIAL_IMAGES = {
  tech: '/src/assets/images/editorial_tech_silicon_1794417505852.jpg',
  world: '/src/assets/images/editorial_world_diplomacy_1794417506347.jpg',
  business: '/src/assets/images/editorial_business_markets_1794417507914.jpg',
  science: '/src/assets/images/editorial_science_observatory_1794417508832.jpg',
  culture: '/src/assets/images/editorial_culture_museum_1794417510497.jpg',
};

export const DEFAULT_SOURCES: RssSource[] = [
  {
    id: 'ars-technica',
    name: 'Ars Technica',
    category: 'tech',
    feedUrl: 'https://feeds.arstechnica.com/arstechnica/index',
    domain: 'arstechnica.com',
    enabled: true,
    editorialTagline: 'Silicon architecture, systems engineering, and computing policy',
  },
  {
    id: 'mit-tech-review',
    name: 'MIT Technology Review',
    category: 'tech',
    feedUrl: 'https://www.technologyreview.com/feed/',
    domain: 'technologyreview.com',
    enabled: true,
    editorialTagline: 'Deep technical reporting on frontier hardware and AI',
  },
  {
    id: 'reuters-world',
    name: 'Reuters World Dispatch',
    category: 'world',
    feedUrl: 'https://www.reutersagency.com/feed/',
    domain: 'reuters.com',
    enabled: true,
    editorialTagline: 'Global diplomacy, treaties, and geopolitical shifts',
  },
  {
    id: 'bbc-world',
    name: 'BBC Global Service',
    category: 'world',
    feedUrl: 'https://feeds.bbci.co.uk/news/world/rss.xml',
    domain: 'bbc.co.uk',
    enabled: true,
    editorialTagline: 'International correspondents and regional dispatches',
  },
  {
    id: 'ft-markets',
    name: 'Financial Chronicle',
    category: 'business',
    feedUrl: 'https://www.ft.com/rss/home',
    domain: 'ft.com',
    enabled: true,
    editorialTagline: 'Central banking, sovereign debt, and global capital flows',
  },
  {
    id: 'nikkei-asia',
    name: 'Tokyo Exchange Review',
    category: 'business',
    feedUrl: 'https://asia.nikkei.com/rss/feed/nar',
    domain: 'asia.nikkei.com',
    enabled: true,
    editorialTagline: 'Pacific Rim supply chains and industrial strategy',
  },
  {
    id: 'nature-briefing',
    name: 'Nature Journal Dispatch',
    category: 'science',
    feedUrl: 'https://www.nature.com/nature.rss',
    domain: 'nature.com',
    enabled: true,
    editorialTagline: 'Peer-reviewed breakthroughs in astrophysics and biology',
  },
  {
    id: 'quanta-mag',
    name: 'Quanta Science Digest',
    category: 'science',
    feedUrl: 'https://api.quantamagazine.org/v1/rss',
    domain: 'quantamagazine.org',
    enabled: true,
    editorialTagline: 'Illuminating mathematics, physics, and basic research',
  },
  {
    id: 'architectural-digest',
    name: 'Monolith & Form',
    category: 'culture',
    feedUrl: 'https://www.archdaily.com/feed',
    domain: 'archdaily.com',
    enabled: true,
    editorialTagline: 'Museum curation, brutalist civic spaces, and design criticism',
  },
  {
    id: 'new-yorker-culture',
    name: 'The Curatorial Review',
    category: 'culture',
    feedUrl: 'https://www.newyorker.com/feed/culture',
    domain: 'newyorker.com',
    enabled: true,
    editorialTagline: 'Essays on literature, cinema, and contemporary art',
  },
];

export const CURATED_ARTICLES: NewsArticle[] = [
  {
    id: 'art-tech-1',
    title: 'Sub-Nanometer Photonic Interconnects Redefine Wafer-Scale Silicon Efficiency',
    subtitle: 'Optical waveguides etched directly onto crystalline silicon substrates cut data-center thermal dissipation by 64 percent.',
    summary: 'Engineers in Eindhoven and Zurich have demonstrated a production-grade silicon photonics lithography pipeline that replaces copper traces between processor dies with coherent laser pulses.',
    contentParagraphs: [
      'During the past decade, the primary bottleneck in high-performance computing has shifted from transistor switching speed to the energetic cost of moving electrons across millimeters of copper interconnect. Every time data travels between high-bandwidth memory stacks and logic cores, resistive heating claims up to forty percent of the total power budget.',
      'Now, a consortium of lithography physicists and optical foundry specialists has unveiled a dual-stage ultraviolet fabrication method that integrates hollow-core silicon nitride waveguides directly into standard 300-millimeter wafer runs. Rather than converting electrical signals at the edge of the rack, laser modulators operate within microns of the arithmetic logic units.',
      'In benchmark trials across 1,024-node cluster topologies, latency across non-adjacent compute nodes dropped by a factor of four while total rack cooling requirements fell dramatically. Semiconductor fabrication plants in Europe and East Asia have already begun qualifying the optical reticle masks for pilot production runs scheduled for late next year.',
      'Crucially, the optical pathways remain resilient to thermal drift between 20 and 85 degrees Celsius, overcoming a longstanding hurdle that previously restricted photonic chips to laboratory cryostats.'
    ],
    keyTakeaways: [
      'Coherent optical waveguides replace copper interposers inside 300mm wafer assemblies.',
      'Data movement thermal dissipation drops by 64% across multi-rack compute clusters.',
      'Thermal drift compensation enables standard air and liquid cooling without cryogenic stabilization.'
    ],
    pullQuote: 'We are no longer limited by how fast a transistor gates, but by how cleanly light can traverse the boundary between memory and logic.',
    author: 'Dr. Lukas Vance',
    authorRole: 'Senior Semiconductor Correspondent',
    sourceId: 'ars-technica',
    sourceName: 'Ars Technica',
    category: 'tech',
    publishedAt: '18m ago',
    readTimeMinutes: 5,
    imageUrl: EDITORIAL_IMAGES.tech,
    imageCaption: 'Fig. 1 — Optical metrology table inspecting deep-ultraviolet wafer alignment lenses in cleanroom Sector B.',
    articleUrl: 'https://arstechnica.com',
    issueNumber: 'ISSUE NO. 48 · TECH'
  },
  {
    id: 'art-world-1',
    title: 'The Geneva Maritime & Critical Minerals Accord Enters Binding Ratification',
    subtitle: 'Thirty-eight signatory nations establish transparent seabed stewardship corridors and sovereign processing audits.',
    summary: 'Following fourteen months of closed-door drafting at the Palais des Nations, delegates finalized a multilateral framework governing deep-ocean mineral extraction and green shipping lanes.',
    contentParagraphs: [
      'Under the travertine colonnades of Geneva’s diplomatic quarter, trade ministers and maritime law delegates concluded what observers are calling the most comprehensive resource treaty since the 1982 Convention on the Law of the Sea. The accord binds thirty-eight coastal and industrial economies to unified environmental baselines before any abyssal plain harvesting can occur.',
      'At the center of the agreement is an independent hydrological telemetry registry. Every autonomous vessel operating beyond exclusive economic zones must stream real-time sediment plume and acoustic data to an open international ledger overseen by marine biologists.',
      'In exchange for strict ecological moratoria across mid-ocean ridge vents, land-based mineral refining states secured long-term tariff stability and shared sovereign insurance pools for low-emission ammonia cargo corridors linking Rotterdam, Singapore, and Yokohama.',
      'Ratification votes in national parliaments will proceed through the second quarter, with the provisional compliance secretariat opening in Geneva next month.'
    ],
    keyTakeaways: [
      '38 nations ratify unified environmental and customs rules for critical mineral corridors.',
      'Mandatory real-time acoustic and sediment telemetry required for all deep-sea survey vessels.',
      'Zero-tariff green ammonia shipping lanes established between Europe and East Asia.'
    ],
    pullQuote: 'Resource sovereignty in the twenty-first century cannot survive without verifiable ecological accounting across shared waters.',
    author: 'Clara Moreau',
    authorRole: 'Chief Diplomatic Editor',
    sourceId: 'reuters-world',
    sourceName: 'Reuters World Dispatch',
    category: 'world',
    publishedAt: '42m ago',
    readTimeMinutes: 6,
    imageUrl: EDITORIAL_IMAGES.world,
    imageCaption: 'Fig. 2 — Delegates convene outside the assembly pavilion in Geneva following the twilight plenary session.',
    articleUrl: 'https://reuters.com',
    issueNumber: 'ISSUE NO. 48 · WORLD'
  },
  {
    id: 'art-business-1',
    title: 'Tokyo’s Vertical Financial Districts Pioneer 24-Hour Sovereign Bond Settlement',
    subtitle: 'Tokenized central bank liquidity pools eliminate multi-day cross-currency clearing friction across Asian and European desks.',
    summary: 'Major institutional clearinghouses in Marunouchi and London have completed the first full quarter of atomic T+0 settlement for sovereign treasury instruments.',
    contentParagraphs: [
      'For half a century, institutional bond markets operated on a patchwork of legacy batch-processing windows that trapped trillions of yen, euros, and dollars in two-day settlement limbo. This week, the Tokyo Exchange Clearing Consortium published its ninety-day audit of continuous atomic settlement across major sovereign yield curves.',
      'By pairing wholesale central bank settlement accounts with deterministic smart-contract clearing rails, institutional desks executed cross-border repo transactions in under four hundred milliseconds—even during overlapping twilight hours between Tokyo and London.',
      'Balance-sheet capital previously locked in overnight margin buffers has been redeployed into municipal infrastructure bonds and grid-scale energy financing. Commercial real estate analysts also note a structural transformation inside financial districts, where trading floors increasingly resemble quiet systems-engineering observatories.',
      'The Bank for International Settlements is expected to incorporate the Tokyo-London interoperability specification into its upcoming blueprint for G20 capital markets.'
    ],
    keyTakeaways: [
      'Atomic T+0 settlement reduces cross-border sovereign bond clearing from 48 hours to 400ms.',
      'Overnight margin buffer reductions unlock $140B in institutional balance-sheet liquidity.',
      'Tokyo and London clearinghouses synchronize continuous 24-hour liquidity windows.'
    ],
    pullQuote: 'When settlement latency drops to zero, counterparty risk ceases to be a calendar problem and becomes pure mathematics.',
    author: 'Kenji Takahashi',
    authorRole: 'Asia Markets Bureau Chief',
    sourceId: 'nikkei-asia',
    sourceName: 'Tokyo Exchange Review',
    category: 'business',
    publishedAt: '1h ago',
    readTimeMinutes: 4,
    imageUrl: EDITORIAL_IMAGES.business,
    imageCaption: 'Fig. 3 — Evening commuters traverse the skybridge atrium of the Marunouchi financial complex in Tokyo.',
    articleUrl: 'https://asia.nikkei.com',
    issueNumber: 'ISSUE NO. 48 · BUSINESS'
  },
  {
    id: 'art-science-1',
    title: 'Atacama Interferometer Maps Atmospheric Water Vapor on a Temperate Sub-Neptune',
    subtitle: 'Adaptive laser guide-star optics resolve parts-per-million molecular absorption bands 110 light-years from Earth.',
    summary: 'Using a newly commissioned cryogenic spectrograph at 5,100 meters elevation, astronomers have isolated distinct stratospheric cloud layers around exoplanet TOI-4481b.',
    contentParagraphs: [
      'High above the arid salt flats of northern Chile, where atmospheric precipitable water vapor drops below half a millimeter, the Atacama High-Resolution Spectrographic Array has achieved a milestone once thought reserved for orbital space telescopes. Across forty-two consecutive nights of observation, astronomers tracked the subtle Doppler shift of starlight filtering through the limb of exoplanet TOI-4481b.',
      'By subtracting telluric lines with femtosecond laser frequency combs, the research team isolated unmistakable rotational-vibrational signatures of water vapor, methane, and photochemical hazes stratified across three distinct altitude zones.',
      'Unlike scorched hot Jupiters that orbit perilously close to their host stars, TOI-4481b circles a quiet K-type dwarf within the temperate habitable zone, maintaining estimated equilibrium temperatures between 260 and 310 Kelvin.',
      'The findings suggest that mid-sized rocky-core worlds with hydrogen-helium envelopes may harbor stable liquid-water cloud decks far more frequently than planetary formation models previously predicted.'
    ],
    keyTakeaways: [
      'Femtosecond laser frequency combs calibrate spectrographic resolution to 1 part in 100 million.',
      'Stratified water vapor and methane clouds confirmed in a temperate 285K exoplanet atmosphere.',
      'Ground-based high-altitude interferometry complements space-based infrared spectroscopy.'
    ],
    pullQuote: 'Every photon that survives a hundred-year journey across interstellar space carries a chemical fingerprint of another sky.',
    author: 'Dr. Elena Rostova',
    authorRole: 'Astrophysics Senior Editor',
    sourceId: 'nature-briefing',
    sourceName: 'Nature Journal Dispatch',
    category: 'science',
    publishedAt: '2h ago',
    readTimeMinutes: 7,
    imageUrl: EDITORIAL_IMAGES.science,
    imageCaption: 'Fig. 4 — Enclosure dome of the 6.5-meter spectroscopic telescope opening at dusk on the Chajnantor plateau.',
    articleUrl: 'https://nature.com',
    issueNumber: 'ISSUE NO. 48 · SCIENCE'
  },
  {
    id: 'art-culture-1',
    title: 'The Architecture of Silence: How Monolithic Concrete Pavilions Shape Contemplation',
    subtitle: 'Curators and acousticians collaborate on museum spaces where natural zenithal light replaces artificial gallery spotlights.',
    summary: 'A new generation of civic art foundations in Basel, Naoshima, and Mexico City is stripping away digital kiosks in favor of slow architectural encounters with sculpture.',
    contentParagraphs: [
      'Step across the threshold of the newly inaugurated Kunsthalle Pavilion and the first sensation is not visual, but acoustic. Thirty-centimeter board-formed pozzolanic concrete walls absorb the low-frequency hum of the surrounding city, dropping ambient sound levels to twenty-four decibels.',
      'Above the central court, an angled trapezoidal oculus slices through the coffered roof slab, casting a slow-moving blade of natural daylight across a single patinated bronze torso. There are no wall labels, QR codes, or audio guide transmitters inside the primary chambers; archival provenance notes are printed in letterpress booklets handed to visitors upon entry.',
      'Museum directors report that average dwell time in front of individual works has tripled from seventeen seconds to nearly four minutes. By treating natural light as a kinetic material that shifts with passing clouds and seasons, the architecture invites repeat visits at dawn and late afternoon.',
      'In an era saturated with backlit screens, physical institutions are discovering that their rarest curatorial asset is uninterrupted perceptual stillness.'
    ],
    keyTakeaways: [
      'Pozzolanic concrete geometries reduce gallery reverberation and urban noise to 24 dB.',
      'Zenithal skylights eliminate glare and UV degradation while restoring natural circadian light.',
      'Removing wall-mounted digital screens increased visitor dwell time per artwork by 320%.'
    ],
    pullQuote: 'Light is not merely an illuminant we apply to a room after it is built; it is the primary chisel that carves the space itself.',
    author: 'Julian St. Clair',
    authorRole: 'Architecture & Curation Critic',
    sourceId: 'architectural-digest',
    sourceName: 'Monolith & Form',
    category: 'culture',
    publishedAt: '3h ago',
    readTimeMinutes: 5,
    imageUrl: EDITORIAL_IMAGES.culture,
    imageCaption: 'Fig. 5 — Zenithal skylight illuminating gallery Chamber IV during the autumn afternoon equinox.',
    articleUrl: 'https://archdaily.com',
    issueNumber: 'ISSUE NO. 48 · CULTURE'
  },
  {
    id: 'art-tech-2',
    title: 'Open-Weight Local Verification Models Bring Deterministic Proofs to Systems Code',
    subtitle: 'Formal verification assistants running on workstation NPUs mathematically prove memory safety in kernel drivers.',
    summary: 'Systems programmers are pairing lightweight formal theorem provers with local neural guided search to eliminate concurrency race conditions before compilation.',
    contentParagraphs: [
      'Writing device drivers and operating system kernels has historically required years of defensive auditing to prevent subtle memory corruption and lock-ordering deadlocks. Even with modern borrow-checked languages, unsafe hardware-interface blocks remain a persistent vector for critical vulnerabilities.',
      'This month, an open-source research collective released an 8-billion-parameter formal proof assistant trained specifically on interactive theorem provers such as Lean 4 and Coq. Because the model runs entirely locally on standard 32-gigabyte developer workstations, proprietary firmware source code never leaves the engineer’s machine.',
      'When an engineer writes a low-level ring-buffer routine, the local verifier synthesizes an accompanying machine-checked invariance proof in seconds. If a proof step fails, the compiler highlights the exact byte offset where an interrupt handler could violate thread safety.',
      'Three major embedded real-time operating system maintainers have already integrated the verification pass into their continuous integration pipelines.'
    ],
    keyTakeaways: [
      'Local 8B formal proof assistant runs offline on consumer NPUs with zero cloud telemetry.',
      'Synthesizes machine-checked Lean 4 memory invariance proofs for kernel ring buffers.',
      'Eliminates concurrency race conditions prior to hardware-in-the-loop testing.'
    ],
    pullQuote: 'Unit tests can only show the presence of bugs on inputs you imagined; formal proofs guarantee their absence across all states.',
    author: 'Soren Lindqvist',
    authorRole: 'Systems Software Editor',
    sourceId: 'mit-tech-review',
    sourceName: 'MIT Technology Review',
    category: 'tech',
    publishedAt: '4h ago',
    readTimeMinutes: 6,
    imageUrl: EDITORIAL_IMAGES.tech,
    imageCaption: 'Fig. 6 — Hardware verification bench testing deterministic interrupt latency on RISC-V silicon.',
    articleUrl: 'https://technologyreview.com',
    issueNumber: 'ISSUE NO. 48 · TECH'
  },
  {
    id: 'art-science-2',
    title: 'Deep-Crustal Geothermal Closed Loops Achieve Continuous 400-Megawatt Baseload',
    subtitle: 'Supercritical carbon dioxide circulating through five-kilometer granite horizontal wells delivers zero-water-loss clean power.',
    summary: 'By adapting directional diamond-bit drilling from energy exploration, geothermal engineers have unlocked ubiquitous granite heat reservoirs independent of volcanic fault lines.',
    contentParagraphs: [
      'Conventional geothermal power plants have long been restricted to rare tectonic hotspots like Iceland, New Zealand, and Northern California, where naturally permeable steam reservoirs sit close to the surface. Everywhere else, dry crystalline basement rock remained too impermeable to harvest economically.',
      'Now, a closed-loop geothermal array in the Bavarian Molasse Basin has completed 8,000 hours of uninterrupted baseload generation using polycrystalline diamond compact drill bits paired with millimeter-wave rock spallation.',
      'Instead of injecting water to fracture rock—which risks induced seismicity and mineral scaling—the facility drills two parallel horizontal bores five kilometers deep and connects them like a subterranean radiator. Supercritical carbon dioxide circulates in a sealed thermosiphon loop, driving surface turbines without consuming a single liter of groundwater.',
      'Because granite reaches 220 degrees Celsius beneath nearly every continent at sufficient depth, utility planners view closed-loop geothermal as the missing firm-power partner to solar and wind.'
    ],
    keyTakeaways: [
      'Closed-loop subterranean heat exchangers require zero hydraulic fracturing or water loss.',
      'Supercritical CO2 thermosiphon naturally circulates heat to surface turbines without pump drag.',
      'Replicable in non-volcanic continental granite formations worldwide.'
    ],
    pullQuote: 'Beneath every city on Earth lies an inexhaustible thermal battery waiting only for precision geometry to tap it.',
    author: 'Dr. Henrik Lindholm',
    authorRole: 'Energy & Earth Sciences Correspondent',
    sourceId: 'quanta-mag',
    sourceName: 'Quanta Science Digest',
    category: 'science',
    publishedAt: '5h ago',
    readTimeMinutes: 5,
    imageUrl: EDITORIAL_IMAGES.science,
    imageCaption: 'Fig. 7 — High-altitude geophysical monitoring array tracking subsurface thermal gradients.',
    articleUrl: 'https://quantamagazine.org',
    issueNumber: 'ISSUE NO. 48 · SCIENCE'
  },
  {
    id: 'art-business-2',
    title: 'European Industrial Foundries Turn Waste Heat Into District Heating Dividends',
    subtitle: 'Municipal energy cooperatives partner with semiconductor fabs and data centers to warm 600,000 residential homes.',
    summary: 'New waste-heat recovery mandates and carbon-adjusted municipal bonds have turned industrial cooling loops into profitable civic infrastructure across Northern Europe.',
    contentParagraphs: [
      'For decades, industrial cooling towers vented gigawatt-hours of low-grade thermal energy into the atmosphere while residential neighborhoods three kilometers away burned imported natural gas for winter heating. A new generation of high-temperature industrial heat pumps has closed that thermodynamic loop.',
      'Under cooperative off-take contracts pioneered in Zurich, Odense, and Munich, fabrication plants and cloud compute facilities feed their 45-degree-Celsius cooling water directly into insulated municipal district pipes. Ammonia-cycle compressors boost the temperature to 85 degrees Celsius before delivering it to apartment radiators.',
      'Rather than treating thermal regulation as a compliance cost, industrial operators now book steady twenty-year annuity revenue from municipal utilities, improving facility operating margins by up to four hundred basis points.',
      'Infrastructure funds have oversubscribed the latest tranche of European green thermal bonds by more than three times.'
    ],
    keyTakeaways: [
      'Industrial cooling water at 45°C is boosted via ammonia heat pumps to warm 600,000 homes.',
      'Long-term municipal thermal off-take agreements add 400 bps to foundry operating margins.',
      'Eliminates 1.8 million metric tons of residential heating emissions annually.'
    ],
    pullQuote: 'There is no such thing as waste heat in a well-designed city—only energy that has not yet found its neighbor.',
    author: 'Beatrice Von Berg',
    authorRole: 'European Infrastructure Editor',
    sourceId: 'ft-markets',
    sourceName: 'Financial Chronicle',
    category: 'business',
    publishedAt: '6h ago',
    readTimeMinutes: 5,
    imageUrl: EDITORIAL_IMAGES.business,
    imageCaption: 'Fig. 8 — Evening view of integrated commercial and district infrastructure corridors.',
    articleUrl: 'https://ft.com',
    issueNumber: 'ISSUE NO. 48 · BUSINESS'
  }
];

/**
 * Fetches live RSS items from a custom or default RSS URL via rss2json API
 * and converts them into our magazine NewsArticle format, falling back gracefully
 * so the user never experiences broken feeds or empty error screens.
 */
export async function fetchLiveRssFeed(
  feedUrl: string,
  sourceName: string,
  category: Exclude<CategoryId, 'all'>
): Promise<NewsArticle[]> {
  try {
    const endpoint = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`;
    const response = await fetch(endpoint, { signal: AbortSignal.timeout(5500) });
    if (!response.ok) throw new Error('RSS gateway non-200');
    const data = await response.json();
    if (data.status !== 'ok' || !Array.isArray(data.items) || data.items.length === 0) {
      throw new Error('Empty RSS items');
    }

    const fallbackImage = EDITORIAL_IMAGES[category] || EDITORIAL_IMAGES.tech;

    return data.items.slice(0, 5).map((item: Record<string, string>, idx: number) => {
      const cleanDesc = (item.description || item.content || '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      const sentences = cleanDesc.split('. ').filter(Boolean);
      const summary = sentences.slice(0, 2).join('. ') + (sentences.length > 0 ? '.' : '');
      const paragraphs = [
        cleanDesc || 'Full dispatch synchronized from live RSS syndication stream.',
        'This dispatch was ingested directly via FlipStream’s real-time RSS syndication parser and formatted for eye-protective editorial reading.',
        'Tap "Original Source Dispatch" in the reader toolbar to inspect external citations and supplementary figures from the publisher.'
      ];

      return {
        id: `live-${category}-${Date.now()}-${idx}`,
        title: item.title || 'Untitled Editorial Dispatch',
        subtitle: summary.slice(0, 140) || `Live RSS dispatch from ${sourceName}`,
        summary: summary || `Live syndicated article from ${sourceName}.`,
        contentParagraphs: paragraphs,
        keyTakeaways: [
          `Syndicated live from ${sourceName} RSS stream.`,
          'Formatted automatically for distraction-free OLED and Sepia reading.',
          'Verified structured metadata and reading cadence.'
        ],
        pullQuote: summary.slice(0, 120) || 'Live syndicated journalism formatted for ocular comfort.',
        author: item.author || `${sourceName} Editorial Desk`,
        authorRole: 'Syndicated Correspondent',
        sourceId: sourceName.toLowerCase().replace(/\s+/g, '-'),
        sourceName,
        category,
        publishedAt: 'Live RSS',
        readTimeMinutes: Math.max(3, Math.min(9, Math.ceil(cleanDesc.length / 600))),
        imageUrl: fallbackImage,
        imageCaption: `Fig. ${idx + 1} — Archival editorial plate accompanying live RSS dispatch from ${sourceName}.`,
        articleUrl: item.link || feedUrl,
        issueNumber: `LIVE RSS · ${category.toUpperCase()}`
      };
    });
  } catch {
    // Return empty array so caller keeps curated articles or synthesizes a clean entry
    return [];
  }
}
