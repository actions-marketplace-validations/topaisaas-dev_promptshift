"""
Project Fingerprinting & Signature Engine
Automatically detects the source platform, version, and architecture of any AI project
(Gemini, Claude, OpenAI, Cursor) in <5 milliseconds WITHOUT requiring user configuration.
"""

import os
import json
from typing import Dict, Any, List

class ProjectFingerprinter:
    # Deterministic identification signatures
    SIGNATURES = {
        "antigravity": {
            "required_any": ["GEMINI.md", "AGENTS.md", ".agents"],
            "description": "Google Antigravity / Gemini Workspace",
            "version": "2.0"
        },
        "claude_code": {
            "required_any": ["CLAUDE.md", ".claude"],
            "description": "Anthropic Claude Code CLI",
            "version": "1.0"
        },
        "claude_project": {
            "required_any": ["claude_project_bundle.json", "claude_project_instructions.xml"],
            "description": "Anthropic Claude Projects (Web)",
            "version": "1.0"
        },
        "chatgpt_custom_gpt": {
            "required_any": ["custom_gpt_manifest.json", "custom_gpt_instructions.txt"],
            "description": "OpenAI ChatGPT Custom GPT",
            "version": "GPT-4o"
        },
        "openai_assistant": {
            "required_any": ["openai_assistant_v2.json", "assistant_spec.json"],
            "description": "OpenAI Assistants API v2",
            "version": "v2"
        },
        "cursor": {
            "required_any": [".cursorrules", ".cursor"],
            "description": "Cursor IDE Workspace Rules",
            "version": "1.0"
        }
    }

    @classmethod
    def detect_from_directory(cls, dir_path: str) -> Dict[str, Any]:
        """
        Scans a local directory and determines platform identity in <5ms.
        """
        dir_path = os.path.abspath(dir_path)
        if not os.path.exists(dir_path):
            raise FileNotFoundError(f"Directory not found: {dir_path}")

        files_and_dirs = set(os.listdir(dir_path))
        
        matches = []
        for platform_key, sig in cls.SIGNATURES.items():
            matched_items = [item for item in sig["required_any"] if item in files_and_dirs]
            if matched_items:
                score = len(matched_items) / len(sig["required_any"])
                matches.append({
                    "platform": platform_key,
                    "description": sig["description"],
                    "version": sig["version"],
                    "matched_signatures": matched_items,
                    "confidence": min(1.0, score + 0.5)
                })

        # Sort by confidence descending
        matches.sort(key=lambda x: x["confidence"], reverse=True)

        if matches:
            best = matches[0]
            return {
                "detected": True,
                "platform": best["platform"],
                "description": best["description"],
                "version": best["version"],
                "confidence": best["confidence"],
                "all_matches": matches
            }

        # Fallback: Generic repository with markdown docs
        has_md = any(f.endswith(".md") for f in files_and_dirs)
        return {
            "detected": False,
            "platform": "generic_markdown_project" if has_md else "unknown",
            "description": "Generic Markdown Project (Ready for AI Directives Injection)",
            "version": "generic",
            "confidence": 0.4,
            "all_matches": []
        }

    @classmethod
    def detect_from_json_dict(cls, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Detects platform if user provides a raw JSON bundle or manifest.
        """
        if "instructions" in data and "conversation_starters" in data:
            return {
                "detected": True,
                "platform": "chatgpt_custom_gpt",
                "description": "OpenAI Custom GPT Manifest",
                "version": "v1",
                "confidence": 0.95
            }
        elif "custom_instructions" in data and "target_platform" in data and "claude" in data.get("target_platform", ""):
            return {
                "detected": True,
                "platform": "claude_project",
                "description": "Claude Project Bundle",
                "version": "v1",
                "confidence": 0.95
            }
        elif "tools" in data and ("model" in data or "assistant" in data):
            return {
                "detected": True,
                "platform": "openai_assistant",
                "description": "OpenAI Assistants API Definition",
                "version": "v2",
                "confidence": 0.90
            }
        return {
            "detected": False,
            "platform": "unknown_json",
            "description": "Unrecognized JSON Manifest",
            "version": "unknown",
            "confidence": 0.2
        }
