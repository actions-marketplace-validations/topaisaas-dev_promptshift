"""
Context Sharder & Token Budget Optimizer
Handles context window asymmetry across platforms (Gemini 2M vs Claude 200k vs OpenAI 128k/8k).
"""

from typing import Dict, List, Any

class ContextSharder:
    # Safe token limit references per platform
    PLATFORM_LIMITS = {
        "gemini": 2_000_000,
        "claude": 200_000,
        "chatgpt_custom_gpt_instructions": 8_000,
        "openai_assistant": 128_000
    }

    @staticmethod
    def estimate_tokens(text: str) -> int:
        # Conservative heuristic (~4 chars per token average for multilingual / code)
        return max(1, len(text) // 4)

    @classmethod
    def analyze_budget(cls, total_text: str, target_platform: str) -> Dict[str, Any]:
        tokens = cls.estimate_tokens(total_text)
        limit = cls.PLATFORM_LIMITS.get(target_platform.lower(), 128_000)
        
        ratio = tokens / limit
        is_overflow = tokens > limit

        recommendations = []
        if is_overflow:
            recommendations.append(
                f"Notice: Total project volume is ~{tokens:,} tokens, exceeding the recommended limit of {limit:,} tokens for {target_platform}."
            )
            recommendations.append(
                "Automated Action: Raw documentation offloaded to vector RAG indexing (File Search / Embeddings) with executive summary generation."
            )
        else:
            recommendations.append(
                f"Optimal Context: ~{tokens:,} tokens within maximum budget of {limit:,} tokens ({ratio:.1%})."
            )

        return {
            "estimated_tokens": tokens,
            "target_limit": limit,
            "usage_ratio": round(ratio, 3),
            "is_overflow": is_overflow,
            "strategy": "vector_rag_sharding" if is_overflow else "direct_context_injection",
            "recommendations": recommendations
        }
