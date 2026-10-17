# Show HN: PromptShift — In-Browser RAM Transpiler Between Claude, Cursor, and Gemini Agent Projects

**URL**: https://promptshift.dev  
**GitHub / Specs**: https://promptshift.dev/llms.txt  

Hi HN,

We built **PromptShift** (https://promptshift.dev) because managing instructions, master prompts, and tool rules across multiple AI coding assistants has become fragmented and tedious.

If you develop with Cursor (`.cursorrules`, `.cursor/rules/*.mdc`), Anthropic Claude (`CLAUDE.md`, Claude Projects XML), OpenAI Custom GPTs (`custom_gpt_instructions.txt`, Assistants v2 JSON), or Google Antigravity (`GEMINI.md`, `AGENTS.md`), you typically face prompt drift, mismatched file globs, or loss of autonomous execution directives when moving between platforms.

### Key Architectural Choices:

1. **100% In-RAM & Zero Server Retention**:
   Your codebase and proprietary prompts never touch persistent server storage or databases. File tree parsing, pruning, and transpilations are computed in-memory (using WebAssembly & Edge runtime). Once your session closes or download completes, memory is zeroed out.

2. **In-RAM Secret Redaction**:
   Before parsing instructions or knowledge files, an automated multi-pattern regex engine redacts leaked OpenAI, Anthropic, Stripe, AWS, and HuggingFace API keys.

3. **Canonical AI Project Schema (CAPS)**:
   We defined an intermediate representation (IR) that preserves **98.5% certified AST semantic fidelity**. System prompts, autonomy policies, directory-scoped rules, and function calling tools are mapped bi-directionally without prompt drift.

4. **Self-Service & Open Standards**:
   - `llms.txt` and `llms-full.txt` exposed for AI crawlers.
   - OpenAPI 3.1 specification at `https://promptshift.dev/api/openapi.json`.
   - Model Context Protocol schema at `https://promptshift.dev/.well-known/mcp-schema.json`.
   - HTTP 402 payment headers for programmatic agent integrations.

Try it instantly without an account: https://promptshift.dev  
Feedback and critique on our AST mappings or secret sanitizer are warmly welcomed!
