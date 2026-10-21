// Content transcribed from the Apartment Scout case-study content package
// (workspaces/work/career-ops/portfolio/apartment-scout/apartment-scout/), which was itself
// reverse-engineered from the real codebase, git history, and direct user confirmation.
// See that package's 07-source-material/ for the underlying evidence register.

export interface ZoomIn {
  id: string;
  title: string;
  question: string;
  body: string;
  takeaway: string;
  evidenceTier: 'verified' | 'source-described' | 'unverified';
  diagramId?: string;
}

export interface Chapter {
  id: string;
  ordinal: number;
  eyebrow: string;
  heading: string;
  summary: string;
  body: string;
  zoomIds: string[];
  diagramId?: string;
}

export const hero = {
  title: 'Apartment Scout',
  lead:
    "I built an AI-assisted apartment search tool that discovered relevant Facebook communities, made fragmented rental listings comparable, and surfaced the property we ultimately selected.",
  detail:
    'The actual outcome was a selected property found through the tool. It also helped us understand real market prices and the scarcity of genuinely furnished units. Built April to May 2026 with Claude Code, local Qwen3 8B, Claude Haiku, browser automation, SQLite and Streamlit.',
  metrics: [
    { label: '26', sublabel: 'AI-discovered, manually approved groups' },
    { label: '228', sublabel: 'retained, ranked listing records' },
    { label: '1', sublabel: 'selected property, surfaced by the tool' },
  ],
  metricsCaveat: 'Activity indicators, not numbers of viewings or contacts.',
};

// Diagrams render as static HTML/CSS (no client JS, no diagramming library) — a flowchart
// rendering library was tried first and pulled in several megabytes of unused diagram-type
// code for these simple 3-10 node graphs; these structures cover the same conceptual content
// at zero runtime cost, consistent with the design system's "minimal decoration" direction.

export interface FlowDiagram {
  kind: 'flow';
  title: string;
  steps: string[];
  branch?: { after: string; question: string; outcomes: { label: string; detail: string }[] };
  note?: string;
}

export interface JourneyDiagram {
  kind: 'journey';
  title: string;
  columns: { heading: string; items: string[] }[];
}

export type DiagramDef = FlowDiagram | JourneyDiagram;

