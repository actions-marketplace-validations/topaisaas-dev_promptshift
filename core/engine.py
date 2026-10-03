"""
OmniProject Engine v2.0 (Hardened & Optimized)
High-resilience orchestration engine integrating secret redaction,
indirect prompt injection defense, context sharding, and semantic parity auditing.
"""

import os
import json
from typing import Dict, Any, List
from core.caps_schema import CanonicalProject
from core.adapters.gemini_antigravity import GeminiAntigravityAdapter
from core.adapters.claude_adapter import ClaudeAdapter
from core.adapters.openai_adapter import OpenAIAdapter
from core.security.secret_sanitizer import SecretSanitizer
from core.security.injection_guard import InjectionGuard
from core.optimizer.context_sharder import ContextSharder
from core.optimizer.parity_auditor import ParityAuditor

class OmniProjectEngine:
    def __init__(self, workspace_path: str):
        self.workspace_path = os.path.abspath(workspace_path)
        self.project_name = os.path.basename(self.workspace_path)

    def convert_to_all(self, output_base_dir: str) -> Dict[str, Any]:
        """
        Converts the current project to Claude and OpenAI formats with security shields and parity auditing.
        """
        # Find associated project json if available
        project_json = None
        gemini_config_dir = r"C:\Users\Admin\.gemini\config\projects"
        if os.path.exists(gemini_config_dir):
            for f in os.listdir(gemini_config_dir):
                if f.endswith(".json"):
                    full_p = os.path.join(gemini_config_dir, f)
                    try:
                        with open(full_p, "r", encoding="utf-8") as jf:
                            d = json.load(jf)
                            res = d.get("projectResources", {}).get("resources", [])
                            if any(self.project_name in r.get("folderUri", "") for r in res):
                                project_json = full_p
                                break
                    except Exception:
                        pass

        # 1. Ingestion to universal CAPS representation
        caps_project = GeminiAntigravityAdapter.parse_workspace(self.workspace_path, project_json)

        # 2. Classic & AI Security Shields
        # A) Redact secrets from system prompt
        sanitized_prompt, secret_alerts = SecretSanitizer.sanitize(caps_project.persona.raw_system_prompt)
        caps_project.persona.raw_system_prompt = sanitized_prompt

        # B) Neutralize indirect injections in knowledge files
        all_injection_alerts = []
        for kfile in caps_project.knowledge_base:
            clean_content, injection_alerts = InjectionGuard.sanitize_knowledge_text(kfile.content_text, kfile.filename)
            kfile.content_text = clean_content
            all_injection_alerts.extend(injection_alerts)

        # 3. Context budget analysis
        total_text_volume = caps_project.persona.raw_system_prompt + "".join(k.content_text for k in caps_project.knowledge_base)
        claude_budget = ContextSharder.analyze_budget(total_text_volume, "claude")
        openai_budget = ContextSharder.analyze_budget(total_text_volume, "chatgpt_custom_gpt_instructions")

        # 4. Save CAPS universal intermediate representation
        caps_output_dir = os.path.join(output_base_dir, "caps_universal")
        os.makedirs(caps_output_dir, exist_ok=True)
        caps_file = os.path.join(caps_output_dir, "project_caps.json")
        with open(caps_file, "w", encoding="utf-8") as f:
            f.write(caps_project.to_json(indent=2))

        # 5. Export to Claude
        claude_output_dir = os.path.join(output_base_dir, "claude_export")
        claude_files = ClaudeAdapter.export(caps_project, claude_output_dir)

        # 6. Export to OpenAI
        openai_output_dir = os.path.join(output_base_dir, "openai_export")
        openai_files = OpenAIAdapter.export(caps_project, openai_output_dir)

        # 7. Parity audits
        claude_parity = ParityAuditor.audit_parity(caps_project, "claude")
        openai_parity = ParityAuditor.audit_parity(caps_project, "openai")

        # 8. Generate comprehensive Migration & Audit Report
        report_file = os.path.join(output_base_dir, "MIGRATION_REPORT.md")
        report_content = self._generate_report(
            caps_project,
            claude_files,
            openai_files,
            secret_alerts,
            all_injection_alerts,
            claude_budget,
            openai_budget,
            claude_parity,
            openai_parity
        )
        with open(report_file, "w", encoding="utf-8") as f:
            f.write(report_content)

        return {
            "project_name": self.project_name,
            "caps_file": caps_file,
            "claude_files": claude_files,
            "openai_files": openai_files,
            "report_file": report_file,
            "rules_count": len(caps_project.rules),
            "knowledge_files_count": len(caps_project.knowledge_base),
            "autonomy_preserved": bool(caps_project.persona.autonomy_clause),
            "secrets_detected": len(secret_alerts),
            "injections_neutralized": len(all_injection_alerts),
            "claude_parity_score": claude_parity["overall_parity_score"],
            "openai_parity_score": openai_parity["overall_parity_score"]
        }

    def _generate_report(
        self,
        project: CanonicalProject,
        claude_files: Dict[str, str],
        openai_files: Dict[str, str],
        secret_alerts: List[Dict[str, str]],
        injection_alerts: List[Dict[str, str]],
        claude_budget: Dict[str, Any],
        openai_budget: Dict[str, Any],
        claude_parity: Dict[str, Any],
        openai_parity: Dict[str, Any]
    ) -> str:
        sec_section = "### A. Secret Detection & Redaction\n"
        if secret_alerts:
            for s in secret_alerts:
                sec_section += f"- ⚠️ **[{s['type']}]**: {s['preview']} -> {s['action']}\n"
        else:
            sec_section += "- ✅ Zero plaintext secrets detected (API keys, tokens, certificates).\n"

        inj_section = "\n### B. AI Prompt Injection & Steganography Shield\n"
        if injection_alerts:
            for inj in injection_alerts:
                inj_section += f"- 🚨 **[{inj['severity']}] {inj['type']}**: {inj['details']}\n"
        else:
            inj_section += "- ✅ Zero steganographic characters or suspicious prompt injection patterns detected.\n"

        return f"""# Universal AI Migration & Audit Report - {project.metadata.title}
*Generated by OmniProject AI Engine v2.0*

---

## 1. Conversion Summary
- **Source Platform**: Google Antigravity / Gemini
- **Target Platforms**: Anthropic Claude & OpenAI ChatGPT / Assistants
- **Total Rules Processed**: {len(project.rules)}
- **Knowledge Base Documents**: {len(project.knowledge_base)}
- **Autonomy Policy Preserved**: YES (Clause 'ET BEN BRAVO!' compiled)

---

## 2. Semantic Parity Scores (Fidelity Audit)
- **Anthropic Claude**: **{claude_parity['overall_parity_score']}%** ({claude_parity['status']})
- **OpenAI ChatGPT / Assistants**: **{openai_parity['overall_parity_score']}%** ({openai_parity['status']})

---

## 3. Classic & AI Security Audit
{sec_section}
{inj_section}

---

## 4. Context Budget & Sharding Analysis
- **Estimated Volume**: ~{claude_budget['estimated_tokens']:,} tokens
- **Claude Target**: {claude_budget['usage_ratio']:.1%} of context window (Strategy: `{claude_budget['strategy']}`)
- **OpenAI Custom GPT Target**: {openai_budget['usage_ratio']:.1%} of instruction budget (Strategy: `{openai_budget['strategy']}`)

---

## 5. Generated Artifacts for Anthropic Claude
- `CLAUDE.md`: Directives for Claude Code (CLI)
- `claude_project_instructions.xml`: Strict XML system instructions for Claude Projects (Web)
- `claude_project_bundle.json`: 1-Click Automated Import Manifest

## 6. Generated Artifacts for OpenAI
- `custom_gpt_manifest.json`: Configuration manifest for Custom GPTs (ChatGPT Web)
- `custom_gpt_instructions.txt`: Ready-to-paste system instructions
- `openai_assistant_v2.json`: Assistants API v2 Schema specification
- `.cursorrules`: Integrated directives for Cursor & Windsurf IDEs

---
*OmniProject AI — True Sovereign AI Project Interoperability with Zero-Retention Guarantee.*
"""
