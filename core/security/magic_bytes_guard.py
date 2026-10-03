"""
Magic Bytes & Binary Malware Guard
Inspects the actual binary headers (Magic Bytes) of incoming files to block disguised executables
(.exe masquerading as .txt), malicious scripts, and hazardous payloads in RAM.
"""

from typing import Dict, List, Tuple

class MagicBytesGuard:
    # Dangerous binary header signatures
    DANGEROUS_SIGNATURES = {
        b"MZ": "Windows Executable / DLL (PE)",
        b"\x7fELF": "Linux Executable / ELF",
        b"\xca\xfe\xba\xbe": "Mach-O Universal Binary / Java Class",
        b"\xce\xfa\xed\xfe": "Mach-O 32-bit Binary",
        b"\xcf\xfa\xed\xfe": "Mach-O 64-bit Binary",
        b"Rar!\x1a\x07": "Nested RAR Archive",
        b"%PDF-": "PDF Document"
    }

    # Strict positive allowlist for AI project files
    ALLOWED_EXTENSIONS = {
        ".md", ".markdown", ".txt", ".json", ".yaml", ".yml",
        ".xml", ".csv", ".pdf", ".docx", ".prompt", ".rules", ".py", ".ts", ".js"
    }

    @classmethod
    def inspect_file(cls, filename: str, content_bytes: bytes) -> Tuple[bool, str]:
        """
        Verifies if file matches a clean AI document or source code file.
        Returns (is_safe: bool, reason: str).
        """
        # 1. Extension validation
        dot_idx = filename.rfind(".")
        if dot_idx == -1:
            ext = ""
        else:
            ext = filename[dot_idx:].lower()

        if ext not in cls.ALLOWED_EXTENSIONS:
            return False, f"Disallowed file extension ({ext or 'no extension'}). Only documentation, code, and AI metadata files are permitted."

        # 2. Magic bytes validation (anti-renamed malware)
        header_4 = content_bytes[:4]
        header_2 = content_bytes[:2]

        if header_2 == b"MZ":
            return False, "SECURITY ALERT: Windows executable binary (.exe/.dll) disguised under a false extension!"

        if header_4 == b"\x7fELF":
            return False, "SECURITY ALERT: Linux executable binary (ELF) detected!"

        if header_4 in [b"\xca\xfe\xba\xbe", b"\xce\xfa\xed\xfe", b"\xcf\xfa\xed\xfe"]:
            return False, "SECURITY ALERT: Mach-O/Java executable binary detected!"

        # 3. Text file sanitization: ensure text files don't contain null bytes
        if ext in [".md", ".txt", ".json", ".yaml", ".yml", ".xml", ".csv", ".rules"]:
            if b"\x00" in content_bytes[:1024]:
                return False, "SECURITY ALERT: Binary null bytes detected inside a file purported to be pure text."

        return True, "File verified and clean."
