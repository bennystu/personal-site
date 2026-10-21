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

export interface StaticDiagram {
  kind: 'static';
  title: string;
  svg: string;
}

export type DiagramDef = FlowDiagram | JourneyDiagram | StaticDiagram;

export const diagrams: Record<string, DiagramDef> = {
  'user-journey': {
    kind: 'journey',
    title: 'User journey, before and with the tool (conceptual)',
    beforeHeading: 'Manual search',
    afterHeading: 'With Apartment Scout',
    pairs: [
      { before: 'Browse fragmented Facebook groups', after: 'One ranked, comparable list' },
      { before: 'Interpret posts manually', after: 'Structured fields, pulled out automatically' },
      { before: 'Compare rent and quality in head', after: 'Real price and photo score, side by side' },
    ],
    outcome: 'Faster decisions, and the property we actually moved into',
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
  'data-pipeline': {
    kind: 'flow',
    title: 'The full pipeline, start to finish',
    steps: [
      'Discover groups',
      'Approve sources',
      'Collect full posts',
      'Classify relevance',
      'Extract fields',
      'Known-rule filtering',
      'Deduplicate',
      'Estimate missing utilities',
      'Score photos',
      'Rank and review',
    ],
    branch: {
      after: 'Classify relevance',
      question: 'Relevant?',
      outcomes: [
        { label: 'No', detail: 'Dropped from candidate review' },
        { label: 'Yes', detail: 'Continues to field extraction' },
      ],
    },
    note: 'A known rule mismatch during filtering also drops a listing from review, the same as an irrelevant classification.',
  },
  'cost-normalization': {
    kind: 'flow',
    title: 'What does an apartment actually cost?',
    steps: [
      'Advertised rent',
      'Read inclusions and excluded charges',
      'Known costs, plus assumed costs for any missing utility',
      'Avoid double-counting charges already included',
      'Estimated comparable monthly cost',
    ],
    note: 'Uncertainty in the comparison gets flagged, not hidden, whenever an assumption had to fill a real gap.',
  },
  'decision-transformation': {
    kind: 'static',
    title: 'From fragmented posts to comparable, ranked opportunities',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="210" viewBox="0 0 960 210" role="img" aria-label="From fragmented Facebook posts to comparable ranked opportunities"><rect width="960" height="210" fill="#F7F6F2"/><rect x="18" y="30" width="275" height="140" rx="14" fill="#E5EAE7"/><text x="38" y="65" font-family="sans-serif" font-size="21" fill="#17242B">Fragmented posts</text><text x="38" y="101" font-family="sans-serif" font-size="15" fill="#58656C">Incomplete, inconsistent</text><text x="38" y="125" font-family="sans-serif" font-size="15" fill="#58656C">Manual interpretation</text><path d="M311 101 H345" stroke="#247B73" stroke-width="3"/><path d="M341 94 l10 7 -10 7" fill="none" stroke="#247B73" stroke-width="3"/><rect x="366" y="30" width="230" height="140" rx="14" fill="#DAE9E4"/><text x="386" y="65" font-family="sans-serif" font-size="21" fill="#17242B">Interpret and compare</text><text x="386" y="101" font-family="sans-serif" font-size="15" fill="#58656C">Structured fields</text><text x="386" y="125" font-family="sans-serif" font-size="15" fill="#58656C">Price normalization</text><path d="M610 101 H648" stroke="#247B73" stroke-width="3"/><path d="M644 94 l10 7 -10 7" fill="none" stroke="#247B73" stroke-width="3"/><rect x="666" y="30" width="276" height="140" rx="14" fill="#247B73"/><text x="686" y="65" font-family="sans-serif" font-size="21" fill="white">Confident decisions</text><text x="686" y="101" font-family="sans-serif" font-size="15" fill="white">Prioritized opportunities</text><text x="686" y="125" font-family="sans-serif" font-size="15" fill="white">Faster go/no-go</text></svg>`,
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
    evidenceTier: 'verified',
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
  {
    id: 'fragmented-search',
    title: 'What hunting for an apartment actually looked like',
    question: 'Every single listing was its own research task.',
    body: "Facebook groups held posts in different languages with no consistent format, no site-wide filters, and no way to compare two listings side by side. Duplicates, missing sizes, missing availability, all of it had to be reconstructed by hand, post by post.",
    takeaway: "Fragmented information creates work, even before you've decided anything.",
    evidenceTier: 'verified',
  },
  {
    id: 'marketplace-language',
    title: "Tidy data can still hide real ambiguity",
    question: "Translating a post isn't the same as extracting what it means.",
    body: 'Posts used local rental shorthand like APD and ONO, mixed with informal French, Dutch, and English. "Toutes charges comprises" (all charges included) could still be followed, two lines later, by a separate service charge. The system had to tell a stated fact apart from an implied one, not just translate the words.',
    takeaway: "Clean-looking data isn't the same as true data.",
    evidenceTier: 'verified',
  },
  {
    id: 'market-confidence',
    title: 'Understanding the market was itself valuable',
    question: 'Does knowing the market count as a result, even without instrumentation?',
    body: "Watching candidates accumulate built a real, working sense of normal asking prices and how rare genuinely furnished options were. That translated into faster, more confident go or no-go calls, and faster outreach. Neither effect has a before-and-after number attached to it.",
    takeaway: 'Better decisions can be real value, even without a full automation story.',
    evidenceTier: 'verified',
  },
  {
    id: 'availability',
    title: "A listing existing doesn't mean it's available",
    question: 'Stale and quietly edited posts broke an early assumption.',
    body: 'Some listings were years old and still looked current. Others got edited in place, the same post, now saying "loué" or "plus disponible," without ever disappearing. That forced availability to become its own explicit field and filter, not something inferred from a post simply being there.',
    takeaway: 'Freshness, identity, and availability are three different facts, not one.',
    evidenceTier: 'verified',
  },
  {
    id: 'diagnostics',
    title: 'Pre-flight checks, built from actual incidents',
    question: 'Fail in five seconds, not five hours in.',
    body: 'Checks were added for a valid login session, whether two browser contexts could reach Facebook without tripping a checkpoint, and whether the local model server was actually up. A separate diagnostic tool captured a screenshot and a structural summary of the page, for whenever Facebook changed its markup again.',
    takeaway: "Build instrumentation for the failures you've actually hit, not hypothetical ones.",
    evidenceTier: 'verified',
  },
  {
    id: 'full-text',
    title: 'Getting the full post without clicking anything',
    question: 'Every click is a chance to look like a bot.',
    body: 'Facebook\'s feed view cuts long posts short behind "See more." Instead of clicking it, the scraper visits the post\'s own permalink page, reads every text block already in the page, and keeps the longest genuine one. Same result, zero extra clicks.',
    takeaway: 'Understand how the page actually works before you automate clicking on it.',
    evidenceTier: 'verified',
  },
  {
    id: 'input-truncation',
    title: "The model wasn't failing, its input was missing",
    question: 'A silent 1,200-character cutoff looked like a capability problem.',
    body: 'Long posts were getting clipped before they ever reached the extraction step. The first instinct was to reach for a bigger model. The actual fix was raising the truncation limit and the token budget, and the model swap got reverted once that was found.',
    takeaway: "Check what the model is actually seeing before you blame what it knows.",
    evidenceTier: 'verified',
  },
  {
    id: 'reclassification',
    title: "Old listings don't have to stay badly classified",
    question: "An improvement shouldn't only help the data collected after it.",
    body: 'A reclassification tool lets an improved prompt or model revisit listings already sitting in the database, instead of leaving early mistakes frozen in place while only new data benefits.',
    takeaway: 'Build a way to apply improvements backward, not just forward.',
    evidenceTier: 'verified',
  },
  {
    id: 'dashboard',
    title: 'What actually showed up in the dashboard',
    question: 'A real screenshot replaces what used to be a reconstruction here.',
    body: 'Each Facebook post became a reviewable card: extracted fields, an estimated comparable cost, an availability flag, and a photo score, all in one place instead of scattered across a feed.',
    takeaway: 'The tool changed how listings got reviewed, not just how they were displayed.',
    evidenceTier: 'verified',
  },
  {
    id: 'local-qwen',
    title: 'Why a small local model did the heavy lifting',
    question: 'Repeated, high-volume work needed a model sized for the job, not the biggest one available.',
    body: 'Qwen3 8B, quantized, ran locally through llama-server on my own Mac. Two prompts split the work: a cheap pass dismissed irrelevant posts, and only the roughly 15% that survived went through detailed extraction. Temperature zero made it repeatable, though not perfectly deterministic in practice.',
    takeaway: 'Design the model choice around the task and the volume, not the parameter count.',
    evidenceTier: 'verified',
  },
  {
    id: 'pipeline',
    title: 'The full pipeline, start to finish',
    question: 'Where ambiguous judgment calls end and explicit rules begin.',
    body: 'Browser collection got the full post. Local Qwen3 8B dismissed irrelevant posts, then extracted fields from what survived. SQLite persisted and deduplicated. Plain code applied explicit filters and normalized cost. Claude Haiku scored photos, only for listings that made it that far. A weighted ranking fed the Streamlit dashboard. Caching meant unchanged listings never repeated a step.',
    takeaway: "Spend a paid model's judgment only where it adds something code or a free model can't.",
    evidenceTier: 'verified',
    diagramId: 'data-pipeline',
  },
  {
    id: 'vision',
    title: 'Why photo scoring was worth paying for',
    question: "Text alone can't tell you if an apartment actually looks lived-in.",
    body: 'The real choice was staying entirely free and text-only, or paying to have a model actually look at the photos. Claude Haiku applied a fixed visual rubric, but only to listings that had already survived every cheaper filter. No measured lift was ever recorded, but it caught condition signals the listing text never mentioned.',
    takeaway: "Spend inference budget on the one thing a different kind of model can tell you that text can't.",
    evidenceTier: 'verified',
  },
  {
    id: 'cost-normalization',
    title: 'What does an apartment actually cost?',
    question: 'Two listings quoting the same rent can mean two different real prices.',
    body: "Some posts included heating, electricity, and internet. Others didn't mention them at all. The system accounted for what was stated and filled in reasonable assumptions for what wasn't, to get one comparable estimated monthly cost instead of comparing a bare number to a fully-loaded one.",
    takeaway: 'A comparable estimate beats an exact but incomparable number.',
    evidenceTier: 'verified',
    diagramId: 'cost-normalization',
  },
  {
    id: 'information-to-decisions',
    title: 'Collecting listings was never the actual job',
    question: 'Hundreds of saved posts are still hundreds of research tasks.',
    body: 'A real search tool had to answer fit, comparable cost, and urgency, not just hold more raw posts. In practice, just accumulating candidates over time sharpened my sense of typical prices and how rare genuinely good, furnished units actually were.',
    takeaway: 'Market understanding was real value, even separate from any single listing.',
    evidenceTier: 'verified',
  },
  {
    id: 'uncertainty',
    title: 'Unknown is not the same as disqualified',
    question: 'Rejecting every incomplete post would have thrown out good options.',
    body: 'With few genuinely suitable listings around, dismissing every post missing a size or a furnished flag would have quietly removed real candidates. Explicit disqualifiers still got filtered out. Everything merely unknown stayed visible, accepting a bit more review noise in exchange for not missing something good.',
    takeaway: 'Whether a false negative is expensive depends entirely on how scarce the good options are.',
    evidenceTier: 'verified',
  },
  {
    id: 'claude-code',
    title: 'Built with Claude Code, not by it alone',
    question: 'Human-directed, AI-assisted, not autonomous.',
    body: 'Claude Code wrote and changed the actual code, across two build phases and plenty of iteration. Every call on scope, priority, trade-off, and what counted as done stayed mine. Nothing here was a single prompt producing a finished product on its own.',
    takeaway: "Using AI leverage for implementation doesn't remove you from the product decisions.",
    evidenceTier: 'verified',
  },
  {
    id: 'redo',
    title: "What I'd actually do differently",
    question: 'Which dependency should have been proven first.',
    body: 'Collection reliability should have come before any dashboard polish. A next version would prove the data could actually be gathered reliably first, get extraction and comparison solid, instrument what I actually did with each listing, then only add features where real usage justified them.',
    takeaway: 'De-risk the one thing everything else depends on, first.',
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
    zoomIds: ['speed-attention', 'fragmented-search'],
    diagramId: 'user-journey',
  },
  {
    id: 'insight',
    ordinal: 2,
    eyebrow: '02 — The insight',
    heading: 'I needed comparable data, not more of it',
    summary: 'Raw listings and decision-ready listings are not the same thing.',
    body: "A database of five hundred posts still leaves you mentally sorting through five hundred posts. What I actually needed were answers to three questions:\n\n- Does this place fit\n- Is it good value\n- Should I act now\n\nCleaning up the text didn't make it true either. Posts contradicted themselves, went stale, or got quietly edited to \"already rented.\" So the system had to say \"we don't know\" instead of guessing. Guessing wrong is worse than admitting a gap. Estimating the missing utility costs also put wildly different listings on an apples-to-apples footing, instead of comparing a bare rent figure to one that already included everything.",
    zoomIds: ['marketplace-language', 'availability', 'cost-normalization', 'information-to-decisions'],
    diagramId: 'decision-transformation',
  },
  {
    id: 'product',
    ordinal: 3,
    eyebrow: '03 — What I built',
    heading: 'From scattered posts to a shortlist',
    summary: 'One tool, built around the decisions I actually needed to make.',
    body: "One automated pipeline, built around data aggregation and cleaning, one tool per job:\n\n- Claude Haiku found the Facebook groups worth watching, I approved all 26 by hand\n- A local Qwen3 8B model read every post and pulled out the useful fields\n- Plain code filtered and deduplicated\n- Claude Haiku looked at photos, but only for listings that survived everything cheaper first\n- Then a ranked shortlist, in a Streamlit dashboard\n\nIt didn't need to be perfect to be useful. Every run turned a pile of random posts into a short, comparable list. Just seeing real prices side by side made me faster and more confident, even on the ones I passed on.",
    zoomIds: ['group-discovery', 'scraper-failures', 'diagnostics', 'full-text', 'dashboard', 'pipeline'],
    diagramId: 'system-architecture',
    screenshots: [
      { src: '/case-studies/apartment-scout/dashboard-list.png', caption: 'The actual dashboard, filters on the left, ranked listings on the right.' },
      { src: '/case-studies/apartment-scout/dashboard-inquiry.png', caption: 'The auto-written French inquiry message for a selected listing.' },
    ],
  },
  {
    id: 'decisions',
    ordinal: 4,
    eyebrow: '04 — Hard calls',
    heading: 'Where to use a model, where to use code',
    summary: 'A different tool for each kind of uncertainty.',
    body: "Here's how that split worked in practice:\n\n- Claude Haiku for open-ended discovery, always with me approving the result\n- The small local model for the repetitive reading-and-extracting work, since it runs for free\n- Plain code wherever there's one right answer, no reason to pay for a model call when a rule gives the same result every time\n- The pricier vision model only once everything cheaper already said yes\n\nThe ranking formula needed fixing more than once too. An early version rated \"has a phone number\" as important as price. I caught that and cut its weight by two-thirds, because a phone number is a nice-to-have, not a dealbreaker. Ranking isn't really math. It's a list of opinions about what matters, just written down.",
    zoomIds: ['requirements-pivot', 'ranking-evolution', 'feedback', 'model-evaluation', 'cloud-github', 'input-truncation', 'reclassification', 'local-qwen', 'vision', 'uncertainty'],
  },
  {
    id: 'impact',
    ordinal: 5,
    eyebrow: '05 — Did it work',
    heading: 'It found the apartment we moved into',
    summary: 'A real result, from a genuinely messy process.',
    body: "228 ranked listings came out the other end, pulled from 26 groups I'd never have found by hand. That data made me noticeably better at reading the market: real prices, how rare \"actually furnished\" is, and quicker to say yes or no. And it worked. Apartment Scout surfaced the place we moved into.\n\nIt wasn't glamorous getting there. The plan was to check it daily; in reality the scraper broke constantly and a refresh could take hours, so I used it in bursts. The \"contacted\" button barely got touched, most real outreach happened over Messenger, not inside my own app. None of that ended up mattering.",
    zoomIds: ['bursty-usage', 'used-versus-built', 'chosen-property', 'market-confidence'],
  },
  {
    id: 'reflection',
    ordinal: 6,
    eyebrow: '06 — What I\'d change',
    heading: 'Build the weakest link first',
    summary: 'In hindsight, I built the wrong half first.',
    body: "I'd fix the scraper before touching the dashboard. A flaky data feed undermines everything built on top of it, no matter how clever the ranking. I'd also track what I actually did with a listing, not just how it got classified, and let real usage decide what's worth building next instead of guessing.\n\nMostly though, this was a two-week tool for a personal problem, not a product. The fun part was seeing how far a bit of product thinking, plus the right AI model in the right place, could stretch a scrappy weekend-sized build.",
    zoomIds: ['claude-code', 'redo'],
  },
];
