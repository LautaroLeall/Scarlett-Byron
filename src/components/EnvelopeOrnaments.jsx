import { motion } from 'framer-motion';
import { IMAGES } from '../data/weddingData.js';

const CALM_EASE = [0.22, 1, 0.36, 1];

export function EnvelopeBackdropRoses({ isOpening = false }) {
  return (
    <>
      {/* Rosa superior izquierda detrás del sobre (rotación fija en el <img> para evitar giros al reaparecer) */}
      <motion.div
        aria-hidden="true"
        initial={false}
        animate={isOpening ? { x: -10, y: -8, opacity: 0.92 } : { x: 0, y: 0, opacity: 1 }}
        transition={{ duration: 1.1, delay: isOpening ? 0.45 : 0, ease: CALM_EASE }}
        className="pointer-events-none select-none absolute -top-10 -left-9 sm:-top-12 sm:-left-11 z-0 w-30 sm:w-38"
      >
        <img
          src={IMAGES.rosesCorner}
          alt=""
          loading="eager"
          className="w-full h-auto rotate-180 object-contain drop-shadow-[0_10px_22px_rgba(5,11,28,0.7)]"
        />
      </motion.div>

      {/* Rosa inferior derecha detrás del sobre */}
      <motion.div
        aria-hidden="true"
        initial={false}
        animate={isOpening ? { x: 8, y: 8, opacity: 0.88 } : { x: 0, y: 0, opacity: 1 }}
        transition={{ duration: 1.1, delay: isOpening ? 0.45 : 0, ease: CALM_EASE }}
        className="pointer-events-none select-none absolute -bottom-10 -right-8 sm:-bottom-12 sm:-right-10 z-0 w-28 sm:w-36"
      >
        <img
          src={IMAGES.rosesCorner}
          alt=""
          loading="eager"
          className="w-full h-auto object-contain drop-shadow-[0_10px_22px_rgba(5,11,28,0.7)]"
        />
      </motion.div>
    </>
  );
}

export function SealSparkBurst({ active }) {
  if (!active) return null;
  return (
    <motion.span
      aria-hidden="true"
      initial={{ scale: 0.55, opacity: 0 }}
      animate={{ scale: [0.55, 1.9, 2.3], opacity: [0, 0.52, 0] }}
      transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
      className="pointer-events-none absolute w-24 h-24 rounded-full bg-radial from-champagne/70 via-gold-light/22 to-transparent blur-md"
    />
  );
}

export function EnvelopeRibbonBow({ untying }) {
  return (
    <div
      className="relative w-36 h-24 sm:w-42 sm:h-28 pointer-events-none select-none"
      aria-hidden="true"
    >
      {/* Mitad izquierda del lazo soltándose con calma */}
      <motion.svg
        viewBox="0 0 180 120"
        initial={false}
        animate={
          untying
            ? { x: -20, y: 8, rotate: -6, opacity: 0, scale: 0.94 }
            : { x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 }
        }
        transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 w-full h-full drop-shadow-[0_6px_12px_rgba(68,8,14,0.45)]"
      >
        <defs>
          <linearGradient id="velvetLeft" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#BC2330" />
            <stop offset="55%" stopColor="#8A131C" />
            <stop offset="100%" stopColor="#5C0910" />
          </linearGradient>
        </defs>
        <path
          d="M86 44 C56 26, 26 24, 24 44 C22 60, 52 62, 86 52 Z"
          fill="url(#velvetLeft)"
          stroke="#4B070D"
          strokeWidth="1.2"
        />
        <path
          d="M84 54 L54 108 L68 100 L76 112 L91 58 Z"
          fill="url(#velvetLeft)"
          stroke="#4B070D"
          strokeWidth="1.1"
        />
      </motion.svg>

      {/* Mitad derecha del lazo soltándose con calma */}
      <motion.svg
        viewBox="0 0 180 120"
        initial={false}
        animate={
          untying
            ? { x: 20, y: 8, rotate: 6, opacity: 0, scale: 0.94 }
            : { x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 }
        }
        transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 w-full h-full drop-shadow-[0_6px_12px_rgba(68,8,14,0.45)]"
      >
        <defs>
          <linearGradient id="velvetRight" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#BC2330" />
            <stop offset="55%" stopColor="#8A131C" />
            <stop offset="100%" stopColor="#5C0910" />
          </linearGradient>
        </defs>
        <path
          d="M94 44 C124 26, 154 24, 156 44 C158 60, 128 62, 94 52 Z"
          fill="url(#velvetRight)"
          stroke="#4B070D"
          strokeWidth="1.2"
        />
        <path
          d="M96 54 L126 108 L112 100 L104 112 L89 58 Z"
          fill="url(#velvetRight)"
          stroke="#4B070D"
          strokeWidth="1.1"
        />
      </motion.svg>
    </div>
  );
}

export function BaroquePlaqueButton({ onClick, disabled }) {
  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={onClick}
      whileHover={disabled ? undefined : { y: -2, scale: 1.02 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
      className="relative group cursor-pointer disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-light rounded-full px-8 sm:px-10 py-3.5 min-h-12 bg-linear-to-b from-ivory-50 via-ivory-100 to-ivory-200 border-2 border-gold shadow-[0_12px_30px_-6px_rgba(5,11,28,0.75),inset_0_1px_0_rgba(255,255,255,0.9)]"
    >
      <svg
        width="56"
        height="16"
        viewBox="0 0 56 16"
        fill="none"
        aria-hidden="true"
        className="pointer-events-none absolute -top-3.5 left-1/2 -translate-x-1/2 drop-shadow-[0_2px_4px_rgba(9,19,41,0.45)]"
      >
        <path
          d="M4 14 C12 14, 18 4, 28 2 C38 4, 44 14, 52 14"
          stroke="#E8CC88"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="28" cy="6" r="3" fill="#C8A152" stroke="#FDFBF7" strokeWidth="1" />
        <circle cx="15" cy="11" r="1.8" fill="#E8CC88" />
        <circle cx="41" cy="11" r="1.8" fill="#E8CC88" />
      </svg>

      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-1 rounded-full border border-gold/55"
      />

      <span className="relative z-10 flex flex-col items-center leading-tight">
        <span className="font-headline text-[12px] sm:text-[13px] tracking-[1.2px] font-semibold text-ink uppercase">
          Haz clic para abrir el sobre
        </span>
      </span>

      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-crimson border-2 border-gold-light shadow-sm"
      />
    </motion.button>
  );
}
