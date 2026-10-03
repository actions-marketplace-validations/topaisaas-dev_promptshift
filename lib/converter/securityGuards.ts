/**
 * In-RAM Security Guards (Magic Bytes, Secret Redactor, Prompt Injection Shield)
 */

export interface SecurityAlert {
  type: string;
  severity: 'INFO' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  preview: string;
  details: string;
}

export class SecurityGuards {
  private static SECRET_PATTERNS: Record<string, RegExp> = {
    'OpenAI API Key': /sk-[a-zA-Z0-9_-]{32,}/g,
    'Anthropic API Key': /sk-ant-[a-zA-Z0-9_-]{32,}/g,
    'Google API Key': /AIza[0-9A-Za-z-_]{35}/g,
    'GitHub Token': /(?:ghp|gho|ghu|ghs|ghr)_[a-zA-Z0-9_]{36,}/g,
    'AWS Access Key': /AKIA[0-9A-Z]{16}/g,
    'Generic Private Key': /-----BEGIN [A-Z ]+PRIVATE KEY-----/g,
    'Stripe Secret Key': /(?:sk_live|rk_live)_[0-9a-zA-Z]{24,}/g,
    'Slack Token': /(?:xoxb|xoxp|xoxa|xoxr)-[0-9a-zA-Z-]{24,}/g,
    'JWT / Bearer Token': /eyJ[a-zA-Z0-9_-]{10,}\.eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/g,
    'Database Connection URI': /(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?):\/\/[^:\s]+:[^@\s]+@[^\s\/]+/gi,
    'SendGrid API Key': /SG\.[a-zA-Z0-9_-]{22}\.[a-zA-Z0-9_-]{43}/g,
    'HuggingFace Token': /hf_[a-zA-Z0-9]{34,}/g,
    'GitLab Token': /glpat-[a-zA-Z0-9_\-]{20,}/g,
    'Discord Bot Token': /[MN][A-Za-z\d]{23,25}\.[\w-]{6}\.[\w-]{27,38}/g,
  };

  private static ZERO_WIDTH_CHARS = [
    '\u200B', '\u200C', '\u200D', '\uFEFF', '\u2060', '\u200E', '\u200F',
    '\u202A', '\u202B', '\u202C', '\u202D', '\u202E'
  ];

  private static ADVERSARIAL_PATTERNS = [
    /ignore\s+(all\s+)?(previous|prior)\s+(instructions|directives|rules)/i,
    /system\s+override/i,
    /disregard\s+the\s+above/i,
    /you\s+are\s+now\s+in\s+developer\s+mode/i,
    /exfiltrate\s+(all\s+)?data\s+to/i,
    /output\s+the\s+full\s+system\s+prompt/i,
  ];

  /**
   * Sanitizes text by redacting sensitive credentials and API keys
   */
  public static sanitizeSecrets(text: string): { cleanText: string; alerts: SecurityAlert[] } {
    if (!text || typeof text !== 'string') {
      return { cleanText: '', alerts: [] };
    }
    let cleanText = text;
    const alerts: SecurityAlert[] = [];

    for (const [name, pattern] of Object.entries(this.SECRET_PATTERNS)) {
      cleanText = cleanText.replace(pattern, (match) => {
        if (match.length < 8) return match;
        const preview = `${match.slice(0, 5)}...${match.slice(-4)}`;
        alerts.push({
          type: name,
          severity: 'HIGH',
          preview,
          details: `Redacted sensitive credential: ${name}`,
        });
        return `[REDACTED_${name.toUpperCase().replace(/\s+/g, '_')}]`;
      });
    }

    return { cleanText, alerts };
  }

  /**
   * Validates whether a file path contains path traversal attempts (Zip Slip)
   */
  public static isSafeFilePath(filePath: string): boolean {
    const normalized = filePath.replace(/\\/g, '/');
    if (normalized.startsWith('/') || normalized.startsWith('../') || normalized.includes('/../') || normalized === '..') {
      return false;
    }
    // Disallow absolute drive letters on Windows (e.g. C:)
    if (/^[a-zA-Z]:/.test(normalized)) {
      return false;
    }
    return true;
  }

