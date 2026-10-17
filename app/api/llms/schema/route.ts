import { NextResponse } from 'next/server';

export async function GET() {
  const capsSchemaDefinition = {
    title: 'Canonical AI Project Schema (CAPS)',
    version: '1.0.0',
    description: 'Universal AST intermediate representation schema for AI coding assistants and agent configurations.',
    ecosystems_supported: ['cursor', 'claude', 'openai', 'gemini', 'antigravity', 'windsurf', 'copilot'],
    pricing: {
      currency: 'USD',
      tiers: [
        { name: 'Free Starter', price: 0, file_limit: 5 },
        { name: 'Single Migration Pass', price: 1.99, file_limit: 'unlimited', project_limit: 1 },
        { name: 'Pro Developer', price: 5.99, billing: 'monthly', file_limit: 'unlimited', features: ['multi-ecosystem', 'cli-tokens', 'ram-vault'] },
        { name: 'Team & Agency', price: 19.99, billing: 'monthly', file_limit: 'unlimited', features: ['unlimited-seats', 'dpa', 'priority-support'] },
      ],
    },
    schema: {
      metadata: {
        id: 'string (UUID)',
        title: 'string',
        description: 'string',
        source_platform: 'string (cursor | claude | openai | gemini | antigravity)',
        version: 'string',
      },
      persona: {
        role: 'string',
        raw_system_prompt: 'string',
        instructions: 'array of strings',
        constraints: 'array of strings',
        autonomy_clause: 'string (optional)',
      },
      rules: [
        {
          name: 'string',
          content: 'string',
          scope: 'global | workspace | directory',
          trigger: 'always_on | model_decision',
        },
      ],
      knowledge_base: [
        {
          filename: 'string',
          content_text: 'string',
          mime_type: 'string',
          size_bytes: 'number',
        },
      ],
      tools: [
        {
          name: 'string',
          description: 'string',
          input_schema: 'object',
          protocol: 'mcp | openapi | function_calling',
        },
      ],
      security: {
        permission_mode: 'full_autonomy | ask | strict',
        allow_grants: 'array of strings',
        deny_grants: 'array of strings',
      },
    },
  };

  return NextResponse.json(capsSchemaDefinition, {
    headers: {
      'Cache-Control': 'public, max-age=86400',
      'Content-Type': 'application/json',
    },
  });
}
