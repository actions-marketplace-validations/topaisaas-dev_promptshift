"""
Adapter to ingest Google Antigravity and Gemini Workspace projects into CAPS.
"""

import os
import json
import re
from typing import Optional
from core.caps_schema import (
    CanonicalProject,
    ProjectMetadata,
    PersonaDirective,
    ProjectRule,
    KnowledgeFile,
    ToolDefinition,
    SecurityPolicy
)

class GeminiAntigravityAdapter:
    @staticmethod
    def parse_workspace(workspace_dir: str, project_json_path: Optional[str] = None) -> CanonicalProject:
        project_name = os.path.basename(os.path.abspath(workspace_dir))
        
        # 1. Read GEMINI.md or AGENTS.md
        gemini_md_path = os.path.join(workspace_dir, "GEMINI.md")
        agents_md_path = os.path.join(workspace_dir, "AGENTS.md")
        
        raw_prompt = ""
        autonomy_clause = None
        
        for p in [gemini_md_path, agents_md_path]:
            if os.path.exists(p):
                with open(p, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()
                    if len(content) > len(raw_prompt):
                        raw_prompt = content
                        if "ET BEN BRAVO!" in content:
                            autonomy_clause = "Full autonomous execution unconditionally active until user trigger: 'ET BEN BRAVO!'"

        # 2. Scan workspace rules in .agents/rules/*.md
        rules = []
        rules_dir = os.path.join(workspace_dir, ".agents", "rules")
        if os.path.exists(rules_dir):
            for fname in os.listdir(rules_dir):
                if fname.endswith(".md"):
                    r_path = os.path.join(rules_dir, fname)
                    with open(r_path, "r", encoding="utf-8", errors="ignore") as f:
                        rule_content = f.read()
                        rules.append(ProjectRule(
                            name=fname,
                            content=rule_content,
                            scope="workspace",
                            trigger="always_on"
                        ))

        # 3. Scan permissions if json exists
        security = SecurityPolicy()
        if project_json_path and os.path.exists(project_json_path):
            try:
                with open(project_json_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    allows = data.get("permissionGrants", {}).get("permissionGrants", {}).get("allow", [])
                    security.allow_grants = allows
                    if "*" in allows or "command(*)" in allows:
                        security.permission_mode = "full_autonomy"
            except Exception:
                pass

        # 4. Scan documentation and knowledge files
        knowledge_files = []
        for root, dirs, files in os.walk(workspace_dir):
            # Exclude build, cache, next.js, exports, and vendor directories
            dirs[:] = [d for d in dirs if d not in [".git", ".agents", "node_modules", ".gemini", "scratch", "dist", "build", "__pycache__", ".next", "exports", ".turbo", ".vercel"]]
            for file in files:
                if file.endswith((".md", ".txt", ".json", ".yaml", ".yml", ".pdf")) and file not in ["GEMINI.md", "AGENTS.md", "package-lock.json"]:
                    fpath = os.path.join(root, file)
                    rel_path = os.path.relpath(fpath, workspace_dir)
                    try:
                        # Safety check: skip huge files over 1MB
                        if os.path.getsize(fpath) > 1_000_000:
                            continue
                        with open(fpath, "r", encoding="utf-8", errors="ignore") as f:
                            text = f.read()
                            knowledge_files.append(KnowledgeFile(
                                filename=rel_path,
                                content_text=text,
                                size_bytes=len(text.encode("utf-8"))
                            ))
                    except Exception:
                        pass

        # Metadata
        metadata = ProjectMetadata(
            id=f"antigravity-{project_name}",
            title=project_name,
            description=f"Exported project from Google Antigravity ({project_name})",
            source_platform="antigravity"
        )

        persona = PersonaDirective(
            role=f"Specialized assistant for {project_name}",
            raw_system_prompt=raw_prompt or f"You are the dedicated assistant for project {project_name}.",
            autonomy_clause=autonomy_clause
        )

        return CanonicalProject(
            metadata=metadata,
            persona=persona,
            rules=rules,
            knowledge_base=knowledge_files,
            security=security
        )
