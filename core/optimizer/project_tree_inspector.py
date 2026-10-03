"""
Full Project Tree & Multi-File Diff Inspector
Scans 100% of a code or AI project repository (complete file tree),
categorizes files by semantic criticality, and powers the multi-file diff inspector.
"""

import os
import hashlib
from typing import Dict, Any, List

class FullProjectTreeInspector:
    # Semantic categorization of project files
    CATEGORIES = {
        "MASTER_INSTRUCTION": ["GEMINI.md", "AGENTS.md", "CLAUDE.md", "custom_gpt_instructions.txt", ".cursorrules"],
        "RULE": [".agents/rules/", ".cursor/rules/", ".claude/"],
        "TOOL_SPEC": ["mcp_config.json", "actions_openapi_schema.json", "tools.json", ".agents/hooks.json"],
        "CONFIG": ["package.json", "requirements.txt", "pyproject.toml", "tsconfig.json", "settings.json"],
        "KNOWLEDGE_DOC": [".md", ".txt", ".pdf", ".docx", ".csv", ".json", ".yaml", ".yml"]
    }

    IGNORE_DIRS = {
        ".git", "node_modules", ".venv", "venv", "__pycache__", "dist",
        "build", ".next", ".turbo", "target", ".cache", "coverage"
    }

    @classmethod
    def scan_entire_project(cls, root_dir: str) -> Dict[str, Any]:
        root_dir = os.path.abspath(root_dir)
        tree_manifest = {
            "root_path": root_dir,
            "total_files_scanned": 0,
            "total_bytes": 0,
            "eligible_files_count": 0,
            "ignored_files_count": 0,
            "categories": {
                "master_instructions": [],
                "rules": [],
                "tools_and_hooks": [],
                "knowledge_docs": [],
                "configs": []
            },
            "file_tree": []
        }

        for root, dirs, files in os.walk(root_dir):
            # In-memory pruning of heavy dependency/build folders
            dirs[:] = [d for d in dirs if d not in cls.IGNORE_DIRS]

            for file in files:
                tree_manifest["total_files_scanned"] += 1
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, root_dir).replace("\\", "/")
                
                try:
                    file_size = os.path.getsize(full_path)
                    tree_manifest["total_bytes"] += file_size
                except OSError:
                    continue

                # Categorization
                cat, target_equiv = cls._categorize_file(rel_path)
                
                entry = {
                    "path": rel_path,
                    "size_bytes": file_size,
                    "category": cat,
                    "target_equivalent": target_equiv,
                    "is_text": cls._is_text_extension(rel_path)
                }

                tree_manifest["file_tree"].append(entry)

                if cat == "MASTER_INSTRUCTION":
                    tree_manifest["categories"]["master_instructions"].append(entry)
                elif cat == "RULE":
                    tree_manifest["categories"]["rules"].append(entry)
                elif cat == "TOOL_SPEC":
                    tree_manifest["categories"]["tools_and_hooks"].append(entry)
                elif cat == "CONFIG":
                    tree_manifest["categories"]["configs"].append(entry)
                elif cat == "KNOWLEDGE_DOC":
                    tree_manifest["categories"]["knowledge_docs"].append(entry)
                else:
                    tree_manifest["ignored_files_count"] += 1

        tree_manifest["eligible_files_count"] = len(tree_manifest["file_tree"]) - tree_manifest["ignored_files_count"]
        return tree_manifest

    @classmethod
    def _categorize_file(cls, rel_path: str):
        basename = os.path.basename(rel_path)
        
        # 1. Master instructions
        for m in cls.CATEGORIES["MASTER_INSTRUCTION"]:
            if basename == m or rel_path == m:
                return "MASTER_INSTRUCTION", "CLAUDE.md / custom_gpt_instructions.txt"

        # 2. Rules
        for r in cls.CATEGORIES["RULE"]:
            if r in rel_path:
                return "RULE", "Project Rules Section"

        # 3. Tool specs
        for t in cls.CATEGORIES["TOOL_SPEC"]:
            if basename == t or rel_path.endswith(t):
                return "TOOL_SPEC", "MCP Server Tool Config / OpenAPI Actions"

        # 4. Configs
        for c in cls.CATEGORIES["CONFIG"]:
            if basename == c:
                return "CONFIG", "Environment Config"

        # 5. Knowledge docs
        for ext in cls.CATEGORIES["KNOWLEDGE_DOC"]:
            if rel_path.endswith(ext):
                return "KNOWLEDGE_DOC", "RAG Knowledge Base Document"

        return "OTHER", "Unmodified Project Asset"

    @staticmethod
    def _is_text_extension(rel_path: str) -> bool:
        ext = os.path.splitext(rel_path)[1].lower()
        return ext in {
            ".md", ".txt", ".json", ".yaml", ".yml", ".xml", ".csv",
            ".py", ".ts", ".js", ".html", ".css", ".toml", ".ini", ".cfg", ".sh", ".bat"
        }
