import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VolumeX } from 'lucide-react';
import { IMAGES, WEDDING_DETAILS } from '../data/weddingData.js';
import { ResilientImage } from './ResilientImage.jsx';
import { FloatingPetals } from './FloatingPetals.jsx';
import { GoldButterfly, StarlightField } from './RoyalOrnaments.jsx';
import {
  BaroquePlaqueButton,
  EnvelopeBackdropRoses,
  EnvelopeRibbonBow,
  SealSparkBurst,
} from './EnvelopeOrnaments.jsx';
import { EnvelopeRevealedCard } from './EnvelopeRevealedCard.jsx';

const PAPER_EASE = [0.38, 0.04, 0.22, 1];
const CALM_EASE = [0.22, 1, 0.36, 1];

export function EnvelopeGate({
  isOpened,
  isPlaying,
  onOpenEnvelope,
  onCloseEnvelope,
  onEnterInvitation,
  onEnterSilent,
}) {
  // 'closed' -> 'opening' (1. sello -> 2. solapa 100% abierta -> 3. tarjeta sale) -> 'revealed'
  const [stage, setStage] = useState(() => (isOpened ? 'revealed' : 'closed'));
  const timersRef = useRef([]);

  const clearTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  };

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';

    return () => {
      clearTimers();
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
    };
  }, []);

  const triggerRealOpen = () => {
    if (stage !== 'closed') return;
    onOpenEnvelope();

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      setStage('revealed');
      return;
    }

    setStage('opening');
    clearTimers();
    // 0.00-0.55s sello/lazo -> 0.55-1.75s solapa 100% abierta -> 1.80-2.90s carta sube -> 2.75s relevo suave
    const revealTimer = window.setTimeout(() => {
      setStage('revealed');
    }, 2750);
    timersRef.current.push(revealTimer);
  };

  const triggerClose = () => {
    clearTimers();
    setStage('closed');
    onCloseEnvelope();
  };

  const isOpening = stage === 'opening';
  const isRevealed = stage === 'revealed';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.42, ease: 'easeOut' }}
      className="fixed inset-0 h-dvh w-full bg-royal-950 flex items-center justify-center px-3.5 py-3 sm:px-6 sm:py-4 overflow-hidden overscroll-none"
    >
      {/* Escenario nocturno del castillo encantado */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <motion.img
          src={IMAGES.castleBg}
          alt=""
          loading="eager"
          decoding="async"
          animate={isRevealed ? { scale: 1.08 } : isOpening ? { scale: 1.06 } : { scale: 1.04 }}
          transition={{ duration: 2.2, ease: CALM_EASE }}
          className="w-full h-full object-cover object-top sm:object-center brightness-[0.82] contrast-[1.06]"
        />
        <div className="absolute inset-0 bg-linear-to-b from-royal-950/65 via-royal-900/35 to-royal-950/88" />
        <div className="absolute inset-0 bg-radial from-transparent via-royal-950/25 to-royal-950/85" />
        <StarlightField />
      </div>

      <FloatingPetals showSparkles={false} />

      <GoldButterfly className="fixed top-10 left-4 sm:left-14 z-10 w-10 sm:w-14 opacity-85" />
      <GoldButterfly
        flip
        className="fixed top-20 right-4 sm:right-16 z-10 w-9 sm:w-12 opacity-80"
      />

      <main className="relative z-30 w-full max-w-md h-full mx-auto grid place-items-center">
        <AnimatePresence initial={false}>
          {!isRevealed && (
            <motion.section
              key="physical-envelope-stage"
              aria-label={isOpening ? 'Abriendo sobre de invitación' : 'Sobre de invitación cerrado'}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{
                opacity: 0,
                y: 56,
                scale: 0.92,
                transition: { duration: 0.85, ease: CALM_EASE },
              }}
              transition={{ duration: 0.46, ease: 'easeOut' }}
              className="col-start-1 row-start-1 z-10 w-full flex flex-col items-center gap-4 sm:gap-5"
            >
              {/* Encabezado sobre el cielo nocturno */}
              <motion.div
                animate={isOpening ? { opacity: 0, y: -12 } : { opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="flex flex-col items-center text-center gap-1 drop-shadow-[0_2px_10px_rgba(5,11,28,0.85)]"
              >
                <span className="font-label text-[11px] leading-4 tracking-[2.4px] font-semibold text-champagne uppercase">
                  {WEDDING_DETAILS.envelopeEyebrow}
                </span>
                <span className="font-body text-[12px] leading-4 tracking-[0.8px] text-royal-200">
                  {WEDDING_DETAILS.dateFormatted}
                </span>
              </motion.div>

              {/* Escenario 3D del sobre físico: baja suavemente para dejar aire arriba a la solapa */}
              <motion.div
                animate={isOpening ? { y: 74, scale: 0.91 } : { y: 0, scale: 1 }}
                transition={{ duration: 1.15, delay: 0.55, ease: CALM_EASE }}
                className="envelope-stage relative w-full max-w-92 sm:max-w-108"
              >
                {/* Halo cálido suave detrás del sobre */}
                <motion.div
                  aria-hidden="true"
                  initial={false}
                  animate={isOpening ? { opacity: 0.72, scale: 1.14 } : { opacity: 0, scale: 0.8 }}
                  transition={{ duration: 1.1, delay: 0.3, ease: 'easeOut' }}
                  className="pointer-events-none absolute -inset-x-6 -top-20 bottom-6 z-0 rounded-full bg-radial from-champagne/32 via-gold-light/12 to-transparent blur-2xl"
                />

                {/* Rosas acuarela simétricas DETRÁS del sobre (z-0): nunca tapan la solapa ni la tarjeta */}
                <EnvelopeBackdropRoses isOpening={isOpening} />

                {/* Cuerpo 3D del sobre por encima de las rosas (z-20) */}
                <div className="preserve-3d relative z-20 w-full aspect-16/11">
                  {/* 1. Fondo interior aterciopelado azul real (z = -4px) */}
                  <div
                    aria-hidden="true"
                    style={{ transform: 'translateZ(-4px)' }}
                    className="absolute inset-0 z-10 rounded-2xl bg-linear-to-b from-royal-950 via-royal-900 to-royal-800 border border-gold/80 shadow-[0_26px_58px_-12px_rgba(4,9,24,0.8)] overflow-hidden"
                  >
                    <StarlightField />
                  </div>

                  {/* 2. Tarjeta interior: permanece quieta adentro hasta que la solapa abre 100% (1.75s), y RECIÉN a 1.80s sube con calma */}
                  <motion.div
                    aria-hidden="true"
                    initial={false}
                    animate={
                      isOpening
                        ? { y: '-46%', scale: 1.01, opacity: 1, z: 0 }
                        : { y: '10%', scale: 0.93, opacity: 0, z: 0 }
                    }
                    transition={{
                      y: { duration: 1.1, delay: 1.78, ease: CALM_EASE },
                      scale: { duration: 1.1, delay: 1.78, ease: CALM_EASE },
                      opacity: { duration: 0.35, delay: 1.15, ease: 'easeOut' },
                    }}
                    className="pointer-events-none absolute inset-x-4 sm:inset-x-5 top-3 bottom-3 z-20 rounded-2xl overflow-hidden bg-ivory-50 border-2 border-gold/90 shadow-[0_20px_42px_rgba(4,9,24,0.6)] flex flex-col"
                  >
                    <div className="bg-linear-to-b from-royal-950 via-royal-900 to-royal-800 py-2.5 px-4 text-center border-b-2 border-gold/70 flex flex-col items-center gap-0.5">
                      <ResilientImage src={IMAGES.crown} alt="" className="w-8 h-5 object-contain" />
                      <span className="font-label text-[8.5px] tracking-[2px] text-gold-light uppercase font-semibold">
                        {WEDDING_DETAILS.eyebrow}
                      </span>
                      <p className="font-display text-[28px] sm:text-[32px] leading-8 text-ivory-50">
                        {WEDDING_DETAILS.coupleNames}
                      </p>
                    </div>
                    <div className="parchment-sheet flex-1 px-4 py-2.5 flex flex-col items-center justify-center text-center gap-1">
                      <p className="font-headline text-[10px] tracking-[1.1px] font-semibold text-royal-900 uppercase">
                        {WEDDING_DETAILS.dateFormatted} · {WEDDING_DETAILS.ceremony.time}
                      </p>
                      <p className="font-body text-[10px] text-ink-muted">
                        {WEDDING_DETAILS.ceremony.venue} · {WEDDING_DETAILS.ceremony.address}
                      </p>
                    </div>
                  </motion.div>

                  {/* 3. Bolsillo delantero plegado del sobre (z = +2px) */}
                  <div
                    style={{ transform: 'translateZ(2px)' }}
                    className="pointer-events-none absolute inset-0 z-30 rounded-2xl overflow-hidden border border-gold/80"
                  >
                    <svg
                      viewBox="0 0 400 275"
                      preserveAspectRatio="none"
                      aria-hidden="true"
                      className="absolute inset-0 w-full h-full"
                    >
                      <defs>
                        <linearGradient id="pocketSide" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#FBF3E4" />
                          <stop offset="100%" stopColor="#E9D5B3" />
                        </linearGradient>
                        <linearGradient id="pocketBottom" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#FDF8EE" />
                          <stop offset="100%" stopColor="#E5CCA2" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M0 16 L186 146 L0 275 Z"
                        fill="url(#pocketSide)"
                        stroke="#C8A152"
                        strokeOpacity="0.55"
                        strokeWidth="1.2"
                      />
                      <path
                        d="M400 16 L214 146 L400 275 Z"
                        fill="url(#pocketSide)"
                        stroke="#C8A152"
                        strokeOpacity="0.55"
                        strokeWidth="1.2"
                      />
                      <path
                        d="M0 275 L168 138 Q200 118 232 138 L400 275 Z"
                        fill="url(#pocketBottom)"
                        stroke="#C8A152"
                        strokeOpacity="0.7"
                        strokeWidth="1.4"
                      />
                    </svg>

                    {/* Sombra suave proyectada por la solapa cerrada */}
                    <motion.div
                      aria-hidden="true"
                      initial={false}
                      animate={{ opacity: isOpening ? 0 : 0.22 }}
                      transition={{ duration: 0.65, delay: 0.5 }}
                      className="absolute inset-x-0 top-0 h-[58%] bg-linear-to-b from-royal-950/28 via-royal-950/8 to-transparent"
                    />

                    <div
                      aria-hidden="true"
                      className="absolute inset-2.5 rounded-xl border border-gold/35"
                    />

                    <ResilientImage
                      src={IMAGES.dancingSilhouette}
                      alt="Silueta dorada de La Bella y la Bestia"
                      loading="eager"
                      className="absolute bottom-3 left-4 sm:left-5 w-18 h-18 sm:w-22 sm:h-22 object-contain opacity-92 drop-shadow-[0_2px_4px_rgba(148,110,39,0.22)]"
                    />

                    <ResilientImage
                      src={IMAGES.lumiere}
                      alt="Lumière sosteniendo sus velas"
                      loading="eager"
                      className="absolute bottom-3 right-5 sm:right-6 w-14 h-18 sm:w-16 sm:h-20 object-contain opacity-92 drop-shadow-[0_2px_6px_rgba(148,110,39,0.25)]"
                    />
                  </div>

                  {/* 4. Solapa triangular 3D: se abre lentamente y por completo (0.55s -> 1.75s) antes de que salga la tarjeta */}
                  <motion.div
                    initial={false}
                    animate={
                      isOpening
                        ? { rotateX: 180, z: -2, zIndex: 15 }
                        : { rotateX: 0, z: 3, zIndex: 35 }
                    }
                    transition={{
                      rotateX: { duration: 1.2, delay: 0.55, ease: PAPER_EASE },
                      z: { delay: 1.15, duration: 0.01 },
                      zIndex: { delay: 1.15, duration: 0.01 },
                    }}
                    className="envelope-flap-3d absolute inset-x-0 top-0 h-[62%]"
                  >
                    {/* Cara exterior cerrada */}
                    <div className="backface-hidden absolute inset-0">
                      <svg
                        viewBox="0 0 400 175"
                        preserveAspectRatio="none"
                        aria-hidden="true"
                        className="absolute inset-0 w-full h-full drop-shadow-[0_6px_12px_rgba(43,33,27,0.2)]"
                      >
                        <defs>
                          <linearGradient id="flapFrontGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#FFFDF9" />
                            <stop offset="72%" stopColor="#F7ECDA" />
                            <stop offset="100%" stopColor="#E9D3AD" />
                          </linearGradient>
                        </defs>
                        <path
                          d="M1 12 Q1 1 12 1 L388 1 Q399 1 399 12 L399 18 L216 164 Q200 175 184 164 L1 18 Z"
                          fill="url(#flapFrontGrad)"
                          stroke="#C8A152"
                          strokeWidth="1.8"
                        />
                      </svg>

                      <div className="relative z-10 w-full h-full flex flex-col items-center justify-start pt-2.5 sm:pt-3.5 px-6 text-center">
                        <ResilientImage
                          src={IMAGES.crown}
                          alt="Corona dorada real"
                          loading="eager"
                          className="w-10 h-6 sm:w-11 sm:h-7 object-contain drop-shadow-[0_2px_4px_rgba(148,110,39,0.28)]"
                        />
                        <h1 className="font-display text-[32px] sm:text-[40px] leading-10 sm:leading-11.5 text-ink mt-0.5">
                          {WEDDING_DETAILS.coupleNames}
                        </h1>
                        <div
                          className="w-28 sm:w-36 h-px bg-linear-to-r from-transparent via-gold to-transparent mt-0.5"
                          aria-hidden="true"
                        />
                      </div>
                    </div>

                    {/* Cara interior azul real con geometría corregida (punta hacia arriba al abrir 180°) */}
                    <div className="envelope-flap-back absolute inset-0" aria-hidden="true">
                      <svg
                        viewBox="0 0 400 175"
                        preserveAspectRatio="none"
                        className="w-full h-full"
                      >
                        <defs>
                          <linearGradient id="flapRoyalLiner" x1="0%" y1="100%" x2="0%" y2="0%">
                            <stop offset="0%" stopColor="#0D1A36" />
                            <stop offset="60%" stopColor="#162D5B" />
                            <stop offset="100%" stopColor="#21407D" />
                          </linearGradient>
                        </defs>
                        <path
                          d="M1 163 Q1 174 12 174 L388 174 Q399 174 399 163 L399 157 L216 11 Q200 0 184 11 L1 157 Z"
                          fill="url(#flapRoyalLiner)"
                          stroke="#E8CC88"
                          strokeWidth="2"
                        />
                        <path
                          d="M18 163 L382 163 L200 19 Z"
                          fill="none"
                          stroke="#E8CC88"
                          strokeOpacity="0.4"
                          strokeWidth="1.2"
                        />
                      </svg>
                    </div>
                  </motion.div>

                  {/* 5. Lazo de terciopelo + Sello carmesí 3D + Halo cálido (z = +5px) */}
                  <div
                    style={{ transform: 'translateZ(5px)' }}
                    className="absolute inset-0 z-40 flex items-center justify-center pt-10 sm:pt-12 pointer-events-none"
                  >
                    <div className="relative flex items-center justify-center">
                      <div className="absolute top-1">
                        <EnvelopeRibbonBow untying={isOpening} />
                      </div>

                      <SealSparkBurst active={isOpening} />

                      <motion.button
                        type="button"
                        disabled={isOpening}
                        onClick={triggerRealOpen}
                        aria-label="Abrir sobre con música"
                        initial={false}
                        animate={
                          isOpening
                            ? { scale: [1, 0.94, 1.03], opacity: [1, 1, 0], y: [0, 1, -5] }
                            : { scale: 1, opacity: 1, y: 0 }
                        }
                        transition={{ duration: 0.58, times: [0, 0.25, 1], ease: CALM_EASE }}
                        whileHover={isOpening ? undefined : { scale: 1.05 }}
                        whileTap={isOpening ? undefined : { scale: 0.94 }}
                        className="pointer-events-auto relative z-10 flex items-center justify-center w-22 h-22 sm:w-25 sm:h-25 rounded-full cursor-pointer disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-light focus-visible:ring-offset-2 focus-visible:ring-offset-ivory-100"
                      >
                        {!isOpening && (
                          <span
                            aria-hidden="true"
                            className="seal-halo absolute -inset-1.5 rounded-full border-2 border-gold-light pointer-events-none"
                          />
                        )}
                        <span
                          className={`relative flex items-center justify-center w-20 h-20 sm:w-23 sm:h-23 rounded-full drop-shadow-[0_8px_16px_rgba(72,9,15,0.58)] ${isOpening ? '' : 'seal-pulse'
                            }`}
                        >
                          <ResilientImage
                            src={IMAGES.waxSealCrimson}
                            alt="Sello de lacre carmesí con rosa"
                            fallbackLabel={WEDDING_DETAILS.monogram}
                            loading="eager"
                            className="w-full h-full object-contain"
                          />
                        </span>
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Placa barroca inferior + acceso silencioso */}
              <motion.div
                animate={isOpening ? { opacity: 0, y: 10 } : { opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="relative z-40 flex flex-col items-center gap-2.5 pt-1"
              >
                <BaroquePlaqueButton onClick={triggerRealOpen} disabled={isOpening} />

                <button
                  type="button"
                  disabled={isOpening}
                  onClick={onEnterSilent}
                  className="inline-flex items-center gap-1.5 min-h-10 px-4 rounded-full bg-royal-950/60 border border-gold/30 backdrop-blur-xs font-label text-[11px] tracking-[0.9px] uppercase text-royal-200 hover:text-champagne hover:border-gold/60 transition-colors cursor-pointer disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-light"
                >
                  <VolumeX className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>Ingresar sin música</span>
                </button>
              </motion.div>
            </motion.section>
          )}

          {isRevealed && (
            <EnvelopeRevealedCard
              key="opened-royal-card"
              isPlaying={isPlaying}
              onEnterInvitation={onEnterInvitation}
              onCloseEnvelope={triggerClose}
              className="col-start-1 row-start-1 z-20"
            />
          )}
        </AnimatePresence>
      </main>
    </motion.div>
  );
}
