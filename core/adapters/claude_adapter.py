"""
Adapter to export a CAPS project to the Anthropic Claude ecosystem (Claude Code CLI + Claude Projects).
"""

import os
import json
from typing import Dict, Any
from core.caps_schema import CanonicalProject

class ClaudeAdapter:
    @staticmethod
    def export(project: CanonicalProject, output_dir: str) -> Dict[str, str]:
        os.makedirs(output_dir, exist_ok=True)
        results = {}

        # 1. Generate CLAUDE.md for Claude Code CLI
        claude_md_lines = [
            f"# {project.metadata.title} - Claude Code Guidelines",
            "",
            "## Role & Identity",
            project.persona.role,
            "",
            "## System Directives",
            project.persona.raw_system_prompt,
            ""
        ]

        if project.persona.autonomy_clause:
            claude_md_lines.extend([
                "## Autonomous Execution Mode",
                f"- **Directives**: {project.persona.autonomy_clause}",
                "- You are authorized to run non-destructive terminal commands and edit files directly.",
                ""
            ])

        if project.rules:
            claude_md_lines.append("## Workspace Rules")
            for r in project.rules:
                claude_md_lines.append(f"### Rule: {r.name}")
                claude_md_lines.append(r.content.strip())
                claude_md_lines.append("")

        claude_md_content = "\n".join(claude_md_lines)
        claude_md_file = os.path.join(output_dir, "CLAUDE.md")
        with open(claude_md_file, "w", encoding="utf-8") as f:
            f.write(claude_md_content)
        results["CLAUDE.md"] = claude_md_file

        # 2. Generate XML Structured Instructions for Claude Projects (Web)
        xml_prompt = [
            "<project_context>",
            f"  <project_name>{project.metadata.title}</project_name>",
            f"  <description>{project.metadata.description}</description>",
            "  <instructions>",
            f"    {project.persona.raw_system_prompt.strip()}",
            "  </instructions>"
        ]

        if project.persona.autonomy_clause:
            xml_prompt.extend([
                "  <autonomy_policy>",
                f"    {project.persona.autonomy_clause}",
                "  </autonomy_policy>"
            ])

        if project.rules:
            xml_prompt.append("  <rules>")
            for r in project.rules:
                xml_prompt.append(f"    <rule name=\"{r.name}\">")
                xml_prompt.append(f"      {r.content.strip()}")
                xml_prompt.append("    </rule>")
            xml_prompt.append("  </rules>")

        xml_prompt.append("</project_context>")
        xml_content = "\n".join(xml_prompt)
        xml_file = os.path.join(output_dir, "claude_project_instructions.xml")
        with open(xml_file, "w", encoding="utf-8") as f:
            f.write(xml_content)
        results["claude_project_instructions.xml"] = xml_file

        # 3. Generate JSON bundle for 1-click import (Claude Extension / API)
        bundle_data = {
            "title": project.metadata.title,
            "custom_instructions": xml_content,
            "knowledge_files": [
                {
                    "filename": k.filename,
                    "content": k.content_text
                }
                for k in project.knowledge_base
            ],
            "exported_at": "2026-10-01",
            "target_platform": "claude_projects"
        }
        bundle_file = os.path.join(output_dir, "claude_project_bundle.json")
        with open(bundle_file, "w", encoding="utf-8") as f:
            json.dump(bundle_data, f, indent=2, ensure_ascii=False)
        results["claude_project_bundle.json"] = bundle_file

        return results
