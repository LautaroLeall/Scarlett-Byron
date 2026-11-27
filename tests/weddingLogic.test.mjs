import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  calculateCountdown,
  wrapGalleryIndex,
  getCircularOffset,
  normalizeMatchKey,
  normalizeCompanions,
  validateRsvpForm,
  hasRsvpChanged,
  validateSongSuggestion,
  addSongSuggestion,
  parseStoredRsvp,
  parseStoredSongs,
  parseWeddingCalendarDate,
  resolveActiveSectionId,
} from '../src/utils/weddingLogic.js';
import { buildGoogleCalendarUrl, buildIcsContent } from '../src/utils/calendar.js';
import {
  getDriveWebhookUrl,
  isDriveConfigured,
  postToDriveSheet,
  submitRsvpToDrive,
  submitSongToDrive,
} from '../src/services/driveSheets.js';
import { renderSeoHtml, resolveSiteUrl } from '../scripts/seoAutoPlugin.mjs';
import {
  APP_RELEASE_VERSION,
  ASSET_VERSION,
  GALLERY_PHOTOS,
  IMAGES,
  NAV_SECTIONS,
  WEDDING_DETAILS,
  versionedAsset,
} from '../src/data/weddingData.js';
import { RELEASE_STORAGE_KEY, syncAppReleaseVersion } from '../src/utils/releaseReset.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PUBLIC_DIR = path.join(ROOT, 'public');

test('calculateCountdown formatea días, horas, minutos y segundos con cero a la izquierda', () => {
  const target = '2027-04-10T14:00:00-04:00';
  const now = new Date('2027-04-08T11:54:55-04:00').getTime();
  assert.deepEqual(calculateCountdown(target, now), {
    days: '02',
    hours: '02',
    minutes: '05',
    seconds: '05',
    isFinished: false,
  });
});

test('calculateCountdown clampa a cero cuando la fecha ya pasó o es inválida', () => {
  const past = calculateCountdown('2026-01-01T00:00:00Z', new Date('2026-11-26T00:00:00Z').getTime());
  assert.deepEqual(past, { days: '00', hours: '00', minutes: '00', seconds: '00', isFinished: true });

  const invalid = calculateCountdown('fecha-invalida');
  assert.equal(invalid.isFinished, true);
});

test('wrapGalleryIndex y getCircularOffset calculan el salto circular más corto en el carrusel', () => {
  assert.equal(wrapGalleryIndex(0, -1, 7), 6);
  assert.equal(wrapGalleryIndex(6, 1, 7), 0);
  assert.equal(wrapGalleryIndex(1, -5, 3), 2);
  assert.equal(wrapGalleryIndex(0, 1, 0), 0);

  assert.equal(getCircularOffset(0, 0, 7), 0);
  assert.equal(getCircularOffset(1, 0, 7), 1);
  assert.equal(getCircularOffset(6, 0, 7), -1);
  assert.equal(getCircularOffset(0, 6, 7), 1);
  assert.equal(getCircularOffset(5, 0, 7), -2);
  assert.equal(getCircularOffset(1, 6, 7), 2);
  assert.equal(getCircularOffset(2, 0, 3), -1);
  assert.equal(getCircularOffset(0, 0, 0), 0);
});

test('normalizeMatchKey unifica tildes, mayúsculas y espacios extra para anti-duplicados', () => {
  assert.equal(normalizeMatchKey('  Cámila   ROJAS '), 'camila rojas');
  assert.equal(normalizeMatchKey('camila rojas'), normalizeMatchKey('CÁMILA  rojas'));
  assert.equal(normalizeMatchKey('Vivir Mi VíDA'), normalizeMatchKey('vivir mi vida'));
});

test('normalizeCompanions maneja cadenas vacías, textos inválidos y tope estricto de 2 acompañantes', () => {
  assert.equal(normalizeCompanions('', 2), 0);
  assert.equal(normalizeCompanions('abc', 2), 0);
  assert.equal(normalizeCompanions(-3, 2), 0);
  assert.equal(normalizeCompanions('2', 2), 2);
  assert.equal(normalizeCompanions('3'), 2);
  assert.equal(normalizeCompanions('99', 2), 2);
});

