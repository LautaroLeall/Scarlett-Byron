import { motion } from 'framer-motion';
import { IMAGES } from '../data/weddingData.js';

const STAR_POINTS = [
  { left: '8%', top: '12%', size: 3, duration: '3.2s', delay: '0.1s' },
  { left: '19%', top: '28%', size: 4, duration: '4.1s', delay: '1.1s' },
  { left: '33%', top: '10%', size: 2.5, duration: '3.6s', delay: '0.5s' },
  { left: '48%', top: '18%', size: 3.5, duration: '4.4s', delay: '1.9s' },
  { left: '64%', top: '9%', size: 3, duration: '3.3s', delay: '0.8s' },
  { left: '77%', top: '24%', size: 4, duration: '4.2s', delay: '1.5s' },
  { left: '88%', top: '14%', size: 3, duration: '3.7s', delay: '0.3s' },
  { left: '92%', top: '38%', size: 2.5, duration: '4.6s', delay: '2.2s' },
  { left: '12%', top: '54%', size: 3, duration: '3.9s', delay: '1.7s' },
  { left: '83%', top: '58%', size: 3.5, duration: '4.0s', delay: '0.9s' },
];

export function StarlightField({ className = '' }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden select-none ${className}`}
      aria-hidden="true"
    >
      {STAR_POINTS.map((star, index) => (
        <span
          key={index}
          className="star-twinkle absolute rounded-full bg-champagne shadow-[0_0_10px_2px_rgba(248,232,190,0.8)]"
          style={{
            left: star.left,
            top: star.top,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDuration: star.duration,
            animationDelay: star.delay,
          }}
        />
      ))}
    </div>
  );
}

export function BaroqueDivider({ tone = 'gold', className = '' }) {
  const strokeColor = tone === 'light' ? '#F0D898' : '#C8A152';
  const roseColor = tone === 'light' ? '#E24552' : '#9E1B24';

  return (
    <div
      className={`w-full max-w-sm mx-auto flex items-center justify-center gap-3 select-none ${className}`}
      aria-hidden="true"
    >
      <motion.span
        initial={{ scaleX: 0, opacity: 0.25 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true, amount: 'some' }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: '100% 50%' }}
        className={`h-px flex-1 ${tone === 'light'
          ? 'bg-linear-to-r from-transparent via-gold-light/70 to-gold-light'
          : 'bg-linear-to-r from-transparent via-outline to-outline-variant'
          }`}
      />
      <motion.svg
        width="72"
        height="22"
        viewBox="0 0 72 22"
        fill="none"
        initial={{ scale: 0.65, opacity: 0, rotate: -10 }}
        whileInView={{ scale: 1, opacity: 1, rotate: 0 }}
        viewport={{ once: true, amount: 'some' }}
        transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        className="shrink-0"
      >
        <path
          d="M4 11 C12 4, 22 4, 28 11 C22 18, 12 18, 4 11 Z"
          stroke={strokeColor}
          strokeWidth="1.2"
          fill="none"
        />
        <path
          d="M68 11 C60 4, 50 4, 44 11 C50 18, 60 18, 68 11 Z"
          stroke={strokeColor}
          strokeWidth="1.2"
          fill="none"
        />
        <circle cx="36" cy="11" r="4.5" fill={roseColor} stroke={strokeColor} strokeWidth="1.2" />
        <circle cx="16" cy="11" r="1.5" fill={strokeColor} />
        <circle cx="56" cy="11" r="1.5" fill={strokeColor} />
      </motion.svg>
      <motion.span
        initial={{ scaleX: 0, opacity: 0.25 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true, amount: 'some' }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: '0% 50%' }}
        className={`h-px flex-1 ${tone === 'light'
          ? 'bg-linear-to-l from-transparent via-gold-light/70 to-gold-light'
          : 'bg-linear-to-l from-transparent via-outline to-outline-variant'
          }`}
      />
    </div>
  );
}

const CORNER_POSITION_CLASSES = {
  tl: '-top-3 -left-3 rotate-180',
  tr: '-top-3 -right-3 -scale-y-100',
  bl: '-bottom-3 -left-3 -scale-x-100',
  br: '-bottom-3 -right-3',
};

export function CornerRoses({ position = 'br', className = 'w-28 sm:w-36 opacity-90' }) {
  return (
    <img
      src={IMAGES.rosesCorner}
      alt=""
      aria-hidden="true"
      loading="lazy"
      decoding="async"
      className={`pointer-events-none select-none absolute object-contain drop-shadow-[0_6px_14px_rgba(9,19,41,0.28)] ${CORNER_POSITION_CLASSES[position] || CORNER_POSITION_CLASSES.br} ${className}`}
    />
  );
}

export function GoldButterfly({ className = '', flip = false }) {
  return (
    <img
      src={IMAGES.butterflyGold}
      alt=""
      aria-hidden="true"
      loading="lazy"
      decoding="async"
      className={`pointer-events-none select-none butterfly-flutter object-contain drop-shadow-[0_0_12px_rgba(240,216,152,0.65)] ${flip ? '-scale-x-100' : ''
        } ${className}`}
    />
  );
}
