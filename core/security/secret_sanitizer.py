"""
Secret Sanitizer & Redactor Module
Automatically detects and neutralizes API keys, session tokens,
private keys, and sensitive secrets prior to project export or conversion.
"""

import re
from typing import Dict, List, Tuple

class SecretSanitizer:
    # Known regex signatures for API keys and secrets
    SECRET_PATTERNS = {
        "OpenAI API Key": r"sk-[a-zA-Z0-9_-]{32,}",
        "Anthropic API Key": r"sk-ant-[a-zA-Z0-9_-]{32,}",
        "Google API Key": r"AIza[0-9A-Za-z-_]{30,40}",
        "GitHub Token": r"(?:ghp|gho|ghu|ghs|ghr)_[a-zA-Z0-9_]{36,}",
        "AWS Access Key": r"AKIA[0-9A-Z]{16}",
        "Generic Private Key": r"-----BEGIN [A-Z ]+PRIVATE KEY-----",
        "JWT Token": r"ey[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*"
    }

    @classmethod
    def sanitize(cls, text: str) -> Tuple[str, List[Dict[str, str]]]:
        redacted_text = text
        detections = []

        for name, pattern in cls.SECRET_PATTERNS.items():
            matches = list(re.finditer(pattern, redacted_text))
            for match in matches:
                secret_val = match.group(0)
                # Skip short false positives
                if len(secret_val) < 8:
                    continue
                masked = f"[REDACTED_{name.upper().replace(' ', '_')}]"
                redacted_text = redacted_text.replace(secret_val, masked)
                detections.append({
                    "type": name,
                    "preview": secret_val[:6] + "..." + secret_val[-4:],
                    "action": "Successfully Redacted"
                })

        return redacted_text, detections
