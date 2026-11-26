import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WEDDING_DETAILS } from '../src/data/weddingData.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');

function normalizeOrigin(rawUrl) {
  if (!rawUrl) return '';
  const trimmed = String(rawUrl).trim().replace(/\/+$/, '');
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function resolveSiteUrl(env = process.env) {
  const candidates = [
    env.VITE_SITE_URL,
    env.VERCEL_PROJECT_PRODUCTION_URL,
    env.VERCEL_URL,
    WEDDING_DETAILS.seo.siteUrl,
  ];
  for (const candidate of candidates) {
    const normalized = normalizeOrigin(candidate);
    if (normalized) return normalized;
  }
  return 'https://scarlett-byron.vercel.app';
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function writeIfChanged(filePath, content) {
  try {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    if (fs.existsSync(filePath)) {
      const current = fs.readFileSync(filePath, 'utf8');
      if (current === content) return;
    }
    fs.writeFileSync(filePath, content, 'utf8');
  } catch {
    // Ignorar errores de escritura en entornos solo lectura
  }
}

function buildRobotsTxt(siteUrl) {
  return [
    `# ${WEDDING_DETAILS.coupleNames} — robots.txt generado automáticamente`,
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${siteUrl}/sitemap.xml`,
    '',
  ].join('\n');
}

function buildSitemapXml(siteUrl, ogImageUrl) {
  const today = new Date().toISOString().slice(0, 10);
  const title = escapeHtml(WEDDING_DETAILS.seo.title);
  const caption = escapeHtml(WEDDING_DETAILS.seo.ogDescription);

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
>
  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
    <image:image>
      <image:loc>${escapeHtml(ogImageUrl)}</image:loc>
      <image:title>${title}</image:title>
      <image:caption>${caption}</image:caption>
    </image:image>
  </url>
</urlset>
`;
}

function buildManifestJson() {
  return (
    JSON.stringify(
      {
        name: WEDDING_DETAILS.seo.title,
        short_name: WEDDING_DETAILS.coupleNames,
        description: WEDDING_DETAILS.seo.ogDescription,
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: WEDDING_DETAILS.seo.themeColor,
        theme_color: WEDDING_DETAILS.seo.themeColor,
        lang: WEDDING_DETAILS.seo.lang || 'es-CL',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable any',
          },
          {
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
        ],
      },
      null,
      2
    ) + '\n'
  );
}

function buildEventJsonLd(siteUrl, ogImageUrl) {
  const payload = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: WEDDING_DETAILS.seo.siteName,
    description: WEDDING_DETAILS.seo.description,
    url: `${siteUrl}/`,
    image: [ogImageUrl],
    startDate: WEDDING_DETAILS.targetDateIso,
    endDate: WEDDING_DETAILS.eventEndIso,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name:
        WEDDING_DETAILS.ceremony.venue === WEDDING_DETAILS.reception.venue
          ? `${WEDDING_DETAILS.ceremony.venue}, ${WEDDING_DETAILS.ceremony.address}`
          : `${WEDDING_DETAILS.ceremony.venue} & ${WEDDING_DETAILS.reception.venue}`,
      address: {
        '@type': 'PostalAddress',
        streetAddress: `${WEDDING_DETAILS.ceremony.venue}, ${WEDDING_DETAILS.ceremony.address}`,
        addressCountry: WEDDING_DETAILS.seo.countryCode,
      },
    },
    organizer: {
      '@type': 'Person',
      name: WEDDING_DETAILS.coupleNames,
    },
  };
  return JSON.stringify(payload, null, 2);
}

export function renderSeoHtml(rawHtml, env = process.env) {
  const siteUrl = resolveSiteUrl(env);
  const ogVersion = WEDDING_DETAILS.seo.ogVersion || '1';
  const ogImageUrl = `${siteUrl}${WEDDING_DETAILS.seo.ogImagePath}?v=${ogVersion}`;
  const ogImageClean = `${siteUrl}${WEDDING_DETAILS.seo.ogImagePath}`;

  const replacements = {
    __SITE_URL__: escapeHtml(`${siteUrl}/`),
    __PAGE_TITLE__: escapeHtml(WEDDING_DETAILS.seo.title),
    __PAGE_DESCRIPTION__: escapeHtml(WEDDING_DETAILS.seo.description),
    __OG_SITE_NAME__: escapeHtml(WEDDING_DETAILS.seo.siteName),
    __OG_TITLE__: escapeHtml(WEDDING_DETAILS.seo.ogTitle),
    __OG_DESCRIPTION__: escapeHtml(WEDDING_DETAILS.seo.ogDescription),
    __OG_IMAGE_URL__: escapeHtml(ogImageUrl),
    __OG_IMAGE_ALT__: escapeHtml(`Invitación de casamiento de ${WEDDING_DETAILS.coupleNames}`),
    __THEME_COLOR__: escapeHtml(WEDDING_DETAILS.seo.themeColor),
    __JSON_LD__: buildEventJsonLd(siteUrl, ogImageClean),
  };

  let html = rawHtml;
  for (const [token, value] of Object.entries(replacements)) {
    html = html.split(token).join(value);
  }
  return html;
}

export function syncStaticSeoFiles(env = process.env) {
  const siteUrl = resolveSiteUrl(env);
  const ogImageClean = `${siteUrl}${WEDDING_DETAILS.seo.ogImagePath}`;
  const publicDir = path.join(PROJECT_ROOT, 'public');

  writeIfChanged(path.join(publicDir, 'robots.txt'), buildRobotsTxt(siteUrl));
  writeIfChanged(path.join(publicDir, 'sitemap.xml'), buildSitemapXml(siteUrl, ogImageClean));
  writeIfChanged(path.join(publicDir, 'manifest.json'), buildManifestJson());
}

export function seoAutoPlugin(env = process.env) {
  return {
    name: 'wedding-seo-auto-plugin',
    buildStart() {
      syncStaticSeoFiles(env);
    },
    configureServer() {
      syncStaticSeoFiles(env);
    },
    transformIndexHtml(html) {
      return renderSeoHtml(html, env);
    },
  };
}
