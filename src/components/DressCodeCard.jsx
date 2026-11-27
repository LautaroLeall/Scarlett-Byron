import { motion } from 'framer-motion';
import { Ban } from 'lucide-react';
import { WEDDING_DETAILS } from '../data/weddingData.js';

export function DressCodeCard() {
  const { dressCode } = WEDDING_DETAILS;
  const restrictedColors = Array.isArray(dressCode.restrictedColors)
    ? dressCode.restrictedColors
    : [];

  return (
    <motion.article
      initial={{ opacity: 0, y: 26, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 'some' }}
      transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3 }}
      className="enchanted-card md:col-span-5 w-full bg-surface-container border border-outline rounded-2xl p-5 sm:p-6 flex flex-col justify-between gap-4 overflow-hidden"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-linear-to-r from-crimson via-gold to-royal-900"
      />

      <div className="flex items-start justify-between gap-4 pt-1">
        <div className="flex flex-col gap-1.5">
          <h3 className="font-headline text-[16px] sm:text-[17px] leading-5.5 tracking-[1px] font-semibold text-royal-900">
            {dressCode.title}
          </h3>
          <p className="font-body text-[14px] leading-5.5 font-semibold text-ink">
            {dressCode.style}
          </p>
        </div>

        {/* Íconos traje y vestido de gala en medallón azul real */}
        <div
          className="flex items-center gap-2 shrink-0 bg-royal-900 border border-gold/70 rounded-xl px-3 py-3.5 shadow-xs"
          aria-hidden="true"
        >
          <svg width="24" height="42" viewBox="0 0 28 48" fill="none">
            <path d="M8 6 L14 10 L20 6 L24 14 L21 16 L20 44 L8 44 L7 16 L4 14 Z" fill="#F8E8BE" />
            <path d="M12 6 L14 14 L16 6" stroke="#112247" strokeWidth="1.4" />
          </svg>
          <svg width="28" height="42" viewBox="0 0 32 48" fill="none">
            <path
              d="M11 6 L16 11 L21 6 L20 18 L28 44 L4 44 L12 18 Z"
              stroke="#E8CC88"
              strokeWidth="1.5"
              fill="rgba(248, 232, 190, 0.14)"
            />
          </svg>
        </div>
      </div>

      <div className="pt-3.5 border-t border-outline-variant/75 flex flex-col gap-2.5">
        <p className="inline-flex items-center gap-1.5 font-label text-[11px] leading-4 tracking-[0.8px] font-semibold uppercase text-crimson">
          <Ban className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>{dressCode.note}</span>
        </p>

        {restrictedColors.length > 0 && (
          <ul
            aria-label="Colores prohibidos en el código de vestimenta"
            className="flex flex-wrap gap-2"
          >
            {restrictedColors.map((color) => (
              <li
                key={color.label}
                className="inline-flex items-center gap-2 rounded-full bg-ivory-50 border border-outline-variant px-3 py-1.5 font-body text-[12px] leading-4 font-medium text-ink"
              >
                <span
                  aria-hidden="true"
                  className={`w-3.5 h-3.5 rounded-full shrink-0 ${color.border ? 'border border-outline-variant' : 'ring-1 ring-ink/10'
                    }`}
                  style={{ background: color.swatch }}
                />
                <span>{color.label}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </motion.article>
  );
}
