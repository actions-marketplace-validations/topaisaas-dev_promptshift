import * as fs from 'fs';
import * as path from 'path';

export interface XPost {
  id: string;
  category: 'ast-parity' | 'security' | 'ci-cd' | 'multi-agent' | 'terminal' | 'token-optimization';
  mainTweet: string;
  replyTweet: string;
}

// 1. Core Frameworks & Languages Matrix
const STACKS = [
  { name: 'Next.js 15 App Router', file: 'app/actions/**/*.ts', directive: 'Enforce Server Actions with Zod validation', source: 'cursor', target: 'claude' },
  { name: 'FastAPI & Pydantic v2', file: 'app/api/**/*.py', directive: 'All endpoints must be 100% async with Dependency Injection', source: 'claude', target: 'cursor' },
  { name: 'Rust & Cargo Clippy', file: 'src/**/*.rs', directive: 'Deny unsafe code and enforce strict lifetime annotations', source: 'cursor', target: 'claude' },
  { name: 'Tailwind CSS v4', file: 'styles/**/*.css', directive: 'Minimize arbitrary values and use clean utility composition', source: 'windsurf', target: 'cursor' },
  { name: 'Go Microservices', file: 'internal/**/*.go', directive: 'Handle errors explicitly and avoid global mutable state', source: 'cursor', target: 'claude' },
  { name: 'TypeScript Strict', file: 'src/**/*.ts', directive: 'Zero tolerance for any type, enforce exhaustive switch matching', source: 'claude', target: 'cursor' },
  { name: 'Python uv & ruff', file: 'src/**/*.py', directive: 'Prohibit pip install, enforce uv and ruff for formatting', source: 'cursor', target: 'windsurf' },
  { name: 'Flutter & Dart 3', file: 'lib/**/*.dart', directive: 'Use pattern matching and immutable state models', source: 'claude', target: 'cursor' },
  { name: 'React 19 Server Components', file: 'components/**/*.tsx', directive: 'Never pass server secrets to client components', source: 'cursor', target: 'claude' },
  { name: 'Multi-Agent Swarm', file: 'agents/**/*.ts', directive: 'Enforce non-blocking subagent delegation with audit headers', source: 'gemini', target: 'cursor' },
  { name: 'Turborepo Monorepo', file: 'packages/*/**/*.ts', directive: 'Enforce boundary imports and clean dependency trees', source: 'cursor', target: 'claude' },
  { name: 'LangChain & LlamaIndex', file: 'pipelines/**/*.py', directive: 'Strict vector retrieval chunking and metadata filtering', source: 'openai', target: 'claude' },
];

// 2. Syntax Traps & AST divergence topics
const SYNTAX_TOPICS = [
  {
    hook: "Why Cursor rules break Claude Code:",
    problem: "Cursor expects YAML frontmatter with globs. Claude Code expects pure Markdown. Nested YAML makes Claude ignore half your rules.",
    cmd: "$ npx promptshift --source cursor --target claude"
  },
  {
    hook: "Copying CLAUDE.md into .cursorrules?",
    problem: "Monolithic CLAUDE.md files burn your context window. Cursor needs modular .mdc files with scoped file globs.",
    cmd: "$ npx promptshift --source claude --target cursor"
  },
  {
    hook: "Windsurf Cascade vs Cursor Rules:",
    problem: ".windsurfrules and .cursorrules use incompatible directive headers. Switching editors without AST transpilation breaks agent flow.",
    cmd: "$ npx promptshift --source windsurf --target cursor"
  },
  {
    hook: "GitHub Copilot vs Claude Code rules:",
    problem: "Copilot reads .github/copilot-instructions.md. Claude reads CLAUDE.md. When out of sync, your team gets two divergent code styles.",
    cmd: "$ npx promptshift --to=copilot"
  },
  {
    hook: "Why raw LLMs fail at prompt conversion:",
    problem: "LLMs hallucinate YAML frontmatter keys and drop negative constraints. Deterministic AST parsing preserves 100% of instruction hierarchy.",
    cmd: "$ npx promptshift"
  },
  {
    hook: "The silent killer of AI agent rules:",
    problem: "Invalid YAML indentation in .cursor/rules/*.mdc causes Cursor to silently ignore the entire file. No error log, just ignored rules.",
    cmd: "$ npx promptshift --verify"
  },
  {
    hook: "Negative constraints getting dropped:",
    problem: "'Never use any' and 'Always use Server Actions' get dropped first when copying prompts between tools. Keep your guardrails intact.",
    cmd: "$ npx promptshift"
  },
  {
    hook: "Monolithic prompts are burning your cash:",
    problem: "Loading 800 lines of guidelines on EVERY prompt wastes 20% of your context. Modularize into scoped globs in seconds.",
    cmd: "$ npx promptshift --to=cursor"
  },
  {
    hook: "Moving from Custom GPTs to Claude Projects:",
    problem: "Extracting OpenAI system prompts and tool action schemas into Claude Project Knowledge takes hours by hand.",
    cmd: "$ npx promptshift --source openai --target claude"
  },
  {
    hook: "Google Antigravity to Cursor migration:",
    problem: "Your agent directives live in GEMINI.md and AGENTS.md. Transpile them directly into Cursor rulebooks without prompt drift.",
    cmd: "$ npx promptshift --source gemini --target cursor"
  }
];

