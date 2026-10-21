// Transcribed from workspaces/work/career-ops/portfolio/apartment-scout/apartment-scout/03-supporting-artifacts/.
// All of these are retrospective reconstructions, not original contemporaneous documents.

export interface ArtifactSection {
  heading: string;
  paragraphs: string[];
  table?: { headers: string[]; rows: string[][] };
}

export interface Artifact {
  id: string;
  title: string;
  statusLabel: string;
  sections: ArtifactSection[];
}

export const artifacts: Artifact[] = [
  {
    id: 'prd',
    title: 'Retrospective product requirements document',
    statusLabel: 'Retrospective reconstruction, not an original contemporaneous PRD',
    sections: [
      {
        heading: 'Product intent',
        paragraphs: [
          'Help a person searching for furnished housing in Brussels reduce repeated manual review across Facebook groups and decide which opportunities to pursue.',
        ],
      },
      {
        heading: 'Users and jobs',
        paragraphs: [
          'Primary operator is the builder, discussing apartment decisions with his girlfriend throughout. Jobs: discover relevant supply; capture disparate posts; understand multilingual descriptions; compare true costs and visual condition; prioritize current matches; prepare timely outreach.',
        ],
      },
      {
        heading: 'Version 1 search scope',
        paragraphs: [
          'Five Brussels communes near Metro Line 5: Auderghem, Etterbeek, Watermael-Boitsfort, Ixelles, Woluwe-Saint-Pierre. Budget approximately €1,250 all-in, furnished, at least 35m², available by June 2026, domiciliation required, proximity to Metro Line 5 preferred.',
        ],
      },
      {
        heading: 'Version 2 changed scope',
        paragraphs: [
          'Ten communes, approximately €1,000 budget, June to September short-term window, rooms/colocation and sublets permitted, domiciliation no longer necessary. The detailed personal reason for the change stays private.',
        ],
      },
      {
        heading: 'Core functional requirements',
        paragraphs: [
          '1. Find groups using iterative multilingual AI-assisted source discovery and require manual approval.',
          '2. Collect complete post text with group-level failure logging.',
          '3. Classify relevance before extracting structured rental fields.',
          '4. Store sources, extraction results, timestamps, status, and scoring components in SQLite.',
          '5. Apply known hard rules without rejecting merely missing information.',
          '6. Normalize estimated comparable monthly expenses when component charges are missing.',
          '7. Deduplicate repeated properties.',
          '8. Score photos of qualifying candidates using a separate vision model.',
          '9. Rank and show reviewable candidates.',
          '10. Preserve human review statuses and optionally record dismissal feedback for future model instructions.',
          '11. Support future reclassification as extraction improves.',
        ],
      },
      {
        heading: 'Acceptance criteria described in source specification',
        paragraphs: [
          'Required hard filters behave correctly while unknowns do not auto-dismiss. Target shortlist size 5 to 20 actionable listings per normal run — a planned bar, not a demonstrated distribution. Unchanged content avoids unnecessary additional inference. Manual statuses survive re-runs under normal working synchronization. Failed groups log and skip rather than aborting the whole pipeline. New groups support one-time historical backfill. Photos fail gracefully.',
        ],
      },
      {
        heading: 'Major nonfunctional constraints',
        paragraphs: [
          'Low operational cost, fast development, local deployment, low repetitive API spend, and reliable source collection.',
          'Actual reality: collection was slow and unreliable; the daily-use aspiration was not achieved.',
        ],
      },
      {
        heading: 'Out of scope and non-goals',
        paragraphs: [
          'A multi-user SaaS, perfect market coverage, autonomous housing selection, verified utility bills, guaranteed listing availability, and continuous Facebook monitoring.',
        ],
      },
      {
        heading: 'Measurable outcomes',
        paragraphs: [
          'The selected property surfaced through the tool; 26 approved AI-discovered source groups; 228 ranked retained listing records. No reliable time-saved or contact-conversion numbers.',
        ],
      },
    ],
  },
  {
    id: 'technical-design',
    title: 'Technical system design',
    statusLabel: 'Retrospective reconstruction, based on the supplied project summary',
    sections: [
      {
        heading: 'Component responsibilities',
        paragraphs: [
          'Source discovery: multilingual Facebook searches controlled iteratively by Claude Haiku 4.5; manual approval writes selected_groups.json.',
          'Collection: browser automation, originally Playwright, later Camoufox; serial execution after a parallel-session ban; permalink full-text retrieval; group and session preflight checks; timestamp and post-change fragility.',
          'Text analysis: local llama-server hosting quantized Qwen3 8B; a cheap relevance dismissal pass then detailed extraction; few-shot prompt conventions.',
          'Business logic: deduplication, disqualifiers, uncertainty handling, price normalization, score-component storage and configurable ranking, all in plain code.',
          'Vision: Claude Haiku photo-quality assessment for qualifying listings — paid inference, deliberately scoped narrow.',
          'Persistence: local SQLite; photo hosting and cloud data via GitHub-hosted JSON; reconciliation introduced a state-integrity risk.',
          'Presentation: Streamlit, local and Streamlit Community Cloud; cached refresh displayed already-processed data rapidly but did not accelerate collection.',
          'Feedback: dismissal reason persisted then clustered using Jaccard overlap and promoted into progressive classification-prompt instructions.',
        ],
      },
      {
        heading: 'Known failure modes',
        paragraphs: [
          'Facebook checkpoint detection, changing markup and date formats, stale and edited posts, model input truncation, a locally unavailable model server, mismatched local/remote statuses, and uncertain inference outputs.',
        ],
      },
      {
        heading: 'Architecture decisions',
        paragraphs: [
          'SQLite for short-lived, single-user local data. A paid model only on the one expensive judgment call that needed it. Local first-stage classification to avoid metered cost on high-volume work. GitHub reused for remote status storage to avoid provisioning a database. Manual approval retained over every AI-discovered group.',
        ],
      },
      {
        heading: 'Security and privacy considerations',
        paragraphs: [
          'No private Facebook account information, authenticated session cookies, usernames, housing addresses, or personal correspondence is published here. Browser-evasion techniques are described at a high level only, without depicting detection bypass as guaranteed or endorsing unauthorized access.',
        ],
      },
      {
        heading: 'Not verified',
        paragraphs: [
          'Exact code signatures, operational cost, inference latency, and full edited-post refresh semantics cannot be confirmed from the available source material alone.',
        ],
      },
    ],
  },
  {
    id: 'model-evaluation',
    title: 'AI model evaluation report',
    statusLabel: 'Retrospective reconstruction, based on the supplied project summary',
    sections: [
      {
        heading: 'Decision',
        paragraphs: [
          'Choose a local model for high-volume extraction on real Facebook housing posts, rather than relying on published general benchmarks.',
        ],
      },
      {
        heading: 'Described harness',
        paragraphs: [
          'Run Qwen3 8B and Qwen3 14B on the same set of posts. Compare classification outcomes and extracted price, commune, bedrooms, area, and furnished fields. Escalate every disagreement between the two models to Claude Haiku 4.5 as a reference judge. Score each candidate against that judge, on the disagreement-only subset. Record the judge model\'s token counts and estimate evaluation cost.',
        ],
      },
      {
        heading: 'Recorded observations',
        paragraphs: [],
        table: {
          headers: ['Measurement', 'Qwen3 8B', 'Qwen3 14B', 'Interpretation'],
          rows: [
            ['Per-field judge agreement on disagreements', '76%', '9%', 'Not full-dataset accuracy'],
            ['Relative inference throughput', 'About 4x faster', 'Baseline', 'Same local hardware, per source draft'],
          ],
        },
      },
      {
        heading: 'Critical limitations',
        paragraphs: [
          'Exact sample size N and raw output are unavailable. The disagreement-only subset is biased and excludes cases where both models agree — including cases where both are jointly wrong. Haiku\'s labels were never independently verified by a human. A parsing or prompt mismatch specific to the 14B model cannot be excluded. Accuracy over all posts, and statistical significance, cannot be claimed. A model comparison is not proof of an improved downstream housing outcome.',
        ],
      },
      {
        heading: 'Additional quality evidence',
        paragraphs: [
          'A furnished-label audit identified and corrected 10 errors among 131 inspected listings. The denominator is the audited subset, not all records.',
        ],
      },
      {
        heading: 'Ethical disclosure',
        paragraphs: [
          'Call these reported labels "LLM-judged reference labels," not verified ground truth.',
        ],
      },
    ],
  },
  {
    id: 'ranking-spec',
    title: 'Ranking and comparable-cost specification',
    statusLabel: 'Retrospective reconstruction, based on the supplied project summary',
    sections: [
      {
        heading: 'Objective',
        paragraphs: [
          'Prioritize listings that merit timely human attention, using a mix of hard constraints, normalized price, qualitative signals, and soft preferences.',
        ],
      },
      {
        heading: 'Hard constraints',
        paragraphs: [
          'Reject clear known disqualifiers, such as explicitly rented or incompatible requirements, per the active phase. Unknown is never a rejection on its own. Availability later became an explicit hard cutoff once the timing was known to be incompatible.',
        ],
      },
      {
        heading: 'Comparable cost',
        paragraphs: [
          'Use advertised base rent plus known excluded recurring costs, and estimates for missing heating, electricity, and internet — avoiding double-counting charges already included. Conflicting text stays flagged as ambiguous rather than resolved by guesswork.',
        ],
      },
      {
        heading: 'Score architecture',
        paragraphs: [
          'Individual factor values are stored separately, so changing weights never requires repeating AI calls. Factors include price fit, contactability, furnished desirability, proximity, photo quality, availability, and data completeness. Exact weights, beyond the documented phone-weight revision, are unavailable.',
        ],
      },
      {
        heading: 'Documented revisions',
        paragraphs: [
          'Three ranking iterations shipped with explicit, written acceptance tests. In v3, phone contactability carried as much weight as price fit. In v3.1, that weight dropped by two-thirds, because convenience is not a dealbreaker. Availability changed from a soft gradient to a hard cutoff for unsuitable timing. Furnishing desirability was separated from field completeness. Metro proximity stayed a boost, never a hard rejection.',
        ],
      },
      {
        heading: 'Missing proof',
        paragraphs: [
          'The exact numerical total-score formula cannot be reconstructed, and the historical ranking cannot be re-tested, without the source code and real data.',
        ],
      },
    ],
  },
  {
    id: 'qa-and-tests',
    title: 'Testing and quality summary',
    statusLabel: 'Retrospective reconstruction, based on the supplied project summary',
    sections: [
      {
        heading: 'Described practices',
        paragraphs: [
          'Gate-by-gate implementation with acceptance criteria; unit and regression tests; multiple ranking-formula revisions with prior written criteria; pre-flight health tests; debugging utilities; reclassification tools; a specific furnished-label audit.',
        ],
      },
      {
        heading: 'Concrete examples',
        paragraphs: [
          'Input truncation at 1,200 characters cut important field details; the limit and token budget were corrected. Timestamp extraction required repeated repair across different DOM patterns. An early feedback mechanism used Streamlit session state only; the persistence path was fixed. Availability logic incorrectly assumed post existence implied the listing was still available; explicit handling was added. A smoke test mistakenly allowed a full run in non-interactive mode; explicit confirmation was introduced. A furnished-label audit corrected 10 of 131 inspected records.',
        ],
      },
      {
        heading: 'Coverage boundaries',
        paragraphs: [
          'The source drafts report 258 and 330+ tests at different points. The actual test files, pass logs, and coverage report are not included in this package — do not claim independently verified coverage or production uptime beyond what is stated.',
        ],
      },
    ],
  },
  {
    id: 'decision-log',
    title: 'Product and engineering decision log',
    statusLabel: 'Retrospective reconstruction, based on the supplied project summary',
    sections: [
      {
        heading: '',
        paragraphs: [],
        table: {
          headers: ['Decision', 'Rationale', 'Cost or trade-off', 'Observed result / confidence'],
          rows: [
            ['AI-guided group search with approval', 'Unknown source landscape', 'Human review required', 'All 26 approved groups AI-discovered, user confirmed'],
            ['Local 8B extraction', 'High-volume repeated work', 'Local compute and extraction errors', 'Used; limited benchmark favored 8B'],
            ['Paid vision assessment', 'Text misses condition', 'Metered model cost', 'Implemented; value plausible, uplift not measured'],
            ['Unknown remains eligible', 'Avoid false negatives', 'More review noise', 'Implemented in logic'],
            ['Estimated total monthly cost', 'Inconsistent included charges', 'Approximation uncertainty', 'User-confirmed implementation'],
            ['Persistent separated score factors', 'Cheap reweighting', 'More model/schema design', 'Implemented in draft'],
            ['Direct dismissal feedback', 'Too many nuanced preferences for MVP schema', 'Lexical grouping may be crude', 'Live-wired after a persistence bug; adoption limited'],
            ['Sequential browser collection', 'Parallelism caused a ban', 'Slow runs', 'Used; scraper still unreliable'],
            ['GitHub JSON cloud state', 'Avoid hosted DB setup', 'Two sources of truth', 'Implemented; state tracker underused'],
            ['Change the schema after pivot', 'Rooms and sublets differ from apartments', 'Refactor effort', 'Implemented'],
            ['Phone weight reduced', 'Convenience less important than price', 'Previous rankings flawed', 'Documented v3.1 change'],
          ],
        },
      },
    ],
  },
  {
    id: 'iteration-timeline',
    title: 'Development and iteration timeline',
    statusLabel: 'Retrospective reconstruction, based on the supplied project summary',
    sections: [
      {
        heading: 'April 2026 — phase 1',
        paragraphs: [
          'Mid-April, the project begins. The initial search expands from Walloon Brabant toward five Brussels communes. Build gates include source collection, staged text extraction, photo scoring, persistence, dashboard, date-parsing repairs, and ranking-criteria revisions. The source drafts report 258 tests after early refactoring and more than 330 after criteria rebuilding — build artifacts, not customer-value outcomes on their own.',
        ],
      },
      {
        heading: 'May 2026 — phase 2',
        paragraphs: [
          'The search changes toward shorter-term, lower-budget, rooms-and-sublet-inclusive requirements across ten communes. Data model, prompts, and ranking change accordingly. Scraping moves from Playwright toward Camoufox, with further tuning. Additional availability, timestamp, and other issues require repair. Active development drops after mid-May — this does not establish daily operational reliability, only that active building stopped.',
        ],
      },
      {
        heading: 'Outcomes',
        paragraphs: [
          'A retained, ranked export of 228 records. Apartment Scout surfaced the selected property. Actual operation was bursty, due to hours-long refreshes and scraping instability.',
        ],
      },
      {
        heading: 'Methodological note',
        paragraphs: [
          'The exact chronological ordering of several smaller implementation events is not proven by the available summary — no invented daily milestone dates appear here.',
        ],
      },
    ],
  },
  {
    id: 'prompt-engineering',
    title: 'Prompt engineering and inference boundaries',
    statusLabel: 'Retrospective reconstruction, based on the supplied project summary',
    sections: [
      {
        heading: 'Distinct model jobs',
        paragraphs: [
          '1. Claude Haiku 4.5 guides multilingual group discovery through iterative refinement.',
          '2. Qwen3 8B at Q4_K_M quantization runs a low-cost relevance-dismissal prompt, then extraction with few-shot in-context examples.',
          '3. Claude Haiku evaluates photos against a rubric, with anchors corresponding to an average and a genuinely impressive Belgian rental.',
          '4. Claude Haiku 4.5 judges disagreements in the model-evaluation harness.',
        ],
      },
      {
        heading: 'Dynamic preference context',
        paragraphs: [
          'On each future classification run, dismissal reasons stored in SQLite are clustered lexically, weighted by recurrence, and appended as preferences to the classification system prompt. This is prompt adaptation, not fine-tuning.',
        ],
      },
      {
        heading: 'Illustrative prompt skeleton — not original code',
        paragraphs: [
          'System: You are evaluating rental listings against explicit hard constraints and soft user preferences. Use only facts supported by the post; preserve unknown values; distinguish total monthly cost claims from extra charges. Dynamic preferences: {{PERSISTED_RECURRENT_DISMISSAL_REASON_RULES}}. User: {{FULL_POST_TEXT}}. Return structured values with uncertainty flags.',
          'This skeleton is conceptual — the product did not necessarily use this exact text.',
        ],
      },
      {
        heading: 'Failure controls',
        paragraphs: [
          'Inspect complete inputs before blaming model capability — the implementation had a 1,200-character truncation bug that looked like a capability problem until found. A zero-temperature setting is not a guarantee of semantic determinism, and parsing correctness must be evaluated independently of it.',
        ],
      },
    ],
  },
  {
    id: 'results-and-evidence',
    title: 'Results and evidence sheet',
    statusLabel: 'Retrospective reconstruction, based on the supplied project summary',
    sections: [
      {
        heading: 'Verified by explicit user clarification',
        paragraphs: [
          'Housing was found, and Apartment Scout surfaced the property selected. All 26 approved groups were discovered through AI-assisted source discovery. Usage was bursty, not a dependable daily workflow. Better understanding of market prices and the scarcity of genuinely furnished listings translated into faster, confident decisions and outreach, reported qualitatively. Pricing comparisons were normalized using assumptions for unknown heating, electricity, and internet costs. The feedback loop is connected to the live classification prompt after its persistence fix. Built with Claude Code under active human direction and review.',
        ],
      },
      {
        heading: 'Described in draft, partially corroborated by repository analysis',
        paragraphs: [
          '228 final retained ranked records. In-app statuses: nearly all "new," two "favorites," no recorded "contacted" states. Qwen 8B versus 14B disagreement-only judge comparison: 76% versus 9%, with an approximate 4x relative throughput difference. A furnished-label audit corrected 10 of 131 records. Two major build phases, April and May 2026.',
        ],
      },
      {
        heading: 'Not measured / not verified',
        paragraphs: [
          'Time saved, number of viewings, total AI/API spend, full-dataset extraction accuracy, quantitative ranking improvement, reliable daily collection, number of outbound contacts, the actual model-benchmark sample size, and original screenshot fidelity.',
        ],
      },
      {
        heading: 'Content integrity',
        paragraphs: [
          'A planned acceptance criterion is never treated as a measured outcome here. The word "new" in the database is never treated as proof the user took no action.',
        ],
      },
    ],
  },
  {
    id: 'repository-references',
    title: 'Implementation reference index',
    statusLabel: 'Pointers only — source files are not attached to this package',
    sections: [
      {
        heading: 'Referenced paths',
        paragraphs: [
          'discover_groups.py — AI-guided multilingual group discovery. selected_groups.json — the approved source-group list. compare_models.py — the disagreement-based model-comparison harness. A SQLite database holding retained listings and review/feedback state. listings.json — the GitHub-backed cloud state. checkpoint.png and login_debug.png — incidental debug screenshots, not UI screenshots.',
          'These paths are mentioned in the supplied summaries, but the source files themselves are not attached to this package — they are pointers for a possible future repository connection, not source-code verification performed here. Before publishing any direct repository link, it would need review for repo visibility, path sensitivity, session data, access tokens, and the privacy of any rental information it might expose.',
        ],
      },
    ],
  },
];
