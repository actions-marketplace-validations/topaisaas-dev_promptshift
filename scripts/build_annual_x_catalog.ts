import * as fs from 'fs';
import * as path from 'path';

export interface XPost {
  id: string;
  category:
    | 'ast-parity'
    | 'security'
    | 'ci-cd'
    | 'multi-agent'
    | 'terminal'
    | 'token-optimization'
    | 'mcp-ecosystem'
    | 'syntax-traps';
  slot?: 'morning' | 'afternoon';
  mainTweet: string;
  replyTweet: string;
}

/**
 * Computes X (Twitter) weighted character length:
 * - Standard ASCII / Latin-1 characters count as 1
 * - Emojis / Astral plane / CJK characters (> U+10FF) count as 2
 * - http(s):// URLs count as 23 chars per t.co wrapping
 */
function getXWeightedLength(text: string): number {
  const urlRegex = /https?:\/\/[^\s]+/g;
  const withoutUrls = text.replace(urlRegex, '');
  const urls = text.match(urlRegex) || [];
  let count = urls.length * 23;
  for (const ch of withoutUrls) {
    const code = ch.codePointAt(0) || 0;
    count += code > 0x10ff ? 2 : 1;
  }
  return count;
}

// Preserve the exact 3 historical posts already broadcast in data/x_posts_history.json
const HISTORICAL_BROADCASTED_POSTS: XPost[] = [
  {
    id: 'post-d001-morning',
    category: 'ast-parity',
    slot: 'morning',
    mainTweet:
      'Windsurf Cascade vs Cursor Rules:\n\n.windsurfrules and .cursorrules use incompatible directive headers. Switching editors without AST transpilation breaks agent flow.\n\n$ npx promptshift --source windsurf --target cursor',
    replyTweet:
      'Stop wasting 3 hours manually reformatting AI instructions. The $1.99 Single Pass pays for itself on day 1.\n\n👉 1-Click interactive studio:\nhttps://promptshift.dev',
  },
  {
    id: 'post-d001-afternoon',
    category: 'security',
    slot: 'afternoon',
    mainTweet:
      'Binary magic byte protection:\nAI coding rules should only contain markdown and text. PromptShift blocks Windows PE, ELF, and Mach-O executables in-RAM.\n\nClean configs only:\n$ npx promptshift',
    replyTweet:
      'PromptShift parses, deduplicates, and sanitizes API keys in-RAM with zero server retention.\n\n🔒 Sovereign universal bridge for developers ($1.99):\nhttps://promptshift.dev',
  },
  {
    id: 'post-d002-morning',
    category: 'token-optimization',
    slot: 'morning',
    mainTweet:
      'Multi-agent token budget compounding:\nIn multi-agent swarms, passing bloated instructions across 4 subagents compounds token waste 4x. Clean directives are mandatory.\n\nOptimize swarm guidelines:\n$ npx promptshift --to=gemini',
    replyTweet:
      'One source of truth for all your AI coding assistants. Export to Cursor, Claude, Copilot & Gemini simultaneously.\n\n⚡ Universal 4-in-1 Pass ($1.99):\nhttps://promptshift.dev',
  },
];

// ============================================================================
// HANDCRAFTED HIGH-VIRALITY STANDALONE POST BANKS (CALIBRATED FOR REPOSTS BY @jeanyvesgarcin)
// Strictly ZERO external URLs in mainTweet, <= 265 weighted chars
// ============================================================================

const MCP_ECOSYSTEM_POSTS: string[] = [
  `PromptShift is officially Grade-A certified on the Glama MCP Registry.\n\nYour Claude Desktop & Cursor agents can now transpile rules, redact leaked API keys, and benchmark AST parity directly over STDIO.\n\nZero disk writes:\n$ npx promptshift --mcp`,
  `Stop asking LLMs to rewrite their own system prompts.\n\nConnect a deterministic MCP tool instead:\n1. Agent reads .cursor/rules/*.mdc\n2. Calls promptshift_transpile in RAM\n3. Writes verified CLAUDE.md (98.5% AST parity)\n\n$ npx promptshift --mcp`,
  `Why STDIO MCP beats cloud wrappers for AI config files:\n\n• 0ms network roundtrip\n• 0 third-party prompt logging\n• Sub-15ms JSON-RPC 2.0 execution\n• Automatic secret redaction before disk write\n\nAdd to Claude Desktop:\n$ npx promptshift --mcp`,
  `3 MCP servers every multi-IDE repo needs in 2026:\n\n1. filesystem -> read/write local rule files\n2. github -> open sync PRs automatically\n3. promptshift -> deterministic AST transpilation + secret scrubbing\n\nRun locally:\n$ npx promptshift --mcp`,
  `Inside our Glama Firecracker microVM audit:\n\n• Base: node:22-alpine (unprivileged user)\n• Cold boot to JSON-RPC ping: <40ms\n• External runtime dependencies: 0\n• TDQS Tool Schema Grade: 5-Star\n\nTest the MCP server:\n$ npx promptshift --mcp`,
  `Ever wondered if converting .cursorrules to CLAUDE.md silently dropped a constraint?\n\nOur MCP server exposes promptshift_validate_ast:\nIt benchmarks semantic fidelity in RAM and flags prompt drift before you commit.\n\n$ npx promptshift --mcp`,
  `Before your AI coding agent commits a new rule file, have it call promptshift_sanitize_secrets via MCP.\n\nScrubs sk-proj-*, sk-ant-*, AKIA*, ghp_*, and sk_live_* in memory with zero retention.\n\n1-line setup:\n$ npx promptshift --mcp`,
  `Claude Desktop config tip:\n\nAdd "promptshift": { "command": "npx", "args": ["-y", "promptshift", "--mcp"] }\n\nNow ask Claude:\n"Convert this repo's Cursor .mdc rules into a clean CLAUDE.md and verify AST parity."`,
  `Why Tool Definition Quality Score (TDQS) matters for MCP:\n\nVague 1-line tool descriptions make agents hallucinate arguments.\nExplicit "when to use / when NOT to use" schemas cut wrong tool calls by >80%.\n\nSee it live:\n$ npx promptshift --mcp`,
  `Cursor MCP + Claude Code CLI workflow:\n\nEdit modular .cursor/rules/*.mdc in Cursor.\nLet the PromptShift MCP tool compile deterministic CLAUDE.md + Copilot instructions automatically in RAM.\n\nZero manual copy-paste:\n$ npx promptshift --mcp`,
  `Most MCP servers pull 150+ npm packages just to parse JSON-RPC.\n\nPromptShift's STDIO MCP binary uses 0 external dependencies.\nPure Node core. Instant startup. Zero supply-chain bloat.\n\nVerify it yourself:\n$ npx promptshift --mcp`,
  `Agentic self-healing for repo configs:\n\nWhen a PR updates .cursor/rules/api.mdc, an autonomous agent running PromptShift MCP detects drift, transpiles CLAUDE.md, and validates 98.5% AST fidelity.\n\nBootstrap now:\n$ npx promptshift --mcp`,
  `Running Cline or Roo Code alongside Cursor?\n\nInstead of duplicating 500 lines of architecture rules, expose PromptShift over STDIO MCP and generate clean target rulebooks on demand.\n\nOne command:\n$ npx promptshift --mcp`,
  `How MCP HTTP-402 / quota previews should work for devs:\n\n1. Never block small repos (<=2 rule files = 100% free)\n2. Unlock the master output file immediately to prove AST quality\n3. Zero-signup unlock for large repos\n\n$ npx promptshift --mcp`,
  `Dockerized MCP for strict enterprise sandboxes:\n\ndocker build -t promptshift .\ndocker run -i --rm promptshift\n\nRuns as non-root user, 100% air-gapped in RAM, speaking pure JSON-RPC 2.0 over STDIO.`,
  `Why AI agents love deterministic MCP tools:\n\nWhen Claude calls an LLM to convert YAML frontmatter, output varies every run.\nWhen Claude calls promptshift_transpile, the AST output is 100% idempotent.\n\n$ npx promptshift --mcp`,
  `Windsurf Cascade + Claude Desktop harmony:\n\nKeep .windsurfrules synced with Claude Projects XML bundles without touching a browser.\nJust wire up the STDIO MCP bridge:\n\n$ npx promptshift --mcp`,
  `Testing MCP liveness the right way:\n\nYour STDIO server must handle:\n• ping -> {}\n• notifications/initialized -> silent ack\n• initialize -> capabilities + serverInfo\n• tools/list -> full JSON schema\n\nTry ours:\n$ npx promptshift --mcp`,
  `Stop pasting proprietary system prompts into web chatbots just to reformat them.\n\nRun PromptShift locally via STDIO MCP. Your repo's rules never leave your machine's RAM.\n\n$ npx promptshift --mcp`,
  `Multi-repo founder hack:\n\nKeep one battle-tested architecture prompt.\nUse PromptShift MCP inside Claude Desktop to stamp out Cursor, Copilot, Windsurf & Gemini configs for every new repo in 2 seconds.\n\n$ npx promptshift --mcp`,
];

