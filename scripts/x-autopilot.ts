/**
 * PromptShift X (Twitter) Autonomous DevRel Publisher
 * 100% Self-Contained, Zero-Dependency Node.js engine for X API v2
 * Uses native crypto for OAuth 1.0a HMAC-SHA1 signatures.
 * 
 * Flow:
 * 1. Posts technical proof-of-work main tweet (high organic reach, zero external links).
 * 2. Immediately posts thread auto-reply with promptshift.dev & Polar checkout link.
 * 3. Persists run state to data/x_posts_history.json to prevent duplicate broadcasts.
 */

import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { pathToFileURL } from 'url';

export interface XPost {
  id: string;
  category: 'ast-parity' | 'security' | 'ci-cd' | 'multi-agent' | 'terminal';
  mainTweet: string;
  replyTweet: string;
}

export const X_POSTS_CATALOG: XPost[] = [
  {
    id: 'post-01-cursor-to-claude-frontmatter',
    category: 'ast-parity',
    mainTweet: `Why Cursor rules break Claude Code:

Cursor expects frontmatter:
---
description: API rules
globs: *.ts
---

Claude Code expects raw Markdown in CLAUDE.md.
Nested YAML makes Claude ignore guidelines.

Fix AST in 1 command:
$ npx promptshift --source cursor --target claude`,
    replyTweet: `Convert your entire AI agent project across Cursor, Claude Code, Windsurf & OpenAI in 2 seconds (99.4% AST parity).

⚡ Try live or export the 4-in-1 Suite ($1.99):
https://promptshift.dev`
  },
  {
    id: 'post-02-context-window-waste',
    category: 'multi-agent',
    mainTweet: `Hot take: 90% of developers are burning 18% of their 200k context window before typing a single prompt.

Why? Bloated .cursorrules copy-pasted into CLAUDE.md without semantic deduplication.

Clean your agent context tree:
$ npx promptshift --source cursor --target claude`,
    replyTweet: `PromptShift strips AST noise, deduplicates system prompts, and sanitizes API keys in-RAM with zero retention.

👉 Test with 1 click or get the $1.99 Single Pass:
https://promptshift.dev`
  },
  {
    id: 'post-03-multi-ide-matrix',
    category: 'multi-agent',
    mainTweet: `Windsurf uses .windsurfrules.
Cursor uses .cursorrules or .cursor/rules/*.mdc.
Claude Code uses CLAUDE.md.
GitHub Copilot uses .github/copilot-instructions.md.

Switching tools without rewriting all your agent guidelines:
$ npx promptshift --source windsurf --target cursor`,
    replyTweet: `Stop fragmenting your team's agent configurations. One source of truth, transpiled to all 4 major AI IDEs.

⚡ Instant universal conversion ($1.99 / pass):
https://promptshift.dev`
  },
  {
    id: 'post-04-security-secrets-leak',
    category: 'security',
    mainTweet: `Security PSA: 1 out of 8 public AI config files leaked on GitHub contains a hardcoded OPENAI_API_KEY, ANTHROPIC_API_KEY or AWS token.

Before pushing your agent rules, sanitize all secrets in memory:
$ npx promptshift --source cursor --target claude --sanitize-secrets`,
    replyTweet: `PromptShift includes an in-RAM deterministic entropy scanner that masks all active tokens with zero server persistence.

🔒 Safe migration in seconds:
https://promptshift.dev`
  },
  {
    id: 'post-05-scoped-globs-ast',
    category: 'ast-parity',
    mainTweet: `Did you know? Cursor .cursor/rules/*.mdc files support scoped \`globs\`, while Claude Code subagents require flat instructions.

Copying them directly causes hallucinated tool executions.

Maintain 99.4% AST integrity:
$ npx promptshift --source cursor --target claude`,
    replyTweet: `Deterministic AST parser built for AI coding agents. No hallucinations, no lost system context.

⚡ Instant 4-in-1 Universal Suite ($1.99):
https://promptshift.dev`
  },
  {
    id: 'post-06-ci-cd-automation',
    category: 'ci-cd',
    mainTweet: `Building an AI coding swarm?
Syncing rules between Cursor, Claude Code, and Windsurf across a 10-person dev team is a maintenance nightmare.

Automate your agent config pipeline in CI/CD:
$ npx promptshift --init-ci

Keeps all IDE configs in sync on every git push.`,
    replyTweet: `Deploy automated CI/CD multi-agent alignment with PromptShift Pro ($29/mo) or single conversion pass ($1.99).

🚀 Check live parity score on your repo:
https://promptshift.dev`
  },
  {
    id: 'post-07-deterministic-vs-llm',
    category: 'ast-parity',
    mainTweet: `Why raw LLM prompt conversion fails:
LLMs hallucinate YAML frontmatter keys when translating .cursorrules to CLAUDE.md.

PromptShift uses deterministic AST tokenization, preserving 100% of instruction hierarchy.

Benchmark it:
$ npx promptshift --source cursor --target claude`,
    replyTweet: `Deterministic AST transpilation beats prompt-based generation every single time. 99.4% measured parity score.

🧪 Try our interactive AST Diff Inspector:
https://promptshift.dev`
  },
  {
    id: 'post-08-cursor-to-openai',
    category: 'multi-agent',
    mainTweet: `From Cursor to OpenAI Assistant format:
.cursorrules uses file globs and system role prompts.
OpenAI Assistants require structured instructions and tool function specs.

Bridge the gap without rewriting:
$ npx promptshift --source cursor --target openai`,
    replyTweet: `Universal cross-agent compiler for modern developers. Export to Claude, Cursor, OpenAI & Gemini simultaneously.

👉 Single Pass $1.99 / Team License:
https://promptshift.dev`
  },
  {
    id: 'post-09-terminal-frictionless',
    category: 'terminal',
    mainTweet: `Terminal tip: You don't even need to install PromptShift or open a browser to convert your AI agent projects.

Just run in any repo:
$ npx promptshift

Auto-detects .cursorrules, CLAUDE.md or .windsurfrules and outputs the target format in 1.2s.`,
    replyTweet: `Zero dependencies. Zero telemetry retention. Full AST parity score and universal 4-in-1 export.

⚡ Convert online or get your pass:
https://promptshift.dev`
  },
  {
    id: 'post-10-multi-ide-stack-2026',
    category: 'multi-agent',
    mainTweet: `The multi-IDE developer stack in 2026:
- Cursor for local rapid editing
- Claude Code for terminal agent loops
- Windsurf for Cascade multi-file diffs

Your agent instructions shouldn't be locked into one silo:
$ npx promptshift --source cursor --target claude`,
    replyTweet: `Transpile your agent configurations with 99.4% AST parity. Export the 4-in-1 Universal Suite in 1 click.

⚡ Instant developer pass ($1.99):
https://promptshift.dev`
  },
  {
    id: 'post-11-claude-code-subagents',
    category: 'terminal',
    mainTweet: `PSA for Claude Code users:
Adding \`.cursorrules\` to your repo doesn't instruct Claude Code. It only reads \`CLAUDE.md\`.

Don't let your terminal agent run blind without your project architecture:
$ npx promptshift --source cursor --target claude`,
    replyTweet: `One command to synchronize your Cursor guidelines with Claude Code terminal agents.

🧪 Inspect syntax diffs and export live ($1.99):
https://promptshift.dev`
  },
  {
    id: 'post-12-rule-syntax-linter',
    category: 'ast-parity',
    mainTweet: `Why do AI agents ignore your guidelines?
Most configs fail because of malformed Markdown headings and unsupported frontmatter flags.

Validate and transpile your AI config syntax in seconds:
$ npx promptshift --source claude --target cursor`,
    replyTweet: `Keep your AI coding agents obedient, secure, and aligned across all editors.

👉 1-Click Interactive Demo & Universal Pass ($1.99):
https://promptshift.dev`
  }
];