export const diagrams: Record<string, DiagramDef> = {
  'user-journey': {
    kind: 'journey',
    title: 'User journey, before and with the tool (conceptual)',
    columns: [
      { heading: 'Before', items: ['Browse fragmented Facebook groups', 'Interpret posts manually', 'Compare rent and quality in head'] },
      { heading: 'With Apartment Scout', items: ['Review ranked comparable candidates', 'Develop market intuition', 'Decide whether to reach out'] },
      { heading: 'Outcome', items: ['Selected property surfaced by the tool'] },
    ],
  },
  'system-architecture': {
    kind: 'flow',
    title: 'System architecture',
    steps: [
      'Multilingual search seeds',
      'Claude Haiku 4.5 group discovery (human approval required)',
      '26 approved Facebook groups',
      'Serial browser collection',
      'Local Qwen3 8B relevance filter',
      'Structured extraction',
      'SQLite + deterministic filters',
      'Estimated cost normalization',
      'Claude Haiku photo scoring',
      'Weighted ranking',
      'Streamlit shortlist',
      'Human review and outreach',
    ],
    note: 'Dismissal feedback loops back into the relevance filter via Jaccard grouping and recurrence tiers. The SQLite store also syncs with a GitHub-hosted JSON copy for the cloud dashboard — a dual-source-of-truth risk, covered in "GitHub as a database."',
  },
  'group-discovery': {
    kind: 'flow',
    title: 'AI-guided group discovery',
    steps: [
      'FR / NL / EN seed queries',
      'Search Facebook groups',
      'Claude ranks candidates, refines next search round (repeats)',
      'Review candidates (--show)',
    ],
    branch: {
      after: 'Review candidates (--show)',
      question: 'Human approves?',
      outcomes: [
        { label: 'Yes', detail: 'Added to selected_groups.json' },
        { label: 'No', detail: 'Excluded' },
      ],
    },
    note: '26 final selected groups all passed through this loop and the human approval gate.',
  },
  'feedback-loop': {
    kind: 'flow',
    title: 'Dismissal-feedback loop',
    steps: [
      'Dismiss listing with reason',
      'Persist reason in SQLite',
      'Next pipeline run',
      'Group related phrases with Jaccard overlap',
      'Recurrence thresholds',
      'Soft / moderate / strong preference instruction',
      'Append to classification system prompt',
      'Classify new listing',
      'Human evaluates result',
    ],
    note: 'The evaluated result feeds back into the next dismissal, closing the loop.',
  },
  'ranking-process': {
    kind: 'flow',
    title: 'Ranking process',
    steps: ['Extracted listing fields'],
    branch: {
      after: 'Extracted listing fields',
      question: 'Known hard mismatch?',
      outcomes: [
        { label: 'Yes', detail: 'Filtered out' },
        { label: 'No or unknown', detail: 'Normalize estimated costs → compute separate feature scores → apply configurable weights → priority order' },
      ],
    },
    note: 'Observed errors and feedback revise the acceptance criteria and weights, which then feed back into how weights are applied.',
  },
  'collection-incident': {
    kind: 'flow',
    title: 'Scraping incident and response',
    steps: ['Parallel sessions', 'Account ban', 'Serial runs', 'Camoufox adoption'],
    branch: {
      after: 'Camoufox adoption',
      question: 'Two residual problem threads',
      outcomes: [
        { label: 'Detection', detail: 'Further detection issues → environment adjustments (OS/device/location spoofing)' },
        { label: 'Markup', detail: 'Changing DOM and timestamps → repeated extraction fixes' },
      ],
    },
    note: 'Both threads converge into pre-flight checks and diagnostics — which caught problems faster, but still left the pipeline bursty and fragile in practice.',
  },
  'cloud-state': {
    kind: 'flow',
    title: 'Local versus cloud state',
    steps: [
      'Local SQLite state ↔ Streamlit Community Cloud UI',
      'Cloud writes go via the GitHub API',
      'GitHub-hosted listings.json (also triggers redeploy)',
      'Export and reconcile back to local',
    ],
    branch: {
      after: 'Export and reconcile back to local',
      question: 'Merge successful?',
      outcomes: [
        { label: 'Yes', detail: 'Local state stays in sync' },
        { label: 'No', detail: 'Manual status loss risk' },
      ],
    },
  },
};

