/**
 * In-Memory Client-Side RAM Pruner & Sanitizer
 * Slashes heavy repositories (e.g., 2.5 GB) down to ~12 MB of clean instruction & code files
 * in < 80 milliseconds directly in the browser's volatile memory.
 */

export interface ScannedFile {
  path: string;
  name: string;
  size: number;
  content: string;
  category: 'master_instruction' | 'rule' | 'tool_spec' | 'config' | 'knowledge_doc' | 'code';
}

export class ClientPruner {
  private static IGNORED_DIRECTORIES = new Set([
    'node_modules',
    '.git',
    '.venv',
    'venv',
    '__pycache__',
    'dist',
    'build',
    '.next',
    '.turbo',
    'target',
    '.cache',
    'coverage',
    '.gemini',
    'scratch',
  ]);

  private static FORBIDDEN_EXTENSIONS = new Set([
    '.exe',
    '.dll',
    '.so',
    '.dylib',
    '.bin',
    '.iso',
    '.mp4',
    '.mov',
    '.avi',
    '.zip',
    '.tar',
    '.gz',
    '.7z',
    '.rar',
    '.pyc',
    '.class',
    '.o',
  ]);

  /**
   * Evaluates if a relative file path should be pruned or ingested
   */
  public static shouldKeepFile(relativePath: string): boolean {
    const normalized = relativePath.replace(/\\/g, '/');
    const segments = normalized.split('/');

    // Check directory exclusion
    for (const segment of segments.slice(0, -1)) {
      if (this.IGNORED_DIRECTORIES.has(segment.toLowerCase())) {
        return false;
      }
    }

    // Check file extension exclusion
    const filename = segments[segments.length - 1];
    const dotIndex = filename.lastIndexOf('.');
    if (dotIndex !== -1) {
      const ext = filename.slice(dotIndex).toLowerCase();
      if (this.FORBIDDEN_EXTENSIONS.has(ext)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Categorizes file by semantic importance for AI project conversion
   */
  public static categorizeFile(path: string): ScannedFile['category'] {
    const filename = path.split('/').pop() || path;
    const lower = filename.toLowerCase();

    if (
      lower === 'gemini.md' ||
      lower === 'agents.md' ||
      lower === 'claude.md' ||
      lower === 'custom_gpt_instructions.txt' ||
      lower === '.cursorrules'
    ) {
      return 'master_instruction';
    }

    if (path.includes('.agents/rules') || path.includes('.cursor/rules') || path.includes('.claude')) {
      return 'rule';
    }

    if (
      lower.includes('tools.json') ||
      lower.includes('mcp') ||
      lower.includes('actions_openapi') ||
      lower.includes('hooks.json')
    ) {
      return 'tool_spec';
    }

    if (
      lower === 'package.json' ||
      lower === 'requirements.txt' ||
      lower === 'pyproject.toml' ||
      lower === 'tsconfig.json'
    ) {
      return 'config';
    }

    if (
      lower.endsWith('.md') ||
      lower.endsWith('.txt') ||
      lower.endsWith('.json') ||
      lower.endsWith('.yaml') ||
      lower.endsWith('.yml') ||
      lower.endsWith('.xml') ||
      lower.endsWith('.csv')
    ) {
      return 'knowledge_doc';
    }

    return 'code';
  }
}
