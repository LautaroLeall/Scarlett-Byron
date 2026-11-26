export const IMAGES = {
  crown: '/images/crown.svg',
  waxSeal: '/images/wax-seal.webp',
  coupleHero: '/images/couple-hero.webp',
  enchantedRose: '/images/enchanted-rose.webp',
  baroqueRoseFrame: '/images/baroque-frame.webp',
  dancingSilhouette: '/images/dancing-silhouette.webp',
  lumiere: '/images/lumiere.webp',
  cogsworth: '/images/cogsworth.webp',
  chip: '/images/chip.webp',
};

export const GALLERY_PHOTOS = [
  {
    id: 'rose-garden',
    src: '/images/gallery-1.webp',
    alt: 'Scarlett y Byron caminando bajo un arco de rosas',
    caption: 'Nuestro compromiso en el jardín de rosas',
  },
  {
    id: 'candlelight',
    src: '/images/gallery-2.webp',
    alt: 'Scarlett y Byron sonriendo juntos a la luz de las velas',
    caption: 'Una noche inolvidable a la luz de las velas',
  },
  {
    id: 'sunset-dance',
    src: '/images/gallery-3.webp',
    alt: 'Scarlett y Byron bailando al atardecer',
    caption: 'Nuestro primer baile al atardecer',
  },
];

export const WEDDING_DETAILS = {
  coupleNames: 'Scarlett & Byron',
  monogram: 'S&B',
  eyebrow: 'Nuestro Matrimonio',
  envelopeEyebrow: 'Invitación de Boda',
  tagline: 'Una historia tan antigua como el tiempo',
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
    ogVersion: '2',
    title: 'Scarlett & Byron — Invitación de Matrimonio',
    ogTitle: 'Scarlett & Byron — Nuestro Matrimonio',
    siteName: 'Matrimonio de Scarlett & Byron',
    description:
      'Te invitamos a celebrar nuestro matrimonio religioso el 10 de Abril de 2027 a las 14:00 hs en Tucapel 2100a, La Pintana. Confirma tu asistencia y sugiere tu canción.',
    ogDescription:
      'Una historia tan antigua como el tiempo · 10 de Abril, 2027 · 14:00 hs · La Pintana. Abre tu invitación y confirma asistencia.',
    themeColor: '#F8F2E4',
    countryCode: 'CL',
    locale: 'es_CL',
    lang: 'es-CL',
  },
  audio: {
    src: '/audio/cancion.mp3',
    title: 'Young and Beautiful — Lana Del Rey',
  },
  ceremony: {
    title: 'Matrimonio Religioso',
    time: '14:00 hs',
    venue: 'Tucapel 2100a',
    address: 'La Pintana, Santiago, Chile',
    mapUrl: 'https://maps.app.goo.gl/JL7x1H3cfSguP53U7',
    calendarTitle: 'Matrimonio Religioso — Scarlett & Byron',
    calendarDetails: 'Ceremonia de matrimonio religioso de Scarlett & Byron.',
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
    style: 'Etiqueta Formal / Gala',
    description: 'Traje formal y vestido largo',
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
    subtitle: 'Si deseas hacernos un obsequio para nuestra nueva etapa:',
    entity: 'Banco Falabella',
    holder: 'Byron Hormazabal Sarmiento',
    rut: '19.186.908-7',
    accountType: 'Chequera Electrónica',
    accountNumber: '50013860033',
    alias: '',
  },
  driveSheets: {
    // Se lee desde VITE_SHEETS_WEBHOOK_URL en `.env` (local) o Vercel Environment Variables.
    // Mantener vacío aquí para no exponer la URL del webhook en el repositorio Git.
    webhookUrl: '',
  },
  rsvp: {
    deadline: '20 de Marzo',
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