// 3. Security & In-RAM privacy topics
const SECURITY_TOPICS = [
  {
    hook: "Security PSA for AI developers:",
    fact: "1 out of 8 public AI config files on GitHub leaks an active API key (sk-*, sk-ant-*, AKIA*, ghp_*).",
    solution: "Sanitize all secrets in memory before pushing:\n$ npx promptshift --sanitize-secrets"
  },
  {
    hook: "Why PromptShift stores 0 server logs:",
    fact: "Most online converters save your code to a database. PromptShift operates 100% in ephemeral RAM. When the request ends, memory is wiped.",
    solution: "Verify our sovereign architecture:\n$ npx promptshift --verify"
  },
  {
    hook: "Zip Slip directory traversal in AI rule packs:",
    fact: "Third-party Cursor rules ZIPs can contain malicious ../../ path traversals. PromptShift sanitizes all archive headers in-RAM.",
    solution: "Stay safe:\n$ npx promptshift"
  },
  {
    hook: "Binary magic byte protection:",
    fact: "AI coding rules should only contain markdown and text. PromptShift blocks Windows PE, ELF, and Mach-O executables in-RAM.",
    solution: "Clean configs only:\n$ npx promptshift"
  },
  {
    hook: "Stripe live keys leaked in prompt examples:",
    fact: "Developers often paste mock API calls into .cursorrules containing real sk_live_* tokens. PromptShift masks 15 key formats automatically.",
    solution: "Shield your keys:\n$ npx promptshift --sanitize-secrets"
  },
  {
    hook: "GDPR Article 28 & SOC-2 compliance:",
    fact: "Your enterprise dev team cannot use tools that store prompts on third-party servers. PromptShift has 0 disk writes and 0 retention.",
    solution: "Enterprise ready:\n$ npx promptshift"
  },
  {
    hook: "Catch leaked keys in CI/CD before git merge:",
    fact: "Add PromptShift with --dry-run to your pull request checks. Fails the build immediately if an unmasked secret is detected.",
    solution: "Automate in CI:\n$ npx promptshift --init-ci"
  },
  {
    hook: "No cookies, no tracking, pure developer utility:",
    fact: "Zero tracking cookies, zero ad pixels. Just a sub-50ms deterministic transpiler for modern AI coding assistants.",
    solution: "Try it in terminal:\n$ npx promptshift"
  }
];

// 4. Token & Context Optimization topics
const TOKEN_TOPICS = [
  {
    hook: "Hot take on AI context windows:",
    fact: "90% of developers burn 15-20% of their 200k context window before typing a single prompt because of redundant system instructions.",
    solution: "Deduplicate and optimize:\n$ npx promptshift --source cursor --target claude"
  },
  {
    hook: "Context Rot explained in 3 lines:",
    fact: "When you dump 800 lines of unfiltered guidelines into Claude Code, attention degradation kicks in. The model forgets line 200 by line 600.",
    solution: "Prune instructions with AST parity:\n$ npx promptshift"
  },
  {
    hook: "The real cost of unoptimized AI prompts:",
    fact: "A 4,000-token prompt sent 50 times a day = 200,000 wasted input tokens daily. That's $180/year per engineer in wasted API credits.",
    solution: "Prune in 2 seconds:\n$ npx promptshift"
  },
  {
    hook: "When two rules in .cursorrules contradict:",
    fact: "'Always use arrow functions' on line 24 vs 'Prefer named functions' on line 110 causes AI assistants to stall or flip randomly.",
    solution: "Reconcile prompt conflicts:\n$ npx promptshift --audit"
  },
  {
    hook: "Average PromptShift compression benchmark:",
    fact: "Raw multi-file prompt: 5,800 tokens. After AST deduplication: 2,640 tokens. Measured instruction adherence score: 99.2%.",
    solution: "Sharper prompts = higher IQ:\n$ npx promptshift"
  },
  {
    hook: "Multi-agent token budget compounding:",
    fact: "In multi-agent swarms, passing bloated instructions across 4 subagents compounds token waste 4x. Clean directives are mandatory.",
    solution: "Optimize swarm guidelines:\n$ npx promptshift --to=gemini"
  }
];