test('validateRsvpForm exige nombre completo, bloquea más de 2 acompañantes y rechaza datos inválidos', () => {
  assert.equal(validateRsvpForm({ guestName: '   ', attending: true, companions: 0 }).valid, false);
  assert.equal(validateRsvpForm({ guestName: 'Camila', attending: true, companions: 0 }).valid, false);
  assert.equal(validateRsvpForm({ guestName: 'Aaaa Bbbb', attending: true, companions: 0 }).valid, false);
  assert.equal(validateRsvpForm({ guestName: 'Juan 123', attending: true, companions: 0 }).valid, false);
  assert.equal(validateRsvpForm({ guestName: 'Valentina Gómez', attending: true, companions: -1 }, 2).valid, false);

  // Máximo estricto de 2 acompañantes: 3 acompañantes aunque tengan nombres válidos debe rechazarse
  const overMaxCompanions = validateRsvpForm(
    {
      guestName: 'Valentina Gómez',
      attending: true,
      companions: 3,
      companionNames: ['Martín González', 'Sofía Díaz', 'Lucas Pérez'],
    },
    2
  );
  assert.equal(overMaxCompanions.valid, false);
  assert.match(overMaxCompanions.errors.companions || '', /máximo 2 acompañantes/i);

  assert.equal(
    validateRsvpForm({ guestName: 'Valentina Gómez', attending: true, companions: 0, message: 'x'.repeat(261) }).valid,
    false
  );

  // Si indica acompañantes, debe ingresar el nombre y apellido completo de cada uno
  const missingCompanions = validateRsvpForm({
    guestName: 'Camila Rojas',
    attending: true,
    companions: 2,
    companionNames: ['Martín González', ''],
  });
  assert.equal(missingCompanions.valid, false);
  assert.ok(missingCompanions.errors.companionNames?.[1]);

  const singleWordCompanion = validateRsvpForm({
    guestName: 'Camila Rojas',
    attending: true,
    companions: 1,
    companionNames: ['Martín'],
  });
  assert.equal(singleWordCompanion.valid, false);
  assert.ok(singleWordCompanion.errors.companionNames?.[0]);

  const selfAsCompanion = validateRsvpForm({
    guestName: 'Camila Rojas',
    attending: true,
    companions: 1,
    companionNames: ['cámila  rojas'],
  });
  assert.equal(selfAsCompanion.valid, false);
  assert.ok(selfAsCompanion.errors.companionNames?.[0]);

  const duplicateCompanion = validateRsvpForm({
    guestName: 'Camila Rojas',
    attending: true,
    companions: 2,
    companionNames: ['Martín González', 'martin gonzalez'],
  });
  assert.equal(duplicateCompanion.valid, false);
  assert.ok(duplicateCompanion.errors.companionNames?.[1]);

  const validWithCompanions = validateRsvpForm({
    guestName: "  Ana &   Lucas O'Connor  ",
    attending: true,
    companions: 2,
    companionNames: ['  Martín  González ', 'Valentina Muñoz'],
    message: '¡Felicidades!',
  });
  assert.equal(validWithCompanions.valid, true);
  assert.equal(validWithCompanions.trimmedName, "Ana & Lucas O'Connor");
  assert.equal(validWithCompanions.companions, 2);
  assert.deepEqual(validWithCompanions.companionNames, ['Martín González', 'Valentina Muñoz']);

  const familyList = validateRsvpForm({
    guestName: 'María, Pedro y Sofi',
    attending: false,
    companions: 99,
    companionNames: ['Ignorado'],
  });
  assert.equal(familyList.valid, true);
  assert.equal(familyList.companions, 0);
  assert.deepEqual(familyList.companionNames, []);
});

test('hasRsvpChanged detecta cambios reales (incluidos acompañantes) y evita reenvíos idénticos', () => {
  const base = {
    guestName: 'Camila Rojas',
    attending: true,
    companions: 1,
    companionNames: ['Martín González'],
    message: '¡Felicidades!',
  };
  assert.equal(hasRsvpChanged(null, base), true);
  assert.equal(
    hasRsvpChanged(base, {
      ...base,
      guestName: '  cámila  rojas ',
      companionNames: ['martin   gonzalez'],
    }),
    false
  );
  assert.equal(hasRsvpChanged(base, { ...base, companionNames: ['Valentina Muñoz'] }), true);
  assert.equal(hasRsvpChanged(base, { ...base, companions: 2 }), true);
  assert.equal(hasRsvpChanged(base, { ...base, message: 'Nuevo saludo' }), true);
  assert.equal(hasRsvpChanged(base, { ...base, attending: false }), true);
});

