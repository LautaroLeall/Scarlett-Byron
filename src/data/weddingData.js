// Incrementar estas versiones al cambiar música o fotos en public/ para invalidar
// automáticamente la caché en celulares (iOS Safari, Android Chrome y WhatsApp).
export const APP_RELEASE_VERSION = '2026-11-26-v5';
export const ASSET_VERSION = '20261126v5';

export function versionedAsset(assetPath, version = ASSET_VERSION) {
  if (!assetPath) return '';
  const clean = String(assetPath).split('?')[0];
  return `${clean}?v=${encodeURIComponent(version)}`;
}

export const IMAGES = {
  crown: versionedAsset('/images/crown.svg'),
  waxSeal: versionedAsset('/images/wax-seal.webp'),
  waxSealCrimson: versionedAsset('/images/wax-seal-crimson.webp'),
  castleBg: versionedAsset('/images/castle-bg.webp'),
  rosesCorner: versionedAsset('/images/roses-corner.webp'),
  goldRoses: versionedAsset('/images/gold-roses.webp'),
  butterflyGold: versionedAsset('/images/butterfly-gold.webp'),
  coupleHero: versionedAsset('/images/couple-hero.webp'),
  enchantedRose: versionedAsset('/images/enchanted-rose.webp'),
  baroqueRoseFrame: versionedAsset('/images/baroque-frame.webp'),
  dancingSilhouette: versionedAsset('/images/dancing-silhouette.webp'),
  lumiere: versionedAsset('/images/lumiere.webp'),
  cogsworth: versionedAsset('/images/cogsworth.webp'),
  chip: versionedAsset('/images/chip.webp'),
};

export const NAV_SECTIONS = [
  { id: 'portada', label: 'Portada' },
  { id: 'ceremonia', label: 'Ceremonia' },
  { id: 'historia', label: 'Historia' },
  { id: 'confirmar', label: 'Confirmar' },
];

export const GALLERY_PHOTOS = [
  {
    id: 'palm-embrace',
    src: versionedAsset('/images/gallery-1.webp'),
    alt: 'Scarlett sonriendo mientras Byron la abraza y besa su mejilla bajo las palmeras',
    caption: 'Nuestro amor capturado para siempre',
    position: '50% 34%',
  },
  {
    id: 'sunlit-hug',
    src: versionedAsset('/images/gallery-2.webp'),
    alt: 'Scarlett y Byron abrazados y sonriendo entre los árboles iluminados por el sol',
    caption: 'Tu abrazo, mi lugar favorito',
    position: '50% 16%',
  },
  {
    id: 'garden-gaze',
    src: versionedAsset('/images/gallery-3.webp'),
    alt: 'Scarlett mirando con ternura a Byron tomados de la mano en el jardín',
    caption: 'Miradas que lo dicen todo',
    position: '50% 8%',
  },
  {
    id: 'stone-steps',
    src: versionedAsset('/images/gallery-4.webp'),
    alt: 'Scarlett y Byron sentados juntos mirando hacia el horizonte',
    caption: 'Juntos mirando hacia nuestro futuro',
    position: '50% 0%',
  },
  {
    id: 'sky-hands',
    src: versionedAsset('/images/gallery-5.webp'),
    alt: 'Scarlett y Byron tomados de la mano y besándose bajo el cielo azul',
    caption: 'Tomados de la mano bajo el mismo cielo',
    position: '50% 42%',
  },
  {
    id: 'palm-bliss',
    src: versionedAsset('/images/gallery-6.webp'),
    alt: 'Byron abrazando y besando en la mejilla a Scarlett con los ojos cerrados bajo las palmeras',
    caption: 'La paz de tenerte siempre cerca',
    position: '50% 34%',
  },
  {
    id: 'golden-kiss',
    src: versionedAsset('/images/gallery-7.webp'),
    alt: 'Scarlett rodeando el cuello de Byron en un beso lleno de amor',
    caption: 'Un capítulo más de nuestra historia',
    position: '35% 0%',
  },
];

