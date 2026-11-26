import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { IMAGES, WEDDING_DETAILS } from '../data/weddingData.js';
import { ResilientImage } from './ResilientImage.jsx';
import { MusicPlayerCard } from './MusicPlayerCard.jsx';
import { CountdownCard } from './CountdownCard.jsx';

function OrnatePortraitFrame({ className = '' }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 220, damping: 22 }}
      className={`relative mx-auto aspect-556/745 select-none ${className}`}
    >
      <div
        className="absolute z-0 overflow-hidden rounded-[50%] bg-ivory-200 shadow-inner"
        style={{
          left: '16%',
          top: '14.5%',
          width: '68%',
          height: '70%',
        }}
      >
        <ResilientImage
          src={IMAGES.coupleHero}
          alt={`${WEDDING_DETAILS.coupleNames} en su sesión fotográfica`}
          loading="eager"
          className="w-full h-full object-cover object-center transition-transform duration-700 ease-out hover:scale-105"
        />
      </div>

      <ResilientImage
        src={IMAGES.baroqueRoseFrame}
        alt="Marco barroco dorado ovalado"
        loading="eager"
        className="relative z-10 w-full h-full object-contain pointer-events-none drop-shadow-[0_12px_24px_rgba(44,36,30,0.2)]"
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
  const frameY = useTransform(scrollYProgress, [0, 1], [0, -28]);
  const roseY = useTransform(scrollYProgress, [0, 1], [0, 18]);

  return (
    <section
      ref={sectionRef}
      id="portada"
      aria-label="Portada, música y cuenta regresiva"
      className="relative w-full flex flex-col items-center gap-4 sm:gap-6 pt-4 pb-8 sm:py-8"
    >
      {/* Filigrana ornamental superior */}
      <div className="w-full flex items-center justify-between pointer-events-none" aria-hidden="true">
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
          <path d="M2 42 C2 20, 14 6, 42 2" stroke="#C5A059" strokeWidth="1.5" />
          <circle cx="10" cy="10" r="4" fill="#9E1B24" />
        </svg>
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none" className="scale-x-[-1]">
          <path d="M2 42 C2 20, 14 6, 42 2" stroke="#C5A059" strokeWidth="1.5" />
          <circle cx="10" cy="10" r="4" fill="#9E1B24" />
        </svg>
      </div>

      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-7 lg:gap-9 items-center -mt-6">
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
                className="w-16 h-11 sm:w-20 sm:h-13 object-contain -mb-1.5 gentle-float drop-shadow-[0_3px_6px_rgba(150,113,44,0.28)]"
              />
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full border-2 border-outline bg-ivory-50 flex items-center justify-center shadow-sm">
                <span className="font-headline text-[16px] sm:text-[18px] leading-5.5 tracking-[1.2px] font-semibold text-ink">
                  {WEDDING_DETAILS.monogram}
                </span>
              </div>
            </div>

            <span className="font-label text-[12px] leading-4 tracking-[1.4px] font-semibold text-crimson uppercase mt-2">
              {WEDDING_DETAILS.eyebrow}
            </span>
            <h1 className="font-display text-[42px] sm:text-[52px] leading-12.5 sm:leading-15 text-ink text-balance">
              {WEDDING_DETAILS.coupleNames}
            </h1>
            <p className="font-headline text-[11px] sm:text-[12px] tracking-[1.3px] uppercase text-gold-dark">
              {WEDDING_DETAILS.tagline}
            </p>
            <p className="font-body text-[14px] sm:text-[15px] leading-5.5 text-ink-muted text-pretty max-w-sm mt-0.5">
              {WEDDING_DETAILS.heroSubtitle}
            </p>
          </div>

          {/* Accesos rápidos móvil */}
          <nav
            aria-label="Accesos rápidos"
            className="flex md:hidden flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] font-label font-semibold tracking-[1px] uppercase text-ink-muted"
          >
            <a href="#ceremonia" className="py-1 hover:text-ink underline-offset-4 hover:underline">
              Ceremonia
            </a>
            <span aria-hidden="true" className="text-outline">·</span>
            <a href="#historia" className="py-1 hover:text-ink underline-offset-4 hover:underline">
              Historia
            </a>
            <span aria-hidden="true" className="text-outline">·</span>
            <a href="#confirmar" className="py-1 hover:text-ink underline-offset-4 hover:underline">
              Confirmar
            </a>
          </nav>

          {/* Marco barroco en móvil */}
          <div className="w-full max-w-70 sm:max-w-77.5 lg:hidden">
            <OrnatePortraitFrame className="w-full" />
          </div>

          {/* Silueta dorada bailando con transparencia real */}
          <div className="w-full max-w-sm flex items-center justify-center gap-4">
            <span className="h-px flex-1 bg-linear-to-r from-transparent via-outline to-outline-variant" aria-hidden="true" />
            <motion.div
              whileHover={{ scale: 1.08, rotate: -2 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18 }}
              className="shrink-0"
            >
              <ResilientImage
                src={IMAGES.dancingSilhouette}
                alt="Silueta dorada de La Bella y la Bestia bailando"
                className="w-20 h-20 sm:w-22 sm:h-22 object-contain drop-shadow-[0_2px_4px_rgba(150,113,44,0.18)]"
              />
            </motion.div>
            <span className="h-px flex-1 bg-linear-to-l from-transparent via-outline to-outline-variant" aria-hidden="true" />
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
          className="hidden lg:flex lg:col-span-6 flex-col items-center gap-5"
        >
          <OrnatePortraitFrame className="w-full max-w-82.5" />

          <motion.div
            style={{ y: roseY }}
            className="flex items-center gap-4 bg-surface-container/85 border border-outline-variant rounded-2xl px-5 py-3.5 shadow-sm max-w-90 w-full"
          >
            <ResilientImage
              src={IMAGES.enchantedRose}
              alt="Rosa encantada dentro de su cúpula de cristal"
              className="w-18 h-24 object-contain shrink-0 mix-blend-multiply brightness-[1.06] contrast-[1.08] mask-[radial-gradient(ellipse_78%_82%_at_50%_50%,#000_64%,transparent_100%)]"
            />
            <div className="text-left flex flex-col gap-1">
              <p className="font-headline text-[13px] tracking-[1px] font-semibold text-crimson uppercase">
                {WEDDING_DETAILS.dateFormatted}
              </p>
              <p className="font-body text-[13px] leading-4.75 text-ink-muted">
                {WEDDING_DETAILS.ceremony.venue === WEDDING_DETAILS.reception.venue
                  ? `${WEDDING_DETAILS.ceremony.venue} · ${WEDDING_DETAILS.ceremony.address}`
                  : `${WEDDING_DETAILS.ceremony.venue} & ${WEDDING_DETAILS.reception.venue}`}
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Detalle rosa encantada en móvil */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 'some' }}
        transition={{ duration: 0.5 }}
        className="w-full flex flex-col items-center gap-2 pt-2 lg:hidden"
      >
        <ResilientImage
          src={IMAGES.enchantedRose}
          alt="Rosa encantada dentro de su cúpula de cristal"
          className="w-24 h-32 object-contain mix-blend-multiply brightness-[1.06] contrast-[1.08] mask-[radial-gradient(ellipse_78%_82%_at_50%_50%,#000_64%,transparent_100%)]"
        />
        <p className="font-headline text-[12px] tracking-[1.2px] font-semibold text-gold-dark uppercase">
          {WEDDING_DETAILS.dateFormatted}
        </p>
      </motion.div>
    </section>
  );
}