test('validateSongSuggestion y addSongSuggestion (anti-duplicado + tope) funcionan', () => {
  assert.equal(validateSongSuggestion('   ').valid, false);
  assert.equal(validateSongSuggestion('Ab').valid, false);
  assert.equal(validateSongSuggestion('12345').valid, false);
  assert.equal(validateSongSuggestion('aaaaaaa').valid, false);
  assert.equal(validateSongSuggestion('a'.repeat(101)).valid, false);
  assert.equal(validateSongSuggestion('Perfect - Ed Sheeran').valid, true);

  const step1 = addSongSuggestion([], '  Vivir Mi Vída - Marc Anthony ', 2);
  assert.deepEqual(step1.songs, ['Vivir Mi Vída - Marc Anthony']);
  assert.equal(step1.duplicate, false);
  assert.equal(step1.limitReached, false);

  const dup = addSongSuggestion(step1.songs, 'vivir   mi vida - marc anthony', 2);
  assert.equal(dup.duplicate, true);
  assert.equal(dup.songs.length, 1);

  const step2 = addSongSuggestion(step1.songs, 'Perfect - Ed Sheeran', 2);
  assert.equal(step2.songs.length, 2);

  const capped = addSongSuggestion(step2.songs, 'Stand By Me', 2);
  assert.equal(capped.limitReached, true);
  assert.equal(capped.added, null);
  assert.equal(capped.songs.length, 2);
});

test('parseStoredRsvp y parseStoredSongs resisten JSON corrupto, registros legados y duplicados', () => {
  assert.equal(parseStoredRsvp('{roto'), null);
  assert.equal(parseStoredRsvp('{}'), null);
  assert.equal(parseStoredRsvp('{"guestName":"Sofía"}'), null);

  const okRsvp = parseStoredRsvp(
    '{"guestName":"Sofía Morales","attending":true,"companions":2,"companionNames":["Juan Pérez","Ana Silva"],"action":"updated"}'
  );
  assert.equal(okRsvp?.guestName, 'Sofía Morales');
  assert.equal(okRsvp?.companions, 2);
  assert.deepEqual(okRsvp?.companionNames, ['Juan Pérez', 'Ana Silva']);
  assert.equal(okRsvp?.action, 'updated');

  // Registro legado con más de 2 acompañantes se acota automáticamente al máximo permitido (2)
  const cappedRsvp = parseStoredRsvp(
    '{"guestName":"Carlos Soto","attending":true,"companions":4,"companionNames":["Uno Apellido","Dos Apellido","Tres Apellido"]}',
    2
  );
  assert.equal(cappedRsvp?.guestName, 'Carlos Soto');
  assert.equal(cappedRsvp?.companions, 2);
  assert.deepEqual(cappedRsvp?.companionNames, ['Uno Apellido', 'Dos Apellido']);

  assert.deepEqual(parseStoredSongs('{roto'), []);
  assert.deepEqual(parseStoredSongs('{"no":"array"}'), []);
  assert.deepEqual(parseStoredSongs('["Tema Uno", "tema  uno", 42, "", "  Tema Dos  "]'), [
    'Tema Uno',
    'Tema Dos',
  ]);
});

test('parseWeddingCalendarDate calcula exactamente Abril 2027 (1=Jueves, 10=Sábado) y bisiestos', () => {
  const april2027 = parseWeddingCalendarDate('2027-04-10T14:00:00-04:00');
  assert.equal(april2027.year, 2027);
  assert.equal(april2027.monthName, 'Abril');
  assert.equal(april2027.day, 10);
  assert.equal(april2027.daysInMonth, 30);
  assert.equal(april2027.leadingBlanks, 3); // L, M, X vacíos -> 1 cae en Jueves
  assert.equal(april2027.weddingWeekdayIdx, 5); // Sábado (índice 5 con lunes=0)
  assert.equal(april2027.weddingWeekdayName, 'Sábado');

  const leapFeb = parseWeddingCalendarDate('2028-02-29T12:00:00-03:00');
  assert.equal(leapFeb.daysInMonth, 29);
  assert.equal(leapFeb.monthName, 'Febrero');

  const fallback = parseWeddingCalendarDate('invalido');
  assert.equal(fallback.year, 2027);
  assert.equal(fallback.monthName, 'Abril');
  assert.equal(fallback.day, 10);
});

