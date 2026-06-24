// Second pass: fix lossy mojibake (� / ? / ??) using specific safe Spanish tokens,
// plus a few pre-existing typos. Run: node scripts/fix-mojibake.mjs
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');

// Each entry: a regex matching the corrupted token (where . stands for the lost char),
// and its correct replacement. Tokens are specific enough to be unambiguous in Spanish.
const FIX = [
  // accented vowels lost as � or single ? — only inside known word fragments
  [/art[�?]cul/g, 'artícul'],
  [/divulgaci[�?]n/g, 'divulgación'],
  [/Divulgaci[�?]n/g, 'Divulgación'],
  [/publicaci[�?]n/g, 'publicación'],
  [/Publicaci[�?]n/g, 'Publicación'],
  [/revisi[�?]n/g, 'revisión'],
  [/Revisi[�?]n/g, 'Revisión'],
  [/informaci[�?]n/g, 'información'],
  [/conversaci[�?]n/g, 'conversación'],
  [/secci[�?]n/g, 'sección'],
  [/sesi[�?]n/g, 'sesión'],
  [/Sesi[�?]n/g, 'Sesión'],
  [/precisi[�?]n/g, 'precisión'],
  [/conexi[�?]n/g, 'conexión'],
  [/[�?]til/g, 'útil'],
  [/autor[�?]a/g, 'autoría'],
  [/cient[�?]fic/g, 'científic'],
  [/Cient[�?]fic/g, 'Científic'],
  [/p[�?]blic/g, 'públic'],
  [/P[�?]blic/g, 'Públic'],
  [/se[�?]al/g, 'señal'],
  [/dise[�?]/g, 'diseñ'],
  [/C[�?]mo\b/g, 'Cómo'],
  [/\bc[�?]mo\b/g, 'cómo'],
  [/categor[�?]a/g, 'categoría'],
  // double-char "??" variants
  [/se\?\?al/g, 'señal'],
  [/publicaci\?\?n/g, 'publicación'],
  [/revisi\?\?n/g, 'revisión'],
  [/secci\?\?n/g, 'sección'],
  // pre-existing plain typos in the source
  [/publicacines/g, 'publicaciones'],
  [/Publicacines/g, 'Publicaciones'],
  [/PUBLICACINES/g, 'PUBLICACIONES'],
  [/Revisiónes/g, 'Revisiones'],
];

const EXTS = new Set(['.ts', '.tsx', '.js', '.jsx', '.css', '.html']);
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
  for (const [re, rep] of FIX) t = t.replace(re, () => { c++; return rep; });
  if (t !== o) { writeFileSync(p, t, 'utf8'); changed++; total += c; console.log(`  ${p.replace(ROOT,'')} (${c})`); }
}
walk(join(ROOT, 'src'));
console.log(`\nDone. ${changed} files, ${total} fixes.`);