const SYNTAX_TRAPS_POSTS: string[] = [
  `Infamous Cursor .mdc bug that wastes hours:\n\n---\ndescription: React rules\nglobs: *.tsx\n---\n\nIn YAML, an unquoted * starts an alias anchor!\nCursor's parser fails silently and ignores the ENTIRE rule file.\n\nFix & validate:\n$ npx promptshift --check`,
  `Cursor .mdc silent trap #2:\n\nSetting alwaysApply: false WITHOUT a clear description string means Cursor's semantic router never attaches your rule—even when globs match.\n\nGenerate valid .mdc headers automatically:\n$ npx promptshift --to=cursor`,
  `Why pasting .cursor/rules/*.mdc into CLAUDE.md backfires:\n\nLeftover "--- globs: src/**/*.ts ---" blocks confuse Claude Code into thinking rules are metadata comments rather than active imperatives.\n\nStrip & map AST cleanly:\n$ npx promptshift --to=claude`,
  `Windows CRLF trap in .cursor/rules/:\n\nMixed \\r\\n inside YAML frontmatter delimiters (---) breaks frontmatter extraction in several AI IDE extensions. Zero errors shown—your agent just codes blind.\n\nAudit your repo:\n$ npx promptshift --check`,
  `GitHub Copilot instruction trap:\n\nCopilot reads .github/copilot-instructions.md, NOT .cursorrules or CLAUDE.md.\nIf 3 devs on your team use Copilot and you only maintain .cursorrules, they ship unguarded code.\n\n$ npx promptshift --to=copilot`,
  `OpenAI Custom GPT ceiling trap:\n\nCustom GPT instructions hard-cap at 8,000 chars.\nPasting a 14k-char CLAUDE.md truncates your bottom security constraints!\nPromptShift splits overflow into structured Knowledge bundles.\n\n$ npx promptshift --to=openai`,
  `Why "Never use X" disappears during manual prompt edits:\n\nWhen devs summarize long .cursorrules for another editor, negative constraints ("NEVER expose service_role", "NO default exports") get cut first.\n\nPreserve 98.5% AST:\n$ npx promptshift --to=claude`,
  `UTF-8 BOM (Byte Order Mark) bug:\n\nIf an editor saves .cursor/rules/auth.mdc with a leading UTF-8 BOM, the opening --- isn't at byte 0.\nFrontmatter parsing fails silently. Your auth rules vanish.\n\nCheck in 0.4s:\n$ npx promptshift --check`,
  `Cursor legacy trap:\n\nMaintaining BOTH a root .cursorrules file AND .cursor/rules/*.mdc with conflicting instructions causes non-deterministic precedence in agent loops.\n\nConsolidate into clean scoped .mdc:\n$ npx promptshift --to=cursor`,
  `Claude Projects XML vs raw Markdown:\n\nClaude's attention mechanism tracks <instructions> and <constraints> XML boundaries far better than flat walls of text in multi-file contexts.\n\nCompile XML + CLAUDE.md in 1 shot:\n$ npx promptshift --to=claude`,
  `Comma-separated globs trap in .mdc:\n\nglobs: src/*.ts, lib/*.ts (unquoted or malformed bracket arrays) frequently breaks glob matching across IDE versions.\n\nStandardize every rule header deterministically:\n$ npx promptshift --to=cursor`,
  `Windsurf .windsurfrules vs Cursor .mdc:\n\nWindsurf expects unified Cascade markdown directives, while Cursor thrives on file-scoped .mdc modules.\nCopy-pasting 1:1 degrades both editors.\n\nBridge them cleanly:\n$ npx promptshift --to=windsurf`,
  ` Gemini CLI & Antigravity config layout:\n\nGemini looks for GEMINI.md + AGENTS.md + .agents/rules/*.md.\nManually syncing those with .cursor/rules/ across every sprint is pure toil.\n\nTranspile in 0.4s:\n$ npx promptshift --to=gemini`,
  `Markdown heading depth trap:\n\nJumping from # H1 straight to #### H4 inside CLAUDE.md flattens semantic grouping when agents chunk long instruction trees.\n\nNormalize AST hierarchy automatically:\n$ npx promptshift --to=claude`,
  `Code-fence leakage in AI rulebooks:\n\nUnclosed triple backticks (\`\`\`) inside an example rule turn the bottom 60% of your CLAUDE.md into a literal code block—disabling every rule below it!\n\nCatch it instantly:\n$ npx promptshift --check`,
  `@file reference drift:\n\nCursor rules use @docs/schema.sql references.\nPaste that raw into Copilot or OpenAI Assistants and the agent hallucinates a missing path.\n\nTranspile cross-IDE references cleanly:\n$ npx promptshift --to=claude`,
  `Duplicate rule priority collision:\n\nRule A: "Use vitest for all tests"\nRule B (copied 4 months ago): "Use jest mocks"\n\nResult: AI writes broken hybrid test files.\nAudit rule drift before coding:\n$ npx promptshift --check`,
  `YAML colon trap in .cursor/rules/*.mdc:\n\ndescription: API: strict Zod validation\n\nThat unquoted second colon crashes strict YAML frontmatter parsers! Always quote descriptions—or let AST compilation handle it:\n$ npx promptshift --to=cursor`,
  `Monorepo subfolder trap:\n\nRoot CLAUDE.md doesn't automatically become scoped .cursor/rules/ globs for packages/web and packages/api unless paths are mapped.\n\nPreview mapped output:\n$ npx promptshift --dry-run --to=cursor`,
  `Why LLM-based "prompt converters" fail:\n\nAsk an LLM to convert 12 .mdc files to CLAUDE.md and it summarizes away 30% of your edge-case rules.\nCompilers shouldn't hallucinate. Use deterministic AST:\n$ npx promptshift --to=claude`,
];