test('resolveActiveSectionId identifica con precisión los 4 capítulos sin choques entre Ceremonia e Historia', () => {
  const atTop = [
    { id: 'portada', top: 68 },
    { id: 'ceremonia', top: 1080 },
    { id: 'historia', top: 1620 },
    { id: 'confirmar', top: 2180 },
  ];
  assert.equal(resolveActiveSectionId(atTop, { scrollY: 0, viewportHeight: 800, docHeight: 3700 }), 'portada');

  // Viendo Ceremonia (top=64) mientras Historia aparece en la parte inferior (top=602) -> sigue en Ceremonia
  const viewingCeremony = [
    { id: 'portada', top: -950 },
    { id: 'ceremonia', top: 64 },
    { id: 'historia', top: 602 },
    { id: 'confirmar', top: 1168 },
  ];
  assert.equal(
    resolveActiveSectionId(viewingCeremony, { scrollY: 1020, viewportHeight: 800, docHeight: 3700 }),
    'ceremonia'
  );

  // Scrolleando dentro de Historia (top=120 <= probeY 268) -> cambia limpiamente a Historia
  const viewingStory = [
    { id: 'portada', top: -1430 },
    { id: 'ceremonia', top: -418 },
    { id: 'historia', top: 120 },
    { id: 'confirmar', top: 686 },
  ];
  assert.equal(
    resolveActiveSectionId(viewingStory, { scrollY: 1500, viewportHeight: 800, docHeight: 3700 }),
    'historia'
  );

  // Al fondo de la página -> siempre marca el último capítulo (Confirmar)
  assert.equal(
    resolveActiveSectionId(viewingStory, { scrollY: 2910, viewportHeight: 800, docHeight: 3700 }),
    'confirmar'
  );
});

