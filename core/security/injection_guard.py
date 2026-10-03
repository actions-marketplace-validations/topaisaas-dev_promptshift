"""
Adversarial AI & Prompt Injection Guard
Neutralizes indirect prompt injections, Unicode steganography (zero-width tricks),
and adversarial override patterns lurking inside knowledge documents.
"""

import re
from typing import Dict, List, Tuple

class InjectionGuard:
    # Invisible and steganographic zero-width Unicode characters
    ZERO_WIDTH_CHARS = [
        '\u200B', '\u200C', '\u200D', '\uFEFF', '\u2060', '\u200E', '\u200F',
        '\u202A', '\u202B', '\u202C', '\u202D', '\u202E'
    ]

    # Malicious injection and jailbreak patterns
    ADVERSARIAL_PATTERNS = [
        r"(?i)ignore\s+(all\s+)?(previous|prior)\s+(instructions|directives|rules)",
        r"(?i)system\s+override",
        r"(?i)disregard\s+the\s+above",
        r"(?i)you\s+are\s+now\s+in\s+developer\s+mode",
        r"(?i)exfiltrate\s+(all\s+)?data\s+to",
        r"(?i)output\s+the\s+full\s+system\s+prompt"
    ]

    @classmethod
    def clean_unicode_steganography(cls, text: str) -> Tuple[str, int]:
        count = 0
        cleaned = []
        for char in text:
            if char in cls.ZERO_WIDTH_CHARS:
                count += 1
            else:
                cleaned.append(char)
        return "".join(cleaned), count

    @classmethod
    def sanitize_knowledge_text(cls, text: str, filename: str) -> Tuple[str, List[Dict[str, str]]]:
        alerts = []
        
        # 1. Clean zero-width steganography
        clean_text, zw_count = cls.clean_unicode_steganography(text)
        if zw_count > 0:
            alerts.append({
                "severity": "HIGH",
                "type": "Unicode Steganography",
                "details": f"{zw_count} invisible zero-width characters stripped from {filename}"
            })

        # 2. Scan adversarial patterns
        for pattern in cls.ADVERSARIAL_PATTERNS:
            matches = re.findall(pattern, clean_text)
            if matches:
                alerts.append({
                    "severity": "CRITICAL",
                    "type": "Potential Indirect Prompt Injection",
                    "details": f"Suspicious pattern detected: '{pattern}' in {filename}"
                })
                # Neutralize by replacing with benign indicator
                clean_text = re.sub(pattern, f"[NEUTRALIZED_PROMPT_INJECTION_ATTEMPT in {filename}]", clean_text)

        # 3. Encapsulate in passive, isolated container
        sanitized_payload = (
            f"<!-- START UNTRUSTED DOCUMENT DATA: {filename} -->\n"
            f"<untrusted_reference_document name=\"{filename}\">\n"
            f"{clean_text.strip()}\n"
            f"</untrusted_reference_document>\n"
            f"<!-- END UNTRUSTED DOCUMENT DATA: {filename} -->"
        )

        return sanitized_payload, alerts