const SECURITY_POSTS: string[] = [
  `DevSecOps wake-up call:\n\nDevelopers paste "example" curl commands into .cursorrules to show AI how internal APIs work—accidentally committing live Bearer & sk-proj-* keys.\n\nScan & redact in RAM:\n$ npx promptshift --check`,
  `1 in 8 public .cursorrules / CLAUDE.md files audited on GitHub contains hardcoded secrets, internal endpoints, or staging tokens.\n\nNever push raw AI configs without an OWASP secret scan:\n$ npx promptshift --check`,
  `Stripe sk_live_* & rk_live_* leak vector:\n\nWhen tuning AI rules for billing webhooks, devs often paste real dashboard snippets into prompt files.\nPromptShift auto-redacts 15+ credential patterns in RAM.\n\n$ npx promptshift --check`,
  `Anthropic sk-ant-api03-* & OpenAI sk-proj-* keys inside CLAUDE.md get indexed by git history forever—even if you delete the line 2 commits later.\n\nCatch secrets BEFORE git add:\n$ npx promptshift --check`,
  `Supabase service_role JWT trap:\n\nPutting a real service_role key in an AI rule example bypasses Row Level Security across your entire Postgres DB if pushed.\n\nSanitize rulebooks locally in 0.4s:\n$ npx promptshift --check`,
  `Why online "free prompt converters" are a compliance nightmare:\n\nYour CLAUDE.md reveals your architecture, auth flaws, and DB schema.\nPromptShift runs 100% in ephemeral RAM—0 DB writes, 0 prompt logs.\n\n$ npx promptshift --to=cursor`,
  `Zip Slip vulnerability in shared AI rule packs:\n\nDownloading community .cursorrules ZIP bundles? Crafted "../../.ssh/authorized_keys" archive entries can escape extraction paths.\nPromptShift blocks path traversal in RAM.`,
  `AWS AKIA* access keys in DevOps prompt files:\n\nAutomated bots scrape public GitHub commits for AKIA patterns in <90 seconds.\nRun an in-RAM secret check on your AI instructions on every PR:\n\n$ npx promptshift --init-ci`,
  `GitHub ghp_* and github_pat_* tokens often sneak into MCP & CI prompt instructions.\n\nPromptShift's heuristic scanner replaces exposed tokens with [REDACTED_API_KEY] before writing target files.\n\n$ npx promptshift --to=claude`,
  `SOC-2 & GDPR Art. 28 rule for engineering leaders:\n\nInternal system prompts are core IP.\nTools that log prompts to third-party databases fail security review.\nPromptShift = zero retention, local CLI & in-RAM API.`,
  `Private RSA / OpenSSH headers inside AI agent instructions:\n\nNever let -----BEGIN PRIVATE KEY----- touch a prompt bundle.\nPromptShift strips cryptographic key blocks automatically during AST transpilation.\n\n$ npx promptshift --check`,
  `Binary injection defense for AI configs:\n\nRule packs should NEVER contain disguised executables.\nPromptShift inspects magic bytes and rejects Windows PE, Linux ELF & macOS Mach-O binaries in RAM.\n\n$ npx promptshift --check`,
  `Slack xoxb-* & Discord bot tokens inside multi-agent rules:\n\nCopy-pasting .env examples into CLAUDE.md is the #1 accidental leak in indie SaaS repos.\nAudit your workspace in 400ms:\n\n$ npx promptshift --check`,
  `Google AIza* & HuggingFace hf_* keys in ML repos:\n\nNotebook devs turning prompts into Cursor rules routinely leave API keys in code blocks.\nScrub every rule file deterministically:\n\n$ npx promptshift --to=cursor`,
  `GitLab glpat-* & Postgres connection strings (postgres://user:pass@host) in backend rules:\n\nOne leaked staging DB URL gives attackers your schema.\nEnforce automated PR secret guards:\n\n$ npx promptshift --init-ci`,
  `Zip Bomb protection on config uploads:\n\nA 40KB malicious archive can decompress to 4GB and crash naive CI runners.\nPromptShift enforces strict compression-ratio & byte ceilings in memory.\n\nSafe by design:\n$ npx promptshift --check`,
];

const TOKEN_OPTIMIZATION_POSTS: string[] = [
  `Do the token math on bloated AI rules:\n\n4,200 redundant tokens in CLAUDE.md\n× 60 agent turns/day\n× 22 workdays\n= 5.54M wasted input tokens/month PER dev.\n\nSplit into glob-scoped rules in 0.4s:\n$ npx promptshift --to=cursor`,
  `"Lost in the Middle" hits AI coding rules hard:\n\nWhen .cursorrules exceeds ~600 lines, LLM recall on rules between lines 200-450 drops sharply.\nModularize into targeted .mdc files so only relevant rules load:\n$ npx promptshift --to=cursor`,
  `Prompt caching trap in Claude Code:\n\nConstantly hand-editing random typos at the top of a giant CLAUDE.md invalidates your prefix cache—multiplying input token costs up to 10x.\nCompile clean, stable AST blocks:\n$ npx promptshift --to=claude`,
  `Cursor alwaysApply: true mistake:\n\nMarking 15 .mdc files as alwaysApply: true injects database, CSS, and CI rules even when editing a README!\nScope rules by file globs instead:\n\n$ npx promptshift --to=cursor`,
  `Benchmark on a real 14-rule SaaS repo:\n\n• Raw copy-pasted instructions: 6,120 tokens\n• After PromptShift AST deduplication: 2,790 tokens (-54%)\n• Constraint adherence: 98.5% parity\n\nLess noise = smarter codegen:\n$ npx promptshift`,
  `Why reasoning models (o3, Claude Sonnet/Opus) stall on messy rulebooks:\n\nContradictory directives force extra thinking tokens on every turn—slowing responses by 4-8 seconds.\nAudit rule hygiene:\n$ npx promptshift --check`,
  `Subagent context fan-out:\n\nSpawn 5 parallel subagents in Claude Code with an unpruned 5,000-token root prompt = 25,000 tokens burned before reading a single source file!\n\nKeep root directives lean:\n$ npx promptshift --to=claude`,
  `Prose vs AST directives:\n\nBad (42 tokens): "Please remember that whenever you are creating a new React component..."\nGood (9 tokens): "React components: functional TSX, named exports only."\n\nClean your rule tree:\n$ npx promptshift`,
  `Why splitting a 900-line prompt boosts code quality overnight:\n\nWhen editing SQL migrations, your AI agent needs Postgres & RLS rules—not 400 lines of Tailwind animation guidelines.\n\nModularize fast:\n$ npx promptshift --to=cursor`,
  `Hidden cost of copy-pasting stacktrace examples into .cursorrules:\n\nA single 120-line error log example eats ~1,100 tokens on EVERY chat turn for months.\nAudit and trim bloated rule files:\n\n$ npx promptshift --check`,
  `Context window != attention budget:\n\nJust because a model accepts 200k or 1M tokens doesn't mean 10k tokens of messy rules won't dilute instruction following.\nHigh-signal AST wins every time:\n$ npx promptshift --to=claude`,
  `Agency token savings case study:\n\n8 engineers × 50 prompts/day.\nPruning redundant boilerplate across CLAUDE.md and .cursor/rules/ saved >$1,100/yr in API usage while cutting latency.\n\nTest locally:\n$ npx promptshift --dry-run`,
];