test('driveSheets envía upsert RSVP con acompañantes, bloquea música anónima y maneja errores de red/HTTP', async () => {
  assert.equal(isDriveConfigured({}), false);
  assert.equal(
    isDriveConfigured({ VITE_SHEETS_WEBHOOK_URL: 'https://script.google.com/macros/s/AKfycb123/exec' }),
    true
  );
  assert.equal(
    getDriveWebhookUrl({ VITE_SHEETS_WEBHOOK_URL: 'https://script.google.com/macros/s/AKfycb123/exec' }),
    'https://script.google.com/macros/s/AKfycb123/exec'
  );
  assert.equal(isDriveConfigured({ VITE_SHEETS_WEBHOOK_URL: 'https://ejemplo-invalido.com' }), false);

  // Música sin invitado registrado -> bloqueada antes de llamar a red
  const anonSong = await submitSongToDrive({ song: 'Perfect - Ed Sheeran', guestName: '' });
  assert.equal(anonSong.ok, false);
  assert.equal(anonSong.code, 'RSVP_REQUIRED');

  const literalAnon = await submitSongToDrive({ song: 'Perfect - Ed Sheeran', guestName: 'Anónimo' });
  assert.equal(literalAnon.ok, false);
  assert.equal(literalAnon.code, 'RSVP_REQUIRED');

  // Modo sin webhook configurado aún -> responde local-only sin romper
  const localRes = await postToDriveSheet({ type: 'rsvp' }, { webhookUrl: '' });
  assert.deepEqual(localRes, { ok: true, mode: 'local-only', action: 'created' });

  // Envío real simulado de actualización RSVP (upsert sin duplicados y sin dietNotes)
  let capturedUrl = '';
  let capturedInit = null;
  const mockFetch = async (url, init) => {
    capturedUrl = url;
    capturedInit = init;
    return {
      ok: true,
      text: async () => JSON.stringify({ ok: true, type: 'rsvp', action: 'updated' }),
    };
  };

  const rsvpRes = await submitRsvpToDrive(
    {
      guestName: 'María Gómez',
      previousGuestName: 'Maria Gomez',
      attending: true,
      companions: 2,
      companionNames: ['Pedro Soto', 'Lucía Díaz'],
      message: '¡Saludos!',
    },
    { webhookUrl: 'https://script.google.com/macros/s/DEMO/exec', fetchImpl: mockFetch }
  );
  assert.equal(rsvpRes.ok, true);
  assert.equal(rsvpRes.mode, 'drive');
  assert.equal(rsvpRes.action, 'updated');
  assert.equal(capturedUrl, 'https://script.google.com/macros/s/DEMO/exec');
  assert.equal(capturedInit.method, 'POST');
  assert.equal(capturedInit.headers['Content-Type'], 'text/plain;charset=utf-8');
  const sentBody = JSON.parse(capturedInit.body);
  assert.equal(sentBody.type, 'rsvp');
  assert.equal(sentBody.previousGuestName, 'Maria Gomez');
  assert.equal(sentBody.companions, 2);
  assert.deepEqual(sentBody.companionNames, ['Pedro Soto', 'Lucía Díaz']);
  assert.equal('dietNotes' in sentBody, false);

  // Envío que intenta exceder el máximo de 2 acompañantes se acota a 2 antes de enviar
  let cappedBody = null;
  await submitRsvpToDrive(
    {
      guestName: 'María Gómez',
      attending: true,
      companions: 5,
      companionNames: ['Pedro Soto', 'Lucía Díaz', 'Extra Tres'],
    },
    {
      webhookUrl: 'https://script.google.com/macros/s/DEMO/exec',
      fetchImpl: async (_url, init) => {
        cappedBody = JSON.parse(init.body);
        return { ok: true, text: async () => JSON.stringify({ ok: true, action: 'updated' }) };
      },
    }
  );
  assert.equal(cappedBody.companions, 2);
  assert.deepEqual(cappedBody.companionNames, ['Pedro Soto', 'Lucía Díaz']);

  // Cuando attending=false limpia acompañantes antes de enviar
  let declinedBody = null;
  await submitRsvpToDrive(
    {
      guestName: 'María Gómez',
      attending: false,
      companions: 3,
      companionNames: ['Ignorado Uno'],
    },
    {
      webhookUrl: 'https://script.google.com/macros/s/DEMO/exec',
      fetchImpl: async (_url, init) => {
        declinedBody = JSON.parse(init.body);
        return { ok: true, text: async () => JSON.stringify({ ok: true, action: 'updated' }) };
      },
    }
  );
  assert.equal(declinedBody.companions, 0);
  assert.deepEqual(declinedBody.companionNames, []);

  // Manejo de HTTP 500, timeout AbortError y error de red
  const httpErr = await postToDriveSheet(
    { type: 'rsvp' },
    { webhookUrl: 'https://script.google.com/macros/s/DEMO/exec', fetchImpl: async () => ({ ok: false }) }
  );
  assert.equal(httpErr.ok, false);
  assert.equal(httpErr.code, 'HTTP_ERROR');

  const timeoutErr = await postToDriveSheet(
    { type: 'rsvp' },
    {
      webhookUrl: 'https://script.google.com/macros/s/DEMO/exec',
      fetchImpl: async () => {
        const err = new Error('aborted');
        err.name = 'AbortError';
        throw err;
      },
    }
  );
  assert.equal(timeoutErr.ok, false);
  assert.equal(timeoutErr.code, 'TIMEOUT');

  const netErr = await postToDriveSheet(
    { type: 'rsvp' },
    {
      webhookUrl: 'https://script.google.com/macros/s/DEMO/exec',
      fetchImpl: async () => {
        throw new Error('offline');
      },
    }
  );
  assert.equal(netErr.ok, false);
  assert.equal(netErr.code, 'NETWORK_ERROR');

  // Canción duplicada rechazada por Apps Script
  const dupSongRes = await submitSongToDrive(
    { song: 'Perfect - Ed Sheeran', guestName: 'María Gómez' },
    {
      webhookUrl: 'https://script.google.com/macros/s/DEMO/exec',
      fetchImpl: async () => ({
        ok: true,
        text: async () =>
          JSON.stringify({
            ok: false,
            code: 'DUPLICATE_SONG',
            error: 'Esa canción ya está en la playlist de la fiesta.',
          }),
      }),
    }
  );
  assert.equal(dupSongRes.ok, false);
  assert.equal(dupSongRes.code, 'DUPLICATE_SONG');
});

