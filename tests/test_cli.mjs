import { execSync } from 'child_process';
import assert from 'assert';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const CLI_PATH = path.join(ROOT_DIR, 'packages', 'cli', 'bin', 'promptshift.js');

console.log('🧪 Testing PromptShift CLI...');

// 1. Test --version
const versionOutput = execSync(`node "${CLI_PATH}" --version`).toString();
assert.ok(versionOutput.includes('promptshift v1.0.0'), 'CLI version check failed');
console.log('  ✓ CLI --version check passed');

// 2. Test --help
const helpOutput = execSync(`node "${CLI_PATH}" --help`).toString();
assert.ok(helpOutput.includes('npx promptshift [options]'), 'CLI help check failed');
console.log('  ✓ CLI --help check passed');

// 3. Test --dry-run --to=cursor
const dryRunOutput = execSync(`node "${CLI_PATH}" --dry-run --to=cursor`).toString();
const cleanDryRun = dryRunOutput.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '');
assert.ok(cleanDryRun.includes('Transpiling:'), 'CLI dry-run transpilation failed');
assert.ok(cleanDryRun.includes('AST Semantic Parity: 98.5%'), 'Parity metric missing in CLI');
assert.ok(cleanDryRun.includes('.cursorrules'), '.cursorrules missing in CLI output');
console.log('  ✓ CLI --dry-run --to=cursor passed with 98.5% parity');

console.log('🎉 ALL CLI TESTS PASSED!');