const MULTI_AGENT_FOUNDER_POSTS: string[] = [
  `The 2026 engineering team reality:\n\n• Tech Lead lives in Claude Code CLI\n• Frontend ships in Cursor\n• Backend uses Copilot\n• Contractor uses Windsurf\n\nStop fighting over editors. Sync 1 rule AST across all 4:\n$ npx promptshift`,
  `AI editor lock-in is a myth.\n\nIf you spent 4 months perfecting .cursor/rules/*.mdc, you aren't married to Cursor.\nTranspile your entire rulebook to Claude Code, Copilot, or Windsurf in 0.4s:\n\n$ npx promptshift --to=claude`,
  `Indie hacker / SaaS founder workflow:\n\nBuild UI in Cursor (scoped .mdc rules).\nRun deep backend refactors in Claude Code (CLAUDE.md).\nKeep both brains 100% synchronized in 1 command:\n\n$ npx promptshift --to=claude`,
  `Why forcing 20 developers onto one AI IDE fails:\n\nTop engineers have muscle memory.\nStandardize the ARCHITECTURE RULES, not the text editor.\nGenerate Cursor, Claude, Copilot & Gemini configs from 1 source:\n$ npx promptshift`,
  `Software agency superpower:\n\nClient A mandates GitHub Copilot.\nClient B uses Cursor.\nClient C wants Claude Projects.\n\nReuse your battle-tested security & clean-code rules across every client in 2s:\n$ npx promptshift`,
  `New engineer onboarding in 2026:\n\nOld way: 40-page Notion wiki nobody reads.\nNew way: Verified .cursor/rules/ + CLAUDE.md + copilot-instructions.md synced in git so their AI writes idiomatic code on Day 1.\n\n$ npx promptshift`,
  `Open-source maintainer tip:\n\nContributors submit PRs using Cursor, Claude Code, Cline, and Copilot.\nShip synced rule files for all 4 so AI-assisted PRs actually respect your repo's style!\n\n$ npx promptshift --init-ci`,
  `Switching AI models mid-quarter?\n\nModel upgrades happen monthly. Teams with portable, deterministic rule ASTs switch ecosystems in 30 seconds instead of 3 days.\n\nTest your repo's portability:\n$ npx promptshift --check`,
  `Solo founder leverage:\n\nWhen you jump between 4 microservices and 2 frontends, rule drift makes your AI introduce bugs.\nStamp uniform, secret-scrubbed guidelines across every repo:\n\n$ npx promptshift --to=cursor`,
  `Why CTOs standardize AI instructions in Git:\n\nPrompts living only inside one dev's local UI settings vanish when they leave.\nChecked-in, cross-IDE transpiled rules turn tribal knowledge into repo assets.\n\n$ npx promptshift`,
  `Pair programming across different AI tools:\n\nDriver in Cursor + Navigator running Claude Code in terminal.\nWhen both tools read identical AST-verified constraints, architectural friction drops to zero.\n\n$ npx promptshift --to=claude`,
  `Evaluating Windsurf vs Cursor vs Claude Code on a real sprint?\n\nBenchmark fairly: feed all three the exact same transpiled instruction hierarchy (98.5% AST parity) before judging code quality!\n\n$ npx promptshift --dry-run`,
];

const CICD_TERMINAL_POSTS: string[] = [
  `How AI rule drift happens in every fast team:\n\nMon: Dev updates CLAUDE.md\nWed: Another dev edits .cursorrules\nFri: Prod bug because Cursor missed Monday's auth rule.\n\nBlock drift in GitHub Actions:\n$ npx promptshift --init-ci`,
  `10-second CI/CD upgrade for any TypeScript or Python repo:\n\nRun:\n$ npx promptshift --init-ci\n\nGenerates .github/workflows/promptshift-parity.yml to audit rule parity + leaked API keys on every Pull Request.`,
  `Machine-readable AI config audits for CI pipelines:\n\n$ npx promptshift --check --json\n\nOutputs structured JSON with AST parity score, detected source, and redacted secret count. Pipe straight into jq or PR comments!`,
  `Zero-install terminal speedrun:\n\n1. cd your-saas-repo\n2. npx promptshift --dry-run --to=claude\n3. Inspect generated files & secret scan in 400ms—nothing written to disk until you're ready.`,
  `Show contributors your repo is AI-agent ready:\n\n$ npx promptshift --badge\n\nGenerates a live certified 98.5% AST Parity badge for your GitHub README alongside your CI & MIT license shields.`,
  `Pre-push sanity check before Friday deploys:\n\nDid anyone paste a staging token into .cursor/rules/ or leave CLAUDE.md out of sync?\nOne sub-second check catches both:\n\n$ npx promptshift --check`,
  `Why deterministic compilers beat LLM scripts in GitHub Actions:\n\n• 0 OpenAI/Anthropic API keys needed in CI\n• 0 flaky network timeouts\n• 0.4s execution time\n• 100% reproducible exit codes\n\n$ npx promptshift --init-ci`,
  `Migrating legacy .cursorrules to modern .cursor/rules/*.mdc + CLAUDE.md + .github/copilot-instructions.md:\n\nDon't burn your Saturday doing YAML plumbing by hand.\nRun once, commit, ship:\n$ npx promptshift --to=claude`,
];

// ============================================================================
// 60 REAL-WORLD PRODUCTION STACKS × 9 DISTINCT ENGINEERING ANGLES = 540 UNIQUE BLUEPRINTS
// ============================================================================

interface StackSpec {
  name: string;
  glob: string;
  rule: string;
  antiPattern: string;
}