test('buildGoogleCalendarUrl y buildIcsContent generan formatos válidos y escapan caracteres especiales', () => {
  const gcal = buildGoogleCalendarUrl({
    title: 'Matrimonio Religioso — Scarlett & Byron',
    details: 'Ceremonia religiosa',
    location: 'Tucapel 2100a, La Pintana, Santiago, Chile',
    startDate: '2027-04-10T14:00:00',
    endDate: '2027-04-10T15:30:00',
    timezone: 'America/Santiago',
  });
  assert.ok(gcal.includes('dates=20270410T140000%2F20270410T153000'));
  assert.ok(gcal.includes('ctz=America%2FSantiago'));

  const ics = buildIcsContent({
    title: 'Matrimonio, Scarlett; Byron',
    details: 'Línea 1\nLínea 2',
    location: 'Tucapel 2100a, La Pintana',
    startDate: '2027-04-10T14:00:00',
    endDate: '2027-04-10T15:30:00',
    organizer: 'Scarlett & Byron',
  });
  assert.ok(ics.includes('BEGIN:VCALENDAR'));
  assert.ok(ics.includes('SUMMARY:Matrimonio\\, Scarlett\\; Byron'));
  assert.ok(ics.includes('DESCRIPTION:Línea 1\\nLínea 2'));
  assert.ok(ics.includes('LOCATION:Tucapel 2100a\\, La Pintana'));
  assert.ok(ics.includes('DTSTART:20270410T140000'));
  assert.ok(ics.includes('DTEND:20270410T153000'));
  assert.ok(ics.includes('END:VCALENDAR'));
});

test('resolveSiteUrl y renderSeoHtml inyectan URLs absolutas HTTPS y JSON-LD Event sin tokens pendientes', () => {
  assert.equal(
    resolveSiteUrl({ VITE_SITE_URL: 'https://mi-boda.com/' }),
    'https://mi-boda.com'
  );
  assert.equal(
    resolveSiteUrl({ VERCEL_PROJECT_PRODUCTION_URL: 'scarlett-byron.vercel.app' }),
    'https://scarlett-byron.vercel.app'
  );
  assert.equal(
    resolveSiteUrl({ VERCEL_URL: 'scarlett-byron-git-main.vercel.app' }),
    'https://scarlett-byron-git-main.vercel.app'
  );
  assert.ok(resolveSiteUrl({}).startsWith('https://'));

  const rawHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const rendered = renderSeoHtml(rawHtml, { VITE_SITE_URL: 'https://scarlett-byron.vercel.app/' });
  assert.ok(!/__[A-Z_]+__/.test(rendered));
  assert.ok(rendered.includes('https://scarlett-byron.vercel.app/og-image.jpg?v=5'));
  assert.ok(rendered.includes(`/images/castle-bg.webp?v=${ASSET_VERSION}`));
  assert.ok(rendered.includes('Invitación de matrimonio de Scarlett &amp; Byron'));
});