// 5. Team & Multi-IDE topics
const TEAM_TOPICS = [
  {
    hook: "The multi-IDE developer reality in 2026:",
    fact: "You use Cursor, your tech lead uses Claude Code in terminal, and the junior dev uses Windsurf. Don't fight over editors.",
    solution: "Sync rules across all tools in 1 command:\n$ npx promptshift"
  },
  {
    hook: "The myth of AI vendor lock-in:",
    fact: "Spent 3 months tuning .cursorrules? You're not locked in. Transpile to Claude, Windsurf, or Copilot in 2 seconds.",
    solution: "Keep your rules portable:\n$ npx promptshift --source cursor --target claude"
  },
  {
    hook: "Agency onboarding speedrun:",
    fact: "Client A uses Cursor, Client B uses Claude, Client C uses Windsurf. Stop wasting 2 days of every sprint converting guidelines.",
    solution: "Transpile in 2 seconds:\n$ npx promptshift"
  },
  {
    hook: "End IDE religious wars on your team:",
    fact: "New engineer wants Claude Code terminal loop? Senior dev wants Cursor? PromptShift generates both from a single source of truth.",
    solution: "One source of truth:\n$ npx promptshift"
  },
  {
    hook: "Zero-friction onboarding checklist:",
    fact: "1. Clone repo. 2. Run npx promptshift. 3. All IDE rules are configured and verified with 98.5% AST parity. Back to coding.",
    solution: "Instant developer velocity:\n$ npx promptshift"
  }
];

// 6. CI/CD & Terminal topics
const CICD_TOPICS = [
  {
    hook: "Automate AI rule parity in GitHub Actions:",
    fact: "Run 1 command to inject a continuous sync workflow into your repo. Catches prompt drift and leaked API keys on every PR.",
    solution: "Setup in 10 seconds:\n$ npx promptshift --init-ci"
  },
  {
    hook: "Pre-commit hook for AI configuration files:",
    fact: "Never commit a malformed .mdc file or exposed API token again. Runs deterministic in-RAM checks before git commit completes.",
    solution: "Install hook:\n$ npx promptshift --verify"
  },
  {
    hook: "Terminal speedrun without browser:",
    fact: "Zero installation, zero accounts, zero cloud dependencies. Run in any repository to get clean target formats in 0.4s.",
    solution: "$ npx promptshift --to=claude"
  },
  {
    hook: "Model Context Protocol (MCP) server ready:",
    fact: "Add PromptShift as an STDIO MCP server in Claude Desktop or Cursor. Your agents can transpile their own guidelines on demand.",
    solution: "$ npx promptshift --mcp"
  },
  {
    hook: "Dynamic parity badge for your GitHub README:",
    fact: "Show open-source contributors that your AI assistant instructions are verified with certified AST parity.",
    solution: "Generate your badge:\n$ npx promptshift --badge"
  }
];

// Reply Tweet Variations (Conversion-Engineered, strictly <= 280 chars, $1.99 coffee price anchor)
const REPLIES = [
  `Convert your entire AI agent project across Cursor, Claude Code, Windsurf & OpenAI in 2s (98.5% AST parity).

⚡ Try live or export the 4-in-1 Suite ($1.99):
https://promptshift.dev`,

  `Stop wasting 3 hours manually reformatting AI instructions. The $1.99 Single Pass pays for itself on day 1.

👉 1-Click interactive studio:
https://promptshift.dev`,

  `PromptShift parses, deduplicates, and sanitizes API keys in-RAM with zero server retention.

🔒 Sovereign universal bridge for developers ($1.99):
https://promptshift.dev`,

  `One source of truth for all your AI coding assistants. Export to Cursor, Claude, Copilot & Gemini simultaneously.

⚡ Universal 4-in-1 Pass ($1.99):
https://promptshift.dev`,

  `Higher agent IQ, zero prompt drift, and 100% private in-RAM processing.

🧪 Test your repository for free or get the $1.99 Single Pass:
https://promptshift.dev`,

  `Why do manual prompt reformatting that deterministic software solves in 0.4 seconds?

⚡ Instant 1-click conversion ($1.99):
https://promptshift.dev`,

  `Certified 98.5% AST semantic parity. No hallucinations, no dropped negative constraints.

👉 Try live sandbox or export ($1.99):
https://promptshift.dev`,

  `Free Starter for small projects (≤ 2 files) with zero signup, or $1.99 Single Pass for complete 4-in-1 export.

🚀 Test your project now:
https://promptshift.dev`
];

