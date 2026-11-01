import { NextResponse } from 'next/server';

export async function GET() {
  const mcpSchema = {
    $schema: 'https://modelcontextprotocol.io/schema/draft/v1',
    name: 'promptshift-universal-bridge',
    version: '1.0.0',
    description:
      'Universal in-RAM transpilation and migration tools for AI developer assistants (Claude, Cursor, OpenAI, Gemini).',
    tools: [
      {
        name: 'promptshift_transpile',
        description:
          'Transpile agent instructions, master prompts, and modular rules across Cursor (.cursorrules / .cursor/rules/*.mdc), Anthropic Claude (CLAUDE.md / Claude Projects XML), OpenAI Assistants, and Google Gemini. Use this tool when migrating or porting AI coding configurations between different developer environments. Do not use for general natural language translation or non-AI code refactoring. Operates 100% in-memory with deterministic AST mapping and active secret sanitization.',
        inputSchema: {
          type: 'object',
          required: ['source_platform', 'target_platform', 'system_prompt'],
          properties: {
            source_platform: {
              type: 'string',
              enum: ['cursor', 'claude', 'openai', 'gemini', 'antigravity'],
              description: 'Originating AI coding assistant or rule format (e.g., cursor, claude, gemini).',
            },
            target_platform: {
              type: 'string',
              enum: ['cursor', 'claude', 'openai', 'gemini'],
              description: 'Destination AI ecosystem format to transpile into.',
            },
            system_prompt: {
              type: 'string',
              description: 'The master instruction prompt or primary rule document content to transpile.',
            },
            rules: {
              type: 'array',
              description: 'Optional array of modular rule files, each containing a filename and text content.',
              items: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                    description: 'Relative path or rule filename (e.g., "rules/testing.mdc").',
                  },
                  content: {
                    type: 'string',
                    description: 'Raw textual content of the rule file.',
                  },
                },
                required: ['name', 'content'],
              },
            },
            license_key: {
              type: 'string',
              description:
                'Optional Polar.sh Order ID or Pro Developer License Key to unlock repositories with >2 modular rule files.',
            },
          },
        },
      },
      {
        name: 'promptshift_sanitize_secrets',
        description:
          'Inspect and redact exposed private credentials (OpenAI sk-*, Anthropic sk-ant-*, AWS AKIA*, GitHub ghp_*, Google AIza*, Stripe sk_*) from prompt instructions in-RAM. Use this tool before committing, sharing, or deploying AI prompts to prevent credential leaks. Do not use for cryptographic key generation or data encryption. Pure idempotent scanner executing with zero persistent retention.',
        inputSchema: {
          type: 'object',
          required: ['text'],
          properties: {
            text: {
              type: 'string',
              description: 'Text, system prompt, or configuration file content to inspect and sanitize.',
            },
          },
        },
      },
      {
        name: 'promptshift_validate_ast',
        description:
          'Evaluate semantic AST fidelity and measure prompt drift percentage between an original agent instruction document and its transpiled counterpart. Use this tool to verify cross-IDE parity and detect omitted constraints after rule conversion. Do not use for code compilation or syntax execution. Returns a normalized fidelity score (0-100%).',
        inputSchema: {
          type: 'object',
          required: ['source_text', 'target_text'],
          properties: {
            source_text: {
              type: 'string',
              description: 'The original agent instruction or rule document before transpilation.',
            },
            target_text: {
              type: 'string',
              description: 'The converted target rule document to benchmark for semantic equivalence.',
            },
          },
        },
      },
    ],
  };

  return NextResponse.json(mcpSchema, {
    headers: {
      'Cache-Control': 'public, max-age=86400',
      'Content-Type': 'application/json',
    },
  });
}
