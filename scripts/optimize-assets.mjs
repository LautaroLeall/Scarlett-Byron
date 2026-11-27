import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const IMAGES_DIR = path.join(ROOT, 'public', 'images');

const MAX_DIMENSIONS = {
  'castle-bg.webp': 960,
  'wax-seal.webp': 512,
  'wax-seal-crimson.webp': 420,
  'roses-corner.webp': 520,
  'gold-roses.webp': 420,
  'butterfly-gold.webp': 240,
  'baroque-frame.webp': 760,
  'enchanted-rose.webp': 540,
  'dancing-silhouette.webp': 320,
  'lumiere.webp': 320,
  'cogsworth.webp': 280,
  'chip.webp': 260,
  'couple-hero.webp': 900,
  'gallery-1.webp': 1200,
  'gallery-2.webp': 1200,
  'gallery-3.webp': 1200,
  'gallery-4.webp': 1200,
  'gallery-5.webp': 1200,
  'gallery-6.webp': 1200,
  'gallery-7.webp': 1200,
};

function fmtKb(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

async function optimizeImage(filePath) {
  const fileName = path.basename(filePath);
  const ext = path.extname(fileName).toLowerCase();
  if (!['.webp', '.png', '.jpg', '.jpeg'].includes(ext)) return null;

  const targetName = ext === '.webp' ? fileName : `${path.basename(fileName, ext)}.webp`;
  const targetPath = path.join(IMAGES_DIR, targetName);
  const maxDim = MAX_DIMENSIONS[targetName] || 1200;

  const beforeSize = fs.statSync(filePath).size;
  const inputBuffer = fs.readFileSync(filePath);
  const meta = await sharp(inputBuffer).metadata();

  const optimizedBuffer = await sharp(inputBuffer)
    .rotate()
    .resize({
      width: maxDim,
      height: maxDim,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({
      quality: meta.hasAlpha ? 86 : 84,
      alphaQuality: 92,
      effort: 6,
    })
    .toBuffer();

  // Solo reemplaza si es conversión desde otro formato o si reduce peso real
  if (ext !== '.webp' || optimizedBuffer.length < beforeSize) {
    fs.writeFileSync(targetPath, optimizedBuffer);
    if (ext !== '.webp' && targetPath !== filePath) {
      fs.unlinkSync(filePath);
    }
    return { name: targetName, before: beforeSize, after: optimizedBuffer.length, changed: true };
  }

  return { name: targetName, before: beforeSize, after: beforeSize, changed: false };
}

async function run() {
  if (!fs.existsSync(IMAGES_DIR)) {
    console.error('No existe la carpeta public/images/');
    process.exit(1);
  }

  console.log('Optimizando imágenes en public/images/...\n');
  const entries = fs.readdirSync(IMAGES_DIR).sort();
  let totalBefore = 0;
  let totalAfter = 0;

  for (const entry of entries) {
    const full = path.join(IMAGES_DIR, entry);
    if (!fs.statSync(full).isFile()) continue;
    const res = await optimizeImage(full);
    if (!res) continue;
    totalBefore += res.before;
    totalAfter += res.after;
    const tag = res.changed ? `${fmtKb(res.before)} -> ${fmtKb(res.after)}` : `${fmtKb(res.after)} (óptima)`;
    console.log(`  [OK] ${res.name.padEnd(26)} ${tag}`);
  }

  const saved = Math.max(0, totalBefore - totalAfter);
  console.log(
    `\nTotal public/images/: ${fmtKb(totalAfter)} (ahorrados ${fmtKb(saved)})`
  );
}

run().catch((err) => {
  console.error('Error optimizando imágenes:', err);
  process.exit(1);
});
