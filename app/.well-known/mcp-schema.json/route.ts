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
          'Transpile project rules and master prompts across AI coding platforms with 98.5% certified AST parity and in-RAM secret sanitization.',
        inputSchema: {
          type: 'object',
          required: ['source_platform', 'target_platform', 'system_prompt'],
          properties: {
            source_platform: {
              type: 'string',
              enum: ['cursor', 'claude', 'openai', 'gemini', 'antigravity'],
              description: 'The originating platform of the rules',
            },
            target_platform: {
              type: 'string',
              enum: ['cursor', 'claude', 'openai', 'gemini'],
              description: 'Destination AI ecosystem',
            },
            system_prompt: {
              type: 'string',
              description: 'The raw system prompt or rule file content',
            },
            rules: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  content: { type: 'string' },
                },
              },
            },
          },
        },
      },
      {
        name: 'promptshift_sanitize_secrets',
        description: 'Scan and redact exposed API keys (OpenAI, Anthropic, Stripe, AWS, HuggingFace) from prompt instructions in-RAM.',
        inputSchema: {
          type: 'object',
          required: ['text'],
          properties: {
            text: {
              type: 'string',
              description: 'Text or source code to inspect for exposed credentials',
            },
          },
        },
      },
      {
        name: 'promptshift_validate_ast',
        description: 'Evaluate semantic fidelity score and ensure zero prompt drift across ecosystem migrations.',
        inputSchema: {
          type: 'object',
          required: ['source_text', 'target_text'],
          properties: {
            source_text: { type: 'string' },
            target_text: { type: 'string' },
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
