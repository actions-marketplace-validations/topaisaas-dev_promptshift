"""
Canonical AI Project Schema (CAPS) v1.0
The universal intermediate representation (IR) schema for all AI agent projects.
"""

from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional
import json

@dataclass
class ProjectMetadata:
    id: str
    title: str
    description: str
    source_platform: str  # 'antigravity', 'gemini', 'claude', 'openai'
    version: str = "1.0.0"

@dataclass
class PersonaDirective:
    role: str
    raw_system_prompt: str
    instructions: List[str] = field(default_factory=list)
    constraints: List[str] = field(default_factory=list)
    autonomy_clause: Optional[str] = None

@dataclass
class ProjectRule:
    name: str
    content: str
    scope: str = "workspace"  # 'global', 'workspace', 'directory'
    trigger: str = "always_on"  # 'always_on', 'model_decision'

@dataclass
class KnowledgeFile:
    filename: str
    content_text: str
    mime_type: str = "text/plain"
    size_bytes: int = 0

@dataclass
class ToolDefinition:
    name: str
    description: str
    input_schema: Dict[str, Any] = field(default_factory=dict)
    protocol: str = "mcp"  # 'mcp', 'openapi', 'function_calling'
    raw_config: Dict[str, Any] = field(default_factory=dict)

@dataclass
class SecurityPolicy:
    permission_mode: str = "full_autonomy"  # 'full_autonomy', 'ask', 'strict'
    allow_grants: List[str] = field(default_factory=list)
    deny_grants: List[str] = field(default_factory=list)

@dataclass
class CanonicalProject:
    metadata: ProjectMetadata
    persona: PersonaDirective
    rules: List[ProjectRule] = field(default_factory=list)
    knowledge_base: List[KnowledgeFile] = field(default_factory=list)
    tools: List[ToolDefinition] = field(default_factory=list)
    security: SecurityPolicy = field(default_factory=SecurityPolicy)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "metadata": self.metadata.__dict__,
            "persona": self.persona.__dict__,
            "rules": [r.__dict__ for r in self.rules],
            "knowledge_base": [k.__dict__ for k in self.knowledge_base],
            "tools": [t.__dict__ for t in self.tools],
            "security": self.security.__dict__
        }

    def to_json(self, indent: int = 2) -> str:
        return json.dumps(self.to_dict(), indent=indent, ensure_ascii=False)
