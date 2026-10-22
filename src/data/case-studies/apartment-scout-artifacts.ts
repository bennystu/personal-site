// Transcribed from workspaces/work/career-ops/portfolio/apartment-scout/apartment-scout/03-supporting-artifacts/.
// Written up after the build, from the real codebase and git history, not from memory.

export interface ArtifactSection {
  heading: string;
  paragraphs: string[];
  table?: { headers: string[]; rows: string[][] };
}

export interface Artifact {
  id: string;
  title: string;
  statusLabel?: string;
  diagramId?: string;
  screenshots?: { src: string; caption: string }[];
  sections: ArtifactSection[];
}

export const artifacts: Artifact[] = [
  {
    id: 'prd',
    title: 'Product requirements',
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
        heading: 'Search scope',
        paragraphs: [
          'The search started in Walloon Brabant, near Genval, and moved to five specific Brussels communes near Metro Line 5: Auderghem, Etterbeek, Watermael-Boitsfort, Ixelles, Woluwe-Saint-Pierre. Budget approximately €1,250 all-in, furnished, at least 35m², available by June 2026, domiciliation required, proximity to Metro Line 5 preferred.',
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
        heading: 'Acceptance criteria',
        paragraphs: [
          'Hard filters behave correctly while unknowns never auto-dismiss. Target shortlist size: 5 to 20 actionable listings per normal run. Unchanged content never triggers unnecessary re-inference. Manual statuses survive re-runs. Failed groups log and skip rather than aborting the whole pipeline. New groups get a one-time historical backfill. A failure to load or score photos never stops the pipeline; the listing simply proceeds without a photo score.',
        ],
      },
      {
        heading: 'Nonfunctional constraints',
        paragraphs: [
          'Low operational cost, fast to build, local deployment, low repetitive API spend, reliable source collection.',
        ],
      },
      {
        heading: 'Out of scope',
        paragraphs: [
          'A multi-user SaaS, perfect market coverage, autonomous housing selection, verified utility bills, guaranteed listing availability, continuous Facebook monitoring.',
        ],
      },
    ],
  },
  {
    id: 'technical-design',
    title: 'Technical design',
    diagramId: 'system-architecture',
    screenshots: [
      { src: '/case-studies/apartment-scout/dashboard-list.png', caption: 'The real dashboard: filters on the left, ranked listings on the right.' },
    ],
    sections: [
      {
        heading: 'Component responsibilities',
        paragraphs: [
          'Source discovery: multilingual Facebook searches controlled iteratively by Claude Haiku 4.5; manual approval writes selected_groups.json.',
          'Collection: browser automation, originally Playwright, later Camoufox; serial execution after a parallel-session ban; permalink full-text retrieval; group and session preflight checks.',
          'Text analysis: quantized Qwen3 8B running locally through llama-server. A cheap first pass dismissed irrelevant posts, then detailed extraction ran on the posts that passed, with worked examples in the prompt showing the model how to interpret listings.',
          'Business logic: deduplication, disqualifiers, uncertainty handling, price normalization, score-component storage and configurable ranking, all in plain code.',
          'Vision: Claude Haiku photo-quality assessment for qualifying listings, paid inference, deliberately scoped narrow.',
          'Persistence: local SQLite, plus photo hosting and cloud state via GitHub-hosted JSON.',
          'Presentation: Streamlit, local and Streamlit Community Cloud.',
          'Feedback: dismissal reasons persisted, then clustered using Jaccard overlap and promoted into classification-prompt instructions.',
        ],
      },
      {
        heading: 'Known failure modes',
        paragraphs: [
          'Facebook checkpoint detection, changing markup and date formats, stale and edited posts, model input truncation, mismatched local/remote statuses.',
        ],
      },
      {
        heading: 'Architecture decisions',
        paragraphs: [
          'SQLite was chosen for short-lived, single-user local data. Local classification and extraction avoided per-call charges on the high-volume text work, while paid photo scoring ran only on listings that had passed every earlier check. Claude Haiku also handled group discovery and judged disagreements during model evaluation, both low-volume jobs. GitHub was reused for remote status storage instead of provisioning a database, and manual approval was retained over every AI-discovered group.',
        ],
      },
      {
        heading: 'Security and privacy',
        paragraphs: [
          'No private Facebook account information, session cookies, usernames, housing addresses, or personal correspondence appears here. Browser-evasion techniques are described at a high level only, never as a guarantee or an endorsement of bypassing access controls.',
        ],
      },
    ],
  },
  {
    id: 'model-evaluation',
    title: 'AI model evaluation',
    sections: [
      {
        heading: 'Decision',
        paragraphs: [
          'Local processing was chosen to avoid per-call charges on repeated, high-volume extraction. This evaluation checked the separate decision of which local model to run, Qwen3 8B or Qwen3 14B, using real Facebook housing posts rather than published general benchmarks. It did not compare local extraction against a paid service.',
        ],
      },
      {
        heading: 'The harness',
        paragraphs: [
          'Run Qwen3 8B and Qwen3 14B on the same set of posts. Compare classification outcomes and extracted price, commune, bedrooms, area, and furnished fields. Escalate every disagreement between the two models to Claude Haiku 4.5 as a reference judge (LLM-as-judge). Score each candidate against that judge, on the disagreement-only subset.',
        ],
      },
      {
        heading: 'Results',
        paragraphs: [],
        table: {
          headers: ['Measurement', 'Qwen3 8B', 'Qwen3 14B', 'Interpretation'],
          rows: [
            ['How often the model\'s answer matched the judge\'s, on disputed field values only', '76%', '9%', 'In the remaining cases the judge agreed with neither model'],
            ['Relative inference throughput', 'About 4x faster', 'Baseline', 'Same local hardware'],
          ],
        },
      },
      {
        heading: 'Scope of the claim',
        paragraphs: [
          'This measures agreement with Haiku only on the field values where the two local models disagreed, a harder, skewed sample. It does not establish either model\'s accuracy across the full dataset. Haiku\'s judgments were not independently human-verified, and a result this lopsided is also consistent with a prompt or parsing mismatch rather than a clean capability gap. A separate furnished-label audit caught and corrected 10 errors among 131 inspected listings, real evidence the pipeline could be checked and improved.',
        ],
      },
    ],
  },
  {
    id: 'ranking-spec',
    title: 'Ranking and cost normalization',
    diagramId: 'ranking-process',
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
          'Reject clear known disqualifiers (explicitly rented, incompatible requirements). Unknown is never treated as a rejection on its own. Availability became an explicit hard cutoff once timing was known to be incompatible.',
        ],
      },
      {
        heading: 'Comparable cost',
        paragraphs: [
          'Advertised base rent plus known excluded recurring costs, plus estimates for missing heating, electricity, and internet, without double-counting charges already included. Conflicting text stays flagged as ambiguous rather than resolved by guesswork.',
        ],
      },
      {
        heading: 'Score architecture',
        paragraphs: [
          'Individual factor values are stored separately, so changing weights never requires repeating AI calls. Factors: price fit, contactability, furnished desirability, proximity, photo quality, availability, data completeness.',
        ],
      },
      {
        heading: 'Three documented revisions',
        paragraphs: [
          'Each ranking revision shipped with written acceptance tests. In v3.1, the phone-contact weight dropped to a third of its v3 value. Known-incompatible availability became a hard exclusion instead of a soft gradient. Furnishing desirability was separated from field completeness, and metro proximity stayed a score boost, never a hard rejection.',
        ],
      },
    ],
  },
  {
    id: 'qa-and-tests',
    title: 'Testing and quality',
    sections: [
      {
        heading: 'Practices',
        paragraphs: [
          'Gate-by-gate implementation with acceptance criteria written first. Unit and regression tests. Multiple ranking-formula revisions, each with prior written criteria. Pre-flight health checks. Debugging and reclassification tooling. A dedicated furnished-label audit.',
        ],
      },
      {
        heading: 'Real bugs, caught and fixed',
        paragraphs: [
          'Input truncation at 1,200 characters was cutting important field details, limit and token budget corrected. Timestamp extraction needed repeated repair across different DOM patterns Facebook used. An early feedback mechanism only lived in Streamlit session state, persistence path fixed. Availability logic wrongly assumed a post existing meant the listing was still available, explicit handling added. A smoke test was letting a full run proceed in non-interactive mode, explicit confirmation introduced. The furnished-label audit corrected 10 of 131 inspected records.',
        ],
      },
      {
        heading: 'Test coverage',
        paragraphs: [
          '258 tests after the first refactor, 330+ after the Brussels criteria rebuild.',
        ],
      },
    ],
  },
  {
    id: 'decision-log',
    title: 'Decision log',
    sections: [
      {
        heading: '',
        paragraphs: [],
        table: {
          headers: ['Decision', 'Rationale', 'Trade-off', 'Result'],
          rows: [
            ['AI-guided group search with approval', 'Unknown source landscape', 'Human review required', 'All 26 approved groups AI-discovered'],
            ['Local 8B extraction', 'Free and fast beats paid and slow for high-volume repeated work, if good enough', 'Local compute only', 'Benchmark against 14B supported the choice already made on cost and speed'],
            ['Paid vision assessment', 'Text misses condition', 'Metered model cost', 'Scoped to listings that already passed cheaper checks'],
            ['Unknown remains eligible', 'Avoid false negatives', 'More review noise', 'Never auto-dismiss on missing data'],
            ['Estimated total monthly cost', 'Inconsistent included charges', 'Approximation, not certainty', 'Normalized comparable cost across listings'],
            ['Persistent separated score factors', 'Cheap reweighting', 'More schema design upfront', 'Re-ranking needs zero new AI calls'],
            ['Direct dismissal feedback', 'Too many nuanced preferences for an MVP schema', 'Lexical grouping is crude, not semantic', 'Feedback loop wired into the live classification prompt'],
            ['Sequential browser collection', 'Parallelism caused a ban', 'Slower runs', 'Reliability over raw speed'],
            ['GitHub JSON cloud state', 'Avoid hosted DB setup', 'Two sources of truth', 'Free, with a disclosed reconciliation risk'],
            ['Phone weight reduced', 'Convenience is less important than price', 'Earlier rankings were wrong', 'Documented in v3.1'],
          ],
        },
      },
    ],
  },
  {
    id: 'iteration-timeline',
    title: 'Build timeline',
    sections: [
      {
        heading: 'April 2026: phase 1',
        paragraphs: [
          'The project started mid-April, and the search soon moved from Walloon Brabant to five Brussels communes. Collection, text extraction, photo scoring, storage, and the dashboard were built in stages, each with acceptance criteria written before implementation. Date parsing was repaired along the way and the ranking criteria were revised. The test suite grew from 258 tests after early refactoring to over 330 after the criteria rebuild.',
        ],
      },
      {
        heading: 'May 2026: reliability work continues',
        paragraphs: [
          'Scraping moves from Playwright to Camoufox after the account ban, with further tuning to actually stop detection. Timestamp parsing gets repaired again as Facebook changes its markup. Active development winds down after mid-May.',
        ],
      },
    ],
  },
  {
    id: 'prompt-engineering',
    title: 'Prompt engineering',
    sections: [
      {
        heading: 'Four distinct model jobs',
        paragraphs: [
          '1. Claude Haiku 4.5 guides multilingual group discovery through iterative refinement.',
          '2. Qwen3 8B (Q4_K_M quantization) runs a low-cost relevance-dismissal prompt, then extraction with few-shot in-context examples.',
          '3. Claude Haiku scores photos against a rubric, with anchors for an average and a genuinely impressive Belgian rental.',
          '4. Claude Haiku 4.5 judges disagreements in the model-evaluation harness.',
        ],
      },
      {
        heading: 'Dynamic preference context',
        paragraphs: [
          'On every future classification run, dismissal reasons stored in SQLite are clustered lexically, weighted by recurrence, and appended as preferences to the classification system prompt. Prompt adaptation, not fine-tuning.',
        ],
      },
      {
        heading: 'Root-cause discipline',
        paragraphs: [
          'When extraction quality dropped, the first instinct was a bigger model. The actual cause was a 1,200-character input truncation bug. Fixing the truncation was cheaper and more correct than upgrading the model.',
        ],
      },
    ],
  },
  {
    id: 'results-and-evidence',
    title: 'Results',
    screenshots: [
      { src: '/case-studies/apartment-scout/dashboard-inquiry.png', caption: 'The auto-written French inquiry message for a selected listing.' },
    ],
    sections: [
      {
        heading: 'What happened',
        paragraphs: [
          'Housing was found, and Apartment Scout surfaced the property selected. All 26 approved groups came from AI-assisted source discovery. Better understanding of market prices and the scarcity of genuinely furnished listings translated into faster, more confident decisions and outreach. Built with Claude Code under active human direction and review, across two build phases in April and May 2026.',
        ],
      },
      {
        heading: 'The numbers',
        paragraphs: [
          '1,137 posts read and filtered. Qwen 8B vs. 14B, disagreement-only judge comparison: 76% vs. 9%, about 4x relative throughput in Qwen 8B\'s favor. A furnished-label audit corrected 10 of 131 records.',
        ],
      },
      {
        heading: 'What this doesn\'t claim',
        paragraphs: [
          'There is no time-saved number, no viewing count, and no full-dataset accuracy figure. Usage was bursty rather than a daily habit, and the in-app status tracker was barely used even though real outreach happened over Messenger.',
        ],
      },
    ],
  },
  {
    id: 'repository-references',
    title: 'Code references',
    statusLabel: 'Key files in the private repository',
    sections: [
      {
        heading: 'Referenced paths',
        paragraphs: [
          'discover_groups.py: AI-guided multilingual group discovery. selected_groups.json: the approved source-group list. compare_models.py: the disagreement-based model-comparison harness. A SQLite database holding retained listings and review/feedback state. listings.json: the GitHub-backed cloud state.',
          'Before publishing any direct repository link, it would need review for repo visibility, session data, access tokens, and the privacy of any rental information it might expose.',
        ],
      },
    ],
  },
];
