// Recolor: blue -> fuchsia (magenta), indigo -> purple, cyan -> rose.
// Only touches Tailwind utility tokens (the "<color>-" prefix). Semantic
// green/red/emerald/amber/slate stay. Run: node scripts/recolor.mjs
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');

const MAP = [
  [/blue-/g, 'fuchsia-'],
  [/indigo-/g, 'purple-'],
  [/cyan-/g, 'rose-'],
  [/sky-/g, 'rose-'],
];

const EXTS = new Set(['.tsx', '.jsx', '.ts', '.js', '.html']);
const SKIP = new Set(['node_modules', 'dist', '.git', '.wrangler', 'bundle', 'reports']);
let changed = 0, total = 0;

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) { if (!SKIP.has(name)) walk(p); }
    else if (EXTS.has(extname(name))) proc(p);
  }
}
function proc(p) {
  let t = readFileSync(p, 'utf8'); const o = t; let c = 0;
  for (const [re, rep] of MAP) t = t.replace(re, () => { c++; return rep; });
  if (t !== o) { writeFileSync(p, t, 'utf8'); changed++; total += c; console.log(`  ${p.replace(ROOT,'')} (${c})`); }
}
walk(join(ROOT, 'src'));
console.log(`\nDone. ${changed} files, ${total} swaps.`);