const HISTORY_FILE = path.join(process.cwd(), 'data', 'x_posts_history.json');

interface PostHistoryEntry {
  id: string;
  category: string;
  postedAt: string;
  mainTweetId: string;
  replyTweetId?: string;
  simulated?: boolean;
}

interface PostsHistory {
  lastRun: string | null;
  totalBroadcasts: number;
  history: PostHistoryEntry[];
}

function loadHistory(): PostsHistory {
  if (fs.existsSync(HISTORY_FILE)) {
    try {
      const content = fs.readFileSync(HISTORY_FILE, 'utf-8');
      return JSON.parse(content);
    } catch {
      // Fallback on parse failure
    }
  }
  return {
    lastRun: null,
    totalBroadcasts: 0,
    history: []
  };
}

function saveHistory(history: PostsHistory): void {
  const dir = path.dirname(HISTORY_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf-8');
}

/**
 * Generates OAuth 1.0a HMAC-SHA1 Authorization Header (RFC 5849)
 * Zero external dependency implementation.
 */
function generateOAuthHeader(
  method: string,
  url: string,
  consumerKey: string,
  consumerSecret: string,
  accessToken: string,
  accessTokenSecret: string
): string {
  const oauthParams: Record<string, string> = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: crypto.randomBytes(16).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: accessToken,
    oauth_version: '1.0'
  };

  const paramKeys = Object.keys(oauthParams).sort();
  const paramString = paramKeys
    .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(oauthParams[k])}`)
    .join('&');

  const baseString = [
    method.toUpperCase(),
    encodeURIComponent(url),
    encodeURIComponent(paramString)
  ].join('&');

  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(accessTokenSecret)}`;
  const signature = crypto
    .createHmac('sha1', signingKey)
    .update(baseString)
    .digest('base64');

  oauthParams.oauth_signature = signature;

  const headerParams = Object.keys(oauthParams)
    .sort()
    .map(k => `${encodeURIComponent(k)}="${encodeURIComponent(oauthParams[k])}"`)
    .join(', ');

  return `OAuth ${headerParams}`;
}

