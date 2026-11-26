import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResilientImage } from './ResilientImage.jsx';

export function EnchantedCharacter({
  src,
  alt,
  quote,
  className = '',
  imgClassName = 'w-16 h-20 object-contain',
  idleAnimation = 'float',
  bubbleAlign = 'center',
}) {
  const [showBubble, setShowBubble] = useState(false);
  const [bounceCount, setBounceCount] = useState(0);

  useEffect(() => {
    if (!showBubble) return undefined;
    const timer = window.setTimeout(() => setShowBubble(false), 2800);
    return () => window.clearTimeout(timer);
  }, [showBubble, bounceCount]);

  const handleActivate = () => {
    setBounceCount((count) => count + 1);
    setShowBubble(true);
  };

  const idleClass =
    idleAnimation === 'sway'
      ? 'pendulum-sway'
      : idleAnimation === 'float'
        ? 'gentle-float'
        : '';

  const bubblePosClass =
    bubbleAlign === 'right'
      ? 'right-0'
      : bubbleAlign === 'left'
        ? 'left-0'
        : 'left-1/2 -translate-x-1/2';

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      {idleAnimation === 'candle' && (
        <span
          aria-hidden="true"
          className="candle-aura absolute -inset-2 rounded-full bg-radial from-gold-light/55 via-gold-light/15 to-transparent pointer-events-none"
        />
      )}

      <motion.button
        type="button"
        onClick={handleActivate}
        onMouseEnter={() => setShowBubble(true)}
        onMouseLeave={() => setShowBubble(false)}
        aria-label={`${alt}: ${quote}`}
        whileHover={{ scale: 1.09, rotate: idleAnimation === 'sway' ? 4 : -3 }}
        whileTap={{ scale: 0.93, rotate: idleAnimation === 'sway' ? -6 : 5 }}
        transition={{ type: 'spring', stiffness: 360, damping: 18 }}
        className={`relative z-10 inline-flex items-center justify-center rounded-xl p-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-dark ${idleClass}`}
      >
        <ResilientImage
          src={src}
          alt={alt}
          className={`drop-shadow-[0_4px_8px_rgba(44,36,30,0.16)] ${imgClassName}`}
        />
      </motion.button>

      <AnimatePresence>
        {showBubble && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.94 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            role="status"
            className={`absolute -top-10 ${bubblePosClass} z-30 pointer-events-none max-w-[min(220px,78vw)] sm:whitespace-nowrap text-center rounded-lg bg-ivory-50 border border-outline px-2.5 py-1 shadow-md`}
          >
            <span className="font-body text-[11px] font-medium text-ink">
              {quote}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