test('weddingData mantiene integridad completa de datos reales, versionado anti-caché y archivos físicos', () => {
  assert.equal(WEDDING_DETAILS.rsvp.deadline, '15 de enero');
  assert.equal(WEDDING_DETAILS.rsvp.maxGuests, 2);
  assert.ok(WEDDING_DETAILS.rsvp.adultsOnlyNotice.includes('solo para adultos'));
  assert.ok(WEDDING_DETAILS.rsvp.adultsOnlySubnote.length > 20);
  assert.equal(WEDDING_DETAILS.timezone, 'America/Santiago');
  assert.equal(WEDDING_DETAILS.gifts.entity, 'Banco Falabella');
  assert.equal(WEDDING_DETAILS.gifts.rut, '19.186.908-7');
  assert.equal(WEDDING_DETAILS.gifts.accountNumber, '50013860033');
  assert.ok(WEDDING_DETAILS.gifts.subtitle.length > 20);
  assert.ok(WEDDING_DETAILS.gifts.description.length > 20);
  assert.ok(WEDDING_DETAILS.gifts.end.length > 10);
  assert.equal(WEDDING_DETAILS.dressCode.restrictedColors.length, 4);
  assert.equal(NAV_SECTIONS.length, 4);
  assert.equal(GALLERY_PHOTOS.length, 7);
  assert.ok(GALLERY_PHOTOS.every((photo) => photo.src !== IMAGES.coupleHero));
  assert.equal(versionedAsset('/audio/cancion.mp3?v=old', 'v9'), '/audio/cancion.mp3?v=v9');

  // Verificar que todas las imágenes y el audio tienen query anti-caché (?v=) y existen físicamente
  for (const relPath of Object.values(IMAGES)) {
    assert.ok(relPath.includes(`?v=${ASSET_VERSION}`), `Falta versión anti-caché en ${relPath}`);
    const abs = path.join(PUBLIC_DIR, relPath.split('?')[0].replace(/^\//, ''));
    assert.ok(fs.existsSync(abs), `Falta imagen referenciada en IMAGES: ${relPath}`);
  }
  for (const photo of GALLERY_PHOTOS) {
    assert.ok(photo.src.includes(`?v=${ASSET_VERSION}`), `Falta versión anti-caché en ${photo.src}`);
    const abs = path.join(PUBLIC_DIR, photo.src.split('?')[0].replace(/^\//, ''));
    assert.ok(fs.existsSync(abs), `Falta foto de galería: ${photo.src}`);
  }
  assert.ok(
    WEDDING_DETAILS.audio.src.includes(`?v=${ASSET_VERSION}`),
    'El audio debe incluir versión anti-caché para forzar la canción más reciente'
  );
  const audioAbs = path.join(PUBLIC_DIR, WEDDING_DETAILS.audio.src.split('?')[0].replace(/^\//, ''));
  assert.ok(fs.existsSync(audioAbs), `Falta archivo de audio: ${WEDDING_DETAILS.audio.src}`);
});

test('syncAppReleaseVersion reinicia almacenamiento, cookies y cachés solo al cambiar versión o con ?reset=1', async () => {
  const localMap = new Map([['scarlett_byron_rsvp_v2', '{"guestName":"Prueba Test"}']]);
  const sessionMap = new Map([['tmp', '1']]);
  const deletedCaches = [];
  let swUnregistered = 0;
  let replacedUrl = null;
  const cookieWrites = [];

  const mockEnv = {
    location: { pathname: '/', search: '', hash: '' },
    history: {
      replaceState: (_state, _title, url) => {
        replacedUrl = url;
      },
    },
    localStorage: {
      getItem: (k) => (localMap.has(k) ? localMap.get(k) : null),
      setItem: (k, v) => localMap.set(k, String(v)),
      clear: () => localMap.clear(),
    },
    sessionStorage: {
      clear: () => sessionMap.clear(),
    },
    document: {
      get cookie() {
        return 'old_cookie=1; theme=old';
      },
      set cookie(val) {
        cookieWrites.push(val);
      },
    },
    caches: {
      keys: async () => ['workbox-precache-v1', 'audio-cache'],
      delete: async (k) => {
        deletedCaches.push(k);
        return true;
      },
    },
    navigator: {
      serviceWorker: {
        getRegistrations: async () => [
          {
            unregister: async () => {
              swUnregistered++;
              return true;
            },
          },
        ],
      },
    },
  };

  // Primera visita con nueva versión -> limpia todo y guarda la versión actual
  const firstRun = syncAppReleaseVersion(APP_RELEASE_VERSION, mockEnv);
  await new Promise((r) => setTimeout(r, 15));
  assert.equal(firstRun.reset, true);
  assert.equal(localMap.get(RELEASE_STORAGE_KEY), APP_RELEASE_VERSION);
  assert.equal(localMap.has('scarlett_byron_rsvp_v2'), false);
  assert.equal(sessionMap.size, 0);
  assert.equal(cookieWrites.length, 2);
  assert.deepEqual(deletedCaches, ['workbox-precache-v1', 'audio-cache']);
  assert.equal(swUnregistered, 1);

  // Segunda visita en la misma versión -> conserva el RSVP real del invitado
  localMap.set('scarlett_byron_rsvp_v2', '{"guestName":"Camila Rojas"}');
  const secondRun = syncAppReleaseVersion(APP_RELEASE_VERSION, mockEnv);
  assert.equal(secondRun.reset, false);
  assert.equal(localMap.get('scarlett_byron_rsvp_v2'), '{"guestName":"Camila Rojas"}');

  // Visita manual con ?reset=1 -> fuerza limpieza y quita el parámetro de la URL
  mockEnv.location.search = '?reset=1&foo=bar';
  const forcedRun = syncAppReleaseVersion(APP_RELEASE_VERSION, mockEnv);
  assert.equal(forcedRun.reset, true);
  assert.equal(forcedRun.forced, true);
  assert.equal(localMap.has('scarlett_byron_rsvp_v2'), false);
  assert.equal(replacedUrl, '/?foo=bar');
});
