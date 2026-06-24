// Rebrand Divulgaría/Nova -> PROYECTA + fix unambiguous mojibake.
// Run once: node scripts/rebrand.mjs
import { readFileSync, writeFileSync, readdirSync, statSync, renameSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');

// Order matters: most specific first.
const REPLACERS = [
  // --- Brand name variants (full name only, NEVER the verb "divulgar"/"divulgación") ---
  [/DIVULGAR[IÍ]A/g, 'PROYECTA'],
  [/Divulgar(Ã­a|ï¿½a|�a|\?a|ía)/g, 'Proyecta'],   // mojibake + clean "Divulgaría"
  [/divulgaria/g, 'proyecta'],                       // urls/domains/lowercase brand
  // internal token / session keys
  [/nova-scientia/g, 'proyecta'],
  // component + file identifiers (DivulgaraMark, DivulgaraBrandLockup, DivulgaraTokenSeal, DivulgarasState, setDivulgaras...)
  [/Divulgara/g, 'Proyecta'],
  [/NovaBrand/g, 'ProyectaBrand'],
  // reward token currency
  [/DIVULS/g, 'CRÉDITOS'],
  // compute brand
  [/NOVAS Compute/g, 'PROYECTA Compute'],

  // --- Unambiguous mojibake (UTF-8 mis-decoded as Latin-1, then re-encoded) ---
  [/Ã¡/g, 'á'], [/Ã©/g, 'é'], [/Ã­/g, 'í'], [/Ã³/g, 'ó'], [/Ãº/g, 'ú'],
  [/Ã±/g, 'ñ'], [/Ã'/g, 'Ñ'], [/Ã�/g, 'Ñ'],
  [/Ã�/g, 'Á'], [/Ã‰/g, 'É'], [/Ã�/g, 'Í'], [/Ã“/g, 'Ó'], [/Ãš/g, 'Ú'],
  [/Â¿/g, '¿'], [/Â¡/g, '¡'], [/Âª/g, 'ª'], [/Âº/g, 'º'],
  [/â€™/g, '’'], [/â€˜/g, '‘'], [/â€œ/g, '“'], [/â€/g, '”'], [/â€"/g, '—'], [/â€“/g, '–'],
  [/Â(?=[\s.,;:!?)])/g, ''],   // stray Â before whitespace/punct
];

const EXTS = new Set(['.ts', '.tsx', '.js', '.jsx', '.css', '.html', '.json', '.md']);
const SKIP_DIRS = new Set(['node_modules', 'dist', '.git', '.wrangler', 'bundle', 'reports']);

let filesChanged = 0;
let totalReplacements = 0;

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) {
      if (!SKIP_DIRS.has(name)) walk(p);
    } else if (EXTS.has(extname(name))) {
      processFile(p);
    }
  }
}

function processFile(p) {
  let text = readFileSync(p, 'utf8');
  const original = text;
  let count = 0;
  for (const [re, rep] of REPLACERS) {
    text = text.replace(re, (m) => { count++; return rep; });
  }
  if (text !== original) {
    writeFileSync(p, text, 'utf8');
    filesChanged++;
    totalReplacements += count;
    console.log(`  ${p.replace(ROOT, '')}  (${count})`);
  }
}

// Process src + index.html
walk(join(ROOT, 'src'));
const indexHtml = join(ROOT, 'index.html');
if (existsSync(indexHtml)) processFile(indexHtml);

// Rename brand component file to match new import paths
const oldBrand = join(ROOT, 'src', 'components', 'brand', 'NovaBrand.tsx');
const newBrand = join(ROOT, 'src', 'components', 'brand', 'ProyectaBrand.tsx');
if (existsSync(oldBrand)) {
  renameSync(oldBrand, newBrand);
  console.log('  renamed NovaBrand.tsx -> ProyectaBrand.tsx');
}

console.log(`\nDone. ${filesChanged} files changed, ${totalReplacements} replacements.`);