export const WEDDING_DETAILS = {
  coupleNames: 'Scarlett & Byron',
  monogram: 'S&B',
  eyebrow: 'Nuestro Matrimonio',
  envelopeEyebrow: 'Invitación de Boda',
  tagline: 'La belleza de lo que permanece',
  heroSubtitle: 'Te invitamos a ser parte de nuestra historia de amor',
  closingQuote: '¡Te esperamos para celebrar este cuento de amor!',
  dateFormatted: '10 de Abril, 2027',
  targetDateIso: '2027-04-10T14:00:00-04:00',
  eventEndIso: '2027-04-10T23:59:00-04:00',
  timezone: 'America/Santiago',
  seo: {
    // En Vercel se detecta automáticamente con VERCEL_PROJECT_PRODUCTION_URL o VITE_SITE_URL.
    siteUrl: 'https://scarlett-byron.vercel.app',
    ogImagePath: '/og-image.jpg',
    ogVersion: '5',
    title: 'Scarlett & Byron — Invitación de Matrimonio',
    ogTitle: 'Scarlett & Byron — Nuestro Matrimonio',
    siteName: 'Matrimonio de Scarlett & Byron',
    description:
      'Te invitamos a celebrar nuestra ceremonia religiosa el 10 de Abril de 2027 a las 14:00 hs en Tucapel 2100a, La Pintana. Confirma tu asistencia y sugiere tu canción.',
    ogDescription:
      'La belleza de lo que permanece · 10 de Abril, 2027 · 14:00 hs · La Pintana. Abre tu invitación y confirma asistencia.',
    themeColor: '#112245',
    countryCode: 'CL',
    locale: 'es_CL',
    lang: 'es-CL',
  },
  audio: {
    src: versionedAsset('/audio/cancion.mp3'),
    title: 'Young and Beautiful — Lana Del Rey',
  },
  ceremony: {
    title: 'Ceremonia religiosa',
    time: '14:00 hs',
    venue: 'Tucapel 2100a',
    address: 'La Pintana, Santiago, Chile',
    mapUrl: 'https://maps.app.goo.gl/JL7x1H3cfSguP53U7',
    calendarTitle: 'Matrimonio Religioso — Scarlett & Byron',
    calendarDetails: 'Ceremonia religiosa de Scarlett & Byron.',
    startDate: '2027-04-10T14:00:00',
    endDate: '2027-04-10T15:30:00',
    icsFileName: 'ceremonia-scarlett-byron.ics',
  },
  reception: {
    title: 'Fiesta y Recepción',
    time: 'A continuación',
    venue: 'Tucapel 2100a',
    address: 'La Pintana, Santiago, Chile',
    mapUrl: 'https://maps.app.goo.gl/JL7x1H3cfSguP53U7',
    calendarTitle: 'Recepción — Matrimonio de Scarlett & Byron',
    calendarDetails: 'Celebración y recepción del matrimonio de Scarlett & Byron.',
    startDate: '2027-04-10T15:30:00',
    endDate: '2027-04-10T23:59:00',
    icsFileName: 'recepcion-scarlett-byron.ics',
  },
  dressCode: {
    title: 'Código de Vestimenta',
    style: 'Etiqueta Formal',
    note: 'Colores prohibidos:',
    restrictedColors: [
      { label: 'Blanco y tonos similares', swatch: '#FFFFFF', border: true },
      { label: 'Azul rey', swatch: '#1D4ED8' },
      { label: 'Rojo', swatch: '#B91C1C' },
      {
        label: 'Dorado metálico',
        swatch: 'linear-gradient(135deg, #F6E2A8 0%, #C89E44 52%, #8A621C 100%)',
      },
    ],
  },
  gifts: {
    title: 'Mesa de Regalos',
    subtitle: 'Nuestro mayor regalo es poder compartir este día tan especial con ustedes y contar con su cariño y compañía.',
    description: 'Si además desean hacernos un obsequio para acompañarnos en el comienzo de nuestra vida de casados, hemos dejado una pequeña opción que nos ayudará a construir nuestros nuevos sueños juntos.',
    entity: 'Banco Falabella',
    holder: 'Byron Hormazabal Sarmiento',
    rut: '19.186.908-7',
    accountType: 'Chequera Electrónica',
    accountNumber: '50013860033',
    end: 'Gracias por ser parte de nuestra historia.',
  },
  driveSheets: {
    // Se lee desde VITE_SHEETS_WEBHOOK_URL en `.env` (local) o Vercel Environment Variables.
    // Mantener vacío aquí para no exponer la URL del webhook en el repositorio Git.
    webhookUrl: '',
  },
  rsvp: {
    deadline: '15 de enero',
    maxGuests: 10,
    maxSongsPerGuest: 5,
    storageKey: 'scarlett_byron_rsvp_v2',
    songsStorageKey: 'scarlett_byron_songs_v2',
  },
  characters: {
    cogsworth: {
      alt: 'Din Don, el reloj encantado',
      quote: '¡La puntualidad ante todo!',
    },
    lumiere: {
      alt: 'Lumière, el candelabro anfitrión',
      quote: '¡Nuestro huésped serás!',
    },
    chip: {
      alt: 'Chip, la tacita encantada',
      quote: '¡A bailar toda la noche!',
    },
  },
  developer: {
    label: 'Desarrollado por',
    name: 'Lautaro.Dev',
    url: 'https://lautarolealdev.com/',
  },
};
