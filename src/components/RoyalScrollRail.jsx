import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { NAV_SECTIONS } from '../data/weddingData.js';

export function RoyalScrollRail({ activeSection = 'portada', onSelectSection }) {
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 170,
    damping: 26,
    restDelta: 0.001,
  });
  const jewelTop = useTransform(smoothProgress, [0, 1], ['0%', '100%']);

  return (
    <aside
      aria-label="Progreso de lectura"
      className="hidden xl:flex fixed right-4.5 top-1/2 -translate-y-1/2 z-30 flex-col items-center gap-3 select-none"
    >
      {/* Riel vertical animado con gema dorada deslizante */}
      <div
        aria-hidden="true"
        className="relative w-2 h-44 rounded-full bg-royal-950/90 border border-gold/45 shadow-[0_0_20px_rgba(4,9,24,0.75)] p-px"
      >
        <motion.div
          style={{ scaleY: smoothProgress, transformOrigin: '50% 0%' }}
          className="scroll-shimmer-vertical w-full h-full rounded-full"
        />
        <motion.span
          style={{ top: jewelTop }}
          className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-radial from-ivory-50 via-gold-light to-crimson border border-champagne shadow-[0_0_12px_3px_rgba(248,232,190,0.75)]"
        />
      </div>

      {/* Accesos rápidos de capítulos sincronizados con el Navbar */}
      <nav aria-label="Capítulos" className="flex flex-col items-center gap-2">
        {NAV_SECTIONS.map((chapter) => {
          const isActive = activeSection === chapter.id;
          return (
            <a
              key={chapter.id}
              href={`#${chapter.id}`}
              onClick={() => onSelectSection?.(chapter.id)}
              aria-label={`Ir a ${chapter.label}`}
              aria-current={isActive ? 'location' : undefined}
              className="group relative w-6 h-6 flex items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-light"
            >
              <span
                className={`block rounded-full transition-all duration-300 ${isActive
                  ? 'w-2.5 h-2.5 bg-champagne ring-2 ring-crimson/80 shadow-[0_0_10px_rgba(248,232,190,0.85)]'
                  : 'w-1.5 h-1.5 bg-gold/55 group-hover:bg-champagne group-hover:scale-125'
                  }`}
              />
              <span className="pointer-events-none opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-200 absolute right-8 px-2.5 py-1 rounded-lg bg-royal-950/95 border border-gold/50 text-[10px] font-label font-semibold tracking-[0.9px] uppercase text-champagne whitespace-nowrap shadow-md">
                {chapter.label}
              </span>
            </a>
          );
        })}
      </nav>
    </aside>
  );
}
