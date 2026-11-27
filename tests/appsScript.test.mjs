// Pruebas end-to-end reales del backend Google Apps Script (`google-apps-script/Code.gs`)
// ejecutado en un sandbox `node:vm` con mocks livianos de Google Sheets.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const CODE_GS_PATH = path.join(ROOT, 'google-apps-script', 'Code.gs');

function createMockSheet(name) {
  const rows = [];
  let filter = null;
  let conditionalRules = [];
  let frozenRows = 0;

  function ensureSize(r, c) {
    while (rows.length < r) rows.push([]);
    for (let i = 0; i < r; i++) {
      while (rows[i].length < c) rows[i].push('');
    }
  }

  function parseA1(a1) {
    const match = /^([A-Z]+)(\d+)(?::([A-Z]+)(\d+))?$/.exec(a1);
    const colToNum = (col) => col.split('').reduce((acc, ch) => acc * 26 + ch.charCodeAt(0) - 64, 0);
    const r1 = Number(match[2]);
    const c1 = colToNum(match[1]);
    const r2 = match[4] ? Number(match[4]) : r1;
    const c2 = match[3] ? colToNum(match[3]) : c1;
    return [r1, c1, r2 - r1 + 1, c2 - c1 + 1];
  }

  function makeRange(row, col, numRows = 1, numCols = 1) {
    return {
      getNumColumns: () => numCols,
      setValues: (vals) => {
        ensureSize(row + numRows - 1, col + numCols - 1);
        for (let r = 0; r < numRows; r++) {
          for (let c = 0; c < numCols; c++) {
            rows[row - 1 + r][col - 1 + c] = vals[r][c];
          }
        }
        return makeRange(row, col, numRows, numCols);
      },
      setFormulas: (vals) => makeRange(row, col, numRows, numCols).setValues(vals),
      setFormula: (val) => makeRange(row, col, 1, 1).setValues([[val]]),
      getValues: () => {
        const out = [];
        for (let r = 0; r < numRows; r++) {
          const line = [];
          for (let c = 0; c < numCols; c++) {
            line.push(rows[row - 1 + r]?.[col - 1 + c] ?? '');
          }
          out.push(line);
        }
        return out;
      },
      getValue: () => rows[row - 1]?.[col - 1] ?? '',
      clearContent: () => {
        for (let r = 0; r < numRows; r++) {
          for (let c = 0; c < numCols; c++) {
            if (rows[row - 1 + r]) rows[row - 1 + r][col - 1 + c] = '';
          }
        }
      },
      createFilter: () => {
        filter = {
          getRange: () => ({ getNumColumns: () => numCols }),
          remove: () => {
            filter = null;
          },
        };
        return filter;
      },
      setBackground: function () { return this; },
      setFontColor: function () { return this; },
      setFontWeight: function () { return this; },
      setHorizontalAlignment: function () { return this; },
      setDataValidation: function () { return this; },
    };
  }

  return {
    name,
    _rows: rows,
    getRange: (a, b, c, d) => (typeof a === 'string' ? makeRange(...parseA1(a)) : makeRange(a, b, c || 1, d || 1)),
    appendRow: (vals) => rows.push([...vals]),
    getLastRow: () => rows.length,
    getMaxRows: () => Math.max(rows.length, 500),
    setFrozenRows: (n) => { frozenRows = n; },
    getFrozenRows: () => frozenRows,
    setColumnWidth: () => { },
    setColumnWidths: () => { },
    getFilter: () => filter,
    getConditionalFormatRules: () => conditionalRules,
    setConditionalFormatRules: (rules) => { conditionalRules = rules; },
  };
}

