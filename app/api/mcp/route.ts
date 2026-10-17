import { NextRequest, NextResponse } from 'next/server';
import { UniversalTranspiler } from '@/lib/converter/universalTranspiler';
import { SecurityGuards } from '@/lib/converter/securityGuards';
import { MonetizationManager } from '@/lib/config/monetizationConfig';

const POLAR_SINGLE_URL = 'https://polar.sh/checkout/3e74e0dd-27da-4b78-8dee-f2e0fa36ed25';
const POLAR_PRO_URL = 'https://polar.sh/checkout/f646306b-cddd-4478-8aba-ec282a93397a';
const POLAR_TEAM_URL = 'https://polar.sh/checkout/9e8ca309-7881-4d7e-bfb0-6e6eda85505b';

const SERVER_INFO = {
  name: 'promptshift-universal-bridge',
  version: '1.1.0',
  description: 'Deterministic AST Transpiler & OWASP Secret Sanitizer for AI Coding Agents (Cursor, Claude Code, Windsurf, Copilot, Cline, Aider)',
  protocolVersion: '2024-11-05',
};

const TOOLS = [
  {
    name: 'promptshift_transpile',
    description: 'Transpile AI agent rules and master prompts across ecosystems (Cursor, Claude Code, Windsurf, Copilot, Cline, Aider) with 98.5% certified AST semantic parity.',
    inputSchema: {
      type: 'object',
      required: ['source_platform', 'target_platform', 'system_prompt'],
      properties: {
        source_platform: {
          type: 'string',
          enum: ['cursor', 'claude', 'openai', 'gemini', 'antigravity'],
          description: 'Originating framework of the rules',
        },
        target_platform: {
          type: 'string',
          enum: ['cursor', 'claude', 'openai', 'gemini'],
          description: 'Destination AI ecosystem',
        },
        system_prompt: {
          type: 'string',
          description: 'The master system prompt or primary instruction document',
        },
        rules: {
          type: 'array',
          description: 'Optional list of modular workspace rule files',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              content: { type: 'string' },
            },
            required: ['name', 'content'],
          },
        },
        license_key: {
          type: 'string',
          description: 'Polar.sh Order ID or Pro License Key to unlock workspaces with >2 rule files',
        },
      },
    },
  },
  {
    name: 'promptshift_sanitize_secrets',
    description: 'Scan and redact exposed API keys (OpenAI, Anthropic, AWS, GitHub, Stripe) from prompt instructions in-RAM.',
    inputSchema: {
      type: 'object',
      required: ['text'],
      properties: {
        text: {
          type: 'string',
          description: 'Text or source code to inspect and sanitize',
        },
      },
    },
  },
];

// Handles Streamable HTTP / JSON-RPC 2.0 GET requests
export async function GET() {
  return NextResponse.json({
    status: 'online',
    server: SERVER_INFO,
    tools: TOOLS,
    transport: 'streamable-http',
    docs: 'https://promptshift.dev/cli',
  }, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-PromptShift-Key',
    },
  });
}

// Handles CORS pre-flight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-PromptShift-Key',
    },
  });
}

// Handles JSON-RPC 2.0 POST requests
export async function POST(req: NextRequest) {
  try {
    const rpcReq = await req.json();
    const id = rpcReq.id ?? null;
    const method = rpcReq.method;

    // 1. initialize
    if (method === 'initialize') {
      return NextResponse.json({
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: {
              listChanged: false,
            },
          },
          serverInfo: SERVER_INFO,
        },
      });
    }

    // 2. notifications (initialized)
    if (method === 'notifications/initialized') {
      return new NextResponse(null, { status: 204 });
    }

    // 3. tools/list
    if (method === 'tools/list') {
      return NextResponse.json({
        jsonrpc: '2.0',
        id,
        result: {
          tools: TOOLS,
        },
      });
    }

    // 4. tools/call
    if (method === 'tools/call') {
      const toolName = rpcReq.params?.name;
      const args = rpcReq.params?.arguments || {};

      if (toolName === 'promptshift_sanitize_secrets') {
        const text = args.text || '';
        const { cleanText, alerts } = SecurityGuards.sanitizeSecrets(text);
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  redacted_secrets_count: alerts.length,
                  sanitized_text: cleanText,
                  zero_retention: true,
                }, null, 2),
              },
            ],
          },
        });
      }

      if (toolName === 'promptshift_transpile') {
        const rules = Array.isArray(args.rules) ? args.rules : [];
        const fileCount = 1 + rules.length;
        const freeLimit = MonetizationManager.getFreeLimit();
        const authHeader = req.headers.get('Authorization') || req.headers.get('X-PromptShift-Key');
        const hasKey = Boolean(args.license_key || authHeader);

        const projectPayload = {
          metadata: {
            title: 'MCP Transpiled Project',
            source_platform: args.source_platform || 'cursor',
          },
          persona: {
            role: 'Software Architect',
            raw_system_prompt: args.system_prompt || '',
          },
          rules: rules.map((r: any) => ({
            name: r.name,
            content: r.content,
          })),
        };

        const result = UniversalTranspiler.transpile(
          projectPayload as any,
          args.target_platform || 'claude'
        );

        // Deterministic in-flow paywall if quota exceeded
        if (fileCount > freeLimit && !hasKey) {
          const fileKeys = Object.keys(result.files);
          const firstKey = fileKeys[0];
          return NextResponse.json({
            jsonrpc: '2.0',
            id,
            result: {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    status: 'PAYMENT_REQUIRED_402',
                    message: `Multi-rule repository detected (${fileCount} files > ${freeLimit} Free Starter limit). Master preview unlocked; ${fileKeys.length - 1} rule files locked in RAM.`,
                    ast_parity_score: `${result.parityScore}%`,
                    secrets_redacted: result.alerts.length,
                    unlocked_preview: { [firstKey]: result.files[firstKey] },
                    locked_files: fileKeys.slice(1),
                    in_flow_checkout: {
                      single_pass: { price: '$1.99', url: POLAR_SINGLE_URL },
                      pro_developer: { price: '$5.99/mo', url: POLAR_PRO_URL },
                      team_agency: { price: '$19.99/mo', url: POLAR_TEAM_URL },
                    },
                    instructions: 'Pass your Polar Order ID in "license_key" or header "X-PromptShift-Key" to unlock all files.',
                  }, null, 2),
                },
              ],
            },
          });
        }

        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  status: 'COMPLETED',
                  ast_parity_score: `${result.parityScore}%`,
                  secrets_redacted: result.alerts.length,
                  files: result.files,
                }, null, 2),
              },
            ],
          },
        });
      }

      return NextResponse.json({
        jsonrpc: '2.0',
        id,
        error: { code: -32601, message: `Tool not found: ${toolName}` },
      });
    }

    // Default unknown method
    return NextResponse.json({
      jsonrpc: '2.0',
      id,
      error: { code: -32601, message: `Method not found: ${method}` },
    });
  } catch (error: any) {
    return NextResponse.json({
      jsonrpc: '2.0',
      id: null,
      error: { code: -32603, message: error.message || 'Internal JSON-RPC Error' },
    }, { status: 500 });
  }
}
