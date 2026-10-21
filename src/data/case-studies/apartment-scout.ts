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

export interface Screenshot {
  src: string;
  caption: string;
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
  screenshots?: Screenshot[];
}

export const hero = {
  title: 'Apartment Scout',
  lead:
    "A scrappy AI tool I built to find an apartment in Brussels. It hunted down the right Facebook groups, turned messy posts into something comparable, and found the place we actually moved into.",
  detail:
    'A two-week personal project, not a product. Built April to May 2026 with Claude Code, a local Qwen3 8B model, Claude Haiku, some browser automation, SQLite, and Streamlit.',
  metrics: [
    { label: '26', sublabel: 'Facebook groups, AI-found and human-approved' },
    { label: '228', sublabel: 'listings it ranked for me' },
    { label: '1', sublabel: 'apartment it actually found' },
  ],
  metricsCaveat: "Just activity numbers. Not viewings, not messages sent.",
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
  beforeHeading: string;
  afterHeading: string;
  pairs: { before: string; after: string }[];
  outcome: string;
}

export type DiagramDef = FlowDiagram | JourneyDiagram;

export const diagrams: Record<string, DiagramDef> = {
  'user-journey': {
    kind: 'journey',
    title: 'User journey, before and with the tool (conceptual)',
    beforeHeading: 'Manual search',
    afterHeading: 'With Apartment Scout',
    pairs: [
      { before: 'Browse fragmented Facebook groups', after: 'Review ranked comparable candidates' },
      { before: 'Interpret posts manually', after: 'Develop market intuition' },
      { before: 'Compare rent and quality in head', after: 'Decide whether to reach out' },
    ],
    outcome: 'Selected property surfaced by the tool',
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
    note: 'Dismissal feedback loops back into the relevance filter via Jaccard grouping and recurrence tiers. The SQLite store also syncs with a GitHub-hosted JSON copy for the cloud dashboard, a dual-source-of-truth risk covered in "GitHub as a database."',
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
    note: 'Both threads converge into pre-flight checks and diagnostics. Caught problems faster, but still left the pipeline bursty and fragile in practice.',
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
    title: 'Notifications would have been faster, sometimes',
    question: 'Why not just use Facebook notifications instead?',
    body: "Turning on notifications would sometimes win. Reacting to a brand-new post instantly can get you a viewing a slower tool can't. The real cost is checking your phone constantly, all day, for weeks. A batch tool has to make up for being slower somewhere else: wider coverage, clearer comparisons, faster calls once something good shows up.",
    takeaway: "Speed isn't free. The question is what you're trading it for.",
    evidenceTier: 'verified',
  },
  {
    id: 'group-discovery',
    title: "I didn't pick the 26 groups, Claude did",
    question: 'The source list itself was AI-found, not hand-picked from day one.',
    body: "Claude Haiku searched in French, Dutch, and English, ranking candidate Facebook groups round after round based on what it had already found. I still approved every single one before it entered the real scrape list.",
    takeaway: 'AI proposes sources. A human approves. Code does the collecting.',
    evidenceTier: 'verified',
    diagramId: 'group-discovery',
  },
  {
    id: 'scraper-failures',
    title: 'Facebook fought the scraper, constantly',
    question: 'The weakest layer in the system made the whole thing bursty.',
    body: "Running two browser sessions at once to go faster got my account banned. The fix: one session at a time, and Camoufox, a tool built to dodge bot detection, which still needed tuning before it actually worked. Facebook also kept changing how it renders dates, so timestamp parsing broke and got patched five separate times. None of it ever became a dependable daily job.",
    takeaway: 'Bad input data is a product problem, not just an engineering one.',
    evidenceTier: 'verified',
    diagramId: 'collection-incident',
  },
  {
    id: 'requirements-pivot',
    title: 'The brief changed halfway through',
    question: 'What counted as "an acceptable place" changed mid-project.',
    body: "Partway through, the actual search changed: lower budget, shorter stay, more communes, rooms and sublets now fair game. That meant new fields and dropping bedroom-count as a filter entirely. Why it changed is personal, and staying off this page.",
    takeaway: 'Changing needs can break your filters, not just your thresholds.',
    evidenceTier: 'verified',
  },
  {
    id: 'ranking-evolution',
    title: 'The ranking formula was wrong, twice',
    question: "A phone number isn't as important as price. An early version said it was.",
    body: "The ranking went through three rewrites, each with its reasoning written down. The embarrassing one: an early version cared as much about \"has a phone number\" as actual price. Fixed that, cut its weight by two-thirds, since a phone number is convenient, not a dealbreaker. Stale listings also kept out-ranking fresh ones until availability became a hard cutoff instead of a soft nudge.",
    takeaway: 'A ranking formula is just a list of opinions, written down and tested.',
    evidenceTier: 'verified',
    diagramId: 'ranking-process',
  },
  {
    id: 'feedback',
    title: 'It learned my taste without a new database field',
    question: "How do you handle a preference you didn't design a field for?",
    body: "Dismissing a listing lets me leave a reason. Those get grouped by plain text similarity (no AI needed for that part) and turned into instructions: mentioned once, flag it; mentioned five times, penalize it hard. That gets fed straight back into how the next batch gets classified. The first version of this quietly broke: feedback only lived in the browser tab and vanished on refresh. Fixed that. Never got around to measuring if it actually helped.",
    takeaway: "You don't need a new field for every preference. A feedback loop can absorb it instead.",
    evidenceTier: 'verified',
    diagramId: 'feedback-loop',
  },
  {
    id: 'model-evaluation',
    title: 'Why the smaller model appeared to win',
    question: 'One benchmark, for one decision. Not a universal claim about model quality.',
    body: "I compared a smaller local model (Qwen3 8B) against a bigger one (Qwen3 14B) using an LLM-as-judge setup: wherever the two disagreed, Claude Haiku settled it as the reference answer. The smaller model won, 76% to 9%, but only on the subset where they'd disagreed in the first place. That's a harder, skewed sample, not an overall score. I never independently checked Haiku's calls, and a model losing that badly is just as likely a prompt bug as a real capability gap.",
    takeaway: 'Evaluate on your actual task, and audit the evaluation as hard as the model.',
    evidenceTier: 'source-described',
  },
  {
    id: 'cloud-github',
    title: 'Using GitHub as a makeshift database',
    question: 'A free shortcut, with a trade-off worth naming.',
    body: "The cloud dashboard had nowhere to save state. Streamlit's free hosting wipes its disk on every restart. Rather than stand up a database, I reused a GitHub repo I already had (originally just for re-hosting photos) as one. Writing a status there happened to trigger a redeploy too, which was a nice accident. The catch: now there are two copies of the truth, local and GitHub, and if they don't reconcile cleanly, a status can quietly go missing.",
    takeaway: 'A free shortcut is fine, as long as you can say out loud what it might cost you.',
    evidenceTier: 'verified',
    diagramId: 'cloud-state',
  },
  {
    id: 'bursty-usage',
    title: 'The daily habit that never happened',
    question: "A fast dashboard can't make up for a slow refresh.",
    body: "The plan was daily checks. Reality: a full refresh could take hours and the scraper broke constantly, so I used it in bursts whenever it actually worked. The dashboard's own refresh button was instant. Irrelevant, if there's nothing new underneath it.",
    takeaway: 'The slowest step sets the pace, no matter how fast the rest is.',
    evidenceTier: 'verified',
  },
  {
    id: 'used-versus-built',
    title: 'What I built vs. what I actually used',
    question: 'Technically working isn\'t the same as actually used.',
    body: 'I built a status tracker, a feedback loop, auto-written outreach messages, a cloud version. The works. Then I looked at the real data: almost every listing still says "new," two are "favorited," none say "contacted." I definitely reached out to people, just over Messenger, not through my own status button.',
    takeaway: 'Check what actually got used before deciding what to build next.',
    evidenceTier: 'verified',
  },
  {
    id: 'chosen-property',
    title: 'The one number that actually mattered',
    question: 'Not a dashboard metric. A real outcome.',
    body: "The thing that matters: it found the place we moved into. Not money saved, not a tidy funnel. It just worked. The 228 listings are candidates it ranked, not 228 places we visited.",
    takeaway: 'The real outcome matters more than any processing count next to it.',
    evidenceTier: 'verified',
  },
];