export const zoomIns: ZoomIn[] = [
  {
    id: 'speed-attention',
    title: 'The manual alternative had one real advantage',
    question: 'Facebook notifications react faster than any batch pipeline — so why not just use those?',
    body: "Facebook notifications could surface a brand-new post immediately, which sometimes meant getting a viewing a slower response wouldn't. The cost was living with persistent interruption, checking group feeds throughout the day, every day, for as long as the search lasted. A batch system wouldn't always win on first-response speed — it had to repay that disadvantage with better coverage, better comparison, and faster go/no-go decisions once a candidate appeared.",
    takeaway: "Speed isn't free — the question is what you're trading it for.",
    evidenceTier: 'verified',
  },
  {
    id: 'group-discovery',
    title: 'How AI discovered all 26 groups',
    question: 'The source list itself was AI-assisted, not hand-picked from the start.',
    body: 'A discovery script seeded French, Dutch, and English Facebook searches. Claude Haiku 4.5 iteratively ranked candidate groups and proposed refinements using prior findings, round after round. All 26 groups in the approved collection set came through this process — but a manual approval step (`--show` then `--add`) stood between any AI-surfaced candidate and the actual scrape list.',
    takeaway: 'AI proposes sources; a human approves; code does the collecting.',
    evidenceTier: 'verified',
    diagramId: 'group-discovery',
  },
  {
    id: 'scraper-failures',
    title: 'Facebook fought the scraper, consistently',
    question: 'The weakest layer in the system made the whole workflow bursty.',
    body: 'Running two browser sessions in parallel for speed got the scraping account banned outright. The fix was to go serial and adopt Camoufox, a Firefox-based tool built for bot evasion — and even that needed further tuning (spoofing OS, device, and location signals) before detection actually stopped. Separately, timestamp extraction needed five different fixes as Facebook varied how it rendered dates. Pre-flight checks and a DOM-diagnostic tool helped catch problems fast, but never turned scraping into a dependable daily service.',
    takeaway: 'Reliability of incoming data is product reliability — no downstream logic fixes a broken feed.',
    evidenceTier: 'verified',
    diagramId: 'collection-incident',
  },
  {
    id: 'requirements-pivot',
    title: 'When the search changed halfway through',
    question: 'What counts as "an acceptable rental" changed mid-project.',
    body: 'The search moved from long-term furnished apartments around €1,250 across five communes to lower-budget, short-term options around €1,000 across ten communes, including colocation and sublets. That meant new extracted fields (property type, sublet status, rental type) and the retirement of bedroom-count as a sufficient filter on its own. The personal reason behind the change stays private — only the product consequence is shown here.',
    takeaway: 'Changing user needs can invalidate the schema itself, not just the thresholds.',
    evidenceTier: 'verified',
  },
  {
    id: 'ranking-evolution',
    title: 'When the ranking formula was wrong',
    question: 'A phone number is not as important as price — but an early version of the formula said it was.',
    body: 'The ranking specification went through three deliberate, test-driven versions, each with written acceptance criteria. One version weighted having a contact phone number as heavily as price fit. The next cut that weight by two-thirds, with the reasoning stated plainly: a phone number is a convenience, not a dealbreaker. Availability became a hard cutoff after stale listings kept ranking competitively when they shouldn\'t have, and furnished-preference was split out from plain data-completeness scoring.',
    takeaway: 'A ranking formula is a collection of product judgments, not just a math problem.',
    evidenceTier: 'verified',
    diagramId: 'ranking-process',
  },
  {
    id: 'feedback',
    title: 'Teaching the model preferences that weren\'t in the original design',
    question: 'How do you handle subjective preferences too numerous to model as database fields upfront?',
    body: 'Every dismissal could include a reason. Reasons persisted to SQLite, were grouped on the next run by word-overlap similarity with no AI call needed, and were promoted into soft, moderate, or strong preference language as themes recurred — then appended straight into the classification prompt. The first version only held feedback in the app\'s temporary session memory and lost it the moment the session ended; that was fixed so it persisted properly and reached the live classification path. Actual adoption was limited, and any resulting classification-quality lift was never measured.',
    takeaway: 'Unknown future preferences don\'t need to become a fixed schema field — a feedback loop can absorb them instead.',
    evidenceTier: 'verified',
    diagramId: 'feedback-loop',
  },
  {
    id: 'model-evaluation',
    title: 'Why the smaller model appeared to win',
    question: 'A benchmark that helped make one decision is not a universal claim about model quality.',
    body: 'A comparison harness ran Qwen3 8B and Qwen3 14B on the same posts, escalated every disagreement between them to Claude Haiku 4.5 as a reference judge, and scored each candidate only on that disagreement subset. The reported 76% versus 9% per-field agreement is real, but it measures accuracy only where the two models already disagreed — a harder, non-representative sample, not full-dataset accuracy. Exact sample size and independent human verification of Haiku\'s labels aren\'t available, and a 14B model scoring this much worse is also consistent with a prompt or parsing mismatch rather than a clean capability gap.',
    takeaway: 'Evaluate on your actual task, and audit your evaluation method as hard as the model.',
    evidenceTier: 'source-described',
  },
  {
    id: 'cloud-github',
    title: 'Using GitHub as a database',
    question: 'A pragmatic shortcut with a disclosed integrity risk.',
    body: 'The cloud-hosted dashboard needed to work without a laptop running Streamlit locally, and Streamlit Community Cloud gives no persistent disk between restarts. Rather than standing up a database, a GitHub repo that already existed for an unrelated reason — re-hosting photos, since Facebook\'s own photo links expire — was reused as the state store too. Writing a status change via GitHub\'s API both persisted it and triggered an automatic redeploy. The tradeoff: two sources of truth (local SQLite, remote GitHub JSON) that need reconciling, with a real, disclosed risk of losing a manual status if that reconciliation fails.',
    takeaway: 'A low-cost shortcut is fine — as long as the integrity tradeoff it carries is named, not hidden.',
    evidenceTier: 'verified',
    diagramId: 'cloud-state',
  },
  {
    id: 'bursty-usage',
    title: 'Why the intended daily workflow never happened',
    question: 'A fast dashboard cannot compensate for a slow refresh.',
    body: 'The goal was frequent, close-to-daily review. In practice, a full refresh could take hours, and scraping broke often enough that usage happened in concentrated bursts instead. The dashboard itself could reload already-computed data instantly — but that\'s a different thing entirely from obtaining fresh data in the first place, and the instant refresh button couldn\'t paper over an upstream collection step that wasn\'t yet fast or dependable.',
    takeaway: 'End-to-end availability governs whether a habit actually forms — not how fast the last mile is.',
    evidenceTier: 'verified',
  },
  {
    id: 'used-versus-built',
    title: 'What was built versus what got used',
    question: 'Technically working does not mean habitually adopted.',
    body: 'The app had a persistent status tracker, a feedback loop, auto-generated inquiry messages, and a cloud-deployed version. The final 228-record export shows almost everything still at default "new" status, two listings marked "favorite," and nothing marked "contacted." Real outreach and ongoing discussion with a girlfriend about listings clearly happened — just mostly outside that particular feature, not evidence that no outreach occurred at all.',
    takeaway: 'Usage reality, once you actually look at it, should reshape what you\'d prioritize next — not just how you built it.',
    evidenceTier: 'verified',
  },
  {
    id: 'chosen-property',
    title: 'How Apartment Scout surfaced the selected property',
    question: 'The outcome that mattered was personal, not a dashboard metric.',
    body: 'Housing was found, and Apartment Scout directly surfaced the property chosen. That supports a real, concrete product outcome — but not a claim about money saved, a move-in date, or that every later step in the process ran through the tool. The 228 retained records are ranked candidates, not 228 viewings.',
    takeaway: 'A customer outcome matters more than any processing count sitting next to it.',
    evidenceTier: 'verified',
  },
];

