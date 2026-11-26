import { motion, AnimatePresence } from 'framer-motion';
import { IMAGES, WEDDING_DETAILS } from '../data/weddingData.js';
import { useCountdown } from '../hooks/useCountdown.js';
import { EnchantedCharacter } from './EnchantedCharacter.jsx';

export function CountdownCard() {
  const countdown = useCountdown(WEDDING_DETAILS.targetDateIso);

  const units = [
    { key: 'days', value: countdown.days, label: 'Días' },
    { key: 'hours', value: countdown.hours, label: 'Horas' },
    { key: 'minutes', value: countdown.minutes, label: 'Min' },
    { key: 'seconds', value: countdown.seconds, label: 'Seg' },
  ];

  return (
    <div aria-label="Cuenta regresiva" className="w-full max-w-md flex flex-col items-center gap-3 text-center">
      <div className="flex items-center justify-center gap-3">
        <p className="font-display text-[30px] sm:text-[34px] leading-9.5 text-ink">
          {countdown.isFinished ? '¡Llegó el gran día!' : 'Cada vez falta menos...'}
        </p>
        <EnchantedCharacter
          src={IMAGES.cogsworth}
          alt={WEDDING_DETAILS.characters.cogsworth.alt}
          quote={WEDDING_DETAILS.characters.cogsworth.quote}
          idleAnimation="sway"
          bubbleAlign="right"
          imgClassName="w-11 h-16 sm:w-12 sm:h-18 object-contain"
        />
      </div>

      <div className="enchanted-card w-full grid grid-cols-4 bg-surface-container border border-outline rounded-2xl py-4 px-2 sm:px-4 shadow-sm">
        {units.map((unit, idx) => (
          <div
            key={unit.key}
            className={`flex flex-col items-center justify-center px-1 ${idx > 0 ? 'border-l border-outline-variant' : ''
              }`}
          >
            <div className="h-8 flex items-center justify-center overflow-hidden">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={unit.value}
                  initial={{ y: -8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 8, opacity: 0 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className="font-headline text-[22px] sm:text-[26px] leading-7.5 font-semibold text-ink tabular-nums"
                >
                  {unit.value}
                </motion.span>
              </AnimatePresence>
            </div>
            <span className="font-label text-[10px] sm:text-[11px] leading-3.5 tracking-[0.8px] font-semibold text-ink-muted uppercase mt-0.5">
              {unit.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