function loadAppsScriptSandbox(locale = 'es_CL') {
  const sheets = new Map();
  const ss = {
    getSpreadsheetLocale: () => locale,
    getSheetByName: (name) => sheets.get(name) || null,
    insertSheet: (name) => {
      const sheet = createMockSheet(name);
      sheets.set(name, sheet);
      return sheet;
    },
  };

  const ruleBuilder = () => ({
    requireValueInList: function () { return this; },
    setAllowInvalid: function () { return this; },
    whenTextEqualTo: function () { return this; },
    setBackground: function () { return this; },
    setFontColor: function () { return this; },
    setBold: function () { return this; },
    setRanges: function () { return this; },
    build: () => ({ built: true }),
  });

  const sandbox = {
    SpreadsheetApp: {
      getActiveSpreadsheet: () => ss,
      newDataValidation: ruleBuilder,
      newConditionalFormatRule: ruleBuilder,
      flush: () => { },
    },
    LockService: {
      getScriptLock: () => ({ waitLock: () => { }, releaseLock: () => { } }),
    },
    ContentService: {
      MimeType: { JSON: 'application/json' },
      createTextOutput: (txt) => ({
        text: txt,
        setMimeType: function () { return this; },
      }),
    },
    Utilities: {
      formatDate: () => '26/11/2026 21:45',
    },
  };

  const code = fs.readFileSync(CODE_GS_PATH, 'utf8');
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox);

  const post = (payload) =>
    JSON.parse(sandbox.doPost({ postData: { contents: JSON.stringify(payload) } }).text);

  return { sandbox, sheets, ss, post };
}

test('Code.gs doGet responde listo con las 4 capacidades habilitadas', () => {
  const { sandbox } = loadAppsScriptSandbox('es_CL');
  const res = JSON.parse(sandbox.doGet().text);
  assert.equal(res.ok, true);
  assert.equal(res.status, 'ready');
  assert.ok(res.features.includes('upsert-rsvp'));
  assert.ok(res.features.includes('required-companion-names'));
  assert.ok(res.features.includes('verified-guest-songs'));
  assert.ok(res.features.includes('auto-filters'));
});

test('Code.gs inicializarPlanilla crea 4 hojas con Nombres de Acompañantes y separador regional ; / ,', () => {
  const chile = loadAppsScriptSandbox('es_CL');
  chile.sandbox.inicializarPlanilla();

  const rsvp = chile.sheets.get('Confirmaciones');
  const attending = chile.sheets.get('Solo Asisten');
  const summary = chile.sheets.get('Resumen');
  const songs = chile.sheets.get('Musica');

  assert.ok(rsvp && attending && summary && songs);
  assert.equal(rsvp.getRange('F1').getValue(), 'Nombres de Acompañantes');
  assert.equal(attending.getRange('E1').getValue(), 'Nombres de Acompañantes');
  assert.ok(!JSON.stringify(rsvp._rows).includes('Restricciones'));
  assert.ok(rsvp.getFilter());
  assert.equal(rsvp.getConditionalFormatRules().length, 2);
  assert.ok(String(summary.getRange('B2').getValue()).includes(';'));
  assert.equal(summary.getLastRow(), 5); // Encabezado + 4 métricas sin restricciones alimentarias

  const us = loadAppsScriptSandbox('en_US');
  us.sandbox.inicializarPlanilla();
  assert.ok(String(us.sheets.get('Resumen').getRange('B2').getValue()).includes(','));
});

