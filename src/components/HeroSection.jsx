import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { IMAGES, WEDDING_DETAILS } from '../data/weddingData.js';
import { ResilientImage } from './ResilientImage.jsx';
import { MusicPlayerCard } from './MusicPlayerCard.jsx';
import { CountdownCard } from './CountdownCard.jsx';
import { WeddingCalendarCard } from './WeddingCalendarCard.jsx';
import { CornerRoses, GoldButterfly, StarlightField } from './RoyalOrnaments.jsx';

function OrnatePortraitFrame({ className = '' }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 220, damping: 22 }}
      className={`relative mx-auto aspect-556/745 select-none ${className}`}
    >
      {/* Resplandor dorado detrás del marco barroco */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-4 rounded-full bg-radial from-gold-light/30 via-royal-700/15 to-transparent blur-xl"
      />

      <div
        className="absolute z-0 overflow-hidden rounded-[50%] bg-royal-900 shadow-inner"
        style={{
          left: '17.8%',
          top: '15.6%',
          width: '65.2%',
          height: '64.6%',
        }}
      >
        <ResilientImage
          src={IMAGES.coupleHero}
          alt={`${WEDDING_DETAILS.coupleNames} besándose con las manos entrelazadas`}
          loading="eager"
          style={{ objectPosition: '50% 50%' }}
          className="w-full h-full object-cover transition-transform duration-700 ease-out hover:scale-105"
        />
      </div>

      <ResilientImage
        src={IMAGES.baroqueRoseFrame}
        alt="Marco barroco dorado ovalado"
        loading="eager"
        className="relative z-10 w-full h-full object-contain pointer-events-none drop-shadow-[0_16px_30px_rgba(4,9,24,0.65)]"
      />
    </motion.div>
  );
}

