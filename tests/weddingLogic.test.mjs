import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCountdown,
  wrapGalleryIndex,
  normalizeMatchKey,
  normalizeCompanions,
  validateRsvpForm,
  hasRsvpChanged,
  validateSongSuggestion,
  addSongSuggestion,
  parseStoredRsvp,
  parseStoredSongs,
} from '../src/utils/weddingLogic.js';
import { buildGoogleCalendarUrl, buildIcsContent } from '../src/utils/calendar.js';
import {
  getDriveWebhookUrl,
  isDriveConfigured,
  postToDriveSheet,
  submitRsvpToDrive,
  submitSongToDrive,
} from '../src/services/driveSheets.js';
import { resolveSiteUrl } from '../scripts/seoAutoPlugin.mjs';

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

test('wrapGalleryIndex cicla correctamente hacia adelante y hacia atrás', () => {
  assert.equal(wrapGalleryIndex(0, -1, 3), 2);
  assert.equal(wrapGalleryIndex(2, 1, 3), 0);
  assert.equal(wrapGalleryIndex(1, -5, 3), 2);
  assert.equal(wrapGalleryIndex(0, 1, 0), 0);
});

test('normalizeMatchKey unifica tildes, mayúsculas y espacios extra para anti-duplicados', () => {
  assert.equal(normalizeMatchKey('  Cámila   ROJAS '), 'camila rojas');
  assert.equal(normalizeMatchKey('camila rojas'), normalizeMatchKey('CÁMILA  rojas'));
  assert.equal(normalizeMatchKey('Vivir Mi VíDA'), normalizeMatchKey('vivir mi vida'));
});

test('normalizeCompanions maneja cadenas vacías, textos inválidos y límites', () => {
  assert.equal(normalizeCompanions('', 10), 0);
  assert.equal(normalizeCompanions('abc', 10), 0);
  assert.equal(normalizeCompanions(-3, 10), 0);
  assert.equal(normalizeCompanions('4', 10), 4);
  assert.equal(normalizeCompanions('99', 10), 10);
});

test('validateRsvpForm exige nombre y apellido completo y rechaza spam o datos inválidos', () => {
  assert.equal(validateRsvpForm({ guestName: '   ', attending: true, companions: 0 }).valid, false);
  assert.equal(validateRsvpForm({ guestName: 'Camila', attending: true, companions: 0 }).valid, false);
  assert.equal(validateRsvpForm({ guestName: 'Aaaa Bbbb', attending: true, companions: 0 }).valid, false);
  assert.equal(validateRsvpForm({ guestName: 'Juan 123', attending: true, companions: 0 }).valid, false);
  assert.equal(validateRsvpForm({ guestName: 'Valentina Gómez', attending: true, companions: 25 }, 10).valid, false);

  const coupleName = validateRsvpForm({
    guestName: "  Ana &   Lucas O'Connor  ",
    attending: true,
    companions: '',
    dietNotes: 'Celíaco',
    message: '¡Felicidades!',
  });
  assert.equal(coupleName.valid, true);
  assert.equal(coupleName.trimmedName, "Ana & Lucas O'Connor");
  assert.equal(coupleName.companions, 0);

  const familyList = validateRsvpForm({
    guestName: 'María, Pedro y Sofi',
    attending: false,
    companions: 99,
  });
  assert.equal(familyList.valid, true);
  assert.equal(familyList.companions, 0);
});

test('hasRsvpChanged detecta cambios reales y evita reenvíos idénticos', () => {
  const base = {
    guestName: 'Camila Rojas',
    attending: true,
    companions: 1,
    dietNotes: 'Sin gluten',
    message: '¡Felicidades!',
  };
  assert.equal(hasRsvpChanged(null, base), true);
  assert.equal(hasRsvpChanged(base, { ...base, guestName: '  cámila  rojas ' }), false);
  assert.equal(hasRsvpChanged(base, { ...base, companions: 2 }), true);
  assert.equal(hasRsvpChanged(base, { ...base, attending: false }), true);
});

test('validateSongSuggestion y addSongSuggestion (anti-duplicado + tope) funcionan', () => {
  assert.equal(validateSongSuggestion('   ').valid, false);
  assert.equal(validateSongSuggestion('Ab').valid, false);
  assert.equal(validateSongSuggestion('12345').valid, false);
  assert.equal(validateSongSuggestion('aaaaaaa').valid, false);
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

test('parseStoredRsvp y parseStoredSongs resisten JSON corrupto, nombres de una palabra y duplicados', () => {
  assert.equal(parseStoredRsvp('{roto'), null);
  assert.equal(parseStoredRsvp('{}'), null);
  assert.equal(parseStoredRsvp('{"guestName":"Sofía"}'), null);
  const okRsvp = parseStoredRsvp('{"guestName":"Sofía Morales","attending":true,"companions":3,"action":"updated"}');
  assert.equal(okRsvp?.guestName, 'Sofía Morales');
  assert.equal(okRsvp?.companions, 3);
  assert.equal(okRsvp?.action, 'updated');

  assert.deepEqual(parseStoredSongs('{roto'), []);
  assert.deepEqual(parseStoredSongs('{"no":"array"}'), []);
  assert.deepEqual(parseStoredSongs('["Tema Uno", "tema  uno", 42, "", "  Tema Dos  "]'), [
    'Tema Uno',
    'Tema Dos',
  ]);
});

test('driveSheets envía upsert RSVP, bloquea música anónima y maneja errores del servidor', async () => {
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

  // Envío real simulado de actualización RSVP (upsert sin duplicados)
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
      dietNotes: 'Celíaco',
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

  // Envío simulado de canción duplicada rechazada por Apps Script
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

test('buildGoogleCalendarUrl y buildIcsContent generan formatos válidos con zona horaria Chile', () => {
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
    title: 'Matrimonio Religioso — Scarlett & Byron',
    details: 'Ceremonia religiosa',
    location: 'Tucapel 2100a, La Pintana, Santiago, Chile',
    startDate: '2027-04-10T14:00:00',
    endDate: '2027-04-10T15:30:00',
    organizer: 'Scarlett & Byron',
  });
  assert.ok(ics.includes('BEGIN:VCALENDAR'));
  assert.ok(ics.includes('DTSTART:20270410T140000'));
  assert.ok(ics.includes('DTEND:20270410T153000'));
  assert.ok(ics.includes('END:VCALENDAR'));
});

test('resolveSiteUrl prioriza VITE_SITE_URL, VERCEL_PROJECT_PRODUCTION_URL y VERCEL_URL', () => {
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
});
