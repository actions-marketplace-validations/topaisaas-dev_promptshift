import { CanonicalProject } from './converter/capsSchema';

export interface DemoPreset {
  id: string;
  name: string;
  badge: string;
  sourceKey: 'cursor' | 'claude' | 'openai' | 'gemini';
  targetKey: 'claude' | 'cursor' | 'openai' | 'gemini';
  project: CanonicalProject;
}

export const DEMO_PRESETS: DemoPreset[] = [
  {
    id: 'nextjs-cursor-to-claude',
    name: 'Next.js 15 Agent',
    badge: 'Cursor ➔ Claude',
    sourceKey: 'cursor',
    targetKey: 'claude',
    project: {
      metadata: {
        id: 'demo-nextjs-agent',
        title: 'nextjs15_saas_agent',
        description: 'Next.js 15 React Server Components & Tailwind SaaS rules',
        source_platform: 'cursor',
        version: '1.0.0',
      },
      persona: {
        role: 'Senior Next.js 15 Architect & React 19 Expert',
        raw_system_prompt: `# System Core Directives: Next.js 15 Agent
You are an elite Next.js 15 & React 19 full-stack engineer.
- Enforce React Server Components (RSC) by default. Add 'use client' only to interactive leaves.
- Never leak sensitive keys: sk-proj-sampleDemoKey98765432101234567890 (will be sanitized in RAM).
- Use Server Actions for all mutations with optimistic UI state.
- Ensure WCAG 2.1 AA accessibility standards on all components.`,
        instructions: [
          'Enforce strict TypeScript with zero any',
          'Use Tailwind CSS utility classes',
          'Optimize images with next/image',
        ],
        constraints: [
          'Never import server-only packages in client components',
          'Never execute client-side queries without rate limiting',
        ],
        autonomy_clause: 'Execute full architectural refactors autonomously without prompting.',
      },
      rules: [
        {
          name: '.cursor/rules/server_actions.mdc',
          content: 'Always validate FormData inputs using Zod schemas before running database queries.',
          scope: 'workspace',
          trigger: 'always_on',
        },
        {
          name: '.cursor/rules/tailwind_styling.mdc',
          content: 'Strictly avoid arbitrary Tailwind values (e.g. w-[342px]); use design tokens.',
          scope: 'workspace',
          trigger: 'always_on',
        },
      ],
      knowledge_base: [
        {
          filename: 'docs/architecture_manifest.md',
          content_text: '# Architecture Manifest\nApp Router: enabled\nServer Actions: enabled\nEdge Runtime: enabled',
          mime_type: 'text/markdown',
          size_bytes: 142,
        },
      ],
      tools: [
        {
          name: 'query_db',
          description: 'Runs read query against edge database',
          input_schema: { type: 'object', properties: { sql: { type: 'string' } } },
          protocol: 'function_calling',
          raw_config: {},
        },
      ],
      security: {
        permission_mode: 'full_autonomy',
        allow_grants: ['read', 'write'],
        deny_grants: ['drop_database'],
      },
    },
  },

  {
    id: 'fastapi-openai-to-cursor',
    name: 'FastAPI Microservice',
    badge: 'OpenAI ➔ Cursor',
    sourceKey: 'openai',
    targetKey: 'cursor',
    project: {
      metadata: {
        id: 'demo-fastapi-service',
        title: 'fastapi_distributed_core',
        description: 'FastAPI async microservice with Pydantic v2 schemas',
        source_platform: 'openai',
        version: '1.0.0',
      },
      persona: {
        role: 'Staff Python Distributed Systems Engineer',
        raw_system_prompt: `# Identity & Objectives: FastAPI Specialist
Design robust, non-blocking Python APIs using FastAPI and Pydantic v2.
- Enforce async def on all database and network endpoints.
- Auto-generate complete OpenAPI 3.1 schema documentation with response models.
- Sanitize AWS credentials: aws_secret_key=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY (sanitized in RAM).
- Avoid N+1 queries using SQLAlchemy 2.0 selectinload.`,
        instructions: ['Implement strict dependency injection', 'Log structured JSON with correlation IDs'],
        constraints: ['Zero blocking I/O inside event loops'],
        autonomy_clause: 'Proactively generate unit tests using pytest-asyncio and httpx.',
      },
      rules: [
        {
          name: 'pydantic_v2_validation.md',
          content: 'Use model_validator(mode="after") instead of deprecated root_validator.',
          scope: 'workspace',
          trigger: 'always_on',
        },
      ],
      knowledge_base: [
        {
          filename: 'specs/api_contract.md',
          content_text: '# API Contracts\n/v1/health: 200 OK\n/v1/transpile: 200 or 402 Payment Required',
          mime_type: 'text/markdown',
          size_bytes: 110,
        },
      ],
      tools: [],
      security: {
        permission_mode: 'full_autonomy',
        allow_grants: ['*'],
        deny_grants: [],
      },
    },
  },

  {
    id: 'antigravity-suite-to-claude',
    name: 'Antigravity Autonomous Suite',
    badge: 'Antigravity ➔ Claude',
    sourceKey: 'gemini',
    targetKey: 'claude',
    project: {
      metadata: {
        id: 'demo-antigravity-agent',
        title: 'antigravity_autonomous_core',
        description: 'Google Antigravity 2.0 multi-agent workspace with skills',
        source_platform: 'antigravity',
        version: '2.0.0',
      },
      persona: {
        role: 'Autonomous AI Coding Agent',
        raw_system_prompt: `# Project Directives - Permanent & Unconditional Autonomy
## 1. Full Authorization & Absolute Autonomy
- Status: FULL AUTONOMY GRANTED.
- Imperative Rule: NEVER prompt the user for permission before modifying code or running commands.
- All actions are pre-approved.
## 2. Project Termination Trigger
- Unconditional authorization remains active until user states: "ET BEN BRAVO!"`,
        instructions: ['Execute tasks end-to-end', 'Preserve all comments and docstrings'],
        constraints: ['Zero mock implementations in production paths'],
        autonomy_clause: 'Unconditional autonomy active across all session turns.',
      },
      rules: [
        {
          name: '.agents/rules/strict_typescript.md',
          content: 'Verify all types via tsc --noEmit before marking any task as complete.',
          scope: 'workspace',
          trigger: 'always_on',
        },
      ],
      knowledge_base: [
        {
          filename: 'AGENTS.md',
          content_text: '# Master Agent Workspace\nOrchestrator: Autonomous\nFidelity: Certified 98.5%',
          mime_type: 'text/markdown',
          size_bytes: 130,
        },
      ],
      tools: [
        {
          name: 'bash_exec',
          description: 'Executes terminal command',
          input_schema: { type: 'object', properties: { command: { type: 'string' } } },
          protocol: 'mcp',
          raw_config: {},
        },
      ],
      security: {
        permission_mode: 'full_autonomy',
        allow_grants: ['bash', 'fs'],
        deny_grants: [],
      },
    },
  },
];
