// Higiene automática del proyecto Scarlett & Byron:
// 1. Codificación UTF-8 limpia (0 mojibake)
// 2. Modularidad estricta: ningún archivo en src/ supera las 500 líneas
// 3. Todo enlace con target="_blank" incluye rel="noopener..."
// 4. Clases canónicas Tailwind v4 (sin leading-[...], min-h-[...], max-w-[...], [mask-image:...])
// 5. Blindaje móvil iOS/Android (overflow-x: clip, 100dvh, inputs 16px, viewport-fit=cover, sin bloquear zoom)
// 6. Archivos de producción Vercel y SEO/OG presentes

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SRC_DIR = path.join(ROOT, 'src');
const SCRIPTS_DIR = path.join(ROOT, 'scripts');
const INDEX_HTML = path.join(ROOT, 'index.html');
const CSS_FILE = path.join(SRC_DIR, 'index.css');

const MOJIBAKE_RE =
  /Ã[¡©­³º±¼ÁÉÍÓÚÑ€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ]|Â[·¡¿°ªº]|â€|â†|âœ|â˜|ï¸|ðŸ|\uFFFD/;
const NON_CANONICAL_TW_RE = /leading-\[\d|min-h-\[\d|max-w-\[\d|\bh-\[2px\]|\[mask-image:/;
const HARDCODED_WEBHOOK_RE = /https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]{20,}\/exec/i;

let fail = 0;
let checkedFiles = 0;

function checkFile(filePath, isSrcFile = false) {
  checkedFiles++;
  const txt = fs.readFileSync(filePath, 'utf8');
  const lines = txt.split(/\r?\n/);
  const relPath = path.relative(ROOT, filePath);

  lines.forEach((line, idx) => {
    if (MOJIBAKE_RE.test(line)) {
      fail++;
      console.log(`  [FALLA] Mojibake en ${relPath}:${idx + 1}`);
    }
    if (isSrcFile && /\.jsx$/i.test(filePath) && NON_CANONICAL_TW_RE.test(line)) {
      fail++;
      console.log(`  [FALLA] Clase Tailwind no canónica en ${relPath}:${idx + 1}`);
    }
    if (isSrcFile && HARDCODED_WEBHOOK_RE.test(line)) {
      fail++;
      console.log(
        `  [FALLA] URL real de Apps Script hardcodeada en ${relPath}:${idx + 1} (mover a .env / VITE_SHEETS_WEBHOOK_URL)`
      );
    }
  });

  if (isSrcFile && lines.length > 500) {
    fail++;
    console.log(`  [FALLA] Archivo supera las 500 líneas (${lines.length}): ${relPath}`);
  }

  if (/\.jsx$/i.test(filePath)) {
    const blankRe = /<a\b[^>]*target=["']_blank["'][^>]*>/g;
    let match;
    while ((match = blankRe.exec(txt))) {
      if (!/noopener/.test(match[0])) {
        fail++;
        console.log(`  [FALLA] target="_blank" sin rel="noopener" en ${relPath}`);
      }
    }

    if (/-left-\[9999px\]/.test(txt)) {
      fail++;
      console.log(`  [FALLA] Coordenada negativa -left-[9999px] en ${relPath} (usar sr-only)`);
    }
  }
}

function checkResponsiveAndDeploy() {
  const css = fs.readFileSync(CSS_FILE, 'utf8');
  if (!css.includes('overflow-x: clip')) {
    fail++;
    console.log('  [FALLA] Falta overflow-x: clip en src/index.css');
  }
  if (!css.includes('100dvh')) {
    fail++;
    console.log('  [FALLA] Falta min-height: 100dvh en src/index.css');
  }
  if (!css.includes('font-size: 16px')) {
    fail++;
    console.log('  [FALLA] Falta blindaje anti-zoom iOS (font-size: 16px) en src/index.css');
  }
  if (!css.includes('touch-action: manipulation')) {
    fail++;
    console.log('  [FALLA] Falta touch-action: manipulation en botones/enlaces en src/index.css');
  }
  if (!css.includes('appearance: none')) {
    fail++;
    console.log('  [FALLA] Falta normalización appearance: none para inputs iOS en src/index.css');
  }

  const html = fs.readFileSync(INDEX_HTML, 'utf8');
  if (!html.includes('viewport-fit=cover')) {
    fail++;
    console.log('  [FALLA] Falta viewport-fit=cover en index.html');
  }
  if (/user-scalable\s*=\s*no|maximum-scale\s*=\s*1(\.0)?\b/i.test(html)) {
    fail++;
    console.log('  [FALLA] index.html no debe bloquear zoom de accesibilidad');
  }

  const requiredFiles = [
    '.gitignore',
    '.env.example',
    '.github/workflows/ci.yml',
    'vercel.json',
    'google-apps-script/Code.gs',
    'docs/GUIA_GOOGLE_DRIVE.md',
    'public/audio/cancion.mp3',
    'public/og-image.jpg',
    'public/apple-touch-icon.png',
    'public/icon-192.png',
    'public/icon-512.png',
    'public/favicon.svg',
    'public/manifest.json',
    'public/robots.txt',
    'public/sitemap.xml',
  ];
  for (const rel of requiredFiles) {
    if (!fs.existsSync(path.join(ROOT, rel))) {
      fail++;
      console.log(`  [FALLA] Falta archivo requerido de producción: ${rel}`);
    }
  }

  if (fs.existsSync(path.join(ROOT, 'public/audio/LEEME.txt'))) {
    fail++;
    console.log('  [FALLA] Eliminar archivo temporal public/audio/LEEME.txt antes de producción');
  }

  // Verificar que no haya imágenes huérfanas sin usar en public/images/
  const imagesDir = path.join(ROOT, 'public/images');
  if (fs.existsSync(imagesDir)) {
    const referenceCorpus = [
      fs.readFileSync(INDEX_HTML, 'utf8'),
      fs.readFileSync(path.join(ROOT, 'src/data/weddingData.js'), 'utf8'),
      fs.readFileSync(path.join(ROOT, 'scripts/generate-og.mjs'), 'utf8'),
    ].join('\n');

    for (const entry of fs.readdirSync(imagesDir, { withFileTypes: true })) {
      if (!entry.isFile()) continue;
      if (!referenceCorpus.includes(entry.name)) {
        fail++;
        console.log(`  [FALLA] Imagen sin usar en public/images/: ${entry.name}`);
      }
    }
  }

  // Verificar que no queden referencias eliminadas a restricciones alimentarias en src/ ni Code.gs
  const legacyDietRe = /\bdietNotes\b|Restricciones\s+Alimentarias/i;
  const codeGs = fs.readFileSync(path.join(ROOT, 'google-apps-script/Code.gs'), 'utf8');
  if (legacyDietRe.test(codeGs)) {
    fail++;
    console.log('  [FALLA] Quedó referencia antigua a restricciones alimentarias en google-apps-script/Code.gs');
  }

  const gitignorePath = path.join(ROOT, '.gitignore');
  if (fs.existsSync(gitignorePath)) {
    const gi = fs.readFileSync(gitignorePath, 'utf8');
    for (const rule of ['.env', '.env.*', '.vercel', '*.pem', '*.key']) {
      if (!gi.split(/\r?\n/).some((line) => line.trim() === rule)) {
        fail++;
        console.log(`  [FALLA] Falta regla de seguridad "${rule}" en .gitignore`);
      }
    }
  }
}

function walk(dir, isSrc = false) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, isSrc);
    else if (/\.(js|jsx|mjs|css|gs|md|yml)$/i.test(entry.name)) {
      checkFile(full, isSrc);
    }
  }
}

checkFile(INDEX_HTML, false);
checkFile(path.join(ROOT, 'README.md'), false);
checkResponsiveAndDeploy();
walk(SRC_DIR, true);
walk(SCRIPTS_DIR, false);
walk(path.join(ROOT, 'docs'), false);
walk(path.join(ROOT, 'google-apps-script'), false);
walk(path.join(ROOT, '.github'), false);

console.log(
  fail
    ? `\n[FALLA] ${fail} problemas de higiene detectados en ${checkedFiles} archivos`
    : `[OK] Higiene verificada en ${checkedFiles} archivos (UTF-8 limpio, 100% src <= 500 líneas, Tailwind v4 canónico, blindaje móvil iOS, enlaces seguros y SEO/Vercel listos)`
);
process.exit(fail ? 1 : 0);
