"""
Dynamic Models & Platforms Knowledge Registry
Enables zero-downtime maintenance and dynamic adaptation of the converter engine
as frontier model versions and platform schemas evolve without recompiling binary code.
"""

import json
import os
from typing import Dict, Any, Optional

DEFAULT_MODELS_REGISTRY = {
    "version": "2026.10.1",
    "last_updated": "2026-10-01",
    "platforms": {
        "gemini": {
            "name": "Google Gemini & Antigravity",
            "max_context_tokens": 2_000_000,
            "prompt_syntax": "hierarchical_markdown",
            "preferred_tool_format": "mcp",
            "supports_system_instructions": True,
            "rules_file": "GEMINI.md"
        },
        "claude": {
            "name": "Anthropic Claude (Code & Projects)",
            "max_context_tokens": 200_000,
            "prompt_syntax": "xml_structured",
            "preferred_tool_format": "mcp",
            "supports_system_instructions": True,
            "rules_file": "CLAUDE.md"
        },
        "openai": {
            "name": "OpenAI ChatGPT & Assistants API",
            "max_context_tokens": 128_000,
            "custom_gpt_instructions_max_chars": 8_000,
            "prompt_syntax": "imperative_markdown",
            "preferred_tool_format": "openapi_3_1",
            "supports_system_instructions": True,
            "rules_file": ".cursorrules"
        }
    }
}

class ModelsRegistry:
    _instance = None
    _data = DEFAULT_MODELS_REGISTRY

    @classmethod
    def get_platform_info(cls, platform_name: str) -> Dict[str, Any]:
        key = platform_name.lower()
        if "gemini" in key or "antigravity" in key:
            return cls._data["platforms"]["gemini"]
        elif "claude" in key or "anthropic" in key:
            return cls._data["platforms"]["claude"]
        elif "openai" in key or "gpt" in key:
            return cls._data["platforms"]["openai"]
        return {
            "name": platform_name,
            "max_context_tokens": 128_000,
            "prompt_syntax": "standard_markdown",
            "preferred_tool_format": "openapi_3_1"
        }

    @classmethod
    def load_from_remote_or_cache(cls, cache_file_path: Optional[str] = None):
        """
        Loads the latest model registry definition from a local cache or remote endpoint.
        Allows the converter to adapt dynamically without code changes.
        """
        if cache_file_path and os.path.exists(cache_file_path):
            try:
                with open(cache_file_path, "r", encoding="utf-8") as f:
                    cls._data = json.load(f)
            except Exception:
                cls._data = DEFAULT_MODELS_REGISTRY