export function HeroSection({ isPlaying, onToggleMusic }) {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const frameY = useTransform(scrollYProgress, [0, 1], [0, -24]);
  const roseY = useTransform(scrollYProgress, [0, 1], [0, 16]);

  const heroVenueLabel =
    WEDDING_DETAILS.ceremony.venue === WEDDING_DETAILS.reception.venue
      ? `${WEDDING_DETAILS.ceremony.venue} · ${WEDDING_DETAILS.ceremony.address}`
      : `${WEDDING_DETAILS.ceremony.venue} & ${WEDDING_DETAILS.reception.venue}`;

  return (
    <section
      ref={sectionRef}
      id="portada"
      aria-label="Portada, música y cuenta regresiva"
      className="relative w-full overflow-hidden bg-royal-950 border-b-2 border-gold/65 px-4 sm:px-8 lg:px-12 pt-7 pb-10 sm:py-12"
    >
      {/* Fondo nocturno del castillo encantado + degradado azul real */}
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
        <img
          src={IMAGES.castleBg}
          alt=""
          loading="eager"
          decoding="async"
          className="w-full h-full object-cover object-top opacity-38 scale-105 brightness-[0.88] saturate-[1.08]"
        />
        <div className="absolute inset-0 bg-linear-to-b from-royal-950/78 via-royal-900/72 to-royal-950/92" />
        <div className="absolute inset-0 bg-radial from-royal-700/22 via-transparent to-royal-950/85" />
        <StarlightField />
      </div>

      {/* Rosas acuarela y mariposas doradas en las esquinas de la portada */}
      <CornerRoses position="tl" className="z-10 w-28 sm:w-40 opacity-85" />
      <CornerRoses position="tr" className="z-10 w-28 sm:w-40 opacity-85" />
      <CornerRoses position="bl" className="z-10 w-24 sm:w-36 opacity-65" />
      <CornerRoses position="br" className="z-10 w-24 sm:w-36 opacity-65" />
      <GoldButterfly className="absolute top-14 right-8 sm:right-16 z-10 w-10 sm:w-13 opacity-85" />
      <GoldButterfly
        flip
        className="hidden sm:block absolute bottom-20 left-8 z-10 w-11 opacity-75"
      />

      {/* Marco dorado interior decorativo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-3 sm:inset-5 rounded-2xl border border-gold/30 z-10"
      />

      <div className="relative z-20 w-full flex flex-col items-center gap-6">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Columna izquierda / principal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-6 flex flex-col items-center text-center gap-4 sm:gap-5"
          >
            <div className="flex flex-col items-center text-center gap-2">
              <div className="flex flex-col items-center">
                <ResilientImage
                  src={IMAGES.crown}
                  alt="Corona dorada real"
                  loading="eager"
                  className="w-16 h-11 sm:w-20 sm:h-13 object-contain -mb-1.5 gentle-float drop-shadow-[0_4px_12px_rgba(232,204,136,0.45)]"
                />
                <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full border-2 border-gold-light bg-royal-950/80 flex items-center justify-center shadow-[0_0_24px_rgba(232,204,136,0.28)]">
                  <span className="font-headline text-[16px] sm:text-[18px] leading-5.5 tracking-[1.2px] font-semibold text-champagne">
                    {WEDDING_DETAILS.monogram}
                  </span>
                </div>
              </div>

              <span className="font-label text-[11px] sm:text-[12px] leading-4 tracking-[2px] font-semibold text-gold-light uppercase mt-2">
                {WEDDING_DETAILS.eyebrow}
              </span>
              <h1 className="font-display text-[46px] sm:text-[56px] leading-13 sm:leading-15 text-ivory-50 text-balance drop-shadow-[0_4px_18px_rgba(5,11,28,0.85)]">
                {WEDDING_DETAILS.coupleNames}
              </h1>
              <p className="font-headline text-[11px] sm:text-[12px] tracking-[1.5px] uppercase text-champagne">
                {WEDDING_DETAILS.tagline}
              </p>
              <p className="font-body text-[14px] sm:text-[15px] leading-5.5 text-royal-200 text-pretty max-w-sm mt-0.5">
                {WEDDING_DETAILS.heroSubtitle}
              </p>
            </div>

            {/* Accesos rápidos móvil */}
            <nav
              aria-label="Accesos rápidos"
              className="flex md:hidden flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-full bg-royal-950/70 border border-gold/35 px-4 py-1 text-[11px] font-label font-semibold tracking-[1px] uppercase text-royal-200"
            >
              <a href="#ceremonia" className="py-1 hover:text-champagne underline-offset-4 hover:underline">
                Ceremonia
              </a>
              <span aria-hidden="true" className="text-gold/60">·</span>
              <a href="#historia" className="py-1 hover:text-champagne underline-offset-4 hover:underline">
                Historia
              </a>
              <span aria-hidden="true" className="text-gold/60">·</span>
              <a href="#confirmar" className="py-1 hover:text-champagne underline-offset-4 hover:underline">
                Confirmar
              </a>
            </nav>

            {/* Marco barroco en móvil */}
            <div className="w-full max-w-70 sm:max-w-77.5 lg:hidden">
              <OrnatePortraitFrame className="w-full" />
            </div>

            {/* Silueta dorada bailando */}
            <div className="w-full max-w-sm flex items-center justify-center gap-4">
              <span
                className="h-px flex-1 bg-linear-to-r from-transparent via-gold-light/65 to-gold-light"
                aria-hidden="true"
              />
              <motion.div
                whileHover={{ scale: 1.08, rotate: -2 }}
                transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                className="shrink-0"
              >
                <ResilientImage
                  src={IMAGES.dancingSilhouette}
                  alt="Silueta dorada de La Bella y la Bestia bailando"
                  className="w-20 h-20 sm:w-22 sm:h-22 object-contain drop-shadow-[0_0_14px_rgba(240,216,152,0.5)]"
                />
              </motion.div>
              <span
                className="h-px flex-1 bg-linear-to-l from-transparent via-gold-light/65 to-gold-light"
                aria-hidden="true"
              />
            </div>

            <MusicPlayerCard isPlaying={isPlaying} onToggleMusic={onToggleMusic} />
            <CountdownCard />
          </motion.div>

          {/* Columna derecha escritorio */}
          <motion.div
            style={{ y: frameY }}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="hidden lg:flex lg:col-span-6 flex-col items-center gap-6"
          >
            <OrnatePortraitFrame className="w-full max-w-82.5" />

            <motion.div style={{ y: roseY }} className="w-full max-w-96">
              <WeddingCalendarCard venueLabel={heroVenueLabel} />
            </motion.div>
          </motion.div>
        </div>

        {/* Calendario Abril 2027 + Para siempre en móvil */}
        <div className="w-full max-w-sm lg:hidden">
          <WeddingCalendarCard venueLabel={heroVenueLabel} />
        </div>
      </div>
    </section>
  );
}
