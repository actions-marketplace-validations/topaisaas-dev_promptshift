"""
Safe ZIP Ingest & Stream Guard
Protects the SaaS against:
1. Zip-Slip (arbitrary system file overwrite via ../../ traversal)
2. Zip-Bombs (denial of service via memory or disk decompression saturation)
3. Dangerous binaries / disguised executable scripts (.exe, .bat, .sh)
"""

import os
import zipfile
import io
from typing import Dict, List, Tuple

class SafeZipGuard:
    # Strict security thresholds
    MAX_UNCOMPRESSED_TOTAL_BYTES = 50 * 1024 * 1024  # 50 MB max uncompressed
    MAX_FILE_COUNT = 300                             # 300 files max per archive
    MAX_COMPRESSION_RATIO = 100                      # Max 100:1 ratio (anti-zip-bomb)
    FORBIDDEN_EXTENSIONS = {".exe", ".bat", ".cmd", ".sh", ".dll", ".so", ".bin", ".vbs", ".ps1"}

    @classmethod
    def safely_extract_to_memory(cls, zip_bytes: bytes) -> Tuple[Dict[str, str], List[str]]:
        """
        Extracts ZIP archive 100% in volatile memory (RAM-Only) with rigorous security checks.
        NEVER touches host server persistent disk.
        """
        extracted_files = {}
        security_alerts = []

        total_bytes = 0
        file_count = 0

        with zipfile.ZipFile(io.BytesIO(zip_bytes), "r") as zf:
            infolist = zf.infolist()
            
            if len(infolist) > cls.MAX_FILE_COUNT:
                raise ValueError(f"ZIP Security: Archive contains too many files ({len(infolist)} > {cls.MAX_FILE_COUNT}).")

            for info in infolist:
                # 1. Skip directories
                if info.is_dir():
                    continue

                # 2. Anti-Zip-Slip protection (malicious path traversal)
                filename = info.filename.replace("\\", "/")
                if "../" in filename or filename.startswith("/") or ":" in filename:
                    security_alerts.append(f"Blocked file (Zip-Slip traversal attempt): {filename}")
                    continue

                # 3. Binary executable filter
                _, ext = os.path.splitext(filename.lower())
                if ext in cls.FORBIDDEN_EXTENSIONS:
                    security_alerts.append(f"Executable file ignored for security: {filename}")
                    continue

                # 4. Anti-Zip-Bomb protection (compression ratio check)
                if info.compress_size > 0:
                    ratio = info.file_size / info.compress_size
                    if ratio > cls.MAX_COMPRESSION_RATIO:
                        raise ValueError(f"ZIP Security: Zip-Bomb alert detected on {filename} (ratio {ratio:.1f}:1).")

                total_bytes += info.file_size
                if total_bytes > cls.MAX_UNCOMPRESSED_TOTAL_BYTES:
                    raise ValueError(f"ZIP Security: Exceeded uncompressed size limit ({cls.MAX_UNCOMPRESSED_TOTAL_BYTES // (1024*1024)} MB).")

                file_count += 1

                # 5. Clean in-memory UTF-8 decoding
                try:
                    with zf.open(info) as f:
                        raw_data = f.read()
                        text_content = raw_data.decode("utf-8", errors="replace")
                        extracted_files[filename] = text_content
                except Exception as e:
                    security_alerts.append(f"Unable to read file {filename}: {str(e)}")

        return extracted_files, security_alerts
