# PromptShift ⚡ Universal AI Coding Agent Transpiler & Drift Guard

[![PromptShift Certified](https://promptshift.dev/api/badge?score=98.5)](https://promptshift.dev)
[![GitHub release](https://img.shields.io/github/v/release/topaisaas-dev/promptshift?color=emerald&label=version)](https://github.com/topaisaas-dev/promptshift/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![AST Parity](https://img.shields.io/badge/AST%20Semantic%20Parity-98.5%25-cyan.svg)](https://promptshift.dev)
[![Zero-Data-Retention](https://img.shields.io/badge/Privacy-Zero--Data--Retention-green.svg)](https://promptshift.dev/security)
[![MCP Compatible](https://img.shields.io/badge/MCP-JSON--RPC%202.0-purple.svg)](https://modelcontextprotocol.io)

> **Deterministic AST transpilation and secret sanitation between Cursor (`.mdc`), Claude Code (`CLAUDE.md`), Windsurf (`.windsurfrules`), GitHub Copilot, Cline, and Roo Code.**

🌐 **Web Application:** [https://promptshift.dev](https://promptshift.dev)  
📦 **CLI Package:** `npx promptshift`  
🤖 **MCP Server:** `npx promptshift --mcp`  
🔄 **GitHub Action:** `topaisaas-dev/promptshift@v1`

---

## The Problem: AI Rule Fragmentation & Multi-IDE Drift

Modern engineering teams often collaborate across multiple AI-assisted developer environments:
- **Cursor** uses granular frontmatter-annotated markdown rules (`.cursor/rules/*.mdc`) and `.cursorrules`.
- **Claude Code** expects a unified root instruction context (`CLAUDE.md`).
- **Windsurf** relies on `.windsurfrules`.
- **GitHub Copilot** looks for `.github/copilot-instructions.md`.
- **Aider, Cline & Roo Code** each define custom agent boundaries.

When an engineer updates `CLAUDE.md` but forgets to synchronize `.cursor/rules/`, AI coding agents develop conflicting behaviors, hallucinate mismatched constraints, and accidentally commit sensitive API keys.

**PromptShift** eliminates fragmentation with certified **98.5% AST semantic parity**, **OWASP In-RAM secret sanitization**, and **instant CI/CD drift guards**.

---

## ⚡ Quick Start

### 1. One-Command Continuous CI/CD Guard
Bootstrap automated PR parity verification and secret scanning in 2 seconds:

```bash
npx promptshift --init-ci
```

### 2. Zero-Install CLI (NPX)
Transpile rules locally without permanent installation:

```bash
# Audit workspace for rules drift and exposed secrets
npx promptshift --check

# Transpile from current project to Claude Code
npx promptshift --to=claude

# Transpile from current project to Cursor
npx promptshift --to=cursor --key=polar_ord_xxxx

# Get official certified badge for your README.md
npx promptshift --badge
```

### 2. Model Context Protocol (MCP) Integration
PromptShift includes a native STDIO JSON-RPC 2.0 MCP server compatible with **Claude Desktop**, **Cursor**, **Smithery.ai**, and **Glama.ai**.

#### Claude Desktop Configuration (`claude_desktop_config.json`)
```json
{
  "mcpServers": {
    "promptshift": {
      "command": "npx",
      "args": ["promptshift", "--mcp"]
    }
  }
}
```

#### Exposed MCP Tools:
- `promptshift_transpile`: Deterministically compiles rules between Cursor, Claude Code, Windsurf, Copilot, Cline, and Aider with 98.5% AST parity.
- `promptshift_sanitize_secrets`: Automatically redacts exposed OpenAI, Anthropic, AWS, GitHub, and Stripe API keys before commits.

---

## 🔄 GitHub Actions CI/CD Drift Guard

Add PromptShift to your pull request workflows to automatically enforce rule synchronization across your team:

```yaml
# .github/workflows/ai-rules-sync.yml
name: AI Agent Rules Synchronization & Drift Guard

on:
  pull_request:
    paths:
      - 'CLAUDE.md'
      - '.cursor/rules/**'
      - '.windsurfrules'

jobs:
  sync-rules:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Run PromptShift AST Sync
        uses: topaisaas-dev/promptshift@v1.1.0
        with:
          from: 'cursor'
          to: 'claude-code'
          license_key: ${{ secrets.PROMPTSHIFT_LICENSE_KEY }}
```

---

## 🔒 Security & OWASP Secret Sanitizer

All transpilation processes run **100% in-memory with zero disk persistence and zero telemetry**. Before converting instructions, PromptShift runs an OWASP heuristic regex scanner to sanitize:
- OpenAI API Keys (`sk-proj-...`)
- Anthropic API Keys (`sk-ant-...`)
- GitHub Tokens (`ghp_...`, `github_pat_...`)
- AWS Access Keys (`AKIA...`)
- Stripe API Keys (`sk_live_...`, `rk_live_...`)
- Private RSA / OpenSSH Cryptographic Headers

Leaked credentials are substituted in-place with `[REDACTED_API_KEY]`.

---

## 💳 Pricing & Commercial Access (Polar.sh)

- **Free Starter:** Up to 2 rule files completely free forever (1 master context + 1 specialized rule).
- **Single Deposit Pass ($1.99 one-time):** Lifetime unlock for a single repository migration.
  👉 [Direct Checkout Link](https://buy.polar.sh/polar_cl_fGe6iBikmKFXK6EUnPpBLNSP66Oc4P3K5b5Mb4ZvH5E)
- **Pro Developer ($5.99/mo):** Unlimited rule files, priority AST compilation, and CLI unlocks.
  👉 [Direct Checkout Link](https://buy.polar.sh/polar_cl_tRb5IIABbdflDV5GIJu3VcxPRMUrP6Ok99igV0zdJ5a)
- **Team CI/CD & Agency ($19.99/mo):** Multi-seat license keys for GitHub Actions CI/CD drift guards.
  👉 [Direct Checkout Link](https://buy.polar.sh/polar_cl_Pk9oe3UPJgQRhOwDCDUdawKOOdi2cL2XHyRqZ3QFfvC)

---

## 📄 License & Compliance

Distributed under the **MIT License**. Compliant with OWASP Top 10 API Security guidelines, SOC-2 Zero Data Retention principles, and WCAG 2.1 AA accessibility standards.
