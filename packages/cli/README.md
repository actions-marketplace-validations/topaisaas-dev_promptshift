# promptshift

> **Deterministic AST transpiler & STDIO MCP Server for AI Coding Agents (Cursor, Claude Code, Windsurf, Copilot, Cline, Roo Code, Aider).**

[![Version](https://img.shields.io/npm/v/promptshift.svg)](https://www.npmjs.com/package/promptshift)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Parity](https://img.shields.io/badge/AST%20Parity-98.5%25-cyan.svg)](https://promptshift.dev)

🌐 **Official Web App:** [https://promptshift.dev](https://promptshift.dev)  
📚 **Documentation:** [https://promptshift.dev/cli](https://promptshift.dev/cli)

---

## ⚡ Features
- **Deterministic Multi-Agent Transpilation**: Convert between Cursor (`.mdc`, `.cursorrules`), Claude Code (`CLAUDE.md`), Windsurf (`.windsurfrules`), GitHub Copilot, Cline, and Aider.
- **OWASP Secret Sanitizer**: In-RAM regex engine redacting OpenAI, Anthropic, AWS, GitHub, and Stripe API keys before saving.
- **Native STDIO Model Context Protocol (MCP)**: Run `npx promptshift --mcp` to register as a local MCP server for Claude Desktop, Cursor, Smithery.ai, and Glama.ai.
- **Zero Data Retention**: 100% local in-RAM processing. Zero cloud telemetry.

---

## 🚀 Installation & Usage

### 1. NPX CLI Usage
```bash
# Transpile from Claude Code to Cursor
npx promptshift --from=claude-code --to=cursor

# Preview without writing to disk
npx promptshift --from=cursor --to=claude-code --dry-run

# Transpile Windsurf rules to Copilot
npx promptshift --from=windsurf --to=copilot --dir=.
```

### 2. Model Context Protocol (MCP) Mode
```bash
npx promptshift --mcp
```

Add to your `claude_desktop_config.json`:
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

---

## 💳 Commercial Access & Quotas
- **Free Starter**: Up to 2 rule files completely free forever.
- **Single Deposit Pass ($1.99 one-time)**: [Instant Checkout](https://buy.polar.sh/polar_cl_fGe6iBikmKFXK6EUnPpBLNSP66Oc4P3K5b5Mb4ZvH5E)
- **Pro Developer ($5.99/mo)**: [Instant Checkout](https://buy.polar.sh/polar_cl_tRb5IIABbdflDV5GIJu3VcxPRMUrP6Ok99igV0zdJ5a)
- **Team CI/CD ($19.99/mo)**: [Instant Checkout](https://buy.polar.sh/polar_cl_Pk9oe3UPJgQRhOwDCDUdawKOOdi2cL2XHyRqZ3QFfvC)

Unlock via CLI:
```bash
npx promptshift --to=cursor --key=<YOUR_POLAR_ORDER_ID>
```

---

## 📄 License
MIT © PromptShift Engineering Team