  /**
   * Sanitizes knowledge text against indirect prompt injections and zero-width steganography
   */
  public static sanitizeKnowledge(text: string, filename: string): { cleanText: string; alerts: SecurityAlert[] } {
    if (!text || typeof text !== 'string') {
      return { cleanText: '', alerts: [] };
    }
    const alerts: SecurityAlert[] = [];
    let clean = '';
    let zwCount = 0;

    // 1. Strip zero-width Unicode characters
    for (const char of text) {
      if (this.ZERO_WIDTH_CHARS.includes(char)) {
        zwCount++;
      } else {
        clean += char;
      }
    }

    if (zwCount > 0) {
      alerts.push({
        type: 'Unicode Steganography',
        severity: 'HIGH',
        preview: `${zwCount} chars removed`,
        details: `Stripped ${zwCount} invisible zero-width characters in ${filename}`,
      });
    }

    // 2. Detect and neutralize prompt injection attempts
    for (const pattern of this.ADVERSARIAL_PATTERNS) {
      if (pattern.test(clean)) {
        alerts.push({
          type: 'Potential Prompt Injection',
          severity: 'CRITICAL',
          preview: pattern.source.slice(0, 30),
          details: `Neutralized adversarial override pattern in ${filename}`,
        });
        clean = clean.replace(pattern, `[NEUTRALIZED_PROMPT_INJECTION in ${filename}]`);
      }
    }

    // 3. Hermetic containment
    const encapsulated = `<!-- START UNTRUSTED DOCUMENT DATA: ${filename} -->\n<untrusted_reference_document name="${filename}">\n${clean.trim()}\n</untrusted_reference_document>\n<!-- END UNTRUSTED DOCUMENT DATA: ${filename} -->`;

    return { cleanText: encapsulated, alerts };
  }

  /**
   * Validates in-memory binary header to block executable PE (MZ) or Linux ELF files
   */
  public static validateMagicBytes(filename: string, buffer: Uint8Array): { isSafe: boolean; reason?: string } {
    if (buffer.length >= 2 && buffer[0] === 0x4d && buffer[1] === 0x5a) {
      return { isSafe: false, reason: `Blocked Windows Executable (MZ PE binary) masquerading as ${filename}` };
    }
    if (buffer.length >= 4 && buffer[0] === 0x7f && buffer[1] === 0x45 && buffer[2] === 0x4c && buffer[3] === 0x46) {
      return { isSafe: false, reason: `Blocked Linux Executable (ELF binary) disguised as ${filename}` };
    }
    return { isSafe: true };
  }

  /**
   * Enforces in-RAM size, file count, and compression ratio limits (Zip bomb defense)
   */
  public static validateZipLimits(
    totalFiles: number,
    totalUncompressedBytes: number,
    compressedBytes?: number
  ): { isSafe: boolean; reason?: string } {
    const MAX_FILES = 500;
    const MAX_UNCOMPRESSED_BYTES = 50 * 1024 * 1024; // 50 MB
    if (totalFiles > MAX_FILES) {
      return { isSafe: false, reason: `Archive contains ${totalFiles} files, exceeding safe limit of ${MAX_FILES}.` };
    }
    if (totalUncompressedBytes > MAX_UNCOMPRESSED_BYTES) {
      return {
        isSafe: false,
        reason: `Total uncompressed size of ${(totalUncompressedBytes / (1024 * 1024)).toFixed(1)} MB exceeds the 50 MB in-RAM threshold.`,
      };
    }
    if (compressedBytes && compressedBytes > 0 && totalUncompressedBytes / compressedBytes > 100) {
      return {
        isSafe: false,
        reason: `Suspicious compression ratio (${(totalUncompressedBytes / compressedBytes).toFixed(0)}:1) detected (potential Zip bomb). Extraction aborted.`,
      };
    }
    return { isSafe: true };
  }

  /**
   * Escapes untrusted text to prevent DOM-based XSS when rendering user snippets
   */
  public static escapeHtml(raw: string): string {
    return raw
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
