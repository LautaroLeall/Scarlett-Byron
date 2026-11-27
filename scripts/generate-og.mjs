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

  // 3. apple-touch-icon.png (180x180) e icon-512.png (512x512) -> fondo Azul Real Medianoche con halo dorado
  // (Apple iOS y Android maskable requieren fondo opaco en sintonía con theme_color #112245)
  const paddedTargets = [
    { file: 'apple-touch-icon.png', size: 180, sealRatio: 0.8 },
    { file: 'icon-512.png', size: 512, sealRatio: 0.76 },
  ];

  for (const { file, size, sealRatio } of paddedTargets) {
    const outPath = path.join(PUBLIC_DIR, file);
    const sealDim = Math.round(size * sealRatio);
    const haloRadius = Math.round(size * 0.44);
    const ringRadius = Math.round(size * 0.445);

    const bgSvg = Buffer.from(
      `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="royalBg" cx="48%" cy="42%" r="70%">
            <stop offset="0%" stop-color="#1E3A73" />
            <stop offset="62%" stop-color="#112247" />
            <stop offset="100%" stop-color="#091329" />
          </radialGradient>
          <radialGradient id="goldAura" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#F8E8BE" stop-opacity="0.34" />
            <stop offset="65%" stop-color="#C8A152" stop-opacity="0.14" />
            <stop offset="100%" stop-color="#C8A152" stop-opacity="0" />
          </radialGradient>
        </defs>
        <rect width="${size}" height="${size}" fill="url(#royalBg)" />
        <circle cx="${size / 2}" cy="${size / 2}" r="${haloRadius}" fill="url(#goldAura)" />
        <circle cx="${size / 2}" cy="${size / 2}" r="${ringRadius}" fill="none" stroke="#E8CC88" stroke-opacity="0.38" stroke-width="${Math.max(1.5, size * 0.008)}" />
      </svg>`
    );

    const sealBuf = await sharp(WAX_SEAL_PATH)
      .resize(sealDim, sealDim, { fit: 'contain', background: transparent })
      .png()
      .toBuffer();

    await sharp(bgSvg)
      .composite([{ input: sealBuf, gravity: 'center' }])
      .flatten({ background: '#091329' })
      .png({ compressionLevel: 9, palette: true, quality: 92 })
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

  // Fondo castillo nocturno recortado a 1200x630
  const castleBuffer = await sharp(path.join(IMAGES_DIR, 'castle-bg.webp'))
    .resize(width, height, { fit: 'cover', position: 'top' })
    .modulate({ brightness: 0.55, saturation: 1.05 })
    .png()
    .toBuffer();

  // Sello de lacre carmesí 3D completo
  const sealSize = 108;
  const sealBuffer = await sharp(path.join(IMAGES_DIR, 'wax-seal-crimson.webp'))
    .resize(sealSize, sealSize, { fit: 'contain', background: transparent })
    .png()
    .toBuffer();

  // Rosa encantada derecha sobre medallón marfil
  const roseBuffer = await sharp(path.join(IMAGES_DIR, 'enchanted-rose.webp'))
    .resize({ height: 400, fit: 'contain', background: transparent })
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

  const overlaySvg = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="royalVeil" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#091329" stop-opacity="0.88" />
        <stop offset="55%" stop-color="#112247" stop-opacity="0.74" />
        <stop offset="100%" stop-color="#091329" stop-opacity="0.90" />
      </linearGradient>
      <linearGradient id="goldBorder" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#F6E2A8" />
        <stop offset="50%" stop-color="#C8A152" />
        <stop offset="100%" stop-color="#946E27" />
      </linearGradient>
    </defs>

    <rect width="${width}" height="${height}" fill="url(#royalVeil)" />

    <rect x="26" y="26" width="${width - 52}" height="${height - 52}" rx="20" fill="none" stroke="url(#goldBorder)" stroke-width="2.5" />
    <rect x="38" y="38" width="${width - 76}" height="${height - 76}" rx="14" fill="none" stroke="#E8CC88" stroke-opacity="0.55" stroke-width="1.2" />

    <path d="M52 104 C52 72, 68 54, 104 52" stroke="#E8CC88" stroke-width="1.8" fill="none" />
    <circle cx="64" cy="64" r="5" fill="#C42532" stroke="#F6E2A8" stroke-width="1" />
    <path d="M1148 104 C1148 72, 1132 54, 1096 52" stroke="#E8CC88" stroke-width="1.8" fill="none" />
    <circle cx="1136" cy="64" r="5" fill="#C42532" stroke="#F6E2A8" stroke-width="1" />
    <path d="M52 526 C52 558, 68 576, 104 578" stroke="#E8CC88" stroke-width="1.8" fill="none" />
    <circle cx="64" cy="566" r="5" fill="#C42532" stroke="#F6E2A8" stroke-width="1" />
    <path d="M1148 526 C1148 558, 1132 576, 1096 578" stroke="#E8CC88" stroke-width="1.8" fill="none" />
    <circle cx="1136" cy="566" r="5" fill="#C42532" stroke="#F6E2A8" stroke-width="1" />

    <rect x="780" y="84" width="340" height="462" rx="24" fill="#FDFBF7" fill-opacity="0.96" stroke="#E8CC88" stroke-width="2" />

    <text x="108" y="218" font-family="Georgia, 'Times New Roman', serif" font-size="18" font-weight="700" letter-spacing="4" fill="#F0D898">
      ${eyebrowText}
    </text>

    <text x="108" y="294" font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-size="74" font-weight="400" fill="#FDFBF7">
      ${coupleText}
    </text>

    <text x="108" y="344" font-family="'Segoe UI', Arial, sans-serif" font-size="18" font-weight="600" letter-spacing="3.2" fill="#F8E8BE">
      ${taglineText}
    </text>

    <line x1="108" y1="376" x2="660" y2="376" stroke="#E8CC88" stroke-opacity="0.65" stroke-width="1.5" />

    <text x="108" y="422" font-family="Georgia, 'Times New Roman', serif" font-size="26" font-weight="700" letter-spacing="1.8" fill="#FDFBF7">
      ${dateText}
    </text>

    <text x="108" y="458" font-family="'Segoe UI', Arial, sans-serif" font-size="19" fill="#C9D8F2">
      Te invitamos a celebrar este cuento de amor
    </text>

    <rect x="108" y="492" width="330" height="48" rx="12" fill="url(#goldBorder)" />
    <text x="273" y="522" text-anchor="middle" font-family="'Segoe UI', Arial, sans-serif" font-size="15" font-weight="700" letter-spacing="2" fill="#1C140E">
      ABRE TU INVITACIÓN DIGITAL
    </text>
  </svg>`;

  // JPEG progresivo optimizado (< 150 KB, muy por debajo del tope de 300 KB de WhatsApp)
  await sharp(castleBuffer)
    .composite([
      { input: Buffer.from(overlaySvg), left: 0, top: 0 },
      { input: crownBuffer, left: 108, top: 104 },
      { input: roseBuffer, left: 800, top: 115, blend: 'multiply' },
      { input: silhouetteBuffer, left: 482, top: 468 },
      { input: sealBuffer, left: 616, top: 446 },
    ])
    .flatten({ background: '#091329' })
    .jpeg({ quality: 86, progressive: true, mozjpeg: true })
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
