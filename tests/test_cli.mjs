import { execSync } from 'child_process';
import assert from 'assert';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const CLI_PATH = path.join(ROOT_DIR, 'packages', 'cli', 'bin', 'promptshift.js');

console.log('🧪 Testing PromptShift CLI & STDIO MCP Server...');

// 1. Test --version
const versionOutput = execSync(`node "${CLI_PATH}" --version`).toString();
assert.ok(versionOutput.includes('promptshift v1.1.0'), 'CLI version check failed');
console.log('  ✓ CLI --version check passed (v1.1.0)');

// 2. Test --help
const helpOutput = execSync(`node "${CLI_PATH}" --help`).toString();
assert.ok(helpOutput.includes('npx promptshift [options]'), 'CLI help check failed');
assert.ok(helpOutput.includes('--mcp'), 'CLI --mcp option missing in help');
console.log('  ✓ CLI --help check passed');

// 3. Test --dry-run --to=cursor
const dryRunOutput = execSync(`node "${CLI_PATH}" --dry-run --to=cursor`).toString();
const cleanDryRun = dryRunOutput.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '');
assert.ok(cleanDryRun.includes('Transpiling:'), 'CLI dry-run transpilation failed');
assert.ok(cleanDryRun.includes('AST Semantic Parity: 98.5%'), 'Parity metric missing in CLI');
assert.ok(cleanDryRun.includes('.cursorrules'), '.cursorrules missing in CLI output');
console.log('  ✓ CLI --dry-run --to=cursor passed with 98.5% parity');

// 4. Test --mcp STDIO JSON-RPC Server (initialize & tools/list)
const mcpRequests = [
  JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: {} }),
  JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} })
].join('\n') + '\n';

const mcpOutput = execSync(`node "${CLI_PATH}" --mcp`, { input: mcpRequests }).toString().trim().split('\n');
assert.strictEqual(mcpOutput.length, 2, 'Expected 2 JSON-RPC responses from --mcp');
const initRes = JSON.parse(mcpOutput[0]);
const toolsRes = JSON.parse(mcpOutput[1]);
assert.strictEqual(initRes.result.serverInfo.name, 'promptshift-universal-bridge');
assert.strictEqual(toolsRes.result.tools.length, 2);
assert.strictEqual(toolsRes.result.tools[0].name, 'promptshift_transpile');
console.log('  ✓ CLI --mcp STDIO JSON-RPC 2.0 server verified');

console.log('🎉 ALL CLI & MCP TESTS PASSED!');
