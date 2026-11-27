import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ResilientImage } from './ResilientImage.jsx';

export function EnchantedCharacter({
  src,
  alt,
  quote,
  className = '',
  imgClassName = 'w-16 h-20 object-contain',
  idleAnimation = 'float',
}) {
  const buttonRef = useRef(null);
  const [showBubble, setShowBubble] = useState(false);
  const [bounceCount, setBounceCount] = useState(0);
  const [coords, setCoords] = useState(null);

  const updateCoords = useCallback(() => {
    const el = buttonRef.current;
    if (!el || typeof window === 'undefined') return;
    const rect = el.getBoundingClientRect();
    const margin = 14;
    const estHalfWidth = 110;
    const rawCenter = rect.left + rect.width / 2;
    const clampedCenter = Math.max(
      margin + estHalfWidth,
      Math.min(window.innerWidth - margin - estHalfWidth, rawCenter)
    );
    const placeBelow = rect.top < 72;
    setCoords({
      left: clampedCenter,
      top: placeBelow ? rect.bottom + 10 : rect.top - 10,
      placeBelow,
    });
  }, []);

  useEffect(() => {
    if (!showBubble) return undefined;
    const onScrollOrResize = () => updateCoords();
    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [showBubble, updateCoords]);

  useEffect(() => {
    if (!showBubble || bounceCount === 0) return undefined;
    const timer = window.setTimeout(() => setShowBubble(false), 3000);
    return () => window.clearTimeout(timer);
  }, [showBubble, bounceCount]);

  const handleOpenHover = () => {
    updateCoords();
    setShowBubble(true);
  };

  const handleActivate = () => {
    updateCoords();
    setBounceCount((count) => count + 1);
    setShowBubble(true);
  };

  const idleClass =
    idleAnimation === 'sway'
      ? 'pendulum-sway'
      : idleAnimation === 'float'
        ? 'gentle-float'
        : '';

  const bubbleNode =
    typeof document !== 'undefined'
      ? createPortal(
        <AnimatePresence>
          {showBubble && coords && (
            <div
              style={{
                position: 'fixed',
                left: `${coords.left}px`,
                top: `${coords.top}px`,
                transform: coords.placeBelow
                  ? 'translate(-50%, 0)'
                  : 'translate(-50%, -100%)',
              }}
              className="z-50 pointer-events-none"
            >
              <motion.div
                initial={{ opacity: 0, y: coords.placeBelow ? -6 : 6, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: coords.placeBelow ? -4 : 4, scale: 0.94 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                role="status"
                className="relative max-w-[min(230px,84vw)] text-center rounded-xl bg-royal-950/95 border border-gold-light px-3.5 py-2 shadow-[0_12px_28px_rgba(4,10,24,0.55)]"
              >
                <span className="font-body text-[12px] leading-4.5 font-medium text-champagne whitespace-normal sm:whitespace-nowrap">
                  {quote}
                </span>
                <span
                  aria-hidden="true"
                  className={`absolute left-1/2 -translate-x-1/2 w-2.5 h-2.5 rotate-45 bg-royal-950 border-gold-light ${coords.placeBelow
                    ? '-top-1.5 border-l border-t'
                    : '-bottom-1.5 border-r border-b'
                    }`}
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )
      : null;

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      {idleAnimation === 'candle' && (
        <span
          aria-hidden="true"
          className="candle-aura absolute -inset-2 rounded-full bg-radial from-gold-light/55 via-gold-light/15 to-transparent pointer-events-none"
        />
      )}

      <motion.button
        ref={buttonRef}
        type="button"
        onClick={handleActivate}
        onMouseEnter={handleOpenHover}
        onMouseLeave={() => setShowBubble(false)}
        onFocus={handleOpenHover}
        onBlur={() => setShowBubble(false)}
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

      {bubbleNode}
    </div>
  );
}