export const chapters: Chapter[] = [
  {
    id: 'pain',
    ordinal: 1,
    eyebrow: '01 — Customer pain',
    heading: 'Hundreds of listings, no useful filters',
    summary: 'Finding an apartment meant doing the data work by hand.',
    body: "Relevant rentals were scattered across Facebook groups, not neatly arranged in a filterable rental database. Each listing needed reading, interpretation, deduplication, price comparison, availability checking, photo inspection, and a judgment about whether to contact the poster. French, Dutch, English, and shorthand like APD and ONO increased the friction. Every new post added another small research task — the cost was sustained attention, not just time spent scrolling.\n\nThe manual alternative worked, but demanded constant attention: Facebook notifications could surface a brand-new post immediately, potentially securing an early viewing, at the cost of persistent interruption throughout the day. A slower, batch-based system wouldn't always win on first-response speed — it needed to repay that disadvantage with better coverage, better comparison, and faster go/no-go decisions once a candidate appeared.",
    zoomIds: ['speed-attention'],
    diagramId: 'user-journey',
  },
  {
    id: 'insight',
    ordinal: 2,
    eyebrow: '02 — Product insight',
    heading: 'Collecting more posts was not the solution',
    summary: 'Raw information is not the same as decision-useful information.',
    body: "A database of hundreds of posts would still leave me mentally reconstructing the facts every time. The underlying need was to answer three questions: does this place fit, is it good value compared with the market, and should we act now? That insight sharpened during use — the most valuable output turned out to be comparable, prioritized opportunities and a clearer sense of real prices and genuinely furnished supply, not a bigger pile of listings.\n\nTurning messy text into a clean schema didn't automatically make the data true. Descriptions were incomplete, shorthand-heavy, and sometimes internally inconsistent — \"toutes charges comprises\" could coexist with separate service charges elsewhere in the same post. Posts could be stale, or quietly edited to say a property was already rented. Each extraction stage could introduce false certainty, so the design deliberately distinguished known mismatches from merely missing information.",
    zoomIds: [],
  },
  {
    id: 'product',
    ordinal: 3,
    eyebrow: '03 — Product and experience',
    heading: 'From scattered posts to a shortlist',
    summary: 'I designed an end-to-end tool around the decisions I actually needed to make.',
    body: "Claude Haiku guided multilingual discovery of relevant Facebook groups; I manually approved all 26 groups in the final list. Browser automation collected post content; a local Qwen3 8B model classified and extracted structured rental attributes. Code applied clear filters, deduplicated, and persisted records. Missing utility costs were estimated for a comparable total; Haiku evaluated photos only for candidates that had already passed every cheaper check. A weighted ranking and a Streamlit dashboard let me review what was left.\n\nThe experience was useful even without perfect automation. Each run produced a retained, ranked set of candidates rather than another stream of unrelated posts. Consistent fields and estimated comparable costs made asking prices easier to judge at a glance, and photo scoring captured visual signal the listing text never gave. The app included saved statuses and auto-generated inquiry messages, but real outreach mostly happened outside that status tracker. The strongest value observed was better market understanding, faster confident decisions, and the selected property actually being surfaced.",
    zoomIds: ['group-discovery', 'scraper-failures'],
    diagramId: 'system-architecture',
  },
  {
    id: 'decisions',
    ordinal: 4,
    eyebrow: '04 — Hard problems and decisions',
    heading: 'Where to use models, where to use code',
    summary: 'A different tool for each kind of ambiguity.',
    body: "Claude Haiku directed exploratory source discovery, with a human approval step before any new group was trusted. Local Qwen handled repeated relevance and extraction work without metered per-request charges. Deterministic rules handled explicit exclusions, persistence, deduplication, and ranking math — no reason to pay for a model call when a rule gives the same answer every time. Paid vision calls assessed apartment condition, but only after cheaper filtering had already run. For subjective preferences too numerous to model as database fields upfront, dismissal reasons could be turned into evolving classification instructions instead.\n\nI revised the scoring logic when real outputs exposed wrong assumptions. The formula went through three deliberate, test-driven versions. One weighted having a phone number as highly as price fit; the next cut that weight by two-thirds, because a phone number is a convenience, not a dealbreaker. Availability became a hard cutoff after stale results kept surfacing competitively. This is the clearest example of why product judgment mattered more than an intricate formula: a ranking is an encoded choice about what deserves attention.",
    zoomIds: ['requirements-pivot', 'ranking-evolution', 'feedback', 'model-evaluation', 'cloud-github'],
  },
  {
    id: 'impact',
    ordinal: 5,
    eyebrow: '05 — Customer impact',
    heading: 'The tool surfaced the apartment we chose',
    summary: 'A successful personal outcome, despite a messy operational reality.',
    body: "The final export held 228 ranked, retained records, drawn from 26 AI-discovered, manually approved groups. Using that data gave a far more realistic view of price ranges, genuinely furnished supply, and viable opportunities — which translated into faster, more confident go/no-go decisions and faster outreach. Apartment Scout directly surfaced the property we ultimately selected. There is no quantified before/after time saving, no recorded contact funnel, and no evidence of fully automated daily use.\n\nThe data and prioritization mattered more than the feature inventory. The original aspiration was frequent, close-to-daily checking, but scraping repeatedly failed and a full refresh could take hours — actual use happened in concentrated bursts. The status tracker was technically implemented yet barely used: the 228-record export shows only two favorites and no contacted statuses, though contact happened outside the UI. The product won by supporting an informed decision, not by delivering a flawless end-to-end CRM.",
    zoomIds: ['bursty-usage', 'used-versus-built', 'chosen-property'],
  },
  {
    id: 'reflection',
    ordinal: 6,
    eyebrow: '06 — Reflection',
    heading: 'Build the weakest dependency first',
    summary: 'What I would change after solving the actual problem.',
    body: "I would establish collection reliability before investing in dashboard polish — every downstream insight depended on fresh source data, and no amount of ranking sophistication fixes a feed that's broken or hours behind. I would instrument actual decision outcomes, not only classification and test results, and let observed adoption — not assumption — decide which extra features deserve further investment.\n\nThe larger lesson: useful AI products combine disciplined interpretation, explicit assumptions, human judgment, and pragmatic software. The model is only one component of the work.",
    zoomIds: [],
  },
];
