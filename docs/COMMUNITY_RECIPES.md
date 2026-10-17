# PromptShift Community Agent Recipes & Templates

Official, production-grade rules and directives optimized for Cursor (.mdc), Claude Projects, and Gemini Antigravity.

---

## 1. Next.js 15 & React 19 Full-Stack Agent Directives
- **Target Files**: `.cursor/rules/nextjs.mdc` / `.claude/rules/nextjs.md`
- **Globs**: `app/**`, `components/**`
- **Core Directives**:
  - Enforce React Server Components (RSC) by default; only use `'use client'` on interactive leaf nodes.
  - Prioritize Server Actions for data mutations with optimistic UI updates.
  - Never import server-only modules or secrets into client components.
  - Implement accessible HTML with semantic elements and WCAG 2.1 AA standards.

---

## 2. FastAPI & Python Microservices Agent Directives
- **Target Files**: `.cursor/rules/fastapi.mdc` / `.claude/rules/fastapi.md`
- **Globs**: `**/*.py`
- **Core Directives**:
  - Enforce strict Pydantic v2 schemas for all request payloads and response models.
  - Utilize async/await natively for I/O bound endpoints.
  - Redact all sensitive fields from logs and exceptions.
  - Provide comprehensive OpenAPI docstrings for automatic documentation generation.

---

## 3. Rust Systems Engineering Directives
- **Target Files**: `.cursor/rules/rust.mdc` / `.claude/rules/rust.md`
- **Globs**: `**/*.rs`, `Cargo.toml`
- **Core Directives**:
  - Zero unhandled `unwrap()` in production paths; use `Result<T, E>` and `?` propagation.
  - Leverage `clippy` lints and zero-copy abstractions.
  - Document all public functions with doc tests.

---

## Transpiling Custom Recipes with PromptShift:
Drop any of these recipes into https://promptshift.dev to automatically convert them into Claude XML, Cursor rules, or Google Antigravity workspaces.