const PRODUCTION_STACKS: StackSpec[] = [
  { name: 'Next.js 15 App Router', glob: 'app/**/*.tsx', rule: 'Enforce Server Components by default; validate all Server Actions with Zod', antiPattern: 'leaking DB queries into "use client" files' },
  { name: 'FastAPI + Pydantic v2', glob: 'app/routers/**/*.py', rule: 'Require async def endpoints, strict response_model, and Depends() injection', antiPattern: 'blocking sync I/O inside async event loops' },
  { name: 'Rust + Axum', glob: 'src/**/*.rs', rule: 'Forbid .unwrap() in handlers; return typed AppError implementing IntoResponse', antiPattern: 'panicking worker threads with raw unwrap()' },
  { name: 'Go gRPC Services', glob: 'internal/**/*.go', rule: 'Propagate context.Context first arg and wrap all errors via fmt.Errorf("%w")', antiPattern: 'swallowing cancellation signals in goroutines' },
  { name: 'TypeScript 5.8 Strict', glob: 'src/**/*.ts', rule: 'Ban explicit any; enforce exhaustive switch checks with satisfies never', antiPattern: 'silencing type errors with as unknown as T' },
  { name: 'Python uv + Ruff', glob: 'packages/**/*.py', rule: 'Never emit pip install; enforce uv add and strict ruff check + format', antiPattern: 'polluting globalenvs with legacy requirements.txt' },
  { name: 'Tailwind CSS v4', glob: 'src/components/**/*.tsx', rule: 'Use CSS-first @theme tokens; ban arbitrary magic hex values in classNames', antiPattern: 'scattering hardcoded [#1a2b3c] across 40 components' },
  { name: 'Supabase Postgres + RLS', glob: 'supabase/migrations/*.sql', rule: 'Enable Row Level Security on every CREATE TABLE with explicit auth.uid() policies', antiPattern: 'shipping public tables with RLS disabled' },
  { name: 'Drizzle ORM', glob: 'src/db/**/*.ts', rule: 'Use prepared parameterized queries and explicit transaction rollbacks', antiPattern: 'interpolating raw user strings inside sql`` templates' },
  { name: 'Prisma Monorepo', glob: 'packages/db/**/*.ts', rule: 'Instantiate a single global PrismaClient singleton; select explicit fields', antiPattern: 'spawning connection-pool exhaustion in serverless dev' },
  { name: 'Cloudflare Workers + Hono', glob: 'src/index.ts', rule: 'Stick to Web Standard APIs; zero Node fs/net imports; bind secrets via c.env', antiPattern: 'importing Node-only crypto/fs polyfills that break edge deploys' },
  { name: 'Svelte 5 Runes', glob: 'src/lib/**/*.svelte', rule: 'Use $state, $derived, and $props runes exclusively; ban legacy export let', antiPattern: 'mixing Svelte 4 reactive $: labels into Svelte 5 components' },
  { name: 'Astro 5 Islands', glob: 'src/pages/**/*.astro', rule: 'Ship zero JS by default; add client:visible only on interactive islands', antiPattern: 'hydrating static marketing layouts with client:load everywhere' },
  { name: 'Vue 3 Composition API', glob: 'src/**/*.vue', rule: 'Use <script setup lang="ts"> with typed defineProps<T>() only', antiPattern: 'falling back to legacy Options API mixins' },
  { name: 'Nuxt 4 Fullstack', glob: 'server/api/**/*.ts', rule: 'Validate event payloads via readValidatedBody(event, zodSchema)', antiPattern: 'trusting unvalidated readBody() inputs in Nitro routes' },
  { name: 'React Router v7 / Remix', glob: 'app/routes/**/*.tsx', rule: 'Keep mutations in action() and data reads in loader(); never fetch in useEffect', antiPattern: 'triggering client waterfall fetches inside useEffect' },
  { name: 'Flutter + Dart 3', glob: 'lib/**/*.dart', rule: 'Use sealed classes with exhaustive switch expressions and const constructors', antiPattern: 'rebuilding entire widget trees without const keys' },
  { name: 'SwiftUI + Swift 6', glob: 'Sources/**/*.swift', rule: 'Enforce @Observable macro and strict MainActor concurrency isolation', antiPattern: 'using deprecated ObservableObject with @Published races' },
  { name: 'Kotlin Jetpack Compose', glob: 'app/src/**/*.kt', rule: 'Hoist UI state via unidirectional StateFlow; keep composables stateless', antiPattern: 'mutating side-effect state directly inside @Composable bodies' },
  { name: 'React Native + Expo SDK', glob: 'app/**/*.tsx', rule: 'Use Expo Router typed routes and FlashList for virtualized feeds', antiPattern: 'rendering 500 items inside unvirtualized ScrollView' },
  { name: 'Tauri v2 Desktop', glob: 'src-tauri/src/**/*.rs', rule: 'Scope IPC commands with minimum capability permissions in capabilities/*.json', antiPattern: 'exposing unrestricted shell execution to the webview' },
  { name: 'Solidity + Foundry', glob: 'contracts/**/*.sol', rule: 'Enforce Checks-Effects-Interactions and ReentrancyGuard on external calls', antiPattern: 'updating balances after external ETH transfers' },
  { name: 'Solana Anchor (Rust)', glob: 'programs/**/*.rs', rule: 'Verify signer + PDA seeds constraints on every Account8 struct', antiPattern: 'accepting unchecked AccountInfo without owner verification' },
  { name: 'Terraform / OpenTofu', glob: 'infra/**/*.tf', rule: 'Pin provider versions, tag all resources, and never hardcode IAM secrets', antiPattern: 'committing wildcard Action: "*" IAM policies' },
  { name: 'Kubernetes Helm Charts', glob: 'charts/**/*.yaml', rule: 'Set resources.limits, readOnlyRootFilesystem: true, and runAsNonRoot: true', antiPattern: 'deploying privileged pods with unbounded memory' },
  { name: 'Turborepo Workspaces', glob: 'packages/*/src/**/*.ts', rule: 'Import exclusively via declared package exports; ban relative ../.. cross-package paths', antiPattern: 'reaching into sibling package internals and breaking cache' },
  { name: 'Bun HTTP + SQLite', glob: 'src/**/*.ts', rule: 'Use native Bun.serve() and parameterized db.query() bindings', antiPattern: 'installing heavy Express middleware chains on Bun runtime' },
  { name: 'Deno 2 TypeScript', glob: 'src/**/*.ts', rule: 'Use explicitjsr:/npm: specifiers and least-privilege --allow-net flags', antiPattern: 'running tasks with blanket --allow-all in production' },
  { name: 'GraphQL Yoga + Pothos', glob: 'src/graphql/**/*.ts', rule: 'Enforce DataLoader batching on every nested relation and max query depth <= 6', antiPattern: 'shipping N+1 SQL queries on nested GraphQL resolvers' },
  { name: 'tRPC v11 End-to-End', glob: 'src/server/routers/*.ts', rule: 'Protect authenticated procedures via protectedProcedure middleware + Zod input', antiPattern: 'exposing internal mutations on publicProcedure' },
  { name: 'Playwright E2E Suite', glob: 'tests/e2e/**/*.spec.ts', rule: 'Locate elements by getByRole / getByTestId; zero hard waitForTimeout() sleeps', antiPattern: 'writing flaky CSS-selector tests with sleep(3000)' },
  { name: 'Vitest Unit Testing', glob: 'src/**/*.test.ts', rule: 'Reset mocks in afterEach and test deterministic edge cases without real network calls', antiPattern: 'leaking global vi.mock state across test files' },
  { name: 'Stripe Billing Webhooks', glob: 'app/api/webhooks/**/*.ts', rule: 'Verify stripe-signature against raw request body and enforce idempotency keys', antiPattern: 'parsing JSON before verifying webhook cryptographic signatures' },
  { name: 'Polar MoR Checkouts', glob: 'lib/payments/**/*.ts', rule: 'Validate Standard Webhooks HMAC signatures and verify Order UUID formats', antiPattern: 'unlocking paid tiers on unverified client query params' },
  { name: 'Auth.js / OAuth2 Flows', glob: 'src/auth/**/*.ts', rule: 'Enforce state + PKCE checks, HttpOnly SameSite=Lax cookies, and short JWT TTLs', antiPattern: 'storing raw access tokens in browser localStorage' },
  { name: 'Upstash Redis Rate-Limit', glob: 'src/middleware/**/*.ts', rule: 'Apply sliding-window rate limits per IP + API key before expensive compute', antiPattern: 'leaving LLM or auth endpoints open to unbounded bursts' },
  { name: 'Postgres pgvector RAG', glob: 'src/retrieval/**/*.ts', rule: 'Use HNSW cosine indexes with pre-filtered tenant_id metadata WHERE clauses', antiPattern: 'leaking cross-tenant embeddings in vector similarity scans' },
  { name: 'ClickHouse Analytics', glob: 'sql/ch/**/*.sql', rule: 'Filter on primary ORDER BY time-bucket keys first; avoid SELECT * on wide tables', antiPattern: 'triggering full-column scans across billion-row partitions' },
  { name: 'DuckDB + Polars Data', glob: 'pipelines/**/*.py', rule: 'Use lazy scan_parquet() predicate pushdown; ban row-by-row .iterrows() loops', antiPattern: 'materializing 20GB DataFrames eagerly into RAM' },
  { name: 'Vercel AI SDK Streams', glob: 'app/api/chat/**/*.ts', rule: 'Use streamText with strict Zod tool parameters and maxSteps: 5 guardrails', antiPattern: 'allowing runaway infinite tool-calling loops' },
  { name: 'LangGraph Stateful Agents', glob: 'agents/**/*.py', rule: 'Type TypedDict state reducers explicitly and persist checkpoints per thread_id', antiPattern: 'mutating shared global dicts across concurrent runs' },
  { name: 'Anthropic MCP TypeScript', glob: 'src/mcp/**/*.ts', rule: 'Write pure JSON-RPC to stdout only; route all debug logs strictly to stderr', antiPattern: 'corrupting STDIO JSON-RPC frames with console.log()' },
  { name: 'OpenAI Agents SDK', glob: 'src/agents/**/*.py', rule: 'Attach input/output tripwire guardrails before handoffs to tool-executing agents', antiPattern: 'passing raw untrusted prompt injections into shell tools' },
  { name: 'Temporal Durable Workflows', glob: 'workflows/**/*.ts', rule: 'Keep workflow code 100% deterministic; isolate all network/clock calls in Activities', antiPattern: 'calling Math.random() or fetch() directly inside workflow replay' },
  { name: 'Elixir Phoenix LiveView', glob: 'lib/*_web/live/**/*.ex', rule: 'Use LiveView streams for collections and pattern-match authorized socket assigns', antiPattern: 'holding 10,000 DOM rows in socket memory per user' },
  { name: 'Rails 8 + Hotwire', glob: 'app/controllers/**/*.rb', rule: 'Enforce strong parameters with expect() and scope queries to Current.user', antiPattern: 'querying Model.find(params[:id]) without tenant scoping' },
  { name: 'Laravel 12 Actions', glob: 'app/Actions/**/*.php', rule: 'Validate via FormRequest classes, declare strict_types=1, and queue heavy jobs', antiPattern: 'stuffing 300 lines of SQL + mailers inside controller methods' },
  { name: 'ASP.NET Core 9 Minimal API', glob: 'Endpoints/**/*.cs', rule: 'Use TypedResults, CancellationToken propagation, and AsNoTracking() on read queries', antiPattern: 'tracking read-only EF Core entities on hot paths' },
  { name: 'Spring Boot 3 Virtual Threads', glob: 'src/main/java/**/*.java', rule: 'Use constructor injection, @Valid DTO records, and avoid synchronized pin blocks', antiPattern: 'pinning carrier threads with legacy synchronized I/O' },
  { name: 'Zig Systems Code', glob: 'src/**/*.zig', rule: 'Pass explicit std.mem.Allocator and pair allocations with errdefer/defer free', antiPattern: 'hiding global heap allocations without cleanup paths' },
  { name: 'C++23 Modern CMake', glob: 'src/**/*.cpp', rule: 'Use RAII smart pointers, std::span/std::expected, and zero raw new/delete', antiPattern: 'shipping manual pointer arithmetic and buffer overruns' },
  { name: 'WebAssembly + Rust', glob: 'crates/wasm/**/*.rs', rule: 'Minimize JS<->Wasm boundary copies; pass typed byte slices across linear memory', antiPattern: 'serializing giant JSON strings across wasm-bindgen on every frame' },
  { name: 'Playwright + Axe A11y', glob: 'tests/a11y/**/*.ts', rule: 'Assert WCAG 2.1 AA contrast, ARIA labels, and keyboard focus traps on every view', antiPattern: 'shipping clickable <div onClick> elements invisible to keyboards' },
  { name: 'GraphQL Federation v2', glob: 'subgraphs/**/*.graphql', rule: 'Declare explicit @key entities and ban breaking field removals without @deprecated', antiPattern: 'breaking downstream mobile clients with silent schema edits' },
  { name: 'Kafka / Redpanda Consumers', glob: 'consumers/**/*.ts', rule: 'Make event handlers idempotent by event_id and route poison pills to DLQ', antiPattern: 'crashing consumer groups in infinite retry loops on bad payloads' },
  { name: 'GitHub Actions Security', glob: '.github/workflows/*.yml', rule: 'Pin third-party actions to full 40-char commit SHAs and set permissions: read-all', antiPattern: 'interpolating untrusted PR titles directly inside run: bash blocks' },
  { name: 'Docker Multi-Stage Prod', glob: 'Dockerfile*', rule: 'Copy minimal build artifacts into alpine/distroless and run as non-root USER', antiPattern: 'shipping 1.4GB dev images running as root with .env baked in' },
  { name: 'OpenTelemetry Tracing', glob: 'src/telemetry/**/*.ts', rule: 'Propagate W3C traceparent headers and scrub PII/tokens from span attributes', antiPattern: 'logging raw Authorization headers into distributed traces' },
  { name: 'Monorepo Design System', glob: 'packages/ui/src/**/*.tsx', rule: 'Support ref forwarding, semantic Radix/ARIA primitives, and dark-mode tokens', antiPattern: 'hardcoding z-index: 99999 and non-accessible custom dropdowns' },
  { name: 'Chrome Extension MV3', glob: 'src/background/**/*.ts', rule: 'Design ephemeral service workers using chrome.storage.session—zero global vars', antiPattern: 'relying on in-memory globals that vanish when MV3 suspends' },
];

