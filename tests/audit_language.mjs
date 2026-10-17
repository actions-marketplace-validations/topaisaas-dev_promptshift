import fs from 'fs';
import path from 'path';

const frenchWords = ['vous', 'votre', 'notre', 'avec', 'pour', 'dans', 'sur', 'tous', 'toutes', 'gratuit', 'paiement', 'facture', 'projet', 'connexion', 'déconnexion', 'sauvegarder', 'télécharger'];

function scanDir(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === '.git') continue;
      scanDir(fullPath);
    } else if (entry.isFile() && /\.(tsx?|jsx?|html)$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      lines.forEach((l, idx) => {
        const trimmed = l.trim();
        if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) return;
        for (const w of frenchWords) {
          const regex = new RegExp(`\\b${w}\\b`, 'i');
          if (regex.test(trimmed)) {
            console.log(`${fullPath}:${idx + 1} [${w}] -> ${trimmed.slice(0, 100)}`);
            break;
          }
        }
      });
    }
  }
}

console.log('--- Scanning App, Components, Lib for French terms ---');
scanDir('app');
scanDir('components');
scanDir('lib');
console.log('--- Scan Complete ---');