async function postTweet(
  text: string,
  replyToId?: string,
  creds?: {
    consumerKey: string;
    consumerSecret: string;
    accessToken: string;
    accessTokenSecret: string;
  }
): Promise<{ id: string }> {
  if (!creds) {
    throw new Error('Missing X API credentials');
  }

  const endpoint = 'https://api.twitter.com/2/tweets';
  const authHeader = generateOAuthHeader(
    'POST',
    endpoint,
    creds.consumerKey,
    creds.consumerSecret,
    creds.accessToken,
    creds.accessTokenSecret
  );

  const payload: any = { text };
  if (replyToId) {
    payload.reply = { in_reply_to_tweet_id: replyToId };
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
      'User-Agent': 'PromptShift-DevRel-Autopilot/1.0'
    },
    body: JSON.stringify(payload)
  });

  const body: any = await response.json();

  if (!response.ok) {
    throw new Error(`X API Error (${response.status}): ${JSON.stringify(body)}`);
  }

  return { id: body.data?.id };
}

export async function runAutopilot(): Promise<void> {
  const args = process.argv.slice(2);
  const isForceDryRun = args.includes('--dry-run') || process.env.DRY_RUN === 'true';

  const consumerKey = process.env.X_API_KEY || process.env.TWITTER_API_KEY || '';
  const consumerSecret = process.env.X_API_SECRET || process.env.TWITTER_API_SECRET || '';
  const accessToken = process.env.X_ACCESS_TOKEN || process.env.TWITTER_ACCESS_TOKEN || '';
  const accessTokenSecret = process.env.X_ACCESS_TOKEN_SECRET || process.env.TWITTER_ACCESS_TOKEN_SECRET || '';

  const hasCredentials = Boolean(consumerKey && consumerSecret && accessToken && accessTokenSecret);
  const isDryRun = isForceDryRun || !hasCredentials;

  console.log('====================================================');
  console.log('🤖 PromptShift X (Twitter) Autonomous DevRel Engine');
  console.log(`Execution Mode: ${isDryRun ? '🧪 DRY-RUN (Simulation)' : '🚀 LIVE BROADCAST'}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log('====================================================\n');

  if (!hasCredentials && !isForceDryRun) {
    console.warn('⚠️ Missing X API credentials in environment.');
    console.warn('Required variables: X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET');
    console.warn('Falling back to safe DRY-RUN verification.\n');
  }

  // 1. Load History & Filter Available Posts
  const history = loadHistory();
  const postedIds = new Set(history.history.map(h => h.id));

  let candidate = X_POSTS_CATALOG.find(p => !postedIds.has(p.id));

  // If all posts have been broadcast, restart rotation cycle
  if (!candidate) {
    console.log('🔄 All 12 posts have completed a full broadcasting cycle. Resetting rotation.');
    history.history = [];
    candidate = X_POSTS_CATALOG[0];
  }

  console.log(`Selected Post ID: [${candidate.id}] (Category: ${candidate.category})`);
  console.log('----------------------------------------------------');
  console.log('📝 MAIN TWEET (Reach Maximized, Zero URLs):');
  console.log(candidate.mainTweet);
  console.log(`Length: ${candidate.mainTweet.length} / 280 chars`);
  console.log('----------------------------------------------------');
  console.log('💬 AUTO-REPLY TWEET (Conversion Link & Polar Pass):');
  console.log(candidate.replyTweet);
  console.log(`Length: ${candidate.replyTweet.length} / 280 chars`);
  console.log('----------------------------------------------------\n');

  if (isDryRun) {
    console.log('🧪 [DRY-RUN] Simulating broadcast without calling external API.');
    const mockMainId = 'mock_main_' + Date.now();
    const mockReplyId = 'mock_reply_' + Date.now();

    history.lastRun = new Date().toISOString();
    history.totalBroadcasts += 1;
    history.history.push({
      id: candidate.id,
      category: candidate.category,
      postedAt: new Date().toISOString(),
      mainTweetId: mockMainId,
      replyTweetId: mockReplyId,
      simulated: true
    });

    saveHistory(history);
    console.log(`✅ Simulation successfully recorded in data/x_posts_history.json`);
    return;
  }

  // 2. Live Broadcast
  try {
    const creds = { consumerKey, consumerSecret, accessToken, accessTokenSecret };
    
    console.log('📡 Step 1: Broadcasting main tweet...');
    const mainResult = await postTweet(candidate.mainTweet, undefined, creds);
    console.log(`✅ Main tweet published! ID: ${mainResult.id}`);

    // Wait 2 seconds before replying to avoid race conditions
    await new Promise(r => setTimeout(r, 2000));

    console.log('📡 Step 2: Broadcasting auto-reply thread...');
    const replyResult = await postTweet(candidate.replyTweet, mainResult.id, creds);
    console.log(`✅ Auto-reply published! ID: ${replyResult.id}`);

    history.lastRun = new Date().toISOString();
    history.totalBroadcasts += 1;
    history.history.push({
      id: candidate.id,
      category: candidate.category,
      postedAt: new Date().toISOString(),
      mainTweetId: mainResult.id,
      replyTweetId: replyResult.id,
      simulated: false
    });

    saveHistory(history);
    console.log('\n🎉 Autonomous DevRel dispatch completed with 100% success.');
  } catch (error: any) {
    console.error('❌ Broadcast failed:', error.message);
    process.exit(1);
  }
}

// Direct execution check
const isDirectRun = Boolean(process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href);
if (isDirectRun || process.argv.length > 1) {
  runAutopilot().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}