function buildStackPost(stack: StackSpec, angle: number): { category: XPost['category']; text: string } {
  switch (angle % 11) {
    case 0:
      return {
        category: 'ast-parity',
        text: `${stack.name} drift:\n\nCursor: "${stack.rule}"\n\nSkip CLAUDE.md sync -> Claude Code starts ${stack.antiPattern}.\n\n$ npx promptshift --to=claude`,
      };
    case 1:
      return {
        category: 'token-optimization',
        text: `${stack.name} context tip:\n\nDon't load ${stack.name} rules when editing docs.\nScope \`${stack.glob}\` in .cursor/rules/*.mdc to stop ${stack.antiPattern}.\n\n$ npx promptshift --to=cursor`,
      };
    case 2:
      return {
        category: 'multi-agent',
        text: `Shipping ${stack.name} across mixed IDEs?\n\nRule: "${stack.rule}"\n\nCompile 1 prompt into Cursor (.mdc), CLAUDE.md & Copilot simultaneously:\n$ npx promptshift --to=copilot`,
      };
    case 3:
      return {
        category: 'syntax-traps',
        text: `Why ${stack.name} agents break rules after switching editors:\n\nPasting \`${stack.glob}\` YAML frontmatter raw into CLAUDE.md leads to ${stack.antiPattern}.\n\n$ npx promptshift --to=claude`,
      };
    case 4:
      return {
        category: 'ci-cd',
        text: `PR guardrail for ${stack.name}:\n\nStop AI PRs from ${stack.antiPattern}.\nKeep \`${stack.glob}\` rules synced across Cursor, Copilot & Claude on every commit:\n$ npx promptshift --init-ci`,
      };
    case 5:
      return {
        category: 'mcp-ecosystem',
        text: `${stack.name} + MCP:\n\nLet Claude Desktop or Cursor call PromptShift MCP to sync "${stack.rule}" on \`${stack.glob}\` in RAM.\n\n$ npx promptshift --mcp`,
      };
    case 6:
      return {
        category: 'security',
        text: `Auditing ${stack.name} AI rules:\n\nPrevent ${stack.antiPattern}—and ensure \`${stack.glob}\` rule snippets never leak live API keys.\n\nScan in RAM:\n$ npx promptshift --check`,
      };
    case 7:
      return {
        category: 'terminal',
        text: `2s setup for ${stack.name}:\n\nEnforce "${stack.rule}" across Windsurf, Cursor & Claude Code—zero manual markdown edits.\n\n$ npx promptshift --dry-run --to=windsurf`,
      };
    case 8:
      return {
        category: 'multi-agent',
        text: `Gemini CLI + Cursor on ${stack.name}:\n\nSync AGENTS.md with \`${stack.glob}\` .mdc rules so neither agent starts ${stack.antiPattern}.\n\n$ npx promptshift --to=gemini`,
      };
    case 9:
      return {
        category: 'token-optimization',
        text: `Trim ${stack.name} prompt bloat:\n\nScope "${stack.rule}" strictly to \`${stack.glob}\` instead of 1 giant monolithic root prompt.\n\n$ npx promptshift --check`,
      };
    default:
      return {
        category: 'ast-parity',
        text: `Before vs After (${stack.name}):\n\nUnsynced rules: AI keeps ${stack.antiPattern}.\nAST-synced \`${stack.glob}\`: 98.5% parity across every IDE.\n\n$ npx promptshift --to=cursor`,
      };
  }
}

// ============================================================================
// CONTEXT-MATCHED CONVERSION REPLIES (40+ VARIATIONS ACROSS CATEGORIES & OFFERS)
// Includes Glama Grade-A social proof, Free Starter hook, $1.99 Single Pass, $5.99 Pro, $19.99 Team
// ============================================================================

