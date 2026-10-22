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
    'I needed an apartment in Brussels, and the listings all live in messy Facebook groups. So I built a tool that found the right groups, turned the posts into comparable data, and ranked them. It surfaced the place we moved into.',
  detail:
    'This was a personal project, not a product, built solo across April and May 2026. I picked the models, wrote the pipeline with Claude Code, and made every decision about what to build, what to skip, and when it was good enough.',
  metrics: [
    { label: '26', sublabel: 'Facebook groups, AI-found and human-approved' },
    { label: '228', sublabel: 'listings it ranked for me' },
    { label: '1', sublabel: 'apartment we actually moved into' },
  ],
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
    body: "For raw speed, notifications would sometimes have won. Reacting to a brand-new post within minutes can get you a viewing that a slower tool misses. But the price of that speed is checking your phone constantly, all day, for weeks, and I was not willing to pay it. I chose a tool that reacts more slowly but covers far more ground.",
    takeaway: "Speed isn't free. The question is what you're trading it for.",
    evidenceTier: 'verified',
  },
  {
    id: 'group-discovery',
    title: 'Automated the search, kept the approval manual',
    question: 'Hand-picking groups across three languages would have taken days. Why not automate the approval too?',
    body: "Claude Haiku searched in French, Dutch, and English, ranking candidate Facebook groups round after round based on what it had already found. I set it up that way on purpose: search is repetitive and cheap to get wrong, so a model does it. Deciding which group is actually worth scraping affects everything downstream, so I reviewed and approved each of the 26 myself before any of them entered the real scrape list.",
    takeaway: 'Automate the repetitive part, keep the judgment call manual.',
    evidenceTier: 'verified',
    diagramId: 'group-discovery',
  },
  {
    id: 'scraper-failures',
    title: 'Facebook fought the scraper, constantly',
    question: 'What made collection the least reliable layer of the system?',
    body: "Running two browser sessions at once to collect faster got my account banned. After that I switched to one session at a time and moved to Camoufox, a browser tool built to avoid bot detection, which itself needed tuning before it actually stopped the detection. Facebook also kept changing how it renders dates, so my timestamp parsing broke and had to be patched five separate times. Collection never became a dependable daily job, and that unreliability shaped how I used the whole tool.",
    takeaway: 'Bad input data is a product problem, not just an engineering one.',
    evidenceTier: 'verified',
    diagramId: 'collection-incident',
  },
  {
    id: 'ranking-evolution',
    title: 'The ranking formula was wrong, twice',
    question: 'How do you know when your own ranking formula is wrong?',
    body: "The ranking went through three rewrites, and I wrote down the reasoning for each one. The embarrassing version weighted \"has a phone number\" as heavily as actual price. When I noticed that, I cut the phone-number weight by two-thirds, because a phone number is a convenience and price is a dealbreaker. The second fix concerned availability. A listing that was already rented, or not available by the date we needed, could still rank high on its other scores, so I changed availability from a soft preference in the formula to a hard cutoff: known-incompatible timing excluded a listing outright.",
    takeaway: 'A ranking formula is just a list of opinions, written down and tested.',
    evidenceTier: 'verified',
    diagramId: 'ranking-process',
  },
  {
    id: 'feedback',
    title: 'It learned my taste without a new database field',
    question: "How do you handle a preference you didn't design a field for?",
    body: "When I dismissed a listing, the tool let me write down why. Before each classification run, those reasons were grouped by similar wording, which needed no AI at all, and appended to the classifier's prompt as preference instructions. The wording scaled with how often a reason recurred: a one-off reason became a soft preference, and a reason I kept repeating became a strong instruction to dismiss similar listings. The first version of this quietly broke, because the feedback only lived in the browser tab and vanished on refresh. I fixed the persistence, but I never got around to measuring whether the loop actually improved the results.",
    takeaway: "You don't need a new field for every preference. A feedback loop can absorb it instead.",
    evidenceTier: 'verified',
    diagramId: 'feedback-loop',
  },
  {
    id: 'model-evaluation',
    title: 'Picked the smaller model, checked the choice afterward',
    question: 'How did I check that the smaller local model was good enough?',
    body: "There were two separate decisions here. The first was local versus paid: the extraction work was high-volume and repetitive, so I ran it locally to avoid per-call charges. The second was which local model to run. I picked Qwen3 8B for speed, then checked it against Qwen3 14B on the same posts, with Claude Haiku judging the field values where the two disagreed. The 8B model matched the judge's answer on 76% of those disputed values, the 14B model on 9%, and the 8B ran about four times faster on the same hardware. That supported keeping the smaller model. The comparison says nothing about local versus paid extraction, and I never independently checked Haiku's judgments, so I treat it as support for the choice, not proof of it.",
    takeaway: 'Make the call on the constraints that actually apply, then use a benchmark to check it, not to make it for you.',
    evidenceTier: 'verified',
  },
  {
    id: 'cloud-github',
    title: 'Using GitHub as a makeshift database',
    question: 'Why use a code-hosting service as a database?',
    body: "The cloud dashboard had nowhere to save state, because Streamlit's free hosting wipes its disk on every restart. Rather than set up and pay for a real database, I reused a GitHub repository I already had for re-hosting photos, and stored the dashboard's state there as a JSON file. Writing a status change to the repository also happened to trigger a redeploy, which was a convenient accident. The cost of the shortcut is that there are now two copies of the truth, one local and one on GitHub, and if they fail to reconcile cleanly, a status change can quietly go missing. I took the deal knowingly: this was a tool for one user for a few months, not a system that needed durable guarantees.",
    takeaway: 'A free shortcut is fine, as long as you can say out loud what it might cost you.',
    evidenceTier: 'verified',
    diagramId: 'cloud-state',
  },
  {
    id: 'bursty-usage',
    title: 'The daily habit that never happened',
    question: 'Why did the planned daily check never become a habit?',
    body: "The plan was to check the tool every day. In reality, a full data refresh could take hours and the scraper broke constantly, so I used the tool in bursts whenever collection was actually working. The dashboard itself refreshed instantly, but an instant refresh is worthless when there is no new data underneath it. The bottleneck was never the interface. It was the data feed.",
    takeaway: 'The slowest step sets the pace, no matter how fast the rest is.',
    evidenceTier: 'verified',
  },
  {
    id: 'used-versus-built',
    title: 'What I built vs. what I actually used',
    question: 'Which of the features I built did I actually use?',
    body: 'I built a status tracker, a feedback loop, auto-written outreach messages, and a cloud version of the dashboard. Then I looked at the real usage data for the tracker. Almost every listing still carried the status "new," two were marked "favorited," and not one was marked "contacted." I had definitely contacted people, but I did it over Messenger, where the conversation was going to happen anyway, rather than through my own status button. The tracker worked. I just did not use it.',
    takeaway: 'Check what actually got used before deciding what to build next.',
    evidenceTier: 'verified',
  },
  {
    id: 'chosen-property',
    title: 'The one number that actually mattered',
    question: 'What was the real result, past the dashboard numbers?',
    body: "There is no revenue figure or tidy conversion funnel to attach to this project, and the listing counts on this page are candidates the tool ranked, not places we visited. The goal was one good apartment, and the tool surfaced the one we moved into.",
    takeaway: 'That single result outweighs every processing count sitting next to it.',
    evidenceTier: 'verified',
  },
  {
    id: 'fragmented-search',
    title: 'What hunting for an apartment actually looked like',
    question: 'What made the manual search so slow?',
    body: "Facebook groups held posts in three languages with no consistent format, no search filters, and no way to compare two listings side by side. Many posts were duplicates, most were missing the size or the availability date, and every gap had to be reconstructed by hand, post by post. Each listing was effectively its own small research task before I could even decide whether it was worth a message.",
    takeaway: "Fragmented information creates work, even before you've decided anything.",
    evidenceTier: 'verified',
  },
  {
    id: 'marketplace-language',
    title: "Tidy data can still hide real ambiguity",
    question: "Translating a post isn't the same as extracting what it means.",
    body: 'Posts used local rental shorthand, abbreviations like APD and ONO that only make sense if you already know the market, mixed with informal French, Dutch, and English. "Toutes charges comprises" (all charges included) could still be followed, two lines later, by a separate service charge. The system had to tell a stated fact apart from an implied one, not just translate the words.',
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
    question: 'Why spend build time on checks instead of features?',
    body: 'A scraping run that fails five hours in wastes the whole day, so I added checks that fail in five seconds instead. Before each run, the tool verified that the login session was valid, that the browser could reach Facebook without tripping a security checkpoint, and that the local model server was actually running. I also built a diagnostic tool that captured a screenshot and a structural summary of the page, so that the next time Facebook changed its markup, I could see exactly what broke.',
    takeaway: "Build instrumentation for the failures you've actually hit, not hypothetical ones.",
    evidenceTier: 'verified',
  },
  {
    id: 'full-text',
    title: 'Getting the full post without clicking anything',
    question: 'How do you read a truncated post without behaving like a bot?',
    body: 'Facebook\'s feed view cuts long posts short behind a "See more" link, and every automated click is a chance to look like a bot. Instead of clicking, the scraper visits the post\'s own permalink page, reads every text block already present in the page, and keeps the longest genuine one. That produces the same full text with zero extra clicks.',
    takeaway: 'Understand how the page actually works before you automate clicking on it.',
    evidenceTier: 'verified',
  },
  {
    id: 'input-truncation',
    title: "The model wasn't failing, its input was missing",
    question: 'Why did extraction quality drop when nothing about the model had changed?',
    body: 'Extraction quality dropped, and my first instinct was to swap in a bigger model. The real cause turned out to be a silent 1,200-character cutoff that was clipping long posts before they ever reached the extraction step. The model was fine; it just never saw the text. I raised the truncation limit and the token budget, reverted the model swap, and quality recovered.',
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
    question: 'What did a listing look like once the pipeline was done with it?',
    body: 'Each Facebook post became a reviewable card showing the extracted fields, an estimated comparable monthly cost, an availability flag, and a photo score, all in one place instead of scattered across a feed. The point was that I could judge a listing in seconds without opening Facebook at all.',
    takeaway: 'The tool changed how listings got reviewed, not just how they were displayed.',
    evidenceTier: 'verified',
  },
  {
    id: 'local-qwen',
    title: 'Why a small local model did the heavy lifting',
    question: 'Why use an 8-billion-parameter model instead of the most capable one available?',
    body: 'The work was repetitive and high-volume, which is exactly where a small free model beats a large paid one. Qwen3 8B, quantized, ran locally on my own Mac through llama-server. Two prompts split the work: a cheap first pass dismissed irrelevant posts, and only the roughly 15% that survived went through detailed extraction. Running at temperature zero made the results repeatable, though not perfectly deterministic in practice.',
    takeaway: 'Design the model choice around the task and the volume, not the parameter count.',
    evidenceTier: 'verified',
  },
  {
    id: 'pipeline',
    title: 'The full pipeline, start to finish',
    question: 'How does a raw Facebook post become a ranked listing?',
    body: 'Browser automation collected the full text of each post. The local Qwen3 8B model first dismissed irrelevant posts, then extracted structured fields from the ones that survived. SQLite stored everything and handled deduplication. Plain code applied the explicit filters and normalized costs. Claude Haiku scored photos, but only for listings that had made it through every earlier stage. A weighted ranking then fed the Streamlit dashboard. Caching ensured that an unchanged listing never repeated any of these steps on later runs.',
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
    question: 'How much of this did the AI actually build?',
    body: 'Claude Code wrote and changed the actual code, across two build phases and plenty of iteration. Every decision about scope, priority, trade-offs, and what counted as done stayed mine. Nothing here was a single prompt producing a finished product on its own, and having AI write the code did not take me out of a single product decision.',
    takeaway: "Having AI write the code doesn't take you out of the product decisions.",
    evidenceTier: 'verified',
  },
  {
    id: 'redo',
    title: "What I'd actually do differently",
    question: 'Which dependency should have been proven first?',
    body: 'Collection reliability should have come before any dashboard polish, because everything else depended on it. A next version would prove the data could be gathered reliably first, then get extraction and comparison solid, then instrument what I actually did with each listing, and only add features where real usage justified them.',
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
    summary: 'The information is scattered, not uniform, not searchable, and not filterable.',
    body: "A large share of Brussels rentals are only posted in Facebook groups, and Facebook gives you nothing to search them with. The listings are spread across dozens of groups in French, Dutch, and English. There are no filters, no standard format, and no way to compare one post against another. One post states the rent with charges included, the next without, and the third doesn't mention size or availability at all. Finding a good apartment was a needle-in-a-haystack problem: hours of scrolling and manual legwork to reconstruct basic facts, post by post, before I could even judge whether a place was worth a message.\n\nThe one thing Facebook does offer is notifications, and they would sometimes catch a new post faster than any tool. I decided against them, because reacting fast enough would have meant watching my phone constantly for weeks. That decision defined what the tool had to be good at instead: coverage across all the groups, listings made comparable, and faster decisions once something good appeared.",
    zoomIds: ['speed-attention', 'fragmented-search'],
    diagramId: 'user-journey',
  },
  {
    id: 'insight',
    ordinal: 2,
    eyebrow: '02 — The insight',
    heading: 'I needed comparable data, not more of it',
    summary: 'Collecting more listings was never the problem. Comparing them was.',
    body: "My first instinct was to collect everything. But a database of five hundred posts still leaves you mentally sorting through five hundred posts. The real job was answering three questions about each listing:\n\n- Does this place fit?\n- Is it good value?\n- Should I act now?\n\nAnswering those questions ran into two problems. The first was trust: posts contradicted themselves, went stale, or were quietly edited to say \"already rented\" without ever being taken down. I decided the system should say \"we don't know\" rather than guess, because a wrong guess silently buries a good apartment, while an honest gap just asks me to look closer.\n\nThe second problem was comparability. One listing quotes bare rent, another includes heating and internet, and the two numbers look the same on the page. The system estimated the missing costs so that every listing showed one comparable monthly figure.",
    zoomIds: ['marketplace-language', 'availability', 'cost-normalization'],
    diagramId: 'decision-transformation',
  },
  {
    id: 'product',
    ordinal: 3,
    eyebrow: '03 — What I built',
    heading: 'From scattered posts to a shortlist',
    summary: 'A pipeline that turns scattered Facebook posts into a ranked, comparable shortlist.',
    body: "I built one pipeline, and for each stage I picked the cheapest tool that could actually do the job:\n\n- Claude Haiku searched for relevant Facebook groups across three languages. I reviewed its suggestions and approved all 26 groups myself before anything was scraped.\n- A local Qwen3 8B model, running free and private on my own machine, read every collected post and extracted the useful fields: price, size, location, furnished or not.\n- Plain code handled everything with one right answer: filtering, deduplication, and the cost math. There is no reason to pay for a model call where a rule gives the same result every time.\n- Claude Haiku's vision scored the photos, but only for listings that had already passed every cheaper check, because it was the one paid step in the pipeline.\n- The result was a ranked shortlist in a Streamlit dashboard.\n\nIt did not need to be perfect to be useful. Every run turned a pile of unstructured posts into a short, comparable list, and seeing real prices side by side made me faster and more confident even on the listings I passed on.",
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
    summary: 'Every stage got the cheapest tool that could do the job, and the ranking got rewritten when it was wrong.',
    body: "The recurring decision in this build was where a language model earns its cost and where plain code does the same job for free. My rule was simple: a model is for genuine ambiguity, like reading an informal post in Dutch, and code is for anything with one right answer, like deduplication or adding up costs. The expensive capability, vision, only ran on listings that had already survived every cheaper filter. And wherever a model's output affected everything downstream, like which groups to scrape, I kept the final approval manual.\n\nThe ranking formula was a different kind of decision, and I got it wrong twice. An early version weighted \"has a phone number\" as heavily as price. When I noticed that, I cut the phone-number weight by two-thirds, because a phone number is a convenience and price is a dealbreaker. I also changed availability from a soft preference to a hard filter: a listing whose timing was known to be incompatible was excluded outright instead of just scoring lower. A ranking formula is just a list of opinions about what matters, written down, and it should be revised like one.",
    zoomIds: ['ranking-evolution', 'feedback', 'model-evaluation', 'cloud-github', 'input-truncation', 'reclassification', 'local-qwen', 'vision', 'uncertainty'],
  },
  {
    id: 'impact',
    ordinal: 5,
    eyebrow: '05 — Did it work',
    heading: 'It found the apartment we moved into',
    summary: 'Yes. It surfaced the apartment we moved into, through a messier process than planned.',
    body: "The pipeline collected and ranked hundreds of listings from 26 groups across three languages, and one of them was the apartment we now live in. The accumulated data also made me noticeably better at reading the market. I learned what real prices looked like, how rare a genuinely furnished apartment is, and that knowledge made my yes-or-no calls faster.\n\nGetting there was not glamorous. Unreliable collection meant I used the tool in bursts rather than daily, and some features I built, like the status tracker, never became part of how I actually worked. The search succeeded anyway, and the gap between what I built and what I used became one of the clearest lessons of the project.",
    zoomIds: ['bursty-usage', 'used-versus-built', 'chosen-property', 'market-confidence'],
  },
  {
    id: 'reflection',
    ordinal: 6,
    eyebrow: '06 — What I\'d change',
    heading: 'Build the weakest link first',
    summary: 'In hindsight, I built the wrong half first.',
    body: "If I rebuilt this, I would fix the scraper before touching anything else. Collection was the layer everything depended on, and it was the least reliable part of the system. A flaky data feed undermines every clever thing built on top of it. Instead, I spent real effort on ranking and dashboard polish while the data underneath stayed unreliable.\n\nI would also instrument my own behaviour from day one. I built features based on what I assumed I would use, and the usage data later showed some of those assumptions were wrong. Tracking what I actually did with each listing would have told me what was worth building next, instead of guessing.\n\nThis was a tool for a personal problem, not a product, and I am comfortable with that framing. What I wanted to find out was how far product thinking plus the right AI model in the right place could stretch a solo build, and the answer was: further than I expected.",
    zoomIds: ['claude-code', 'redo'],
  },
];
