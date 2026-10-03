/**
 * Canonical AI Project Schema (CAPS) v1.0 — TypeScript Port
 * Universal intermediate representation (IR) schema for all AI agent projects.
 */

export interface ProjectMetadata {
  id: string;
  title: string;
  description: string;
  source_platform: 'antigravity' | 'gemini' | 'claude' | 'openai' | 'cursor' | string;
  version: string;
}

export interface PersonaDirective {
  role: string;
  raw_system_prompt: string;
  instructions: string[];
  constraints: string[];
  autonomy_clause?: string | null;
}

export interface ProjectRule {
  name: string;
  content: string;
  scope: 'global' | 'workspace' | 'directory';
  trigger: 'always_on' | 'model_decision';
}

export interface KnowledgeFile {
  filename: string;
  content_text: string;
  mime_type: string;
  size_bytes: number;
}

export interface ToolDefinition {
  name: string;
  description: string;
  input_schema: Record<string, any>;
  protocol: 'mcp' | 'openapi' | 'function_calling';
  raw_config: Record<string, any>;
}

export interface SecurityPolicy {
  permission_mode: 'full_autonomy' | 'ask' | 'strict';
  allow_grants: string[];
  deny_grants: string[];
}

export interface CanonicalProject {
  metadata: ProjectMetadata;
  persona: PersonaDirective;
  rules: ProjectRule[];
  knowledge_base: KnowledgeFile[];
  tools: ToolDefinition[];
  security: SecurityPolicy;
}