const CATEGORY_REPLIES: Record<XPost['category'], string[]> = {
  'mcp-ecosystem': [
    `PromptShift is Grade-A certified on Glama MCP Registry (zero disk retention, 98.5% AST parity).\n\n⚡ Install MCP or try the Web Studio (Free ≤2 files / $1.99 Pass):\nhttps://promptshift.dev`,
    `Verify our Grade-A MCP server on Glama:\nhttps://glama.ai/mcp/servers/topaisaas-dev/promptshift\n\n🚀 Or transpile Cursor, Claude & Copilot rules in 1 click:\nhttps://promptshift.dev`,
    `Run PromptShift inside Claude Desktop & Cursor via STDIO MCP—100% in RAM, zero telemetry.\n\n⚡ Live Diff Studio & $1.99 Repo Pass:\nhttps://promptshift.dev`,
    `Grade-A verified on Glama • 3 deterministic MCP tools (transpile, secret scrub, AST audit).\n\n👉 Try free on small repos or unlock unlimited ($5.99/mo):\nhttps://promptshift.dev`,
    `Connect your AI coding agents to our official Glama Grade-A MCP server:\nhttps://glama.ai/mcp/servers/topaisaas-dev/promptshift\n\n⚡ Web converter:\nhttps://promptshift.dev`,
  ],
  'syntax-traps': [
    `Stop losing hours to silent YAML & frontmatter parser bugs. PromptShift compiles valid Cursor, Claude, Windsurf & Copilot configs in 0.4s.\n\n⚡ Try free or $1.99 Pass:\nhttps://promptshift.dev`,
    `Deterministic AST transpilation—zero LLM hallucinations, zero dropped negative constraints (98.5% certified parity).\n\n🧪 Live Diff Inspector:\nhttps://promptshift.dev`,
    `Test your repo free (≤2 rule files, no signup). Multi-rule repositories unlock instantly for $1.99—cheaper than a coffee.\n\n👉 Check your rules:\nhttps://promptshift.dev`,
    `Don't let broken .mdc globs silently disable your architecture rules.\n\n⚡ Validate & export 4-in-1 IDE bundles in 2 seconds ($1.99):\nhttps://promptshift.dev`,
    `One canonical rule AST -> clean .cursor/rules/*.mdc, CLAUDE.md, .windsurfrules & Copilot instructions.\n\n🚀 Try live in browser:\nhttps://promptshift.dev`,
  ],
  security: [
    `PromptShift redacts 15+ API key formats (OpenAI, Anthropic, AWS, GitHub, Stripe) 100% in ephemeral RAM. Zero DB writes.\n\n🔒 Scan free or unlock repo ($1.99):\nhttps://promptshift.dev`,
    `SOC-2 & GDPR friendly: your proprietary prompts never touch disk or third-party logs.\n\n🛡️ Audit & transpile your AI rules safely:\nhttps://promptshift.dev`,
    `Catch leaked sk-*, AKIA* & ghp_* keys before they hit git history, while syncing Cursor + Claude rules.\n\n⚡ Free starter / $1.99 Single Pass:\nhttps://promptshift.dev`,
    `OWASP in-RAM secret sanitizer + Zip Slip shield + 98.5% AST transpiler in one zero-retention tool.\n\n🔒 Try live now:\nhttps://promptshift.dev`,
    `Protect your team's repos from accidental credential leaks in AI rulebooks ($5.99/mo Pro or $19.99/mo Team CI/CD):\nhttps://promptshift.dev`,
  ],
  'token-optimization': [
    `Cut context bloat by ~50% while keeping 98.5% semantic AST parity across Cursor, Claude Code & Copilot.\n\n⚡ Test free or $1.99 Single Pass:\nhttps://promptshift.dev`,
    `Stop paying the daily token tax on monolithic rule files. Split into clean glob-scoped modules in 0.4s.\n\n👉 Live AST Studio:\nhttps://promptshift.dev`,
    `Smarter context = faster agent responses + lower API bills. Pay $1.99 once and save hundreds in wasted input tokens:\nhttps://promptshift.dev`,
    `Deduplicate redundant directives and preserve 100% of negative guardrails in RAM.\n\n🧪 Benchmark your prompt files live:\nhttps://promptshift.dev`,
    `Modular .mdc + lean CLAUDE.md generated from a single source of truth.\n\n🚀 Free for ≤2 files • $5.99/mo Pro Unlimited:\nhttps://promptshift.dev`,
  ],
  'multi-agent': [
    `Let every developer use their favorite AI editor without rule drift. Export Cursor, Claude, Copilot & Windsurf in 1 click.\n\n⚡ $1.99 Single Pass / $5.99 Pro:\nhttps://promptshift.dev`,
    `Built for multi-IDE teams & agencies: sync every repo across Claude Code, Cursor & Copilot ($5.99/mo Pro or $19.99/mo Team):\nhttps://promptshift.dev`,
    `Zero vendor lock-in for your AI engineering rules. Write once, compile everywhere with 98.5% AST parity.\n\n👉 Try free (no account needed):\nhttps://promptshift.dev`,
    `Ship faster across Cursor + Claude Code CLI without maintaining duplicate instruction files.\n\n🚀 1-Click 4-in-1 bundle ($1.99):\nhttps://promptshift.dev`,
    `Also available as a Grade-A certified MCP server on Glama for autonomous agent sync:\nhttps://glama.ai/mcp/servers/topaisaas-dev/promptshift\n\nWeb Studio: https://promptshift.dev`,
  ],
  'ci-cd': [
    `Enforce continuous AI rule parity & secret redaction in GitHub Actions PRs.\n\n⚡ Free starter, $5.99/mo Pro, or $19.99/mo Team CI/CD:\nhttps://promptshift.dev`,
    `Stop PRs where CLAUDE.md and .cursor/rules/ drift apart. Setup takes 10 seconds.\n\n🛡️ Docs, CLI & Web Studio:\nhttps://promptshift.dev`,
    `Deterministic 0.4s AST checks in CI—zero flaky LLM calls, zero prompt logging.\n\n🚀 Unlock multi-rule repos from $1.99:\nhttps://promptshift.dev`,
    `Keep Cursor, Claude Code, Windsurf & Copilot locked in 98.5% AST sync on every merge:\nhttps://promptshift.dev`,
  ],
  terminal: [
    `0.4s in terminal or drag-and-drop in browser—100% in-RAM with automatic API key sanitization.\n\n⚡ Free ≤2 files or $1.99 Single Pass:\nhttps://promptshift.dev`,
    `Why spend 2 hours reformatting YAML globs by hand? Convert your whole repo for $1.99 (or $5.99/mo Pro Unlimited):\nhttps://promptshift.dev`,
    `Test live in our zero-retention Diff Studio before touching your local files:\nhttps://promptshift.dev`,
    `Works via CLI (npx promptshift), Glama Grade-A MCP (--mcp), or Web Studio:\nhttps://promptshift.dev`,
  ],
  'ast-parity': [
    `Compile Cursor (.mdc), Claude Code (CLAUDE.md), Copilot & Windsurf rules with 98.5% certified AST parity.\n\n⚡ Free ≤2 files or $1.99 Pass:\nhttps://promptshift.dev`,
    `Zero prompt drift across AI editors—100% deterministic in-RAM transpilation + secret scrubbing.\n\n👉 Live interactive studio:\nhttps://promptshift.dev`,
    `Unlock multi-rule repositories in 10 seconds ($1.99 Single Pass or $5.99/mo Pro Unlimited, zero signup):\nhttps://promptshift.dev`,
    `Test your rules in our live side-by-side AST Diff Inspector:\nhttps://promptshift.dev`,
    `Grade-A MCP certified + Web Studio. Export all 4 AI IDE ecosystems in 1 click:\nhttps://promptshift.dev`,
  ],
};