export const chapters: Chapter[] = [
  {
    id: 'pain',
    ordinal: 1,
    eyebrow: '01 — The problem',
    heading: 'Brussels rentals live on Facebook',
    summary: "Finding an apartment meant doing Facebook's job for it.",
    body: "Decent furnished rentals in Brussels get posted across dozens of Facebook groups, in French, Dutch, and English, full of local shorthand, and gone within hours. Reading every post, comparing prices, checking photos. That's not browsing, that's a part-time job.\n\nTurning on notifications would have reacted faster, sometimes. But it meant staying glued to my phone all day, every day. A slower tool had to make up for that somewhere else: wider coverage, clearer comparisons, faster calls once something good turned up.",
    zoomIds: ['speed-attention'],
    diagramId: 'user-journey',
  },
  {
    id: 'insight',
    ordinal: 2,
    eyebrow: '02 — The insight',
    heading: "More listings wasn't the problem",
    summary: 'Raw listings and decision-ready listings are not the same thing.',
    body: "A database of five hundred posts still leaves you mentally sorting through five hundred posts. What I actually needed were answers to three questions: does this place fit, is it good value, should I act now.\n\nCleaning up the text didn't make it true either. Posts contradicted themselves, went stale, or got quietly edited to \"already rented.\" So the system had to say \"we don't know\" instead of guessing. Guessing wrong is worse than admitting a gap.",
    zoomIds: [],
  },
  {
    id: 'product',
    ordinal: 3,
    eyebrow: '03 — What I built',
    heading: 'From scattered posts to a shortlist',
    summary: 'One tool, built around the decisions I actually needed to make.',
    body: "One pipeline, one tool per job:\n\n- Claude Haiku found the Facebook groups worth watching, I approved all 26 by hand\n- A local Qwen3 8B model read every post and pulled out the useful fields\n- Plain code filtered and deduplicated\n- Claude Haiku looked at photos, but only for listings that survived everything cheaper first\n- Then a ranked shortlist, in a Streamlit dashboard\n\nIt didn't need to be perfect to be useful. Every run turned a pile of random posts into a short, comparable list. Just seeing real prices side by side made me faster and more confident, even on the ones I passed on.",
    zoomIds: ['group-discovery', 'scraper-failures'],
    diagramId: 'system-architecture',
    screenshots: [
      { src: '/case-studies/apartment-scout/dashboard-list.png', caption: 'The actual dashboard, filters on the left, ranked listings on the right.' },
      { src: '/case-studies/apartment-scout/dashboard-photos.png', caption: "A listing expanded, with the photos Claude Haiku scored." },
      { src: '/case-studies/apartment-scout/dashboard-inquiry.png', caption: 'The auto-written French inquiry message for a selected listing.' },
    ],
  },
  {
    id: 'decisions',
    ordinal: 4,
    eyebrow: '04 — Hard calls',
    heading: 'Where to use a model, where to use code',
    summary: 'A different tool for each kind of uncertainty.',
    body: "A different tool for each kind of uncertainty:\n\n- Claude Haiku for open-ended discovery, always with me approving the result\n- The small local model for the repetitive reading-and-extracting work, since it runs for free\n- Plain code wherever there's one right answer, no reason to pay for a model call when a rule gives the same result every time\n- The pricier vision model only once everything cheaper already said yes\n\nThe ranking formula needed fixing more than once too. An early version rated \"has a phone number\" as important as price. I caught that and cut its weight by two-thirds, because a phone number is a nice-to-have, not a dealbreaker. Ranking isn't really math. It's a list of opinions about what matters, just written down.",
    zoomIds: ['requirements-pivot', 'ranking-evolution', 'feedback', 'model-evaluation', 'cloud-github'],
  },
  {
    id: 'impact',
    ordinal: 5,
    eyebrow: '05 — Did it work',
    heading: 'It found the apartment we moved into',
    summary: 'A real result, from a genuinely messy process.',
    body: "228 ranked listings came out the other end, pulled from 26 groups I'd never have found by hand. That data made me noticeably better at reading the market: real prices, how rare \"actually furnished\" is, and quicker to say yes or no. And it worked. Apartment Scout surfaced the place we moved into.\n\nIt wasn't glamorous getting there. The plan was to check it daily; in reality the scraper broke constantly and a refresh could take hours, so I used it in bursts. The \"contacted\" button barely got touched, most real outreach happened over Messenger, not inside my own app. None of that ended up mattering.",
    zoomIds: ['bursty-usage', 'used-versus-built', 'chosen-property'],
  },
  {
    id: 'reflection',
    ordinal: 6,
    eyebrow: '06 — What I\'d change',
    heading: 'Build the weakest link first',
    summary: 'In hindsight, I built the wrong half first.',
    body: "I'd fix the scraper before touching the dashboard. A flaky data feed undermines everything built on top of it, no matter how clever the ranking. I'd also track what I actually did with a listing, not just how it got classified, and let real usage decide what's worth building next instead of guessing.\n\nMostly though, this was a two-week tool for a personal problem, not a product. The fun part was seeing how far a bit of product thinking, plus the right AI model in the right place, could stretch a scrappy weekend-sized build.",
    zoomIds: [],
  },
];