export function generateAnnualCatalog(): XPost[] {
  const posts: XPost[] = [];
  const TOTAL_DAYS = 365;
  const SLOTS = ['morning', 'afternoon'] as const;

  let postCount = 0;

  for (let day = 1; day <= TOTAL_DAYS; day++) {
    for (const slot of SLOTS) {
      postCount++;
      const dayPad = String(day).padStart(3, '0');
      const id = `post-d${dayPad}-${slot}`;

      const stack = STACKS[(day + (slot === 'afternoon' ? 6 : 0)) % STACKS.length];
      const reply = REPLIES[postCount % REPLIES.length];

      let mainTweet = '';
      let category: XPost['category'] = 'ast-parity';

      // Cycle across topic engines
      const topicType = postCount % 6;

      if (topicType === 0) {
        // Stack Case Study
        category = 'ast-parity';
        mainTweet = `${stack.name} Case Study:

Your guidelines enforce:
"${stack.directive}"
Scoped: \`${stack.file}\`

Don't let switching editors break your rules.
Transpile ${stack.source} -> ${stack.target} in 1 command:
$ npx promptshift --source ${stack.source} --target ${stack.target}`;
      } else if (topicType === 1) {
        // Syntax & AST
        category = 'ast-parity';
        const item = SYNTAX_TOPICS[(day + postCount) % SYNTAX_TOPICS.length];
        mainTweet = `${item.hook}

${item.problem}

${item.cmd}`;
      } else if (topicType === 2) {
        // Security & Secrets
        category = 'security';
        const item = SECURITY_TOPICS[(day + postCount) % SECURITY_TOPICS.length];
        mainTweet = `${item.hook}
${item.fact}

${item.solution}`;
      } else if (topicType === 3) {
        // Token & Context Optimization
        category = 'token-optimization';
        const item = TOKEN_TOPICS[(day + postCount) % TOKEN_TOPICS.length];
        mainTweet = `${item.hook}
${item.fact}

${item.solution}`;
      } else if (topicType === 4) {
        // Team & Multi-IDE
        category = 'multi-agent';
        const item = TEAM_TOPICS[(day + postCount) % TEAM_TOPICS.length];
        mainTweet = `${item.hook}
${item.fact}

${item.solution}`;
      } else {
        // CI/CD & Terminal
        category = 'ci-cd';
        const item = CICD_TOPICS[(day + postCount) % CICD_TOPICS.length];
        mainTweet = `${item.hook}
${item.fact}

${item.solution}`;
      }

      // Truncate cleanly if edge case over 280 chars
      if (mainTweet.length > 280) {
        const lines = mainTweet.split('\n');
        while (lines.join('\n').length > 280) {
          lines.splice(lines.length - 2, 1);
        }
        mainTweet = lines.join('\n');
      }

      posts.push({
        id,
        category,
        mainTweet: mainTweet.trim(),
        replyTweet: reply.trim()
      });
    }
  }

  return posts;
}

// Build and save catalog
const catalog = generateAnnualCatalog();
console.log(`Generated ${catalog.length} annual posts.`);

// Validate all posts
let errors = 0;
const ids = new Set<string>();

catalog.forEach((p, idx) => {
  if (ids.has(p.id)) {
    console.error(`Duplicate ID: ${p.id} at index ${idx}`);
    errors++;
  }
  ids.add(p.id);

  if (p.mainTweet.length > 280) {
    console.error(`Main tweet too long in ${p.id} (${p.mainTweet.length} chars)`);
    errors++;
  }

  if (p.mainTweet.includes('http://') || p.mainTweet.includes('https://')) {
    console.error(`Main tweet contains URL in ${p.id}`);
    errors++;
  }

  if (p.replyTweet.length > 280) {
    console.error(`Reply tweet too long in ${p.id} (${p.replyTweet.length} chars)`);
    errors++;
  }

  if (!p.replyTweet.includes('https://promptshift.dev')) {
    console.error(`Reply tweet missing URL in ${p.id}`);
    errors++;
  }
});

if (errors > 0) {
  console.error(`Validation failed with ${errors} errors.`);
  process.exit(1);
}

console.log('✅ 100% of 730 posts passed all algorithmic and character constraints!');

// Save to data/x_annual_posts_catalog.json
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const outJson = path.join(dataDir, 'x_annual_posts_catalog.json');
fs.writeFileSync(outJson, JSON.stringify(catalog, null, 2), 'utf-8');
console.log(`Saved annual catalog to: ${outJson} (${(fs.statSync(outJson).size / 1024).toFixed(1)} KB)`);
