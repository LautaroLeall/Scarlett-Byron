// Verificación automatizada de SEO, vista previa en WhatsApp (OG < 300 KB, URLs absolutas HTTPS),
// íconos PWA/iOS y cabeceras HTTP + CSP para Google Apps Script en vercel.json.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PUBLIC = path.join(ROOT, 'public');
const DIST_HTML = path.join(ROOT, 'dist', 'index.html');

let passed = 0;
let failed = 0;

async function check(name, fn) {
  try {
    await fn();
    passed++;
    console.log(`  [OK] ${name}`);
  } catch (err) {
    failed++;
    console.log(`  [FALLA] ${name}: ${err.message}`);
  }
}

console.log('\n[SEO / WhatsApp OG / Vercel Security Test Suite]');

await check('dist/index.html tiene URLs absolutas HTTPS en canonical, OG, Twitter y JSON-LD', () => {
  assert.ok(fs.existsSync(DIST_HTML), 'Ejecuta npm run build antes de correr seo.test.mjs');
  const html = fs.readFileSync(DIST_HTML, 'utf8');

  assert.ok(!/__[A-Z_]+__/.test(html), 'Quedaron tokens sin reemplazar en dist/index.html');
  assert.ok(html.includes('lang="es-CL"'));
  assert.match(html, /<link rel="canonical" href="https:\/\/[^"]+\/"\s*\/?>/);
  assert.match(html, /property="og:url" content="https:\/\/[^"]+\/"/);
  assert.match(html, /property="og:image" content="https:\/\/[^"]+\/og-image\.jpg\?v=[^"]+"/);
  assert.match(html, /property="og:image:secure_url" content="https:\/\/[^"]+\/og-image\.jpg\?v=[^"]+"/);
  assert.match(html, /property="og:image:type" content="image\/jpeg"/);
  assert.match(html, /name="twitter:image" content="https:\/\/[^"]+\/og-image\.jpg\?v=[^"]+"/);

  const ldMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert.ok(ldMatch, 'Falta bloque JSON-LD en dist/index.html');
  const parsed = JSON.parse(ldMatch[1]);
  assert.equal(parsed['@type'], 'Event');
  assert.ok(parsed.url.startsWith('https://'));
  assert.ok(parsed.startDate.startsWith('2027-04-10T14:00:00'));
  assert.equal(parsed.location.address.addressCountry, 'CL');
  assert.ok(Array.isArray(parsed.image) && parsed.image[0].startsWith('https://'));
});

await check('public/og-image.jpg existe, mide 1200x630 y pesa < 300 KB (requisito WhatsApp)', async () => {
  const ogPath = path.join(PUBLIC, 'og-image.jpg');
  assert.ok(fs.existsSync(ogPath), 'Falta public/og-image.jpg');
  const stat = fs.statSync(ogPath);
  assert.ok(
    stat.size < 300 * 1024,
    `og-image.jpg pesa ${(stat.size / 1024).toFixed(1)} KB; WhatsApp exige < 300 KB`
  );
  const meta = await sharp(ogPath).metadata();
  assert.equal(meta.width, 1200);
  assert.equal(meta.height, 630);
  assert.equal(meta.format, 'jpeg');
});

await check('Íconos PWA/iOS, manifest.json, robots.txt y sitemap.xml existen y son válidos', async () => {
  const appleMeta = await sharp(path.join(PUBLIC, 'apple-touch-icon.png')).metadata();
  assert.equal(appleMeta.width, 180);
  assert.equal(appleMeta.height, 180);

  const icon192 = await sharp(path.join(PUBLIC, 'icon-192.png')).metadata();
  assert.equal(icon192.width, 192);

  const icon512 = await sharp(path.join(PUBLIC, 'icon-512.png')).metadata();
  assert.equal(icon512.width, 512);

  const manifest = JSON.parse(fs.readFileSync(path.join(PUBLIC, 'manifest.json'), 'utf8'));
  assert.equal(manifest.lang, 'es-CL');
  assert.ok(Array.isArray(manifest.icons) && manifest.icons.length >= 2);

  const robots = fs.readFileSync(path.join(PUBLIC, 'robots.txt'), 'utf8');
  assert.ok(robots.includes('Allow: /'));
  assert.match(robots, /Sitemap: https:\/\/.+\/sitemap\.xml/);

  const sitemap = fs.readFileSync(path.join(PUBLIC, 'sitemap.xml'), 'utf8');
  assert.match(sitemap, /<loc>https:\/\/.+\/<\/loc>/);
  assert.match(sitemap, /<image:loc>https:\/\/.+\/og-image\.jpg<\/image:loc>/);
});

await check('vercel.json tiene CSP habilitado para Google Apps Script, HSTS y rewrite SPA protegido', () => {
  const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf8'));
  assert.equal(cfg.trailingSlash, false);
  assert.ok(Array.isArray(cfg.rewrites) && cfg.rewrites.length >= 1);

  const rewrite = cfg.rewrites[0];
  assert.equal(rewrite.destination, '/index.html');
  for (const asset of ['robots\\.txt', 'sitemap\\.xml', 'manifest\\.json', 'og-image\\.jpg']) {
    assert.ok(
      rewrite.source.includes(asset),
      `El rewrite SPA en vercel.json debe excluir ${asset}`
    );
  }

  const globalRule = cfg.headers.find((h) => h.source === '/(.*)');
  assert.ok(globalRule, 'Falta regla global de headers /(.*)');
  const byKey = Object.fromEntries(globalRule.headers.map((h) => [h.key, h.value]));

  assert.ok(byKey['Strict-Transport-Security']?.includes('max-age=63072000'));
  assert.ok(byKey['Content-Security-Policy']?.includes('https://script.google.com'));
  assert.ok(byKey['Content-Security-Policy']?.includes('https://script.googleusercontent.com'));
  assert.equal(byKey['X-Content-Type-Options'], 'nosniff');
  assert.equal(byKey['X-Frame-Options'], 'DENY');
  assert.equal(byKey['Referrer-Policy'], 'strict-origin-when-cross-origin');
  assert.equal(byKey['Cross-Origin-Opener-Policy'], 'same-origin-allow-popups');
});

if (failed > 0) {
  console.log(`\n[FALLA] ${failed} fallos / ${passed} OK en pruebas SEO y WhatsApp OG`);
  process.exit(1);
}
console.log(`\n[OK] ${passed}/${passed} pruebas SEO, WhatsApp OG y seguridad Vercel aprobadas`);