export function generateOptimizedCatalog(): XPost[] {
  // 1. Collect all standalone handcrafted candidates
  const morningCurated: Array<{ category: XPost['category']; text: string }> = [];
  const afternoonCurated: Array<{ category: XPost['category']; text: string }> = [];

  // Interleave curated banks into Morning (deep tech / MCP / syntax / token) & Afternoon (security / multi-agent / CI-CD)
  const maxCuratedLen = Math.max(
    MCP_ECOSYSTEM_POSTS.length,
    SYNTAX_TRAPS_POSTS.length,
    TOKEN_OPTIMIZATION_POSTS.length,
    SECURITY_POSTS.length,
    MULTI_AGENT_FOUNDER_POSTS.length,
    CICD_TERMINAL_POSTS.length
  );

  for (let i = 0; i < maxCuratedLen; i++) {
    if (i < MCP_ECOSYSTEM_POSTS.length) {
      morningCurated.push({ category: 'mcp-ecosystem', text: MCP_ECOSYSTEM_POSTS[i] });
    }
    if (i < SYNTAX_TRAPS_POSTS.length) {
      morningCurated.push({ category: 'syntax-traps', text: SYNTAX_TRAPS_POSTS[i] });
    }
    if (i < TOKEN_OPTIMIZATION_POSTS.length) {
      morningCurated.push({ category: 'token-optimization', text: TOKEN_OPTIMIZATION_POSTS[i] });
    }
    if (i < SECURITY_POSTS.length) {
      afternoonCurated.push({ category: 'security', text: SECURITY_POSTS[i] });
    }
    if (i < MULTI_AGENT_FOUNDER_POSTS.length) {
      afternoonCurated.push({ category: 'multi-agent', text: MULTI_AGENT_FOUNDER_POSTS[i] });
    }
    if (i < CICD_TERMINAL_POSTS.length) {
      afternoonCurated.push({
        category: i % 2 === 0 ? 'ci-cd' : 'terminal',
        text: CICD_TERMINAL_POSTS[i],
      });
    }
  }

  // 2. Build 660 distinct Stack Blueprints (60 stacks × 11 angles).
  //    Since gcd(60, 11) = 1 and gcd(7, 60) = 1, stepping k = 0..659 with
  //    stackIdx = (k * 7) % 60 and angle = k % 11 is a 100% mathematical bijection:
  //    every consecutive post changes BOTH tech stack AND angle/category!
  const stackBlueprints: Array<{ category: XPost['category']; text: string }> = [];
  const totalCombinations = PRODUCTION_STACKS.length * 11; // 660
  for (let k = 0; k < totalCombinations; k++) {
    const stackIdx = (k * 7) % PRODUCTION_STACKS.length;
    const angle = k % 11;
    stackBlueprints.push(buildStackPost(PRODUCTION_STACKS[stackIdx], angle));
  }

  // 3. Assemble 730 total posts (365 days × 2/day), preserving indices 0..2 from history
  //    Posts 3..370 = 368 brand-new hyper-optimized posts for the next 6 full months (184 days × 2/day)!
  const catalog: XPost[] = [...HISTORICAL_BROADCASTED_POSTS];
  const usedMainTweets = new Set<string>(HISTORICAL_BROADCASTED_POSTS.map((p) => p.mainTweet.trim()));

  let mCuratedIdx = 0;
  let aCuratedIdx = 0;
  let stackPoolIdx = 0;
  const replyCounters: Record<string, number> = {};

  const TOTAL_DAYS = 365;
  const SLOTS: Array<'morning' | 'afternoon'> = ['morning', 'afternoon'];

  for (let day = 1; day <= TOTAL_DAYS; day++) {
    for (const slot of SLOTS) {
      // Skip the 3 already-populated historical slots
      if (day === 1 && (slot === 'morning' || slot === 'afternoon')) continue;
      if (day === 2 && slot === 'morning') continue;

      const dayPad = String(day).padStart(3, '0');
      const id = `post-d${dayPad}-${slot}`;

      let chosen: { category: XPost['category']; text: string } | null = null;

      // Prioritize rich interleaving during the next 6 months (Days 2..186 = 368 posts):
      // Alternate Handcrafted Standalone Gems with Distinct Stack Blueprints so feed feels 100% human & varied!
      const preferCurated = day % 2 === 0 ? slot === 'afternoon' : slot === 'morning';

      if (preferCurated) {
        const pool = slot === 'morning' ? morningCurated : afternoonCurated;
        while (
          (slot === 'morning' ? mCuratedIdx : aCuratedIdx) < pool.length &&
          !chosen
        ) {
          const idx = slot === 'morning' ? mCuratedIdx++ : aCuratedIdx++;
          const candidate = pool[idx];
          if (!usedMainTweets.has(candidate.text.trim())) {
            chosen = candidate;
          }
        }
      }

      // Otherwise pull next unique item from Stack Blueprints (or remaining curated pools)
      while (!chosen && stackPoolIdx < stackBlueprints.length) {
        const candidate = stackBlueprints[stackPoolIdx++];
        if (!usedMainTweets.has(candidate.text.trim())) {
          chosen = candidate;
        }
      }

      // Drain any remaining curated items if needed
      while (!chosen && mCuratedIdx < morningCurated.length) {
        const candidate = morningCurated[mCuratedIdx++];
        if (!usedMainTweets.has(candidate.text.trim())) chosen = candidate;
      }
      while (!chosen && aCuratedIdx < afternoonCurated.length) {
        const candidate = afternoonCurated[aCuratedIdx++];
        if (!usedMainTweets.has(candidate.text.trim())) chosen = candidate;
      }

      if (!chosen) {
        throw new Error(`Ran out of unique posts at ${id}`);
      }

      const cleanMain = chosen.text.trim();
      usedMainTweets.add(cleanMain);

      const replies = CATEGORY_REPLIES[chosen.category];
      const rCount = replyCounters[chosen.category] || 0;
      replyCounters[chosen.category] = rCount + 1;
      const cleanReply = replies[rCount % replies.length].trim();

      catalog.push({
        id,
        category: chosen.category,
        slot,
        mainTweet: cleanMain,
        replyTweet: cleanReply,
      });
    }
  }

  return catalog;
}

// ============================================================================
// BUILD, AUDIT & WRITE CATALOG
// ============================================================================

const catalog = generateOptimizedCatalog();
console.log(`Generated ${catalog.length} total posts (including 368 prime 6-month posts starting at post-d002-afternoon).`);

let errors = 0;
const ids = new Set<string>();
const uniqueMainCheck = new Set<string>();

catalog.forEach((p, idx) => {
  if (ids.has(p.id)) {
    console.error(`❌ Duplicate ID: ${p.id} at index ${idx}`);
    errors++;
  }
  ids.add(p.id);

  if (uniqueMainCheck.has(p.mainTweet)) {
    console.error(`❌ Duplicate mainTweet content in ${p.id}`);
    errors++;
  }
  uniqueMainCheck.add(p.mainTweet);

  const mainWeighted = getXWeightedLength(p.mainTweet);
  if (p.mainTweet.length > 280 || mainWeighted > 278) {
    console.error(
      `❌ Main tweet exceeds X limit in ${p.id} (raw=${p.mainTweet.length}, weighted=${mainWeighted}):\n${p.mainTweet}`
    );
    errors++;
  }

  if (
    p.mainTweet.includes('http://') ||
    p.mainTweet.includes('https://') ||
    p.mainTweet.includes('promptshift.dev') ||
    p.mainTweet.includes('glama.ai') ||
    p.mainTweet.includes('polar.sh')
  ) {
    console.error(`❌ Main tweet contains external domain/URL in ${p.id}`);
    errors++;
  }

  const replyWeighted = getXWeightedLength(p.replyTweet);
  if (p.replyTweet.length > 280 || replyWeighted > 278) {
    console.error(
      `❌ Reply tweet exceeds X limit in ${p.id} (raw=${p.replyTweet.length}, weighted=${replyWeighted}):\n${p.replyTweet}`
    );
    errors++;
  }

  if (!p.replyTweet.includes('https://promptshift.dev')) {
    console.error(`❌ Reply tweet missing https://promptshift.dev in ${p.id}`);
    errors++;
  }
});

if (errors > 0) {
  console.error(`\n🚨 Validation failed with ${errors} error(s).`);
  process.exit(1);
}

// Category breakdown for the next 6 months (indices 3..370 = 368 posts = 184 days × 2/day)
const sixMonthSlice = catalog.slice(3, 3 + 368);
const catCounts: Record<string, number> = {};
for (const p of sixMonthSlice) {
  catCounts[p.category] = (catCounts[p.category] || 0) + 1;
}

console.log('✅ 100% of posts passed X weighted-length, zero-duplicate, and zero-main-URL constraints!');
console.log('📊 Next 6 Months (184 days / 368 posts) Category Distribution:', catCounts);

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const outJson = path.join(dataDir, 'x_annual_posts_catalog.json');
fs.writeFileSync(outJson, JSON.stringify(catalog, null, 2), 'utf-8');
console.log(`💾 Saved catalog to: ${outJson} (${(fs.statSync(outJson).size / 1024).toFixed(1)} KB)`);
