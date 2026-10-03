"""
Adapter to export a CAPS project to the OpenAI ecosystem (Custom GPTs, Assistants API v2, Cursor).
"""

import os
import json
from typing import Dict, Any
from core.caps_schema import CanonicalProject

class OpenAIAdapter:
    @staticmethod
    def export(project: CanonicalProject, output_dir: str) -> Dict[str, str]:
        os.makedirs(output_dir, exist_ok=True)
        results = {}

        # 1. Generate Custom GPT Manifest (for 1-click ChatGPT Web import)
        gpt_instructions = [
            f"You are the dedicated assistant for {project.metadata.title}.",
            "",
            "### OBJECTIVE & ROLE",
            project.persona.role,
            "",
            "### CORE INSTRUCTIONS",
            project.persona.raw_system_prompt.strip(),
            ""
        ]

        if project.persona.autonomy_clause:
            gpt_instructions.extend([
                "### AUTONOMY & EXECUTION POLICY",
                f"- {project.persona.autonomy_clause}",
                "- Provide direct, ready-to-run solutions and code diffs.",
                ""
            ])

        if project.rules:
            gpt_instructions.append("### MANDATORY RULES & CONSTRAINTS")
            for r in project.rules:
                gpt_instructions.append(f"- [{r.name}]: {r.content.strip()}")
            gpt_instructions.append("")

        gpt_instructions_text = "\n".join(gpt_instructions)

        custom_gpt_manifest = {
            "name": project.metadata.title,
            "description": project.metadata.description,
            "instructions": gpt_instructions_text,
            "conversation_starters": [
                f"Give me an overview of the {project.metadata.title} project",
                "What are the next implementation steps?",
                "Help me design the next architectural feature"
            ],
            "capabilities": {
                "web_browsing": True,
                "code_interpreter": True,
                "dalle_image_generation": False
            },
            "knowledge_files_count": len(project.knowledge_base),
            "target_platform": "chatgpt_custom_gpt"
        }

        gpt_file = os.path.join(output_dir, "custom_gpt_manifest.json")
        with open(gpt_file, "w", encoding="utf-8") as f:
            json.dump(custom_gpt_manifest, f, indent=2, ensure_ascii=False)
        results["custom_gpt_manifest.json"] = gpt_file

        gpt_instructions_file = os.path.join(output_dir, "custom_gpt_instructions.txt")
        with open(gpt_instructions_file, "w", encoding="utf-8") as f:
            f.write(gpt_instructions_text)
        results["custom_gpt_instructions.txt"] = gpt_instructions_file

        # 2. Generate Assistants API v2 Specification
        assistant_v2 = {
            "name": project.metadata.title,
            "description": project.metadata.description,
            "model": "gpt-4o",
            "instructions": gpt_instructions_text,
            "tools": [
                {"type": "code_interpreter"},
                {"type": "file_search"}
            ],
            "metadata": {
                "source": "omniproject_caps",
                "version": project.metadata.version
            }
        }
        assistant_file = os.path.join(output_dir, "openai_assistant_v2.json")
        with open(assistant_file, "w", encoding="utf-8") as f:
            json.dump(assistant_v2, f, indent=2, ensure_ascii=False)
        results["openai_assistant_v2.json"] = assistant_file

        # 3. Generate .cursorrules for Cursor / Windsurf IDE
        cursorrules_lines = [
            f"# Cursor Rules for {project.metadata.title}",
            "",
            "## Role",
            project.persona.role,
            "",
            "## Guidelines",
            project.persona.raw_system_prompt.strip(),
            ""
        ]

        if project.persona.autonomy_clause:
            cursorrules_lines.extend([
                "## Autonomous Mode",
                f"- {project.persona.autonomy_clause}",
                "- Act proactively and edit files with minimal friction.",
                ""
            ])

        if project.rules:
            cursorrules_lines.append("## Project Specific Rules")
            for r in project.rules:
                cursorrules_lines.append(f"### {r.name}")
                cursorrules_lines.append(r.content.strip())
                cursorrules_lines.append("")

        cursorrules_file = os.path.join(output_dir, ".cursorrules")
        with open(cursorrules_file, "w", encoding="utf-8") as f:
            f.write("\n".join(cursorrules_lines))
        results[".cursorrules"] = cursorrules_file

        return results