test('Code.gs doPost valida acompañantes obligatorios, actualiza sin duplicar y bloquea honeypot', () => {
  const { sandbox, sheets, post } = loadAppsScriptSandbox('es_CL');
  sandbox.inicializarPlanilla();

  // Honeypot anti-bots -> ignorado silenciosamente sin guardar fila
  const botRes = post({ type: 'rsvp', guestName: 'Bot Malicioso', website: 'http://spam.tld' });
  assert.equal(botRes.ok, true);
  assert.equal(botRes.ignored, true);
  assert.equal(sheets.get('Confirmaciones').getLastRow(), 1);

  // Falta nombre completo de acompañante -> INVALID_COMPANIONS
  const badComp = post({
    type: 'rsvp',
    guestName: 'Camila Rojas',
    attending: true,
    companions: 2,
    companionNames: ['Martín González', 'Sofía'],
  });
  assert.equal(badComp.ok, false);
  assert.equal(badComp.code, 'INVALID_COMPANIONS');

  // Titular repetido como acompañante -> INVALID_COMPANIONS
  const selfComp = post({
    type: 'rsvp',
    guestName: 'Camila Rojas',
    attending: true,
    companions: 1,
    companionNames: ['Cámila  rojas'],
  });
  assert.equal(selfComp.ok, false);
  assert.equal(selfComp.code, 'INVALID_COMPANIONS');

  // Registro válido -> crea fila con Nombres de Acompañantes en Col F
  const created = post({
    type: 'rsvp',
    guestName: 'Camila Rojas',
    attending: true,
    companions: 2,
    companionNames: ['Martín González', 'Valentina Muñoz'],
    message: '¡Qué emoción!',
  });
  assert.equal(created.ok, true);
  assert.equal(created.action, 'created');
  const rsvpSheet = sheets.get('Confirmaciones');
  assert.equal(rsvpSheet.getLastRow(), 2);
  assert.equal(rsvpSheet.getRange('E2').getValue(), 3); // 1 titular + 2 acompañantes
  assert.equal(rsvpSheet.getRange('F2').getValue(), 'Martín González, Valentina Muñoz');
  assert.equal(rsvpSheet.getRange('H2').getValue(), 'Nuevo');

  // Reenvío del mismo invitado con tildes/mayúsculas distintas -> actualiza sin duplicar
  const updated = post({
    type: 'rsvp',
    guestName: 'CÁMILA   rojas',
    attending: true,
    companions: 1,
    companionNames: ['Martín González'],
    message: 'Confirmación actualizada',
  });
  assert.equal(updated.ok, true);
  assert.equal(updated.action, 'updated');
  assert.equal(rsvpSheet.getLastRow(), 2); // Misma cantidad de filas, cero duplicados
  assert.equal(rsvpSheet.getRange('E2').getValue(), 2);
  assert.equal(rsvpSheet.getRange('F2').getValue(), 'Martín González');
  assert.equal(rsvpSheet.getRange('H2').getValue(), 'Actualizado');
});

test('Code.gs doPost bloquea música anónima/no registrada, duplicados globales y tope de 5 temas', () => {
  const { sandbox, post } = loadAppsScriptSandbox('es_CL');
  sandbox.inicializarPlanilla();

  // Invitado no confirmado aún -> RSVP_REQUIRED
  const unreg = post({ type: 'song', guestName: 'Diego Fuentes', song: 'Perfect - Ed Sheeran' });
  assert.equal(unreg.ok, false);
  assert.equal(unreg.code, 'RSVP_REQUIRED');

  // Registrar invitado primero
  const rsvp = post({ type: 'rsvp', guestName: 'Diego Fuentes', attending: true, companions: 0 });
  assert.equal(rsvp.ok, true);

  // 5 canciones válidas permitidas
  for (let i = 1; i <= 5; i++) {
    const res = post({ type: 'song', guestName: 'diego fuentes', song: `Canción Número ${i}` });
    assert.equal(res.ok, true);
  }

  // Canción duplicada ignorando tildes/mayúsculas -> DUPLICATE_SONG
  const dup = post({ type: 'song', guestName: 'Diego Fuentes', song: 'cancion   numero 1' });
  assert.equal(dup.ok, false);
  assert.equal(dup.code, 'DUPLICATE_SONG');

  // 6ta canción -> SONG_LIMIT
  const overLimit = post({ type: 'song', guestName: 'Diego Fuentes', song: 'Sexta Canción' });
  assert.equal(overLimit.ok, false);
  assert.equal(overLimit.code, 'SONG_LIMIT');
});

test('Code.gs ensureSheets actualiza automáticamente planillas antiguas sin borrar invitados existentes', () => {
  const { ss, post } = loadAppsScriptSandbox('es_CL');
  const legacy = ss.insertSheet('Confirmaciones');
  legacy.appendRow([
    'Fecha y Hora',
    'Nombre y Apellido',
    'Asiste',
    'Acompañantes',
    'Total Personas',
    'Restricciones Alimentarias',
    'Saludo / Mensaje',
    'Estado',
  ]);
  legacy.appendRow(['20/11/2026 12:00', 'Ana Torres', 'Sí', 0, 1, '', 'Hola', 'Nuevo']);

  const res = post({
    type: 'rsvp',
    guestName: 'Pedro Silva',
    attending: true,
    companions: 0,
  });
  assert.equal(res.ok, true);
  assert.equal(legacy.getRange('F1').getValue(), 'Nombres de Acompañantes');
  assert.equal(legacy.getRange('B2').getValue(), 'Ana Torres'); // Invitado previo intacto
  assert.equal(legacy.getRange('B3').getValue(), 'Pedro Silva');
});
