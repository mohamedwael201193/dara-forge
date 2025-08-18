// scripts/assert-no-escapes.js
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = 'src';
const offenders = [];
const rx = /useState<[^>]*\\'/;

function walk(p) {
  for (const name of readdirSync(p)) {
    const full = join(p, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full);
    else if (/\\.(tsx?|jsx?)$/.test(name)) {
      const txt = readFileSync(full, 'utf8');
      if (rx.test(txt)) offenders.push(full);
    }
  }
}
walk(root);

if (offenders.length) {
  console.error('Escaped quotes found in useState generics:\n' + offenders.join('\n'));
  process.exit(1);
}


