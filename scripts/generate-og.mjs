import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { WEDDING_DETAILS } from '../src/data/weddingData.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PUBLIC_DIR = path.join(ROOT, 'public');
const IMAGES_DIR = path.join(PUBLIC_DIR, 'images');
const OG_JPG_PATH = path.join(PUBLIC_DIR, 'og-image.jpg');
const LEGACY_OG_PNG = path.join(PUBLIC_DIR, 'og-image.png');
const WAX_SEAL_PATH = path.join(IMAGES_DIR, 'wax-seal.webp');

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Genera todos los íconos de pestaña, iOS y PWA usando directamente
 * el sello de lacre dorado real (`public/images/wax-seal.webp`) con acabado natural.
 */
async function generateAppIcons() {
  const transparent = { r: 0, g: 0, b: 0, alpha: 0 };

  // 1. Favicon SVG con el sello dorado real (64x64 fondo transparente, natural en la pestaña)
  const faviconPng64 = await sharp(WAX_SEAL_PATH)
    .resize(60, 60, { fit: 'contain', background: transparent })
    .extend({ top: 2, bottom: 2, left: 2, right: 2, background: transparent })
    .png({ compressionLevel: 9, palette: true, quality: 92 })
    .toBuffer();

  const faviconSvg = [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">',
    `  <image href="data:image/png;base64,${faviconPng64.toString('base64')}" x="0" y="0" width="64" height="64" />`,
    '</svg>',
    '',
  ].join('\n');
  const faviconPath = path.join(PUBLIC_DIR, 'favicon.svg');
  fs.writeFileSync(faviconPath, faviconSvg, 'utf8');
  console.log(
    `[OK] Favicon generado desde sello real: public/favicon.svg (64x64, ${(fs.statSync(faviconPath).size / 1024).toFixed(1)} KB)`
  );

  // 2. icon-192.png -> sello dorado natural con transparencia limpia (pestañas / Android)
  const icon192Path = path.join(PUBLIC_DIR, 'icon-192.png');
  const seal176 = await sharp(WAX_SEAL_PATH)
    .resize(176, 176, { fit: 'contain', background: transparent })
    .png()
    .toBuffer();

  await sharp({
    create: { width: 192, height: 192, channels: 4, background: transparent },
  })
    .composite([{ input: seal176, gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toFile(icon192Path);
  console.log(
    `[OK] Icono generado: public/icon-192.png (192x192, ${(fs.statSync(icon192Path).size / 1024).toFixed(1)} KB)`
  );

  // 3. apple-touch-icon.png (180x180) e icon-512.png (512x512) -> fondo pergamino cálido natural
  // (Apple iOS y Android maskable requieren fondo opaco para evitar bordes negros)
  const paddedTargets = [
    { file: 'apple-touch-icon.png', size: 180, sealRatio: 0.84 },
    { file: 'icon-512.png', size: 512, sealRatio: 0.8 },
  ];

  for (const { file, size, sealRatio } of paddedTargets) {
    const outPath = path.join(PUBLIC_DIR, file);
    const sealDim = Math.round(size * sealRatio);
    const radius = Math.round(size * 0.44);
    const shadowCy = Math.round(size * 0.52);

    const bgSvg = Buffer.from(
      `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="bg" cx="46%" cy="40%" r="72%">
            <stop offset="0%" stop-color="#FDFBF7" />
            <stop offset="72%" stop-color="#F8F2E4" />
            <stop offset="100%" stop-color="#EDE0C7" />
          </radialGradient>
          <radialGradient id="softShadow" cx="50%" cy="50%" r="50%">
            <stop offset="68%" stop-color="#6E5020" stop-opacity="0.22" />
            <stop offset="100%" stop-color="#6E5020" stop-opacity="0" />
          </radialGradient>
        </defs>
        <rect width="${size}" height="${size}" fill="url(#bg)" />
        <circle cx="${size / 2}" cy="${shadowCy}" r="${radius}" fill="url(#softShadow)" />
      </svg>`
    );

    const sealBuf = await sharp(WAX_SEAL_PATH)
      .resize(sealDim, sealDim, { fit: 'contain', background: transparent })
      .png()
      .toBuffer();

    await sharp(bgSvg)
      .composite([{ input: sealBuf, gravity: 'center' }])
      .flatten({ background: '#F8F2E4' })
      .png({ compressionLevel: 9 })
      .toFile(outPath);

    const stat = fs.statSync(outPath);
    console.log(
      `[OK] Icono generado: public/${file} (${size}x${size}, ${(stat.size / 1024).toFixed(1)} KB)`
    );
  }
}

async function generateOgImage() {
  const width = 1200;
  const height = 630;
  const transparent = { r: 0, g: 0, b: 0, alpha: 0 };

  const coupleText = escapeXml(WEDDING_DETAILS.coupleNames);
  const eyebrowText = escapeXml(WEDDING_DETAILS.eyebrow.toUpperCase());
  const taglineText = escapeXml(WEDDING_DETAILS.tagline.toUpperCase());
  const dateText = escapeXml(WEDDING_DETAILS.dateFormatted.toUpperCase());

  // Sello de lacre dorado completo sin recortar el relieve exterior
  const sealSize = 114;
  const sealBuffer = await sharp(WAX_SEAL_PATH)
    .resize(sealSize, sealSize, { fit: 'contain', background: transparent })
    .png()
    .toBuffer();

  // Rosa encantada derecha fusionada con multiply
  const roseBuffer = await sharp(path.join(IMAGES_DIR, 'enchanted-rose.webp'))
    .resize({ height: 420, fit: 'contain', background: transparent })
    .modulate({ brightness: 1.04 })
    .png()
    .toBuffer();

  // Corona dorada SVG rasterizada
  const crownBuffer = await sharp(path.join(IMAGES_DIR, 'crown.svg'))
    .resize({ width: 118, height: 76, fit: 'contain', background: transparent })
    .png()
    .toBuffer();

  // Silueta dorada transparente
  const silhouetteBuffer = await sharp(path.join(IMAGES_DIR, 'dancing-silhouette.webp'))
    .resize({ height: 92, fit: 'contain', background: transparent })
    .png()
    .toBuffer();

  const backgroundSvg = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="parchment" cx="38%" cy="46%" r="72%">
        <stop offset="0%" stop-color="#FDFBF7" />
        <stop offset="65%" stop-color="#F8F2E4" />
        <stop offset="100%" stop-color="#EFE3CA" />
      </radialGradient>
      <linearGradient id="goldBorder" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#E3C685" />
        <stop offset="50%" stop-color="#C5A059" />
        <stop offset="100%" stop-color="#96712C" />
      </linearGradient>
      <radialGradient id="roseHalo" cx="80%" cy="50%" r="28%">
        <stop offset="0%" stop-color="#E3C685" stop-opacity="0.34" />
        <stop offset="100%" stop-color="#F8F2E4" stop-opacity="0" />
      </radialGradient>
    </defs>

    <rect width="${width}" height="${height}" fill="url(#parchment)" />
    <rect width="${width}" height="${height}" fill="url(#roseHalo)" />

    <rect x="26" y="26" width="${width - 52}" height="${height - 52}" rx="20" fill="none" stroke="url(#goldBorder)" stroke-width="2.5" />
    <rect x="38" y="38" width="${width - 76}" height="${height - 76}" rx="14" fill="none" stroke="#E3C685" stroke-width="1.2" />

    <path d="M52 104 C52 72, 68 54, 104 52" stroke="#C5A059" stroke-width="1.8" fill="none" />
    <circle cx="64" cy="64" r="5" fill="#9E1B24" />
    <path d="M1148 104 C1148 72, 1132 54, 1096 52" stroke="#C5A059" stroke-width="1.8" fill="none" />
    <circle cx="1136" cy="64" r="5" fill="#9E1B24" />
    <path d="M52 526 C52 558, 68 576, 104 578" stroke="#C5A059" stroke-width="1.8" fill="none" />
    <circle cx="64" cy="566" r="5" fill="#9E1B24" />
    <path d="M1148 526 C1148 558, 1132 576, 1096 578" stroke="#C5A059" stroke-width="1.8" fill="none" />
    <circle cx="1136" cy="566" r="5" fill="#9E1B24" />

    <rect x="780" y="84" width="340" height="462" rx="24" fill="#FDFBF7" stroke="#E3C685" stroke-width="1.8" />

    <text x="108" y="218" font-family="Georgia, 'Times New Roman', serif" font-size="18" font-weight="700" letter-spacing="4" fill="#9E1B24">
      ${eyebrowText}
    </text>

    <text x="108" y="294" font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-size="74" font-weight="400" fill="#2C241E">
      ${coupleText}
    </text>

    <text x="108" y="344" font-family="'Segoe UI', Arial, sans-serif" font-size="18" font-weight="600" letter-spacing="3.2" fill="#96712C">
      ${taglineText}
    </text>

    <line x1="108" y1="376" x2="660" y2="376" stroke="#E3C685" stroke-width="1.5" />

    <text x="108" y="422" font-family="Georgia, 'Times New Roman', serif" font-size="26" font-weight="700" letter-spacing="1.8" fill="#2C241E">
      ${dateText}
    </text>

    <text x="108" y="458" font-family="'Segoe UI', Arial, sans-serif" font-size="19" fill="#6E6259">
      Te invitamos a celebrar este cuento de amor
    </text>

    <rect x="108" y="492" width="330" height="48" rx="12" fill="url(#goldBorder)" />
    <text x="273" y="522" text-anchor="middle" font-family="'Segoe UI', Arial, sans-serif" font-size="15" font-weight="700" letter-spacing="2" fill="#2C241E">
      ABRE TU INVITACIÓN DIGITAL
    </text>
  </svg>`;

  // JPEG progresivo optimizado (< 150 KB, muy por debajo del tope de 300 KB de WhatsApp)
  await sharp(Buffer.from(backgroundSvg))
    .composite([
      { input: crownBuffer, left: 108, top: 104 },
      { input: roseBuffer, left: 794, top: 105, blend: 'multiply' },
      { input: silhouetteBuffer, left: 486, top: 468 },
      { input: sealBuffer, left: 620, top: 444 },
    ])
    .flatten({ background: '#F8F2E4' })
    .jpeg({ quality: 88, progressive: true, mozjpeg: true })
    .toFile(OG_JPG_PATH);

  if (fs.existsSync(LEGACY_OG_PNG)) {
    fs.unlinkSync(LEGACY_OG_PNG);
  }

  const stat = fs.statSync(OG_JPG_PATH);
  console.log(
    `[OK] OG image WhatsApp generada: public/og-image.jpg (1200x630, ${(stat.size / 1024).toFixed(1)} KB)`
  );

  await generateAppIcons();
}

generateOgImage().catch((err) => {
  console.error('Error generando og-image.jpg e íconos:', err);
  process.exit(1);
});
